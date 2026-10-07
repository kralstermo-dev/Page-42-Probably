// Morse Code module. The rules below are copied from manual.md (Module 4: Morse Code).
// The display shows each of 4 letters in Morse for a moment, then a repeat symbol, then starts again.
const MORSE_DEBUG = false;   // set to true to print the answer in the browser console while testing
const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};
const MORSE_HOLD = 1800;         // how long each letter stays on screen (ms)
const MORSE_REPEAT_HOLD = 1500;  // how long the repeat symbol stays (ms)
const MORSE_GAP = 300;           // blank pause between frames, so two identical letters are still told apart

function mountMorse(slotEl, slotIndex) {
  const alphabet = Object.keys(MORSE);
  const letters = Array.from({ length: 4 }, () => pick(alphabet));
  const code = letters.join("");
  if (MORSE_DEBUG) console.log("Morse:", code);

  const box = document.createElement("div");
  box.className = "morse-module";
  box.innerHTML = `<div class="morse-screen"></div>
    <input maxlength="4" placeholder="code" autocapitalize="characters" autocomplete="off">
    <button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const screen = box.querySelector(".morse-screen");
  const input = box.querySelector("input");
  const live = () => bomb.running && !bomb.slots[slotIndex].solved;

  const symbols = (letter) =>
    MORSE[letter].split("").map((c) => `<i class="${c === "." ? "dot" : "dash"}"></i>`).join("");

  // Frames 0-3 show the letters, frame 4 shows the repeat symbol, then it loops.
  let frame = 0;
  function play() {
    if (!live()) { screen.innerHTML = ""; return; }      // game over or module solved: stop
    screen.innerHTML = frame < 4 ? symbols(letters[frame]) : `<span class="repeat">&#8635;</span>`;
    const hold = frame < 4 ? MORSE_HOLD : MORSE_REPEAT_HOLD;
    frame = (frame + 1) % 5;
    setTimeout(() => { screen.innerHTML = ""; setTimeout(play, MORSE_GAP); }, hold);
  }
  (function waitForStart() {                              // the code only starts playing once the bomb is live
    if (bomb.running) play(); else setTimeout(waitForStart, 100);
  })();

  function submit() {
    if (!live() || input.value.trim() === "") return;
    if (input.value.trim().toUpperCase() === code) { solveModule(slotIndex); input.disabled = true; }
    else { addStrike(); input.value = ""; }
  }
  box.querySelector(".confirm-btn").addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}
