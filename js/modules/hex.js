// Hexadecimal module (manual: Module 6). The display shows letters as hex codes; the player types the letters.
const HEX_DEBUG = false;   // set to true to print the answer in the browser console while testing
const HEX_LENGTH = 5;      // how many codes are shown (a good knob for difficulty later)
const hexOf = (letter) => letter.charCodeAt(0).toString(16);   // "a" -> "61"

function mountHex(slotEl, slotIndex) {
  const letters = Array.from({ length: HEX_LENGTH }, () => pick("abcdefghijklmnopqrstuvwxyz".split("")));
  const word = letters.join("");
  if (HEX_DEBUG) console.log("Hex:", word);

  const box = document.createElement("div");
  box.className = "hex-module";
  box.innerHTML = `<div class="hex-screen">${letters.map(hexOf).join(" ")}</div>
    <input maxlength="${HEX_LENGTH}" placeholder="letters" autocomplete="off">
    <button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const input = box.querySelector("input");
  const live = () => bomb.running && !bomb.slots[slotIndex].solved;
  function submit() {
    if (!live() || input.value.trim() === "") return;
    if (input.value.trim().toLowerCase() === word) { solveModule(slotIndex); input.disabled = true; }
    else { addStrike(); input.value = ""; }
  }
  box.querySelector(".confirm-btn").addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}
