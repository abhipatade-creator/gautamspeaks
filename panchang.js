/* ============================================================
   PANCHANG ENGINE
   Sun: Meeus low-precision. Moon: truncated ELP (~0.1 deg).
   Sidereal via Lahiri ayanamsa. Good enough for tithi /
   nakshatra / yoga / karana, which span 12 deg and 13.33 deg.
   ============================================================ */
const Panchang = (function(){
  const D2R = Math.PI/180, R2D = 180/Math.PI;
  const sin = function(d){ return Math.sin(d*D2R); };
  const cos = function(d){ return Math.cos(d*D2R); };
  const norm = function(d){ d = d % 360; return d < 0 ? d + 360 : d; };

  function jd(date){
    let y = date.getUTCFullYear(), m = date.getUTCMonth()+1;
    const dayf = date.getUTCDate()
      + (date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600)/24;
    if (m <= 2){ y -= 1; m += 12; }
    const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
    return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + dayf + B - 1524.5;
  }

  function sunLong(T){
    const L0 = 280.46646 + 36000.76983*T + 0.0003032*T*T;
    const M  = 357.52911 + 35999.05029*T - 0.0001537*T*T;
    const C  = (1.914602 - 0.004817*T - 0.000014*T*T)*sin(M)
             + (0.019993 - 0.000101*T)*sin(2*M) + 0.000289*sin(3*M);
    const om = 125.04 - 1934.136*T;
    return norm(L0 + C - 0.00569 - 0.00478*sin(om));
  }

  function moonLong(T){
    const Lp = 218.3164477 + 481267.88123421*T - 0.0015786*T*T + T*T*T/538841;
    const D  = 297.8501921 + 445267.1114034*T - 0.0018819*T*T;
    const M  = 357.5291092 + 35999.0502909*T - 0.0001536*T*T;
    const Mp = 134.9633964 + 477198.8675055*T + 0.0087414*T*T;
    const F  =  93.2720950 + 483202.0175233*T - 0.0036539*T*T;
    const t = [
      [6288774,0,0,1,0],[1274027,2,0,-1,0],[658314,2,0,0,0],[213618,0,0,2,0],
      [-185116,0,1,0,0],[-114332,0,0,0,2],[58793,2,0,-2,0],[57066,2,-1,-1,0],
      [53322,2,0,1,0],[45758,2,-1,0,0],[-40923,0,1,-1,0],[-34720,1,0,0,0],
      [-30383,0,1,1,0],[15327,2,0,0,-2],[-12528,0,0,1,2],[10980,0,0,1,-2],
      [10675,4,0,-1,0],[10034,0,0,3,0],[8548,4,0,-2,0],[-7888,2,1,-1,0],
      [-6766,2,1,0,0],[-5163,1,0,-1,0],[4987,1,1,0,0],[4036,2,-1,1,0],
      [3994,2,0,2,0],[3861,4,0,0,0],[3665,2,0,-3,0],[-2689,0,1,-2,0],
      [-2602,2,0,-1,2],[2390,2,-1,-2,0],[-2348,1,0,1,0],[2236,2,-2,0,0],
      [-2120,0,1,2,0],[-2069,0,2,0,0],[2048,2,-2,-1,0],[-1773,2,0,1,-2],
      [-1595,2,0,0,2],[1215,4,-1,-1,0],[-1110,0,0,2,2],[-892,3,0,-1,0]
    ];
    let s = 0;
    for (let i=0;i<t.length;i++){
      s += t[i][0] * sin(t[i][1]*D + t[i][2]*M + t[i][3]*Mp + t[i][4]*F);
    }
    return norm(Lp + s/1000000);
  }

  /* Lahiri ayanamsa, referenced to 1900.0 */
  function ayanamsa(JD){
    const t = (JD - 2415020.0)/36525;
    return 22.460148 + 1.396042*t + 0.000308*t*t;
  }

  /* --- sunrise / sunset (NOAA / "sunrise equation") --- */
  function riseSet(date, lat, lon, tzMin){
    /* JD at 00:00 UT of the local calendar date */
    const midUT = jd(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
    /* mean solar noon at this longitude: local noon is 12h - lon/15 in UT */
    const Jbase = midUT + 0.5 - lon/360 + 0.0009;

    /* solve transit and hour angle together, from a FIXED base (do not compound) */
    let Jtransit = Jbase, H = null;
    for (let i = 0; i < 3; i++){
      const T = (Jtransit - 2451545)/36525;
      const M = norm(357.5291 + 35999.0503*T);
      const C = 1.9148*sin(M) + 0.0200*sin(2*M) + 0.0003*sin(3*M);
      const lam = norm(M + C + 102.9372 + 180);
      Jtransit = Jbase + 0.0053*sin(M) - 0.0069*sin(2*lam);
      const dec = Math.asin(sin(23.4397)*sin(lam))*R2D;
      const cosH = (sin(-0.833) - sin(lat)*sin(dec)) / (cos(lat)*cos(dec));
      H = (cosH > 1 || cosH < -1) ? null : Math.acos(cosH)*R2D;
    }
    const rise = H === null ? null : Jtransit - H/360;
    const set  = H === null ? null : Jtransit + H/360;

    function fmt(Jv){
      if (Jv === null) return '—';
      let mins = Math.round(((Jv + 0.5) % 1) * 1440) + tzMin;
      mins = ((mins % 1440) + 1440) % 1440;
      const hh = Math.floor(mins/60), mm = mins % 60;
      return (hh<10?'0':'') + hh + ':' + (mm<10?'0':'') + mm;
    }
    return {rise:rise, set:set, riseStr:fmt(rise), setStr:fmt(set)};
  }

  const TITHI = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami',
    'Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami',
    'Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
  const NAK = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
    'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
    'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha',
    'Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const YOGA = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula',
    'Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha',
    'Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
  const KARANA_MOV = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];
  const KARANA_FIX = ['Kimstughna','Shakuni','Chatushpada','Naga'];
  const RASHI = ['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrishchik','Dhanu','Makar','Kumbh','Meen'];
  const VARA  = ['Ravivar','Somvar','Mangalvar','Budhvar','Guruvar','Shukravar','Shanivar'];
  /* Rahu Kaal: which eighth of the day, by weekday (Sun..Sat) */
  const RAHU  = [7,1,6,4,5,3,2];

  function compute(date, lat, lon, tzMin){
    const rs = riseSet(date, lat, lon, tzMin);
    /* evaluate the angles at local sunrise, the classical reference point */
    const refJD = rs.rise !== null ? rs.rise : jd(date);
    const T = (refJD - 2451545)/36525;
    const ay = ayanamsa(refJD);
    const sunT = sunLong(T), moonT = moonLong(T);
    const sunS = norm(sunT - ay), moonS = norm(moonT - ay);

    const diff = norm(moonS - sunS);
    const tIdx = Math.floor(diff/12);                       // 0..29
    const nIdx = Math.floor(moonS/(360/27));                // 0..26
    const pada = Math.floor((moonS % (360/27)) / (360/108)) + 1;
    const yIdx = Math.floor(norm(sunS + moonS)/(360/27));
    const kNum = Math.floor(diff/6);                        // 0..59

    let karana;
    if (kNum === 0) karana = KARANA_FIX[0];
    else if (kNum >= 57) karana = KARANA_FIX[kNum - 56];
    else karana = KARANA_MOV[(kNum - 1) % 7];

    /* Rahu Kaal + Abhijit from the day's light span */
    let rahuStr = '—', abhStr = '—';
    if (rs.rise !== null && rs.set !== null){
      const startMin = ((rs.rise + 0.5) % 1)*1440 + tzMin;
      const dayLen   = (rs.set - rs.rise)*1440;
      const seg = dayLen/8;
      const rS = startMin + RAHU[date.getDay()]*seg;
      const f = function(m){
        m = ((Math.round(m) % 1440) + 1440) % 1440;
        const hh = Math.floor(m/60), mm = m%60;
        return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
      };
      rahuStr = f(rS) + ' – ' + f(rS + seg);
      const mid = startMin + dayLen/2, a = dayLen/15;
      abhStr = f(mid - a/2) + ' – ' + f(mid + a/2);
    }

    return {
      tithiName: TITHI[tIdx],
      paksha: tIdx < 15 ? 'Shukla Paksha' : 'Krishna Paksha',
      nak: NAK[nIdx], pada: pada,
      yoga: YOGA[yIdx], karana: karana,
      vara: VARA[date.getDay()],
      moonRashi: RASHI[Math.floor(moonS/30)],
      moonRashiIdx: Math.floor(moonS/30),
      sunRashi: RASHI[Math.floor(sunS/30)],
      sunrise: rs.riseStr, sunset: rs.setStr,
      rahu: rahuStr, abhijit: abhStr,
      ayan: ay.toFixed(3) + '°',
      RASHI: RASHI
    };
  }
  return {compute:compute, RASHI:RASHI};
})();
