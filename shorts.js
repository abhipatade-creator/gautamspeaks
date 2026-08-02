/* ============================================================
   YouTube Shorts strip.
   Paste video IDs into SHORTS below — one per Short. Until then
   the section renders a channel card instead of fake embeds.
   An ID is the part after /shorts/ in the URL:
     https://www.youtube.com/shorts/AbCdEfGh123  ->  'AbCdEfGh123'
   Thumbnails come from i.ytimg.com and the player is only loaded
   after a click, from youtube-nocookie.com — so nothing from
   YouTube is requested until the visitor asks for it.
   ============================================================ */
const CHANNEL = { handle:'@gautamspeaks09', id:'UCY8t4oPi9ODQ8EykvEzuT1g' };
const SHORTS = [
  { id:'R39oQu4xH0o' },
  { id:'aAp7iuc8BWw' },
  { id:'N3IUDLBt7fE' },
  { id:'Xqd0o4X5CvE' },
  { id:'A0nIqL_H5KE' },
];

/* Accepts any of these forms — paste whatever is easiest:
     'https://www.youtube.com/shorts/AbCdEfGh123'
     'AbCdEfGh123'
     { id:'AbCdEfGh123', title:'Guru gochar for Vrishchik' }            */
function normalise(list){
  return (list||[]).map(function(s){
    if (typeof s === 'string') s = { id:s };
    let id = (s.id||'').trim();
    const m = id.match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([\w-]{6,})/);
    if (m) id = m[1];
    id = id.split('?')[0].split('&')[0];
    return id ? { id:id, title:s.title||'' } : null;
  }).filter(Boolean);
}

(function(){
  const L = k => ((typeof T!=='undefined' && T[current] && T[current][k]) || (typeof T!=='undefined' && T.en && T.en[k]) || k);
  const host = document.getElementById('shortsRail');
  if (!host) return;
  const url = 'https://www.youtube.com/' + CHANNEL.handle + '/shorts';

  const LIST = normalise(SHORTS);

  function render(){
    const sub = document.getElementById('shortsMore');
    if (sub) { sub.textContent = L('yt_all'); sub.href = url; }
    if (!LIST.length){
      host.className = 'shorts-empty';
      host.innerHTML =
        '<div class="yt-card"><span class="yt-ico">'
        + '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">'
        + '<path d="M23 12s0-3.9-.5-5.8a3 3 0 00-2.1-2.1C18.5 3.5 12 3.5 12 3.5s-6.5 0-8.4.6A3 3 0 001.5 6.2C1 8.1 1 12 1 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 8.4.6 8.4.6s6.5 0 8.4-.6a3 3 0 002.1-2.1C23 15.9 23 12 23 12zM9.8 15.5v-7l6.1 3.5z"/></svg></span>'
        + '<div><b>Gautam Speaks</b><span>' + CHANNEL.handle + '</span></div>'
        + '<a class="btn btn-fill btn-sm" href="' + url + '" target="_blank" rel="noopener">'
        + L('yt_watch') + '</a></div>';
      return;
    }
    host.className = 'shorts-rail';
    const nav=document.getElementById('shortsNav');
    if(nav) nav.hidden=false;
    host.innerHTML = LIST.map(function(s,i){
      return '<button class="short" data-i="' + i + '" aria-label="' + (s.title||'Short') + '">'
        + '<img src="https://i.ytimg.com/vi/' + s.id + '/oardefault.jpg" loading="lazy" alt="" width="270" height="480" '
        + 'onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + s.id + '/hqdefault.jpg\'">'
        + '<span class="short-play" aria-hidden="true">&#9654;</span>'
        + (s.title ? '<span class="short-t">' + s.title + '</span>' : '')
        + '</button>';
    }).join('');
  }

  /* lightbox — the iframe is created on click, never on page load */
  const scrim = document.createElement('div');
  scrim.className = 'yt-scrim'; scrim.hidden = true;
  scrim.innerHTML = '<div class="yt-box"><button class="bk-x" id="ytX" aria-label="Close">✕</button>'
                  + '<div id="ytSlot"></div></div>';
  function mount(){ if(!scrim.parentNode && document.body) document.body.appendChild(scrim); }
  document.addEventListener('DOMContentLoaded', mount); mount();

  document.addEventListener('click', function(e){
    const b = e.target.closest('.short');
    if (b){
      const s = LIST[+b.dataset.i]; if(!s) return;
      mount();
      document.getElementById('ytSlot').innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + s.id + '?autoplay=1&rel=0" '
        + 'title="' + (s.title||'Short') + '" allow="autoplay; encrypted-media" '
        + 'allowfullscreen frameborder="0"></iframe>';
      scrim.hidden = false; document.body.style.overflow = 'hidden';
      document.getElementById('ytX').focus();
      return;
    }
    if (e.target.id === 'ytX' || e.target === scrim){
      document.getElementById('ytSlot').innerHTML = '';
      scrim.hidden = true; document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !scrim.hidden){
      document.getElementById('ytSlot').innerHTML = '';
      scrim.hidden = true; document.body.style.overflow = '';
    }
  });

  /* arrows scroll by one card */
  document.addEventListener('click', function(e){
    const a=e.target.closest('[data-rail]'); if(!a) return;
    const card=host.querySelector('.short');
    const step=card ? card.getBoundingClientRect().width+16 : 220;
    host.scrollBy({left: a.dataset.rail==='next' ? step : -step, behavior:'smooth'});
  });
  function arrows(){
    const nav=document.getElementById('shortsNav'); if(!nav) return;
    const max=host.scrollWidth-host.clientWidth-2;
    nav.querySelector('[data-rail=prev]').disabled = host.scrollLeft<=2;
    nav.querySelector('[data-rail=next]').disabled = host.scrollLeft>=max;
  }
  host.addEventListener('scroll', arrows, {passive:true});
  window.addEventListener('resize', arrows);

  window.addEventListener('gs:lang', render);
  render(); setTimeout(arrows,60);
})();
