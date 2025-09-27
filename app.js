// ===== year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== theme toggle =====
const toggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
function setTheme(mode){
  if(mode === 'light'){
    root.style.setProperty('--bg','#f8fafc');
    root.style.setProperty('--bg-2','#f1f5f9');
    root.style.setProperty('--soft','#e2e8f0');
    root.style.setProperty('--text','#0b1220');
    root.style.setProperty('--muted','#475569');
    root.style.setProperty('--card','rgba(255,255,255,0.7)');
    document.body.style.background =
      'radial-gradient(1200px 800px at 70% 10%, #eef6ff 0%, #f8fafc 40%, #eef2ff 100%)';
  }else{
    root.style.removeProperty('--bg'); root.style.removeProperty('--bg-2'); root.style.removeProperty('--soft');
    root.style.removeProperty('--text'); root.style.removeProperty('--muted'); root.style.removeProperty('--card');
    document.body.style.background =
      'radial-gradient(1200px 800px at 70% 10%, #0a1826 0%, var(--bg) 40%, #060913 100%)';
  }
}
const initial = savedTheme || (prefersDark ? 'dark' : 'light');
setTheme(initial);
toggle?.addEventListener('click', ()=>{
  const now = localStorage.getItem('theme') || initial;
  const next = now === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next); setTheme(next);
});

// ===== mobile drawer =====
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
function closeDrawer(){
  drawer.classList.remove('show'); hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded','false'); drawer.setAttribute('aria-hidden','true');
}
hamburger?.addEventListener('click', ()=>{
  const open = !drawer.classList.contains('show');
  drawer.classList.toggle('show', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
});
drawer?.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeDrawer));
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

// ===== reveal-on-scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// ===== typed subtitle (icons separate so emoji never break) =====
const subtitles = [
  { icon:'⚡', text:'Electrical Engineering @ McMaster University' },
  { icon:'🏎️', text:'Research Intern @ McMaster Automotive Resource Centre (MARC)' },
];
const iconEl = document.getElementById('subtitle-icon');
const textEl = document.getElementById('subtitle-text');
let s = 0, i = 0, del = false;
function typeLoop(){
  const cur = subtitles[s].text;
  iconEl.textContent = subtitles[s].icon;
  if(!del && i < cur.length){ textEl.textContent = cur.slice(0, ++i); setTimeout(typeLoop, 60); }
  else if(!del && i === cur.length){ del = true; setTimeout(typeLoop, 1500); }
  else if(del && i > 0){ textEl.textContent = cur.slice(0, --i); setTimeout(typeLoop, 40); }
  else { del = false; s = (s+1)%subtitles.length; setTimeout(typeLoop, 500); }
}
typeLoop();

// ===== background stars (2D, super safe) =====
const bg = document.getElementById('bg-canvas');
const ctx = bg.getContext('2d', { alpha:true });
function resize(){ bg.width = window.innerWidth; bg.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
const STARS = Math.min(120, Math.floor(window.innerWidth/12));
const stars = Array.from({length:STARS}, ()=>({
  x: Math.random()*bg.width, y: Math.random()*bg.height,
  z: Math.random()*1 + .2, r: Math.random()*1.4 + .4, s: Math.random()*0.4 + 0.2
}));
let mx=0,my=0;
window.addEventListener('pointermove', e=>{ mx=(e.clientX/window.innerWidth-.5)*8; my=(e.clientY/window.innerHeight-.5)*8; }, {passive:true});
(function anim(){
  ctx.clearRect(0,0,bg.width,bg.height);
  for(const st of stars){
    const x = st.x + mx*st.z, y = st.y + my*st.z;
    ctx.globalAlpha = 0.7 + Math.sin((performance.now()/600)+st.x)*0.3*st.s;
    ctx.fillStyle = '#cfeaff';
    ctx.beginPath(); ctx.arc(x, y, st.r, 0, Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(anim);
})();

// ===== project video previews (only if files exist) =====
function createVideo(card){
  const src = card.dataset.video; if(!src) return null;
  const poster = card.dataset.poster || '';
  const v = document.createElement('video');
  v.src = src; v.poster = poster; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
  v.className = 'thumb-video';
  v.style.width = '100%'; v.style.aspectRatio = '16/9'; v.style.borderRadius = '14px';
  v.style.marginTop = '12px'; v.style.border = '1px solid rgba(255,255,255,0.08)';
  return v;
}
const style = document.createElement('style');
style.textContent = `.thumb-video{display:block; box-shadow:0 10px 30px rgba(0,0,0,.35)} .proj:hover{transform:translateY(-2px)}`;
document.head.appendChild(style);

document.querySelectorAll('.proj').forEach(card=>{
  const ph = card.querySelector('.thumb');
  const vid = createVideo(card);
  if(!vid) return; // no file yet — keep placeholder
  let ready = false;
  function ensure(){ if(ready) return; ph?.replaceWith(vid); ready = true; }
  card.addEventListener('mouseenter', ()=>{ ensure(); vid.play().catch(()=>{}); });
  card.addEventListener('mouseleave', ()=>{ if(ready){ vid.pause(); vid.currentTime = 0; } });
  card.addEventListener('click', ()=>{ ensure(); if(vid.paused){ vid.play().catch(()=>{});} else { vid.pause(); } });
});

// ===== scrollspy =====
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const id = '#' + e.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
    }
  });
},{rootMargin:'-45% 0px -50% 0px', threshold:0});
sections.forEach(sec=> spy.observe(sec));

// ===== smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href'); const t = document.querySelector(id);
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});

// ===== icon fallbacks (if a /src/assets/logos/*.svg is missing) =====
const FALLBACK_SVGS = {
  linkedin: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4.9V24H.5V8.5zm7.5 0h4.7v2.1h.1c.7-1.3 2.5-2.7 5.1-2.7 5.4 0 6.4 3.5 6.4 8v8.1h-4.9v-7.2c0-1.7 0-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7V24H8V8.5z"/></svg>`,
  projects: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.6-1.2-3.6-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.5 1.1 3.1.8.1-.7.4-1.1.7-1.4-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3 0 0 .9-.3 3 1.1a10.6 10.6 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>`,
  notion: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M4.5 3.2 14 .8c.5-.1 1 .2 1.2.7l3.6 17.5c.1.5-.2 1-.7 1.2l-9.5 2.4c-.5.1-1-.2-1.2-.7L3.3 4.4c-.1-.5.2-1 .7-1.2zM8 6.4l.3 10.6h2.1l-.2-8.4h.1l4.1 8.4h2.3L16.5 6.4H14l.2 7.7h-.1L10.1 6.4H8zM6.1 4.9 15 2.6l3.2 15.6-8.9 2.3L6.1 4.9z"/></svg>`
};
document.querySelectorAll('img.icon-src').forEach(img=>{
  img.addEventListener('error', ()=>{
    const key = img.dataset.fallback;
    if(FALLBACK_SVGS[key]){
      const wrapper = document.createElement('span');
      wrapper.innerHTML = FALLBACK_SVGS[key];
      img.replaceWith(wrapper.firstChild);
    } else {
      img.remove(); // last resort
    }
  }, { once:true });
});
