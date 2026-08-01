/* ============================================================
   Booking modal.
   Every WhatsApp button now opens a form first, so the enquiry
   that lands in WhatsApp already contains name, number, service
   and — for consultations — a requested date and time slot.
   Slots are checked against Rahu Kaal using panchang.js.
   ============================================================ */
(function(){
  const PH = (typeof PHONE !== 'undefined') ? PHONE : '919769759215';
  const L  = k => ((typeof T!=='undefined' && T[current] && T[current][k]) || (typeof T!=='undefined' && T.en && T.en[k]) || k);

  /* consultations get a scheduler; products are a straight enquiry */
  const SCHEDULED = /chat|voice|video|person|consult|analysis|kundali|kundli|matching|numerology|vastu|muhurat|audit|visit/i;

  const wrap = document.createElement('div');
  wrap.className = 'bk-scrim';
  wrap.hidden = true;
  wrap.innerHTML =
    '<div class="bk" role="dialog" aria-modal="true" aria-labelledby="bkTitle">'
  + '  <button class="bk-x" id="bkClose" aria-label="Close">&#10005;</button>'
  + '  <span class="eyebrow amber" id="bkKicker"></span>'
  + '  <h2 id="bkTitle"></h2>'
  + '  <p class="bk-sub" id="bkSub"></p>'
  + '  <form id="bkForm" novalidate>'
  + '    <div class="bk-item"><span id="bkItem"></span><b id="bkPrice"></b></div>'
  + '    <div class="bk-row">'
  + '      <div class="field"><label for="bkName"></label><input id="bkName" required autocomplete="name"></div>'
  + '      <div class="field"><label for="bkPhone"></label><input id="bkPhone" type="tel" required autocomplete="tel" placeholder="+91"></div>'
  + '    </div>'
  + '    <div id="bkSched">'
  + '      <div class="bk-row">'
  + '        <div class="field"><label for="bkDate"></label><input id="bkDate" type="date"></div>'
  + '        <div class="field"><label for="bkDob"></label><input id="bkDob" type="date"></div>'
  + '      </div>'
  + '      <div class="field"><label id="bkSlotLbl"></label><div class="bk-slots" id="bkSlots"></div>'
  + '        <p class="bk-legend"><span class="lg bad"></span><i id="lgRahu"></i>'
  + '        <span class="lg good"></span><i id="lgAbh"></i></p></div>'
  + '    </div>'
  + '    <div class="field"><label for="bkNote"></label><textarea id="bkNote" rows="2"></textarea></div>'
  + '    <p class="bk-err" id="bkErr" hidden></p>'
  + '    <button type="submit" class="btn btn-fill btn-block" id="bkSend"></button>'
  + '    <p class="form-note" id="bkFoot"></p>'
  + '  </form>'
  + '</div>';
  document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(wrap));
  if (document.body) document.body.appendChild(wrap);

  const $ = id => document.getElementById(id);
  let item='', price='', scheduled=true, lastFocus=null;

  function slotsFor(dateStr){
    const box=$('bkSlots'); box.innerHTML='';
    if(!dateStr) return;
    const d=new Date(dateStr+'T12:00:00');
    let rahu=null, abh=null;
    if (typeof Panchang !== 'undefined'){
      try{
        const P=Panchang.compute(d,18.975,72.8258,-d.getTimezoneOffset());
        const mins=s=>{const[a,b]=s.split(':').map(Number);return a*60+b;};
        if(P.rahu.indexOf('–')>-1){const[a,b]=P.rahu.split('–').map(s=>mins(s.trim()));rahu=[a,b];}
        if(P.abhijit.indexOf('–')>-1){const[a,b]=P.abhijit.split('–').map(s=>mins(s.trim()));abh=[a,b];}
      }catch(e){}
    }
    for(let m=600;m<=1140;m+=45){
      const hh=Math.floor(m/60), mm=m%60;
      const lab=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
      const b=document.createElement('button');
      b.type='button'; b.className='bk-slot'; b.textContent=lab; b.dataset.t=lab;
      if(rahu && m+45>rahu[0] && m<rahu[1]){ b.classList.add('bad'); b.title='Rahu Kaal'; }
      else if(abh && m>=abh[0]-20 && m<=abh[1]+20){ b.classList.add('good'); b.title='Abhijit Muhurat'; }
      b.addEventListener('click',()=>{
        box.querySelectorAll('.bk-slot').forEach(x=>x.classList.remove('is-on'));
        b.classList.add('is-on');
      });
      box.appendChild(b);
    }
  }

  function fill(){
    $('bkKicker').textContent = scheduled ? L('modes_eyebrow') : L('prod_eyebrow');
    $('bkTitle').textContent  = scheduled ? L('bk_title') : L('bk_ptitle');
    $('bkSub').textContent    = scheduled ? L('bk_sub')   : L('bk_psub');
    $('bkItem').textContent   = item;
    $('bkPrice').textContent  = price;
    $('bkPrice').hidden       = !price;
    document.querySelector('label[for=bkName]').textContent  = L('f_name');
    document.querySelector('label[for=bkPhone]').textContent = L('f_phone');
    document.querySelector('label[for=bkDate]').textContent  = L('bk_date');
    document.querySelector('label[for=bkDob]').textContent   = L('calc_dob');
    document.querySelector('label[for=bkNote]').textContent  = L('f_msg');
    $('bkSlotLbl').textContent = L('bk_time');
    $('lgRahu').textContent = L('bk_rahu');
    $('lgAbh').textContent  = L('bk_abhijit');
    $('bkSend').textContent = L('bk_send');
    $('bkFoot').textContent = L('bk_foot');
    $('bkSched').hidden = !scheduled;
  }

  function open(name, cost, sched){
    item=name||''; price=cost||''; scheduled=sched;
    lastFocus=document.activeElement;
    fill();
    const t=new Date(); t.setDate(t.getDate()+1);
    const iso=d=>d.toISOString().slice(0,10);
    const max=new Date(); max.setDate(max.getDate()+60);
    $('bkDate').min=iso(new Date()); $('bkDate').max=iso(max); $('bkDate').value=iso(t);
    $('bkDob').max=iso(new Date());
    slotsFor($('bkDate').value);
    $('bkErr').hidden=true;
    wrap.hidden=false; document.body.style.overflow='hidden';
    setTimeout(()=>$('bkName').focus(),40);
  }
  function close(){
    wrap.hidden=true; document.body.style.overflow='';
    if(lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function(e){
    const a=e.target.closest('a[href*="wa.me/"]');
    if(!a) return;
    if(a.classList.contains('bk-skip')) return;
    e.preventDefault();
    let label='';
    try{ label=decodeURIComponent((new URL(a.href).searchParams.get('text')||'')).split('\n')[0]; }catch(_){}
    const card=a.closest('.svc,.mode,.prod');
    if(card){
      const n=card.querySelector('h3,.mt,.pn'); if(n) label=n.textContent.trim();
      const p=card.querySelector('.price b,.mp b,.pp'); price=p?p.textContent.trim():'';
    } else price='';
    if(!label || /^(hello|namaste|नमस्ते|નમસ્તે|নমস্কার|வணக்கம்|నమస్తే|ನಮಸ್ಕಾರ|നമസ്കാരം|ਸਤ)/i.test(label)) label=L('f_opt0');
    open(label, price, SCHEDULED.test(label) || !!a.closest('.svc,.mode'));
  }, true);

  wrap.addEventListener('click', e=>{ if(e.target===wrap) close(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !wrap.hidden) close(); });
  document.addEventListener('click', e=>{ if(e.target.id==='bkClose') close(); });
  document.addEventListener('change', e=>{ if(e.target.id==='bkDate') slotsFor(e.target.value); });

  document.addEventListener('submit', function(e){
    if(e.target.id!=='bkForm') return;
    e.preventDefault();
    const name=$('bkName').value.trim(), phone=$('bkPhone').value.trim();
    const slot=wrap.querySelector('.bk-slot.is-on');
    if(!name||!phone){ $('bkErr').textContent=L('bk_req'); $('bkErr').hidden=false; return; }
    if(scheduled && !slot){ $('bkErr').textContent=L('bk_pick'); $('bkErr').hidden=false; return; }
    const lines=[ L('wa_intro'), '',
      L('f_service')+': '+item+(price?' ('+price+')':''),
      L('f_name')+': '+name,
      L('f_phone')+': '+phone ];
    if(scheduled){
      lines.push(L('bk_date')+': '+$('bkDate').value+' '+slot.dataset.t);
      if($('bkDob').value) lines.push(L('calc_dob')+': '+$('bkDob').value);
      if(slot.classList.contains('bad')) lines.push('('+L('bk_rahu')+')');
    }
    if($('bkNote').value.trim()) lines.push(L('f_msg')+': '+$('bkNote').value.trim());
    window.open('https://wa.me/'+PH+'?text='+encodeURIComponent(lines.join('\n')),'_blank');
    close();
  });

  window.addEventListener('gs:lang', ()=>{ if(!wrap.hidden) fill(); });
})();
