// Resistor module (manual: Module 7). Answer = (first band + second band) x third band.
const RESISTOR_DEBUG = false;   // set to true to print the answer in the browser console while testing
const BAND_COLORS = [           // index = the digit the manual gives that color
  ["black", "#111111"], ["brown", "#8b5a2b"], ["red", "#d62828"], ["orange", "#f77f00"], ["yellow", "#fcd34d"],
  ["green", "#2a9d3f"], ["purple", "#7b2cbf"], ["pink", "#f472b6"], ["grey", "#9aa5b1"], ["white", "#ffffff"]
];
const MAX_THIRD_BAND = 6;       // the third band stops at purple (x 1,000,000), as the manual says

const resistorAnswer = (a, b, c) => (a + b) * 10 ** c;   // c is the band's digit, so the multiplier is 10^c

function mountResistor(slotEl, slotIndex) {
  const a = rand(10), b = rand(10), c = rand(MAX_THIRD_BAND + 1);
  const answer = resistorAnswer(a, b, c);
  if (RESISTOR_DEBUG) console.log("Resistor:", BAND_COLORS[a][0], BAND_COLORS[b][0], BAND_COLORS[c][0], "->", answer);

  const band = (x, i) => `<rect x="${x}" y="10" width="14" height="40" fill="${BAND_COLORS[i][1]}" stroke="#000"/>`;
  const box = document.createElement("div");
  box.className = "resistor-module";
  box.innerHTML = `<svg viewBox="0 0 200 60" class="resistor">
      <line x1="0" y1="30" x2="200" y2="30" stroke="#999" stroke-width="4"/>
      <rect x="40" y="10" width="120" height="40" rx="14" fill="#d9b77e" stroke="#000"/>
      ${band(62, a)}${band(92, b)}${band(132, c)}
    </svg>
    <input inputmode="numeric" maxlength="8" placeholder="answer">
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
