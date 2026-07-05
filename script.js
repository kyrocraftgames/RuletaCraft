const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const centerSpin = document.getElementById("centerSpin");
const resultBox = document.getElementById("result");
const historyList = document.getElementById("history");
const countText = document.getElementById("countText");
const levelText = document.getElementById("levelText");
const progressBar = document.getElementById("progressBar");
const resetBtn = document.getElementById("resetBtn");
const flash = document.getElementById("flash");

const segments = [
  { text: "Diamantes x16", color: "#0b7a2d", type: "good" },
  { text: "+2 corazones", color: "#159c35", type: "good" },
  { text: "Encantamiento aleatorio", color: "#a88900", type: "good" },
  { text: "Nada pasa nada", color: "#6d5900", type: "neutral" },
  { text: "Sin comida 5 min", color: "#9b4f00", type: "bad" },
  { text: "Mobs más rápidos", color: "#9b3a00", type: "bad" },
  { text: "Explosiones alrededor", color: "#b80f0f", type: "bad" },
  { text: "Solo 1 corazón", color: "#8d0d24", type: "bad" },
  { text: "TNT debajo tuyo", color: "#5a0730", type: "bad" },
  { text: "Lluvia de flechas", color: "#5b178f", type: "bad" },
  { text: "Invoca un Warden", color: "#4f118c", type: "bad" },
  { text: "Invoca un Wither", color: "#31105f", type: "bad" }
];

let rotation = 0;
let spinning = false;
let count = 0;
let level = 1;

function drawWheel() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 350;
  const angle = (Math.PI * 2) / segments.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Outer glow
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 8;
  ctx.shadowBlur = 28;
  ctx.shadowColor = "#00d4ff";
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  segments.forEach((seg, i) => {
    const start = i * angle;
    const end = start + angle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.rotate(start + angle / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 25px Arial";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#000";

    const words = seg.text.toUpperCase().split(" ");
    let line = "";
    let y = -radius + 92;
    words.forEach((word, idx) => {
      const test = line + word + " ";
      if (test.length > 13 && idx > 0) {
        ctx.fillText(line, 0, y);
        line = word + " ";
        y += 30;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 0, y);
    ctx.restore();
  });

  ctx.restore();

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 105, 0, Math.PI * 2);
  ctx.fillStyle = "#020817";
  ctx.fill();
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 5;
  ctx.stroke();
}

function spin() {
  if (spinning) return;
  spinning = true;
  resultBox.textContent = "Girando...";

  const chosenIndex = Math.floor(Math.random() * segments.length);
  const angle = (Math.PI * 2) / segments.length;

  // Pointer is at top (-90deg). Calculate target rotation.
  const targetAngle = (Math.PI * 1.5) - (chosenIndex * angle + angle / 2);
  const extraSpins = (Math.PI * 2) * (5 + Math.floor(Math.random() * 3));
  const start = rotation;
  const end = extraSpins + targetAngle;
  const duration = 4200;
  const startTime = performance.now();

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    rotation = start + (end - start) * ease;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation = end % (Math.PI * 2);
      drawWheel();
      finishSpin(chosenIndex);
    }
  }
  requestAnimationFrame(animate);
}

function finishSpin(index) {
  const seg = segments[index];
  resultBox.textContent = seg.text;
  spinning = false;

  count++;
  if (count >= 10) {
    count = 0;
    level = Math.min(level + 1, 4);
  }

  countText.textContent = count;
  levelText.textContent = level;
  progressBar.style.width = `${(count / 10) * 100}%`;

  const li = document.createElement("li");
  li.textContent = `Nivel ${level}: ${seg.text}`;
  historyList.prepend(li);

  flash.className = seg.type === "good" ? "good" : seg.type === "bad" ? "bad" : "";
  setTimeout(() => flash.className = "", 600);
}

function resetAll() {
  count = 0;
  level = 1;
  rotation = 0;
  countText.textContent = "0";
  levelText.textContent = "1";
  progressBar.style.width = "0%";
  historyList.innerHTML = "";
  resultBox.textContent = "Abrí un Lucky Block y girá la rueda...";
  drawWheel();
}

spinBtn.addEventListener("click", spin);
centerSpin.addEventListener("click", spin);
resetBtn.addEventListener("click", resetAll);

drawWheel();
