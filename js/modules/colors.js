// Colors module (manual: Module 10). Two colors on two displays; the answer is the sum of their numbers.
const COLORS_DEBUG = false;   // set to true to print the answer in the browser console while testing
const COLOR_TABLE = {         // same numbers as the manual's table
  blue:   { n: 3, hex: "#2563eb" }, purple: { n: 5, hex: "#7b2cbf" }, white: { n: 7, hex: "#ffffff" },
  red:    { n: 6, hex: "#d62828" }, pink:   { n: 8, hex: "#f472b6" }, orange: { n: 2, hex: "#f77f00" },
  black:  { n: 1, hex: "#111111" }
};
const colorsAnswer = (a, b) => COLOR_TABLE[a].n + COLOR_TABLE[b].n;

function mountColors(slotEl, slotIndex) {
  const names = Object.keys(COLOR_TABLE);
  const a = pick(names), b = pick(names);
  const answer = colorsAnswer(a, b);
  if (COLORS_DEBUG) console.log("Colors:", a, b, "->", answer);

  const box = document.createElement("div");
  box.className = "colors-module";
  box.innerHTML = `<div class="colors-screens">
      <div class="color-display" style="background:${COLOR_TABLE[a].hex}"></div>
      <div class="color-display" style="background:${COLOR_TABLE[b].hex}"></div>
    </div>
    <input inputmode="numeric" maxlength="2" placeholder="answer">
    <button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const input = box.querySelector("input");
  const live = () => bomb.running && !bomb.slots[slotIndex].solved;
  function submit() {
    if (!live() || input.value.trim() === "") return;
    if (Number(input.value) === answer) { solveModule(slotIndex); input.disabled = true; }
    else { addStrike(); input.value = ""; }
  }
  box.querySelector(".confirm-btn").addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}
