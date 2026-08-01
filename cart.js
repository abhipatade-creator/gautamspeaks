/* ============================================================
   Cart — localStorage only. Checkout hands the whole basket to
   the booking modal, which either opens Razorpay (if PAY.key is
   set) or sends an itemised order to WhatsApp.
   ============================================================ */
(function(){
  const KEY='gs_cart';
  const L = k => ((typeof T!=='undefined' && T[current] && T[current][k]) || (typeof T!=='undefined' && T.en && T.en[k]) || k);
  const inr = n => '₹'+n.toLocaleString('en-IN');
  const find = id => (typeof PRODUCTS!=='undefined') ? PRODUCTS.find(p=>p.id===id) : null;

  function read(){ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } }
  function write(c){ try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(e){} paint(); }
  function add(id,q){ const c=read(); c[id]=(c[id]||0)+(q||1); write(c); flash(id); }
  function setQty(id,q){ const c=read(); if(q<1) delete c[id]; else c[id]=q; write(c); }
  function items(){ const c=read(); return Object.keys(c).map(id=>({p:find(id),q:c[id]})).filter(x=>x.p); }
  function total(){ return items().reduce((a,x)=>a+x.p.price*x.q,0); }
  function count(){ return items().reduce((a,x)=>a+x.q,0); }

  /* ---------- drawer ---------- */
  const el=document.createElement('div');
  el.className='cart-scrim'; el.hidden=true;
  el.innerHTML='<aside class="cart" role="dialog" aria-modal="true" aria-label="Cart">'
   +'<div class="cart-top"><h2 id="cartT"></h2><button class="bk-x" id="cartX" aria-label="Close">✕</button></div>'
   +'<div class="cart-body" id="cartBody"></div>'
   +'<div class="cart-foot"><div class="cart-sum"><span id="cartTotL"></span><b id="cartTot"></b></div>'
   +'<button class="btn btn-fill btn-block" id="cartGo"></button>'
   +'<p class="form-note" id="cartNote"></p></div></aside>';
  function mount(){ if(!el.parentNode && document.body) document.body.appendChild(el); }
  document.addEventListener('DOMContentLoaded',mount); mount();

  function paint(){
    const badges=document.querySelectorAll('.cart-badge');
    const n=count();
    badges.forEach(b=>{ b.textContent=n; b.hidden=!n; });
    const body=document.getElementById('cartBody'); if(!body) return;
    document.getElementById('cartT').textContent=L('cart_title');
    document.getElementById('cartTotL').textContent=L('bk_total');
    document.getElementById('cartTot').textContent=inr(total());
    document.getElementById('cartGo').textContent=L('cart_checkout');
    document.getElementById('cartNote').textContent=L('cart_note');
    const list=items();
    if(!list.length){ body.innerHTML='<p class="cart-empty">'+L('cart_empty')+'</p>';
                      document.querySelector('.cart-foot').hidden=true; return; }
    document.querySelector('.cart-foot').hidden=false;
    body.innerHTML=list.map(x=>
      '<div class="ci"><img src="'+base()+'img/'+x.p.img+'.webp" alt="" width="72" height="72">'
     +'<div class="ci-m"><b>'+x.p.name+'</b><span>'+inr(x.p.price)+'</span></div>'
     +'<div class="ci-q"><button data-q="-" data-id="'+x.p.id+'" aria-label="−">−</button>'
     +'<i>'+x.q+'</i><button data-q="+" data-id="'+x.p.id+'" aria-label="+">+</button></div>'
     +'<button class="ci-x" data-rm="'+x.p.id+'" aria-label="Remove">✕</button></div>').join('');
  }
  function base(){ return /\/(rashi|product)\//.test(location.pathname) ? '../' : ''; }

  function flash(id){
    const p=find(id); if(!p) return;
    let t=document.querySelector('.toast');
    if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent='✓ '+p.name+' — '+L('cart_added');
    t.classList.add('on'); clearTimeout(t._h);
    t._h=setTimeout(()=>t.classList.remove('on'),2200);
  }
  function open(){ mount(); paint(); el.hidden=false; document.body.style.overflow='hidden'; }
  function close(){ el.hidden=true; document.body.style.overflow=''; }

  document.addEventListener('click',function(e){
    const t=e.target;
    if(t.closest('.cart-open')){ e.preventDefault(); open(); return; }
    if(t.id==='cartX'||t===el){ close(); return; }
    const addBtn=t.closest('[data-add]');
    if(addBtn){ e.preventDefault(); e.stopPropagation(); add(addBtn.dataset.add,1); return; }
    const buy=t.closest('[data-buy]');
    if(buy){ e.preventDefault(); e.stopPropagation();
      const p=find(buy.dataset.buy);
      if(p && window.Booking) window.Booking.open(p.name,'',false,[{p:p,q:1}]);
      return; }
    if(t.dataset && t.dataset.q){ const c=read();
      setQty(t.dataset.id,(c[t.dataset.id]||0)+(t.dataset.q==='+'?1:-1)); return; }
    if(t.dataset && t.dataset.rm){ setQty(t.dataset.rm,0); return; }
    if(t.id==='cartGo'){ const list=items(); if(!list.length) return;
      close(); if(window.Booking) window.Booking.open(L('cart_title'),'',false,list); }
  },true);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!el.hidden) close(); });
  window.addEventListener('gs:lang',paint);

  window.Cart={open:open,add:add,items:items,total:total,clear:()=>write({})};
  paint();
})();
