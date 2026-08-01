/* ============================================================
   Site search with autosuggest.
   Entries carry an i18n key, so suggestions appear in whichever
   language is active. Matching runs against BOTH the translated
   label and the English one, so "kundli" finds it in any script.
   ============================================================ */
(function(){
  const I = 'index.html', S = 'shop.html';
  /* [labelKey, href, groupKey, extra search terms] */
  const INDEX = [
    /* consultation */
    ['m1_n', I+'#consult','modes_eyebrow','chat message'],
    ['m2_n', I+'#consult','modes_eyebrow','voice call phone'],
    ['m3_n', I+'#consult','modes_eyebrow','video call'],
    ['m4_n', I+'#consult','modes_eyebrow','in person office mumbai'],
    /* services */
    ['s3_n', I+'#services','nav_services','janam kundli birth chart horoscope'],
    ['s7_n', I+'#services','nav_services','matching guna milan ashtakoot mangal dosha marriage'],
    ['s2_n', I+'#services','nav_services','prashna question urgent'],
    ['s1_n', I+'#services','nav_services','mobile numerology phone number'],
    ['s4_n', I+'#services','nav_services','vastu floor plan home'],
    ['s8_n', I+'#services','nav_services','muhurat date time wedding auspicious'],
    ['s5_n', I+'#services','nav_services','vastu site visit property'],
    ['s6_n', I+'#services','nav_services','business vastu office shop factory'],
    /* topics */
    ['t_career',   I+'#consult','topics_title','job work promotion'],
    ['t_marriage', I+'#consult','topics_title','wedding shaadi vivah'],
    ['t_finance',  I+'#consult','topics_title','money wealth dhan'],
    ['t_health',   I+'#consult','topics_title','illness sehat'],
    ['t_business', I+'#consult','topics_title','vyapar trade'],
    ['t_education',I+'#consult','topics_title','study exam padhai'],
    ['t_foreign',  I+'#consult','topics_title','videsh travel settlement visa'],
    ['t_child',    I+'#consult','topics_title','santaan family kids'],
    /* free tools */
    ['tab_pan',       I+'#calc','calc_eyebrow','panchang tithi nakshatra yoga karana rahu kaal sunrise'],
    ['tab_moon',      I+'#calc','calc_eyebrow','chandra bala moon transit gochar'],
    ['tab_num',       I+'#calc','calc_eyebrow','moolank bhagyank numerology calculator'],
    ['ft_kundli',     I+'#calc','calc_eyebrow','free kundli chart'],
    ['rashi_eyebrow', I+'#rashi','calc_eyebrow','horoscope rashi zodiac sign'],
    /* shop */
    ['prod_yantra',   S,'prod_eyebrow','shree kuber vastu dosh nivaran yantra copper'],
    ['prod_bracelet', S,'prod_eyebrow','rudraksha rashi pyrite tiger eye bracelet'],
    ['prod_vastu',    S,'prod_eyebrow','pyramid copper plate vastu'],
    ['rem_gem',       S,'prod_eyebrow','gemstone ratna stone'],
    ['rem_rudra',     S,'prod_eyebrow','rudraksha mukhi nepali bead'],
    ['rem_pooja',     S,'prod_eyebrow','pooja puja havan ritual'],
    ['rem_mantra',    S,'prod_eyebrow','mantra jaap chanting'],
    ['rep_title',     S,'prod_eyebrow','written report pdf career marriage health finance'],
    /* pages */
    ['nav_how',     I+'#how','nav_services','process how it works'],
    ['nav_why',     I+'#why','nav_services','why choose about'],
    ['tst_title',   I+'#',   'nav_services','reviews testimonials clients'],
    ['nav_faq',     I+'#faq','nav_services','questions faq help'],
    ['nav_contact', I+'#book','nav_services','contact book appointment enquiry']
  ];
  const RASHI = ['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrishchik','Dhanu','Makar','Kumbh','Meen'];
  const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  const box   = document.getElementById('searchBox');
  if (!box) return;
  const input = document.getElementById('searchInput');
  const panel = document.getElementById('searchPanel');
  let items = [], active = -1;

  const norm = s => (s||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'');
  const label = k => ((typeof T !== 'undefined' && T[current] && T[current][k]) || (typeof T !== 'undefined' && T.en[k]) || k);
  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function mark(text, q){
    const i = norm(text).indexOf(norm(q));
    if (i < 0 || !q) return esc(text);
    return esc(text.slice(0,i)) + '<mark>' + esc(text.slice(i,i+q.length)) + '</mark>' + esc(text.slice(i+q.length));
  }

  function search(q){
    const n = norm(q); if (!n) return [];
    const out = [];
    INDEX.forEach(function(e){
      const lab = label(e[0]), en = (typeof T!=='undefined' ? T.en[e[0]] : e[0]) || '';
      const hay = norm(lab + ' ' + en + ' ' + e[3]);
      const i = hay.indexOf(n);
      if (i > -1) out.push({label:lab, href:e[1], group:label(e[2]), score:(norm(lab).indexOf(n)===0?0:(i===0?1:2))});
    });
    RASHI.forEach(function(r,i){
      if (norm(r+' '+RASHI_EN[i]).indexOf(n) > -1)
        out.push({label:r+' · '+RASHI_EN[i], href:I+'#rashi', group:label('rashi_eyebrow'), score:1});
    });
    return out.sort((a,b)=>a.score-b.score).slice(0,8);
  }

  function render(q){
    items = search(q);
    if (!q){ panel.hidden = true; panel.innerHTML=''; active=-1; return; }
    if (!items.length){
      panel.innerHTML = '<p class="sx-empty">' + esc(label('search_none')) + '</p>';
      panel.hidden = false; active = -1; return;
    }
    panel.innerHTML = items.map(function(it,i){
      return '<a class="sx-item" role="option" href="'+it.href+'" data-i="'+i+'">'
           + '<span class="sx-l">'+mark(it.label,q)+'</span>'
           + '<span class="sx-g">'+esc(it.group)+'</span></a>';
    }).join('');
    panel.hidden = false; active = -1;
  }

  function highlight(){
    panel.querySelectorAll('.sx-item').forEach(function(a,i){
      a.classList.toggle('is-on', i===active);
      if (i===active) a.scrollIntoView({block:'nearest'});
    });
  }

  let t;
  input.addEventListener('input', function(){ clearTimeout(t); t=setTimeout(()=>render(input.value.trim()),110); });
  input.addEventListener('focus', function(){ if(input.value.trim()) render(input.value.trim()); });
  input.addEventListener('keydown', function(e){
    if (panel.hidden) return;
    if (e.key==='ArrowDown'){ e.preventDefault(); active=Math.min(active+1, items.length-1); highlight(); }
    else if (e.key==='ArrowUp'){ e.preventDefault(); active=Math.max(active-1,-1); highlight(); }
    else if (e.key==='Enter' && active>-1){ e.preventDefault(); window.location.href = items[active].href; }
    else if (e.key==='Escape'){ panel.hidden=true; input.blur(); }
  });
  document.addEventListener('click', function(e){ if(!box.contains(e.target)) panel.hidden = true; });
  window.addEventListener('gs:lang', function(){
    input.placeholder = label('search_ph');
    if (input.value.trim()) render(input.value.trim());
  });
  input.placeholder = label('search_ph');
})();
