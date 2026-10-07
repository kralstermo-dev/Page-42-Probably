// Button module. The rules below are copied from manual.md (Module 2: Button).
const BUTTON_DEBUG = false;   // set to true to print the answer in the browser console while testing
const BUTTON_COLORS = { blue: "#2f6fe4", red: "#e0322b", green: "#2fb34a" };
const BUTTON_LABELS = ["Press", "Nothing", "", "Cheese", "Red", "Boom"];   // "" = no text. Cheese, Red and Boom are decoys

// Pure randomness rarely makes the combos the manual talks about (like a red "Press" button),
// so most of the time we start from one of these and fill in the rest randomly.
// A combo listed twice is twice as likely.
const BUTTON_FEATURED = [
  { color: "red", label: "Press" }, { color: "red", label: "Press" },
  { color: "blue" },
  { label: "Nothing" }, { label: "Nothing" },
  { label: "" },
  { color: "green" }
];
function makeButton() {
  const base = Math.random() < 0.6 ? pick(BUTTON_FEATURED) : {};
  return {
    color: base.color || pick(Object.keys(BUTTON_COLORS)),
    label: base.label !== undefined ? base.label : pick(BUTTON_LABELS)
  };
}

// Returns how many times the main button must be pressed before clicking Confirm.
// Rules are checked top to bottom, and the first one that applies wins.
function buttonAnswer(btn, bomb) {
  const hasAA = bomb.batteries.includes("AA");
  const hasUSBC = bomb.ports.includes("USB-C");

  if (btn.color === "red" && btn.label === "Press") return 1;     // rule 1
  if (btn.color === "blue") return 0;                             // rule 2
  if (btn.label === "Nothing" && hasAA) return 2;                 // rule 3
  if (btn.label === "") return 4;                                 // rule 4
  if (hasUSBC) return 1;                                          // rule 5
  if (btn.color === "green") return 3;                            // rule 6
  return 1;                                                       // rule 7 (otherwise)
}

function mountButton(slotEl, slotIndex) {
  const btn = makeButton();
  const needed = buttonAnswer(btn, bomb);
  if (BUTTON_DEBUG) console.log("Button:", btn.color, JSON.stringify(btn.label), "-> presses:", needed);

  let presses = 0;
  const box = document.createElement("div");
  box.className = "button-module";
  box.innerHTML = `
    <button class="main-btn" style="--c:${BUTTON_COLORS[btn.color]}">${btn.label}</button>
    <button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const live = () => bomb.running && !bomb.slots[slotIndex].solved;

  box.querySelector(".main-btn").addEventListener("click", () => {
    if (live()) presses++;                      // no feedback, so players have to count
  });
  box.querySelector(".confirm-btn").addEventListener("click", () => {
    if (!live()) return;
    if (presses === needed) solveModule(slotIndex);
    else { addStrike(); presses = 0; }          // wrong count: strike, and start counting again
  });
}
