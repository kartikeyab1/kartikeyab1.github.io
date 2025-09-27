// ===== Year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Theme toggle (persist) =====
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
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
setTheme(initialTheme);
toggle?.addEventListener('click', ()=>{
  const current = localStorage.getItem('theme') || initialTheme;
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next); setTheme(next);
});

// ===== Mobile drawer =====
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
function closeDrawer(){ drawer.classList.remove('show'); hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded','false'); drawer.setAttribute('aria-hidden','true'); }
hamburger?.addEventListener('click', ()=>{
  const open = !drawer.classList.contains('show');
  drawer.classList.toggle('show', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
});
drawer?.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeDrawer));
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

// ===== Reveal on scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// ===== Typed subtitle with icon swap (emoji-safe) =====
const subtitles = [
  { icon:'⚡', text:'Electrical Engineering @ McMaster University' },
  { icon:'🏎️', text:'Research Intern @ McMaster Automotive Resource Centre (MARC)' },
];
const iconEl = document.getElementById('subtitle-icon');
const textEl = document.getElementById('subtitle-text');
let sIdx = 0, cIdx = 0, deleting = false;
function runType(){
  const current = subtitles[sIdx].text;
  iconEl.textContent = subtitles[sIdx].icon;
  if(!deleting && cIdx < current.length){
    textEl.textContent = current.slice(0, ++cIdx);
    setTimeout(runType, 60);
  } else if(!deleting && cIdx === current.length){
    deleting = true; setTimeout(runType, 1500);
  } else if(deleting && cIdx > 0){
    textEl.textContent = current.slice(0, --cIdx);
    setTimeout(runType, 40);
  } else {
    deleting = false; sIdx = (sIdx+1) % subtitles.length;
    // spark towards the subtitle line on switch
    if (typeof strikeToElement === 'function') {
      const subline = document.getElementById('typed-subtitle');
      if (subline) strikeToElement(subline);
    }
    setTimeout(runType, 500);
  }
}
runType();

// ===== Background stars + Tesla coil lightning (2D canvas) =====
const bg = document.getElementById('bg-canvas');
const ctx = bg.getContext('2d', { alpha: true });

function resizeCanvas(){
  bg.width = window.innerWidth;
  bg.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Stars
const STAR_COUNT = Math.min(120, Math.floor(window.innerWidth/12));
const stars = [];
for (let i = 0; i < STAR_COUNT; i++){
  stars.push({
    x: Math.random()*bg.width,
    y: Math.random()*bg.height,
    z: Math.random()*1 + .2,
    r: Math.random()*1.4 + .4,
    s: Math.random()*0.4 + 0.2
  });
}
let mx=0,my=0;
window.addEventListener('pointermove', e=>{
  mx = (e.clientX / window.innerWidth - 0.5) * 8;
  my = (e.clientY / window.innerHeight - 0.5) * 8;
},{passive:true});

// Lightning arcs
const arcs = []; // {pts:[{x,y}], life, maxLife}
let lastStrike = 0;

function coilTip(){
  const hero = document.querySelector('.hero-card');
  const coil = document.querySelector('.coil svg');
  if(!hero || !coil) return { x: bg.width*0.75, y: bg.height*0.28 }; // fallback
  const cr = coil.getBoundingClientRect();
  const tipX = cr.left + cr.width/2;
  const tipY = cr.top + cr.height*0.38; // approx toroid top
  const scaleX = bg.width / window.innerWidth;
  const scaleY = bg.height / window.innerHeight;
  return { x: tipX*scaleX, y: tipY*scaleY };
}

function spawnArc(sx, sy, tx, ty){
  const segs = 18;
  const pts = [];
  for(let i=0;i<=segs;i++){
    const t = i / segs;
    const x = sx + (tx - sx) * t;
    const y = sy + (ty - sy) * t;
    const dx = tx - sx, dy = ty - sy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy/len, ny = dx/len;
    const jitter = (Math.sin(t*Math.PI*2 + Math.random()*0.6) * (1 - Math.abs(0.5 - t)*2)) * (12 + Math.random()*14);
    pts.push({ x: x + nx*jitter, y: y + ny*jitter });
  }
  arcs.push({ pts, life: 0, maxLife: 260 + Math.random()*120 });
}

function strikeToElement(el){
  const tip = coilTip();
  const r = el.getBoundingClientRect();
  const cx = (r.left + r.right)/2, cy = (r.top + r.bottom)/2;
  const sx = tip.x, sy = tip.y;
  const scaleX = bg.width / window.innerWidth;
  const scaleY = bg.height / window.innerHeight;
  spawnArc(sx, sy, cx*scaleX, cy*scaleY);
}
window.strikeToElement = strikeToElement; // expose for typewriter

// Main draw loop
let lastTs = performance.now();
(function draw(){
  const now = performance.now();
  const dt = now - lastTs; lastTs = now;

  // Clear
  ctx.clearRect(0,0,bg.width,bg.height);

  // Stars with parallax & sparkle
  for(const st of stars){
    const x = st.x + mx*st.z, y = st.y + my*st.z;
    ctx.globalAlpha = 0.7 + Math.sin((now/600)+st.x)*0.3*st.s;
    ctx.fillStyle = '#cfeaff';
    ctx.beginPath(); ctx.arc(x, y, st.r, 0, Math.PI*2); ctx.fill();
  }

  // Ambient random strike every 2–4s
  if (now - lastStrike > 2000 + Math.random()*2000){
    const tip = coilTip();
    const tx = bg.width * (0.35 + Math.random()*0.4);
    const ty = bg.height * (0.12 + Math.random()*0.2);
    spawnArc(tip.x, tip.y, tx, ty);
    lastStrike = now;
  }

  // Draw lightning arcs (glow + core)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = arcs.length - 1; i >= 0; i--){
    const a = arcs[i];
    a.life += dt;
    const t = Math.min(1, a.life / a.maxLife);
    const alpha = (1 - t) * (0.9 + 0.1*Math.random());
    const w = 2.2 * (1 - t) + 0.8;

    // outer glow
    ctx.lineWidth = w * 2.2;
    ctx.strokeStyle = `rgba(46,206,255,${alpha*0.18})`;
    ctx.beginPath();
    ctx.moveTo(a.pts[0].x, a.pts[0].y);
    for (let p = 1; p < a.pts.length; p++) ctx.lineTo(a.pts[p].x, a.pts[p].y);
    ctx.stroke();

    // core
    ctx.lineWidth = w;
    ctx.strokeStyle = `rgba(190,246,255,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(a.pts[0].x, a.pts[0].y);
    for (let p = 1; p < a.pts.length; p++) ctx.lineTo(a.pts[p].x, a.pts[p].y);
    ctx.stroke();

    if (t >= 1) arcs.splice(i,1);
  }
  ctx.restore();

  requestAnimationFrame(draw);
})();

// Coil toroid flicker (subtle)
(function flicker(){
  const coilSvg = document.querySelector('.coil svg');
  if (coilSvg){
    const toroid = coilSvg.querySelector('ellipse');
    if(toroid){
      const boost = (Math.sin(performance.now()/120) + 1) * 0.04 + (Math.random()*0.02);
      toroid.style.filter = `drop-shadow(0 0 ${8+boost*20}px rgba(34,211,238,${0.45+boost}))`;
    }
  }
  requestAnimationFrame(flicker);
})();

// ===== Project video previews (hover on desktop, tap on mobile) =====
function createVideoEl(card){
  const src = card.dataset.video; if(!src) return null;
  const poster = card.dataset.poster || '';
  const v = document.createElement('video');
  v.src = src; v.poster = poster; v.muted = true; v.loop = true; v.playsInline = true;
  v.autoplay = false; v.preload = 'metadata';
  v.className = 'thumb-video';
  v.style.width = '100%'; v.style.aspectRatio = '16/9'; v.style.borderRadius = '14px';
  v.style.marginTop = '12px'; v.style.border = '1px solid rgba(255,255,255,0.08)';
  return v;
}
// minimal CSS for the preview video
const style = document.createElement('style');
style.textContent = `.thumb-video{display:block; box-shadow:0 10px 30px rgba(0,0,0,.35)} .proj:hover{transform:translateY(-2px)}`;
document.head.appendChild(style);

document.querySelectorAll('.proj').forEach(card=>{
  const placeholder = card.querySelector('.thumb');
  const video = createVideoEl(card);
  if(!video) return; // no file yet — keep placeholder

  // draw lightning when hovering this card
  card.addEventListener('mouseenter', ()=> strikeToElement(card));
  card.addEventListener('focus', ()=> strikeToElement(card));

  let loaded = false;
  function ensureVideo(){
    if(loaded) return;
    placeholder?.replaceWith(video);
    loaded = true;
  }
  // Desktop hover
  card.addEventListener('mouseenter', ()=>{ ensureVideo(); video.play().catch(()=>{}); });
  card.addEventListener('mouseleave', ()=>{ if(loaded){ video.pause(); video.currentTime = 0; } });
  // Mobile tap toggles play/pause
  card.addEventListener('click', ()=>{ ensureVideo(); if(video.paused){ video.play().catch(()=>{}); } else { video.pause(); } });
});

// ===== Scrollspy =====
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

// ===== Smooth anchor scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href'); const target = document.querySelector(id);
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});

// ===== Icon fallbacks (if a logo file is missing) =====
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
      img.remove();
    }
  }, { once:true });
});

// ===== Strike when hovering hero icons too =====
document.querySelectorAll('.btn-icon').forEach(el=>{
  el.addEventListener('mouseenter', ()=> strikeToElement(el));
  el.addEventListener('focus', ()=> strikeToElement(el));
});
