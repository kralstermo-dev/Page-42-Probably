// Timer module. The rules below are copied from manual.md (Module 3: Timer).
// The player cycles the lamp to the color for the time shown on the bomb's timer, then clicks Confirm.
const TIMER_DEBUG = false;   // set to true to print the correct color in the browser console while testing

const LAMP_COLORS = [        // same order as the manual's table, so clicking the lamp cycles through them
  { name: "Green",       hex: "#00FF00" },
  { name: "Light green", hex: "#80FF00" },
  { name: "Yellow",      hex: "#FFFF00" },
  { name: "Orange",      hex: "#FF8000" },
  { name: "Red",         hex: "#FF0000" }
];

// secondsLeft is bomb.timeLeft. 5:00-4:01 = 300-241, 4:00-3:01 = 240-181, and so on.
function timerColorIndex(secondsLeft) {
  if (secondsLeft > 240) return 0;   // 5:00 - 4:01 green
  if (secondsLeft > 180) return 1;   // 4:00 - 3:01 light green
  if (secondsLeft > 120) return 2;   // 3:00 - 2:01 yellow
  if (secondsLeft > 60)  return 3;   // 2:00 - 1:01 orange
  return 4;                          // 1:00 - 0:01 red
}

function mountTimerModule(slotEl, slotIndex) {
  let lamp = rand(LAMP_COLORS.length);          // the lamp starts on a random color
  const box = document.createElement("div");
  box.className = "lamp-module";
  box.innerHTML = `<button class="lamp"></button><button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const lampBtn = box.querySelector(".lamp");
  const paint = () => lampBtn.style.setProperty("--c", LAMP_COLORS[lamp].hex);
  paint();

  const live = () => bomb.running && !bomb.slots[slotIndex].solved;

  lampBtn.addEventListener("click", () => {
    if (!live()) return;
    lamp = (lamp + 1) % LAMP_COLORS.length;
    paint();
  });
  box.querySelector(".confirm-btn").addEventListener("click", () => {
    if (!live()) return;
    const right = timerColorIndex(bomb.timeLeft);   // judged at the moment of clicking Confirm
    if (TIMER_DEBUG) console.log("Timer:", bomb.timeLeft, "s -> ", LAMP_COLORS[right].name);
    if (lamp === right) solveModule(slotIndex);
    else addStrike();
  });
}
