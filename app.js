// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme toggle
const toggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const root = document.documentElement;

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
    root.style.removeProperty('--bg');
    root.style.removeProperty('--bg-2');
    root.style.removeProperty('--soft');
    root.style.removeProperty('--text');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--card');
    document.body.style.background =
      'radial-gradient(1200px 800px at 70% 10%, #0a1826 0%, var(--bg) 40%, #060913 100%)';
  }
}
const initial = savedTheme || (prefersDark ? 'dark' : 'light');
setTheme(initial);
toggle.addEventListener('click', () => {
  const next = (localStorage.getItem('theme') || initial) === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next); setTheme(next);
});

// Reveal on scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); observer.unobserve(e.target);} });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// =========================
// THREE.JS SPACE + RING
// =========================
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.2, 9);
scene.fog = new THREE.FogExp2(0x070b12, 0.07);

// Resize
function onResize(){
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
}
window.addEventListener('resize', onResize); onResize();

// Lights
const dir = new THREE.DirectionalLight(0x8fd7ff, 1.15); dir.position.set(2,3,2); scene.add(dir);
const amb = new THREE.AmbientLight(0x5f79a8, 0.65); scene.add(amb);

// Starfield
const starCount = 2400;
const starGeom = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for(let i=0;i<starCount;i++){
  const r = 28 * Math.random() + 8;
  const a = Math.random() * Math.PI * 2;
  sta
