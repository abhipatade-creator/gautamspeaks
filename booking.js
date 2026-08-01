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
  + '    <div class="field"><label for="bkService"></label><select id="bkService"></select></div>'
  + '    <div class="bk-total" id="bkTotal" hidden><span id="bkTotalL"></span><b id="bkPrice"></b></div>'
  + '    <div class="bk-row">'
  + '      <div class="field"><label for="bkName"></label><input id="bkName" required autocomplete="name"></div>'
  + '      <div class="field"><label for="bkPhone"></label><input id="bkPhone" type="tel" required autocomplete="tel" placeholder="+91"></div>'
  + '    </div>'
  + '    <div class="field"><label for="bkEmail"></label><input id="bkEmail" type="email" autocomplete="email" placeholder="name@example.com"></div>'
  + '    <div id="bkSched" class="bk-grid2-host">'
  + '      <div class="bk-row">'
  + '        <div class="field"><label for="bkDate"></label><input id="bkDate" type="date"></div>'
  + '        <div class="field"><label for="bkDob"></label><input id="bkDob" type="date"></div>'
  + '      </div>'
  + '      <div class="field"><label id="bkSlotLbl"></label><div class="bk-slots" id="bkSlots"></div>'
  + '        <p class="bk-legend"><span class="lg bad"></span><i id="lgRahu"></i>'
  + '        <span class="lg good"></span><i id="lgAbh"></i></p></div>'
  + '    </div>'
  + '    <div class="field"><label for="bkNote"></label><textarea id="bkNote" rows="2"></textarea></div>'
  + '    <div class="bk-consent">'
  + '      <label class="cbx"><input type="checkbox" id="bkC1"><span id="bkC1t"></span></label>'
  + '      <label class="cbx"><input type="checkbox" id="bkC2"><span id="bkC2t"></span></label>'
  + '    </div>'
  + '    <p class="bk-err" id="bkErr" hidden></p>'
  + '    <button type="submit" class="btn btn-fill btn-block" id="bkSend"></button>'
  + '    <p class="bk-paynote" id="bkNote2" hidden></p>'
  + '    <p class="form-note" id="bkFoot"></p>'
  + '  </form>'
  + '</div>';
  document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(wrap));
  if (document.body) document.body.appendChild(wrap);

  const $ = id => document.getElementById(id);
  let item='', price='', scheduled=true, lastFocus=null, basket=null;

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

  const SERVICES=['s3_n','s7_n','s2_n','s1_n','s4_n','s8_n','s5_n','s6_n',
                  'm1_n','m2_n','m3_n','m4_n','rep_title','prod_yantra','prod_bracelet','prod_vastu'];
  /* amount in rupees; 0 = quote on request */
  const PRICE={s3_n:1500,s7_n:2100,s2_n:999,s1_n:599,s4_n:3800,s8_n:2500,s5_n:9500,s6_n:15000,
               m1_n:0,m2_n:1200,m3_n:1500,m4_n:2500,rep_title:0,prod_yantra:0,prod_bracelet:0,prod_vastu:0};
  const SCHED_KEYS=['s3_n','s7_n','s2_n','s1_n','s4_n','s8_n','s5_n','s6_n','m1_n','m2_n','m3_n','m4_n'];
  const inr=n=>'\u20B9'+n.toLocaleString('en-IN');

  /* Razorpay hook. Set PAY.key to a live key_id to switch payments on;
     until then a paid enquiry goes to WhatsApp and a payment link follows. */
  const PAY={ key:'', name:'Gautam Speaks' };

  function fill(){
    const sel=$('bkService');
    sel.innerHTML = SERVICES.map(k=>'<option value="'+k+'">'+L(k)+'</option>').join('');
    if(item){
      const hit=SERVICES.find(k=>L(k)===item);
      if(hit) sel.value=hit;
      else { const o=document.createElement('option'); o.value='__x'; o.textContent=item;
             o.selected=true; sel.insertBefore(o, sel.firstChild); }
    }
    document.querySelector('label[for=bkService]').textContent = L('f_service');
    sel.onchange = refresh;
    document.querySelector('label[for=bkEmail]').textContent   = L('bk_email');
    $('bkC1t').textContent = L('bk_consent');
    $('bkC2t').textContent = L('bk_consent2');
    document.querySelector('label[for=bkName]').textContent  = L('f_name');
    document.querySelector('label[for=bkPhone]').textContent = L('f_phone');
    document.querySelector('label[for=bkDate]').textContent  = L('bk_date');
    document.querySelector('label[for=bkDob]').textContent   = L('calc_dob');
    document.querySelector('label[for=bkNote]').textContent  = L('f_msg');
    $('bkSlotLbl').textContent = L('bk_time');
    $('lgRahu').textContent = L('bk_rahu');
    $('lgAbh').textContent  = L('bk_abhijit');
    $('bkSend').textContent = L('bk_submit');
    $('bkFoot').textContent = L('bk_foot');
    refresh();
  }

  function currentKey(){
    const s=$('bkService'); return s.options[s.selectedIndex] ? s.options[s.selectedIndex].value : '';
  }
  function refresh(){
    if(basket){
      const tot=basket.reduce((a,x)=>a+x.p.price*x.q,0);
      $('bkService').closest('.field').hidden=true;
      $('bkSched').hidden=true; scheduled=false;
      $('bkTotal').hidden=false;
      $('bkTotalL').textContent=L('bk_total');
      $('bkPrice').textContent=inr(tot);
      $('bkKicker').textContent=L('prod_eyebrow');
      $('bkTitle').textContent=L('cart_title');
      $('bkSub').textContent=basket.map(x=>x.p.name+' × '+x.q).join(' · ');
      $('bkSend').textContent=L('bk_pay');
      $('bkNote2').hidden=false; $('bkNote2').textContent=L('bk_paynote');
      return;
    }
    $('bkService').closest('.field').hidden=false;
    const k=currentKey();
    const amt=PRICE[k];
    scheduled = SCHED_KEYS.indexOf(k) > -1;
    $('bkSched').hidden = !scheduled;
    if(amt){
      $('bkTotal').hidden=false;
      $('bkTotalL').textContent=L('bk_total');
      $('bkPrice').textContent=inr(amt);
    } else $('bkTotal').hidden=true;
    $('bkKicker').textContent = scheduled ? L('modes_eyebrow') : L('prod_eyebrow');
    $('bkTitle').textContent  = scheduled ? L('bk_title') : L('bk_ptitle');
    $('bkSub').textContent    = scheduled ? L('bk_sub')   : L('bk_psub');
    $('bkSend').textContent = amt ? L('bk_pay') : (scheduled ? L('bk_schedule') : L('bk_proceed'));
    $('bkNote2').hidden = !amt;
    $('bkNote2').textContent = amt ? L('bk_paynote') : '';
  }

  function open(name, cost, sched, cartItems){
    item=name||''; price=cost||''; scheduled=sched; basket=cartItems||null;
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
    if(a.closest('.rashi, .rashi-grid, .mrow')) return;   /* rashi.js owns these */
    e.preventDefault();
    let label='';
    try{ label=decodeURIComponent((new URL(a.href).searchParams.get('text')||'')).split('\n')[0]; }catch(_){}
    const card=a.closest('.svc,.mode,.prod');
    if(card){
      const n=card.querySelector('h3,.mt,.pn'); if(n) label=n.textContent.trim();
      const p=card.querySelector('.price b,.mp b,.pp'); price=p?p.textContent.trim():'';
    } else price='';
    if(!label || /^(hello|namaste|नमस्ते|નમસ્તે|নমস্কার|வணக்கம்|నమస్తే|ನಮಸ್ಕಾರ|നമസ്കാരം|ਸਤ)/i.test(label)) label='';
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
    const email=$('bkEmail').value.trim();
    const svc=$('bkService');
    const svcTxt=(svc.options[svc.selectedIndex]||{textContent:''}).textContent;
    const slot=wrap.querySelector('.bk-slot.is-on');
    if(!name||!phone){ $('bkErr').textContent=L('bk_req'); $('bkErr').hidden=false; return; }
    if(email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)){
      $('bkErr').textContent=L('bk_bademail'); $('bkErr').hidden=false; return; }
    if(!basket && scheduled && !slot){ $('bkErr').textContent=L('bk_pick'); $('bkErr').hidden=false; return; }
    if(!$('bkC1').checked){ $('bkErr').textContent=L('bk_creq'); $('bkErr').hidden=false; return; }
    const lines=[ L('wa_intro'), '' ];
    if(basket){
      basket.forEach(x=>lines.push('• '+x.p.name+' × '+x.q+'  '+inr(x.p.price*x.q)));
      lines.push(L('bk_total')+': '+inr(basket.reduce((a,x)=>a+x.p.price*x.q,0)), '');
    }
    const rest=[
      L('f_name')+': '+name,
      L('f_phone')+': '+phone ];
    if(!basket) rest.unshift(L('f_service')+': '+svcTxt+(price?' ('+price+')':''));
    rest.forEach(l=>lines.push(l));
    if(email) lines.push(L('bk_email')+': '+email);
    if(scheduled){
      lines.push(L('bk_date')+': '+$('bkDate').value+' '+slot.dataset.t);
      if($('bkDob').value) lines.push(L('calc_dob')+': '+$('bkDob').value);
      if(slot.classList.contains('bad')) lines.push('('+L('bk_rahu')+')');
    }
    if($('bkNote').value.trim()) lines.push(L('f_msg')+': '+$('bkNote').value.trim());
    lines.push('', '\u2713 ' + L('bk_consent'));
    if($('bkC2').checked) lines.push('\u2713 ' + L('bk_consent2'));
    const key=currentKey();
    const amt = basket ? basket.reduce((a,x)=>a+x.p.price*x.q,0) : (PRICE[key]||0);
    const msg=lines.join('\n');

    if(amt && PAY.key && typeof Razorpay!=='undefined'){
      new Razorpay({
        key:PAY.key, amount:amt*100, currency:'INR', name:PAY.name, description:svcTxt,
        prefill:{name:name, contact:phone, email:email},
        notes:{service: basket ? basket.map(x=>x.p.name+' x'+x.q).join(', ') : svcTxt,
               slot:(slot?$('bkDate').value+' '+slot.dataset.t:'')},
        theme:{color:'#B85321'},
        handler:function(r){
          if(basket && window.Cart) window.Cart.clear();
          window.open('https://wa.me/'+PH+'?text='+encodeURIComponent(
            msg+'\n\nPayment ID: '+r.razorpay_payment_id),'_blank');
        }
      }).open();
      close(); return;
    }

    window.open('https://wa.me/'+PH+'?text='+encodeURIComponent(
      msg + (amt ? '\n\n'+L('bk_paynote') : '')),'_blank');
    close();
  });

  window.Booking = { open: open, close: close };
  window.addEventListener('gs:lang', ()=>{ if(!wrap.hidden) fill(); });
})();
