// ===== Utility: set current year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Simple theme toggle (persist to localStorage) =====
const toggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const root = document.documentElement;

function setTheme(mode) {
  // Light tweaks shift the palette subtly; keep contrast high
  if (mode === 'light') {
    root.style.setProperty('--bg', '#f8fafc');
    root.style.setProperty('--bg-2', '#f1f5f9');
    root.style.setProperty('--soft', '#e2e8f0');
    root.style.setProperty('--text', '#0b1220');
    root.style.setProperty('--muted', '#475569');
    root.style.setProperty('--card', 'rgba(255,255,255,0.7)');
    document.body.style.background =
      'radial-gradient(1200px 800px at 70% 10%, #eef6ff 0%, #f8fafc 40%, #eef2ff 100%)';
  } else {
    // reset to defaults by removing overrides
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
  const next =
    (localStorage.getItem('theme') || initial) === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  setTheme(next);
});

// ===== Reveal-on-scroll helper =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ===== 3D BACKGROUND with Three.js =====
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 8);

// Subtle fog for depth
scene.fog = new THREE.FogExp2(0x071018, 0.08);

// Responsive sizing
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
onResize();

// Lights
const light = new THREE.DirectionalLight(0x7fdcff, 1.1);
light.position.set(2, 3, 2);
scene.add(light);
scene.add(new THREE.AmbientLight(0x5577aa, 0.6));

// Procedural starfield (instanced points)
const starCount = 1200;
const starGeom = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 20 * Math.random() + 6;      // ring radius
  const a = Math.random() * Math.PI * 2; // angle
  positions[i * 3 + 0] = Math.cos(a) * r;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
  positions[i * 3 + 2] = Math.sin(a) * r;
}
starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMat = new THREE.PointsMaterial({ color: 0x66e4ff, size: 0.03, transparent: true, opacity: 0.85 });
const stars = new THREE.Points(starGeom, starMat);
scene.add(stars);

// Centerpiece: glossy torus knot
const tkGeom = new THREE.TorusKnotGeometry(1.2, 0.38, 222, 24);
const tkMat = new THREE.MeshStandardMaterial({ color: 0x2bd4ff, metalness: 0.6, roughness: 0.25, envMapIntensity: 1.0 });
const knot = new THREE.Mesh(tkGeom, tkMat);
scene.add(knot);

// Floating chips around the knot
const chipGeom = new THREE.PlaneGeometry(0.45, 0.3);
const chipMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
const chips = [];
for (let i = 0; i < 10; i++) {
  const chip = new THREE.Mesh(chipGeom, chipMat.clone());
  chip.position.set((Math.random()-0.5)*6, (Math.random()-0.5)*4, (Math.random()-0.5)*6);
  chip.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  chips.push(chip);
  scene.add(chip);
}

// Render loop
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.01;
  knot.rotation.x += 0.004;
  knot.rotation.y += 0.006;
  stars.rotation.y += 0.0008;
  chips.forEach((c, i) => {
    c.rotation.y += 0.01 + i * 0.0003;
    c.position.y += Math.sin(t * 0.4 + i) * 0.0006;
  });
  renderer.render(scene, camera);
}
animate();

// ===== GSAP Scroll Animations =====
gsap.registerPlugin(ScrollTrigger);

// Pin hero for parallax
ScrollTrigger.create({
  trigger: '.hero', start: 'top top', end: '+=80%', pin: true, pinSpacing: true,
});

// Camera tween through sections
const sections = gsap.utils.toArray('section');
sections.forEach((sec, i) => {
  const zTarget = 8 - i * 1.2; // move slightly closer each section
  const yTarget = (i % 2 === 0) ? 0.2 : -0.2;

  gsap.to(camera.position, {
    scrollTrigger: { trigger: sec, start: 'top 70%', end: 'bottom 30%', scrub: 0.8 },
    z: zTarget, y: yTarget, ease: 'power2.out'
  });

  // Subtle hue shift on the knot
  gsap.to(knot.material.color, {
    scrollTrigger: { trigger: sec, start: 'top 80%', end: 'bottom 20%', scrub: 0.6 },
    r: 0.2 + 0.2 * Math.sin(i), g: 0.8 - 0.1 * i, b: 1.0 - 0.1 * i,
  });
});

// Light sweep down the page
gsap.to(light.position, {
  scrollTrigger: { trigger: '#projects', start: 'top center', end: 'bottom center', scrub: true },
  x: 3, y: 2, z: 1
});

// Smooth internal anchor scroll
Array.from(document.querySelectorAll('a[href^=\"#\"]')).forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
// ===== Typewriter effect with stable leading icons =====
const subtitles = [
  { icon: "⚡", text: "Electrical Engineering @ McMaster University" },
  { icon: "🏎️", text: "Research Intern @ McMaster Automotive Resource Centre (MARC)" }
];

const iconEl = document.getElementById("subtitle-icon");
const textEl = document.getElementById("subtitle-text");

let sentence = 0;   // which subtitle
let idx = 0;        // character index
let deleting = false;

function cycleSubtitle() {
  const current = subtitles[sentence].text;
  iconEl.textContent = subtitles[sentence].icon; // set the icon for this sentence

  if (!deleting && idx < current.length) {
    // typing forward
    textEl.textContent = current.slice(0, idx + 1);
    idx++;
    setTimeout(cycleSubtitle, 60);
  } else if (!deleting && idx === current.length) {
    // pause when complete
    deleting = true;
    setTimeout(cycleSubtitle, 1500);
  } else if (deleting && idx > 0) {
    // deleting backward
    textEl.textContent = current.slice(0, idx - 1);
    idx--;
    setTimeout(cycleSubtitle, 40);
  } else if (deleting && idx === 0) {
    // switch sentence
    deleting = false;
    sentence = (sentence + 1) % subtitles.length;
    setTimeout(cycleSubtitle, 500);
  }
}
cycleSubtitle();



typeSubtitle();

