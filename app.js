// Initialize year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Typed subtitle
const subtitles = [
  { icon: "⚡", text: "Electrical Engineering Student" },
  { icon: "💻", text: "Full-Stack Developer" },
  { icon: "🚀", text: "Open Source Enthusiast" },
];

const iconEl = document.getElementById("subtitle-icon");
const textEl = document.getElementById("subtitle-text");

let s = 0,
  i = 0,
  del = false;

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

// Theme toggle with Vanta globe color switch
let vantaEffect = null;

const themeToggleBtn = document.getElementById("themeToggle");
const bodyEl = document.body;

const themeMap = {
  dark: { color: 0x0ea5e9, color2: 0xa78bfa },
  light: { color: 0x606c76, color2: 0xd1d1d1 },
};

function initVanta(themeColors) {
  if (vantaEffect) vantaEffect.destroy();
  vantaEffect = VANTA.GLOBE({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    scale: 1,
    scaleMobile: 1,
    color: themeColors.color,
    color2: themeColors.color2,
    backgroundAlpha: 0,
  });
}

function applyTheme(theme) {
  if (theme === "light") {
    bodyEl.classList.add("light-theme");
  } else {
    bodyEl.classList.remove("light-theme");
  }
  initVanta(themeMap[theme]);
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
