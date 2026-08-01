/* ============================================================
   Rashi detail modal + this month's events.
   Both are computed from panchang.js — the favourable-day list
   is the Moon's real position from each sign, day by day.
   ============================================================ */
(function(){
  const L = k => ((typeof T!=='undefined' && T[current] && T[current][k]) || (typeof T!=='undefined' && T.en && T.en[k]) || k);
  const SLUG=['mesh','vrishabh','mithun','kark','simha','kanya','tula','vrishchik','dhanu','makar','kumbh','meen'];
  const SA  =['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrishchik','Dhanu','Makar','Kumbh','Meen'];
  const EN  =['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const SYM =['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const LORD=['Mangal','Shukra','Budh','Chandra','Surya','Budh','Shukra','Mangal','Guru','Shani','Shani','Guru'];
  const ELEM=['Fire','Earth','Air','Water','Fire','Earth','Air','Water','Fire','Earth','Air','Water'];
  const HOUSE=[4,3,2,1,12,11,10,9,8,7,6,5];
  const GURU=[
   'Jupiter sits in your 4th house of home and mother. A strong month for property and family matters, though spending runs high.',
   'Jupiter in your 3rd lifts your voice, your writing and your network. Good for putting yourself forward — avoid shortcuts.',
   'Jupiter owns both your 7th and 10th and sits in your 2nd. One of the best placements of this cycle for money and family.',
   'Exalted Jupiter is in your own sign. Confidence, respect and opportunity arrive without chasing them.',
   'Jupiter in the 12th favours travel abroad, retreat and inner work — but it loosens the purse. Watch outgoings.',
   'Jupiter in your 11th, owning the 7th. Strong for income, gains through networks, and for partnership.',
   'Jupiter sits at the very top of your chart. The best career and recognition window of this cycle.',
   'Exalted Jupiter in your 9th, owning your 5th. Among the most fortunate placements available this year.',
   'Your own lord moves to the 8th. Depth, research and change rather than ease — look after your health.',
   'Jupiter in your 7th is the classic marriage transit. Strong for alliances of every kind, personal and commercial.',
   'Jupiter owns your 2nd and 11th but sits in the 6th. Reward comes through effort and competition, not luck.',
   'Your lord, exalted, in your 5th. Excellent for study, competitive exams, children and creative work.'];
  const BALA={1:'good',2:'mixed',3:'good',4:'bad',5:'mixed',6:'good',7:'good',8:'bad',9:'mixed',10:'good',11:'good',12:'bad'};

  /* ---------- modal shell ---------- */
  const scrim=document.createElement('div');
  scrim.className='bk-scrim rm-scrim'; scrim.hidden=true;
  scrim.innerHTML='<div class="bk rm" role="dialog" aria-modal="true" aria-labelledby="rmName">'
   +'<button class="bk-x" id="rmClose" aria-label="Close">✕</button>'
   +'<div class="rm-head"><span class="rm-sym" id="rmSym"></span>'
   +'<div><h2 id="rmName"></h2><p class="rm-en" id="rmEn"></p></div></div>'
   +'<div class="rm-facts" id="rmFacts"></div>'
   +'<h3 class="rm-h" id="rmMonthH"></h3><p class="rm-p" id="rmGuru"></p>'
   +'<h3 class="rm-h" id="rmDaysH"></h3><p class="rm-days" id="rmDays"></p>'
   +'<div class="rm-cta"><a class="btn btn-fill" id="rmBook"></a>'
   +'<a class="btn btn-bare" id="rmMore"></a></div></div>';
  function mount(){ if(!scrim.parentNode) document.body.appendChild(scrim); }
  document.addEventListener('DOMContentLoaded',mount); mount();

  function open(i){
    mount();
    const now=new Date();
    document.getElementById('rmSym').textContent=SYM[i];
    document.getElementById('rmName').textContent=SA[i];
    document.getElementById('rmEn').textContent=EN[i]+' · '+LORD[i]+' · '+ELEM[i];

    let today='', days=[];
    if(typeof Panchang!=='undefined'){
      const P=Panchang.compute(now,18.975,72.8258,-now.getTimezoneOffset());
      const pos=((P.moonRashiIdx-i+12)%12)+1;
      today=L('moon_'+BALA[pos]);
      const y=now.getFullYear(), m=now.getMonth();
      const last=new Date(y,m+1,0).getDate();
      for(let d=now.getDate(); d<=last; d++){
        const q=Panchang.compute(new Date(y,m,d),18.975,72.8258,-now.getTimezoneOffset());
        if(BALA[((q.moonRashiIdx-i+12)%12)+1]==='good') days.push(d);
      }
      document.getElementById('rmFacts').innerHTML=
         cell(L('pan_moon'),P.moonRashi)+cell(L('tab_moon'),today)
        +cell('Guru',L('pan_tithi')===''?'':(HOUSE[i]+'ᵗʰ house'))
        +cell(L('pan_nak'),P.nak);
    }
    document.getElementById('rmMonthH').textContent=L('rm_month');
    document.getElementById('rmGuru').textContent=GURU[i];
    document.getElementById('rmDaysH').textContent=L('rm_gooddays');
    document.getElementById('rmDays').textContent = days.length
      ? days.join(', ') + '  ·  ' + now.toLocaleDateString(undefined,{month:'long'})
      : '—';
    const book=document.getElementById('rmBook');
    book.textContent=L('rm_book');
    book.href='#'; book.onclick=function(e){
      e.preventDefault(); close();
      if(window.Booking) window.Booking.open(SA[i]+' · '+EN[i],'',true);
    };
    const more=document.getElementById('rmMore');
    more.textContent=L('rm_more');
    more.href=(location.pathname.indexOf('/rashi/')>-1?'':'rashi/')+SLUG[i]+'.html';
    scrim.hidden=false; document.body.style.overflow='hidden';
    document.getElementById('rmClose').focus();
  }
  function cell(l,v){ return '<div class="rm-f"><span>'+l+'</span><b>'+v+'</b></div>'; }
  function close(){ scrim.hidden=true; document.body.style.overflow=''; }

  document.addEventListener('click',function(e){
    const a=e.target.closest('.rashi');
    if(a){ e.preventDefault(); e.stopPropagation();
           const i=[].indexOf.call(a.parentNode.children,a); open(i); return; }
    if(e.target.id==='rmClose') close();
    if(e.target===scrim) close();
  },true);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!scrim.hidden) close(); });

  /* ---------- panchang modal ---------- */
  const pscrim=document.createElement('div');
  pscrim.className='bk-scrim rm-scrim'; pscrim.hidden=true;
  pscrim.innerHTML='<div class="bk rm" role="dialog" aria-modal="true" aria-labelledby="pmT">'
   +'<button class="bk-x" id="pmClose" aria-label="Close">✕</button>'
   +'<span class="eyebrow amber" id="pmKick"></span><h2 id="pmT"></h2>'
   +'<p class="rm-en" id="pmDate"></p><div class="pan-grid" id="pmGrid"></div>'
   +'<p class="rashi-note" id="pmNote"></p></div>';
  function pmount(){ if(!pscrim.parentNode && document.body) document.body.appendChild(pscrim); }
  document.addEventListener('DOMContentLoaded',pmount); pmount();

  function panOpen(){
    if(typeof Panchang==='undefined') return;
    pmount();
    const now=new Date();
    const P=Panchang.compute(now,18.975,72.8258,-now.getTimezoneOffset());
    document.getElementById('pmKick').textContent=L('calc_eyebrow');
    document.getElementById('pmT').textContent=L('tab_pan');
    let ds; try{ ds=now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }
    catch(e){ ds=now.toDateString(); }
    document.getElementById('pmDate').textContent=ds+' · Mumbai';
    const cel=(l,v,w)=>'<div class="pcell'+(w?' warn':'')+'"><span class="pl">'+l+'</span><b>'+v+'</b></div>';
    document.getElementById('pmGrid').innerHTML=
       cel(L('pan_tithi'),P.tithiName)+cel(L('pan_nak'),P.nak)
      +cel(L('pan_yoga'),P.yoga)+cel(L('pan_karana'),P.karana)
      +cel(L('pan_vara'),P.vara)+cel(L('pan_moon'),P.moonRashi)
      +cel(L('pan_sun'),P.sunRashi)+cel(L('pan_ayan'),P.ayan)
      +cel(L('pan_sunrise'),P.sunrise)+cel(L('pan_sunset'),P.sunset)
      +cel(L('pan_rahu'),P.rahu,true)+cel(L('pan_abhijit'),P.abhijit);
    document.getElementById('pmNote').textContent=L('pan_note');
    pscrim.hidden=false; document.body.style.overflow='hidden';
    document.getElementById('pmClose').focus();
  }
  function panClose(){ pscrim.hidden=true; document.body.style.overflow=''; }
  document.addEventListener('click',function(e){
    if(e.target.closest('#panBtn')){ e.preventDefault(); panOpen(); return; }
    if(e.target.id==='pmClose'||e.target===pscrim) panClose();
  },true);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!pscrim.hidden) panClose(); });
  window.PanchangModal={open:panOpen};

  /* ---------- this month's events, computed ---------- */
  function events(){
    const host=document.getElementById('evList'); if(!host||typeof Panchang==='undefined') return;
    const now=new Date(), y=now.getFullYear(), m=now.getMonth();
    const last=new Date(y,m+1,0).getDate();
    const out=[]; let prevSun=null;
    for(let d=now.getDate(); d<=last; d++){
      const P=Panchang.compute(new Date(y,m,d),18.975,72.8258,-now.getTimezoneOffset());
      if(P.tithiName==='Purnima')  out.push([d,L('ev_purnima')]);
      if(P.tithiName==='Amavasya') out.push([d,L('ev_amavasya')]);
      if(P.tithiName==='Ekadashi') out.push([d,L('ev_ekadashi')+' · '+P.paksha.split(' ')[0]]);
      if(prevSun && P.sunRashi!==prevSun) out.push([d,L('ev_sankranti')+' · '+P.sunRashi]);
      prevSun=P.sunRashi;
    }
    host.innerHTML = out.length
      ? out.slice(0,8).map(e=>'<div class="ev"><b>'+e[0]+'</b><span>'
          +now.toLocaleDateString(undefined,{month:'short'})+'</span><em>'+e[1]+'</em></div>').join('')
      : '<p class="rashi-note">—</p>';
  }
  window.addEventListener('gs:lang',events);
  events();
})();
