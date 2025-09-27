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
    setTimeout(runType, 500);
  }
}
runType();

// ===== Background stars (lightweight 2D canvas, mobile friendly) =====
const bg = document.getElementById('bg-canvas');
const ctx = bg.getContext('2d', { alpha: true });
function resizeCanvas(){ bg.width = window.innerWidth; bg.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

const STAR_COUNT = Math.min(120, Math.floor(window.innerWidth/12));
const stars = [];
for(let i=0;i<STAR_COUNT;i++){
  stars.push({
    x: Math.random()*bg.width,
    y: Math.random()*bg.height,
    z: Math.random()*1 + .2, // parallax depth
    r: Math.random()*1.4 + .4,
    s: Math.random()*0.4 + 0.2 // sparkle
  });
}
let mx=0,my=0;
window.addEventListener('pointermove', e=>{
  mx = (e.clientX / window.innerWidth - 0.5) * 8;
  my = (e.clientY / window.innerHeight - 0.5) * 8;
},{passive:true});

function renderStars(){
  ctx.clearRect(0,0,bg.width,bg.height);
  for(const st of stars){
    const x = st.x + mx*st.z, y = st.y + my*st.z;
    ctx.globalAlpha = 0.7 + Math.sin((performance.now()/600)+st.x)*0.3*st.s;
    ctx.fillStyle = '#cfeaff';
    ctx.beginPath(); ctx.arc(x, y, st.r, 0, Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(renderStars);
}
renderStars();

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

// CSS for video (injected so we don’t edit your CSS file more)
const style = document.createElement('style');
style.textContent = `.thumb-video{display:block; box-shadow:0 10px 30px rgba(0,0,0,.35)} .proj:hover{transform:translateY(-2px)}`;
document.head.appendChild(style);

const projectCards = document.querySelectorAll('.proj');
projectCards.forEach(card=>{
  const placeholder = card.querySelector('.thumb');
  const video = createVideoEl(card);
  if(!video) return;

  // Swap placeholder -> video on first hover/tap
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
  card.addEventListener('click', ()=>{
    ensureVideo();
    if(video.paused){ video.play().catch(()=>{}); } else { video.pause(); }
  });
});

// ===== Scrollspy (highlight nav link) =====
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

// ===== Smooth internal anchor scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href'); const target = document.querySelector(id);
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});