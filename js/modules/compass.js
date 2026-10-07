// Direction module (manual: Module 9). Clicking the compass turns the needle clockwise; Confirm checks it.
const COMPASS_DEBUG = false;   // set to true to print the answer in the browser console while testing
const DIRECTIONS = ["N", "E", "S", "W"];   // index 0-3, clockwise

// Rules are checked top to bottom, and the first one that applies wins.
function compassAnswer(start, bomb) {
  const digits = bomb.serial.match(/\d/g) || [];
  if (bomb.ports.includes("XLR")) return 3;                          // rule 1: west
  if (bomb.batteries.length > 2) return 1;                           // rule 2: east
  if (digits.length >= 2 && Number(digits[1]) % 2 === 1) return 3;   // rule 3: second digit odd -> west
  if (start === 0) return 2;                                         // rule 4: started pointing north -> south
  return 0;                                                          // rule 5: otherwise north
}

function mountCompass(slotEl, slotIndex) {
  const start = rand(4);                      // where the needle points when the bomb starts
  let pointing = start;
  const answer = compassAnswer(start, bomb);
  if (COMPASS_DEBUG) console.log("Compass: starts", DIRECTIONS[start], "-> answer", DIRECTIONS[answer]);

  const box = document.createElement("div");
  box.className = "compass-module";
  box.innerHTML = `<button class="compass"><svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="#1c1e22" stroke="#888" stroke-width="3"/>
      <g fill="#ddd" font-size="12" text-anchor="middle" font-family="Courier New, monospace">
        <text x="50" y="20">N</text><text x="83" y="55">E</text><text x="50" y="92">S</text><text x="17" y="55">W</text>
      </g>
      <g class="needle"><polygon points="50,24 45,50 55,50" fill="#ff3b30"/><polygon points="50,76 45,50 55,50" fill="#eee"/></g>
    </svg></button>
    <button class="confirm-btn">Confirm</button>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const needle = box.querySelector(".needle");
  const aim = () => { needle.style.transform = `rotate(${pointing * 90}deg)`; };
  aim();

  const live = () => bomb.running && !bomb.slots[slotIndex].solved;
  box.querySelector(".compass").addEventListener("click", () => {
    if (!live()) return;
    pointing = (pointing + 1) % 4;
    aim();
  });
  box.querySelector(".confirm-btn").addEventListener("click", () => {
    if (!live()) return;
    if (pointing === answer) solveModule(slotIndex);
    else addStrike();
  });
}
