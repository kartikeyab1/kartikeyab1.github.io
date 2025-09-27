// Set year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Typed subtitle animation
const subtitles = [
  { icon: "⚡", text: "Electrical Engineering Student" },
  { icon: "💻", text: "Full-Stack Developer" },
  { icon: "🚀", text: "Open Source Enthusiast" },
];
const iconEl = document.getElementById("subtitle-icon");
const textEl = document.getElementById("subtitle-text");

let s = 0, i = 0, del = false;
function typeLoop() {
  const cur = subtitles[s].text;
  iconEl.textContent = subtitles[s].icon;
  if (!del && i < cur.length) {
    textEl.textContent = cur.slice(0, ++i);
    setTimeout(typeLoop, 60);
  } else if (!del && i === cur.length) {
    del = true;
    setTimeout(typeLoop, 1500);
  } else if (del && i > 0) {
    textEl.textContent = cur.slice(0, --i);
    setTimeout(typeLoop, 40);
  } else {
    del = false;
    s = (s + 1) % subtitles.length;
    setTimeout(typeLoop, 500);
  }
}
typeLoop();

// Theme toggle
const themeToggleBtn = document.getElementById("themeToggle");
const bodyEl = document.body;
const themeMap = {
  dark: {color: 0x0ea5e9, color2: 0xa78bfa},
  light: {color: 0x606c76, color2: 0xd1d1d1}
};
let vantaEffect = null;

function applyTheme(theme) {
  if (theme === "light") {
    bodyEl.classList.add("light-theme");
  } else {
    bodyEl.classList.remove("light-theme");
  }
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
let currentTheme = savedTheme || defaultTheme;
applyTheme(currentTheme);

themeToggleBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(currentTheme);
});

// Canvas and Hexagon spark animation
const canvas = document.getElementById('tesla-canvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
resize();
window.addEventListener('resize', resize);

let mouseX = width / 2;
let mouseY = height / 2;
window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Draw hexagon at (x, y) with radius r and glow
function drawHexagon(x, y, r = 50, glow = 15) {
  ctx.save();
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#0ea5e9';
  ctx.shadowBlur = glow;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    let angle = Math.PI / 3 * i - Math.PI / 6;
    let vx = x + r * Math.cos(angle);
    let vy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// Spark class
class Spark {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = 60;
    this.size = Math.random() * 2 + 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.life--;
    this.size *= 0.95;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${this.life / 60})`;
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 12;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const sparks = [];

function createSparks() {
  for (let i = 0; i < 10; i++) {
    const angle = (Math.random() * 2 - 1) * 0.5;
    const speed = Math.random() * 2 + 2;
    const vx = Math.sin(angle) * speed;
    const vy = -Math.cos(angle) * speed;
    sparks.push(new Spark(mouseX + (Math.random() * 20 - 10), mouseY - 20, vx, vy));
  }
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Glow depends on vertical mouse position
  let glow = 10 + (height - mouseY) / 15;

  drawHexagon(mouseX, mouseY, 50, glow);

  if (sparks.length < 150) {
    createSparks();
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].draw();
    if (sparks[i].life <= 0 || sparks[i].size < 0.1) {
      sparks.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
