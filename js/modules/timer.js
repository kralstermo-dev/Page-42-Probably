// Timer module. The rules below are copied from manual.md (Module 3: Timer).
// The player points the gauge's needle at the right color for the bomb's timer, then clicks Confirm.
const TIMER_DEBUG = false;   // set to true to print the correct color in the browser console while testing

const LAMP_COLORS = [        // left to right on the gauge, same order as the manual's table
  { name: "Green",       hex: "#00FF00" },
  { name: "Light green", hex: "#80FF00" },
  { name: "Yellow",      hex: "#FFFF00" },
  { name: "Orange",      hex: "#FF8000" },
  { name: "Red",         hex: "#FF0000" }
];
const GAUGE_STEP = 180 / LAMP_COLORS.length;   // each color covers an equal slice of the half circle

// secondsLeft is bomb.timeLeft. 5:00-4:01 = 300-241, 4:00-3:01 = 240-181, and so on.
function timerColorIndex(secondsLeft) {
  if (secondsLeft > 240) return 0;   // 5:00 - 4:01 green
  if (secondsLeft > 180) return 1;   // 4:00 - 3:01 light green
  if (secondsLeft > 120) return 2;   // 3:00 - 2:01 yellow
  if (secondsLeft > 60)  return 3;   // 2:00 - 1:01 orange
  return 4;                          // 1:00 - 0:01 red
}

// Draws the half-circle gauge as SVG: one curved slice per color, plus the needle.
function gaugeSVG() {
  const cx = 100, cy = 100, outer = 90, inner = 50;
  const pt = (rad, deg) =>
    `${(cx + rad * Math.cos(deg * Math.PI / 180)).toFixed(1)},${(cy - rad * Math.sin(deg * Math.PI / 180)).toFixed(1)}`;
  let slices = "";
  LAMP_COLORS.forEach((c, i) => {
    const a1 = 180 - i * GAUGE_STEP, a2 = 180 - (i + 1) * GAUGE_STEP;      // angles, left (180) to right (0)
    slices += `<path class="seg" data-i="${i}" fill="${c.hex}" d="M${pt(outer, a1)} A${outer},${outer} 0 0 1 ${pt(outer, a2)} L${pt(inner, a2)} A${inner},${inner} 0 0 0 ${pt(inner, a1)} Z"/>`;
  });
  return `<svg viewBox="0 0 200 110" class="gauge">${slices}<g class="needle"><polygon points="100,18 94,100 106,100"/><circle cx="100" cy="100" r="9"/></g></svg>`;
}

function mountTimerModule(slotEl, slotIndex) {
  let pointed = rand(LAMP_COLORS.length);       // the needle starts on a random color
  const box = document.createElement("div");
  box.className = "gauge-module";
  box.innerHTML = gaugeSVG() + `<button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const needle = box.querySelector(".needle");
  const aim = () => { needle.style.transform = `rotate(${pointed * GAUGE_STEP + GAUGE_STEP / 2 - 90}deg)`; };
  aim();

  const live = () => bomb.running && !bomb.slots[slotIndex].solved;

  box.querySelectorAll(".seg").forEach((seg) =>
    seg.addEventListener("click", () => {
      if (!live()) return;
      pointed = Number(seg.dataset.i);          // clicking a color swings the needle to it
      aim();
    })
  );
  box.querySelector(".confirm-btn").addEventListener("click", () => {
    if (!live()) return;
    const right = timerColorIndex(bomb.timeLeft);   // judged at the moment of clicking Confirm
    if (TIMER_DEBUG) console.log("Timer:", bomb.timeLeft, "s ->", LAMP_COLORS[right].name);
    if (pointed === right) solveModule(slotIndex);
    else addStrike();
  });
}
