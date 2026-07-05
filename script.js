const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const spinButton = document.getElementById("spinButton");
const centerButton = document.getElementById("centerButton");
const resetButton = document.getElementById("resetButton");
const obsButton = document.getElementById("obsButton");

const resultText = document.getElementById("resultText");
const resultIcon = document.getElementById("resultIcon");
const historyList = document.getElementById("history");

const levelEl = document.getElementById("level");
const levelNameEl = document.getElementById("levelName");
const countEl = document.getElementById("count");
const progressEl = document.getElementById("progress");

const modal = document.getElementById("modal");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const flash = document.getElementById("flash");

const segments = [
  { title: "Diamantes x16", icon: "💎", category: "SUERTE", type: "good", color: "#0f9c42" },
  { title: "+2 Corazones", icon: "💚", category: "SUERTE", type: "good", color: "#18b645" },
  { title: "Manzana Dorada", icon: "🍏", category: "SUERTE", type: "good", color: "#13983d" },

  { title: "Nada pasa nada", icon: "🙂", category: "DESAFÍO", type: "neutral", color: "#8a7300" },
  { title: "Sin comida 5 min", icon: "🍖", category: "DESAFÍO", type: "bad", color: "#a05a00" },
  { title: "No podés correr", icon: "🏃", category: "DESAFÍO", type: "bad", color: "#a54600" },

  { title: "Mobs más rápidos", icon: "⚡", category: "CAOS", type: "bad", color: "#b82813" },
  { title: "Explosiones", icon: "💥", category: "CAOS", type: "bad", color: "#c10e14" },
  { title: "TNT debajo tuyo", icon: "🧨", category: "CAOS", type: "bad", color: "#a20a18" },
  { title: "Lluvia de flechas", icon: "🏹", category: "CAOS", type: "bad", color: "#8b0a28" },

  { title: "Solo 1 corazón", icon: "💔", category: "PESADILLA", type: "bad", color: "#5b0f78" },
  { title: "Invoca un Warden", icon: "👁️", category: "PESADILLA", type: "bad", color: "#48118d" },
  { title: "Invoca un Wither", icon: "☠️", category: "PESADILLA", type: "bad", color: "#35105f" }
];

let rotation = 0;
let spinning = false;
let luckyCount = 0;
let level = 1;
let lastTickSegment = -1;

const TAU = Math.PI * 2;
const pointerAngle = -Math.PI / 2; // top pointer

function normalizeAngle(a) {
  a = a % TAU;
  return a < 0 ? a + TAU : a;
}

function drawWheel() {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const outer = 410;
  const inner = 128;
  const segAngle = TAU / segments.length;

  ctx.clearRect(0, 0, w, h);

  // outer rings
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.arc(0, 0, outer + 18, 0, TAU);
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 10;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 35;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(0, 0, outer + 2, 0, TAU);
  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.rotate(rotation);

  segments.forEach((seg, i) => {
    const start = i * segAngle;
    const end = start + segAngle;

    const grad = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
    grad.addColorStop(0, shade(seg.color, 35));
    grad.addColorStop(.62, seg.color);
    grad.addColorStop(1, shade(seg.color, -35));

    ctx.beginPath();
    ctx.arc(0, 0, outer, start, end);
    ctx.arc(0, 0, inner, end, start, true);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.24)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // icon only, no text to avoid overlap
    ctx.save();
    ctx.rotate(start + segAngle / 2);
    ctx.translate((inner + outer) / 2, 0);
    ctx.rotate(Math.PI / 2);
    ctx.font = "66px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = 12;
    ctx.fillText(seg.icon, 0, 0);
    ctx.restore();
  });

  // inner hole
  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, TAU);
  ctx.fillStyle = "#020713";
  ctx.fill();
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 5;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // little marks
  for (let i = 0; i < segments.length; i++) {
    ctx.save();
    ctx.rotate(i * segAngle);
    ctx.beginPath();
    ctx.moveTo(outer - 16, 0);
    ctx.lineTo(outer + 8, 0);
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function getSegmentAtPointer() {
  const segAngle = TAU / segments.length;
  // Converts pointer world angle into wheel local angle.
  const localAngle = normalizeAngle(pointerAngle - rotation);
  return Math.floor(localAngle / segAngle) % segments.length;
}

function spin() {
  if (spinning) return;
  spinning = true;

  resultIcon.textContent = "🎡";
  resultText.textContent = "GIRANDO...";
  hideModal();

  const selected = Math.floor(Math.random() * segments.length);
  const segAngle = TAU / segments.length;
  const selectedCenter = selected * segAngle + segAngle / 2;

  // To land selected segment under top pointer:
  const targetRotation = normalizeAngle(pointerAngle - selectedCenter);
  const current = normalizeAngle(rotation);
  let delta = targetRotation - current;
  if (delta < 0) delta += TAU;

  const spins = TAU * (6 + Math.floor(Math.random() * 3));
  const startRotation = rotation;
  const finalRotation = rotation + spins + delta;
  const duration = 5200;
  const startTime = performance.now();
  lastTickSegment = getSegmentAtPointer();

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = easeOutQuint(t);
    rotation = startRotation + (finalRotation - startRotation) * eased;
    drawWheel();

    const currentSeg = getSegmentAtPointer();
    if (currentSeg !== lastTickSegment) {
      lastTickSegment = currentSeg;
      tick();
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation = normalizeAngle(finalRotation);
      drawWheel();

      // This verifies the marked segment matches the result.
      const landed = getSegmentAtPointer();
      finish(landed);
    }
  }

  requestAnimationFrame(animate);
}

function finish(index) {
  const seg = segments[index];

  resultIcon.textContent = seg.icon;
  resultText.textContent = seg.title.toUpperCase();

  luckyCount++;
  if (luckyCount >= 10) {
    luckyCount = 0;
    level = Math.min(4, level + 1);
  }
  updateLevel();

  addHistory(seg);
  showModal(seg);
  doFlash(seg.type);
  hit(seg.type);

  spinning = false;
}

function updateLevel() {
  levelEl.textContent = level;
  countEl.textContent = luckyCount;
  progressEl.style.width = `${(luckyCount / 10) * 100}%`;

  const names = {
    1: "CONTROLADO",
    2: "PELIGROSO",
    3: "INESTABLE",
    4: "PESADILLA"
  };
  levelNameEl.textContent = names[level] || "PESADILLA";
  document.body.dataset.level = level;
}

function addHistory(seg) {
  const li = document.createElement("li");
  li.innerHTML = `<span style="font-size:26px">${seg.icon}</span><span><b>${seg.title}</b><small>Nivel ${level} · ${seg.category}</small></span>`;
  historyList.prepend(li);
  while (historyList.children.length > 9) {
    historyList.removeChild(historyList.lastChild);
  }
}

function showModal(seg) {
  modalIcon.textContent = seg.icon;
  modalTitle.textContent = seg.title;
  modalCategory.textContent = seg.category;
  modal.classList.add("show");

  setTimeout(hideModal, 2300);
}

function hideModal() {
  modal.classList.remove("show");
}

function doFlash(type) {
  flash.className = "";
  void flash.offsetWidth;
  if (type === "good") flash.classList.add("goodFlash");
  else if (type === "bad") flash.classList.add("badFlash");
  else flash.classList.add("neutralFlash");
}

function resetAll() {
  rotation = 0;
  luckyCount = 0;
  level = 1;
  historyList.innerHTML = "";
  resultIcon.textContent = "🎲";
  resultText.textContent = "ABRÍ UN LUCKY BLOCK Y GIRÁ LA RULETA";
  updateLevel();
  hideModal();
  drawWheel();
}

function toggleOBS() {
  document.body.classList.toggle("obs");
  obsButton.textContent = document.body.classList.contains("obs") ? "↩ SALIR MODO OBS" : "📺 MODO OBS";
}

function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}

function shade(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00FF) + percent;
  let b = (num & 0x0000FF) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + (b | (g << 8) | (r << 16)).toString(16).padStart(6, "0");
}

// Simple generated sounds, no external files needed.
let audioContext;
function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function tick() {
  try {
    const ac = getAudio();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.value = 620;
    g.gain.value = 0.025;
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.025);
  } catch (e) {}
}

function hit(type) {
  try {
    const ac = getAudio();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type === "good" ? "triangle" : "sawtooth";
    o.frequency.value = type === "good" ? 520 : 90;
    g.gain.value = 0.075;
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + .35);
    o.stop(ac.currentTime + .36);
  } catch (e) {}
}

spinButton.addEventListener("click", spin);
centerButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetAll);
obsButton.addEventListener("click", toggleOBS);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    spin();
  }
  if (e.key.toLowerCase() === "r") resetAll();
  if (e.key.toLowerCase() === "o") toggleOBS();
});

updateLevel();
drawWheel();
