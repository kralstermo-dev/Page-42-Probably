// Mathematics module. The rules below are copied from manual.md (Module 5: Mathematics).
const MATH_DEBUG = false;   // set to true to print the answer in the browser console while testing
const MATH_LETTERS = "ABCDEFGHI";
const MATH_DIGITS = [3, 6, 7, 1, 4, 9, 5, 8, 2];            // the manual's letter table: A = 3, B = 6, C = 7 ...
const MATH_SYMBOLS = { "+": "[]", "-": "{}", "x": "()", "/": "<>" };   // the manual's symbol table

// Two-digit numbers with no zero in them, because the letter table has no 0.
const MATH_NUMBERS = [];
for (let n = 11; n <= 99; n++) if (n % 10 !== 0) MATH_NUMBERS.push(n);

const letterFor = (digit) => MATH_LETTERS[MATH_DIGITS.indexOf(digit)];
const mathLetters = (n) => letterFor(Math.floor(n / 10)) + letterFor(n % 10);   // 61 -> "BD"

// Makes an equation whose answer is always a positive whole number.
function makeMathProblem() {
  const op = pick(["+", "-", "x", "/"]);
  let a, b;
  if (op === "/") {                                  // only pairs that divide exactly (answer 2 or more)
    const pairs = [];
    MATH_NUMBERS.forEach((x) => MATH_NUMBERS.forEach((y) => { if (x % y === 0 && x / y >= 2) pairs.push([x, y]); }));
    [a, b] = pick(pairs);
  } else {
    a = pick(MATH_NUMBERS);
    b = pick(MATH_NUMBERS);
    if (op === "-") {
      if (a === b) return makeMathProblem();         // would give 0, so try again
      if (a < b) [a, b] = [b, a];                    // big number first, so the answer is positive
    }
  }
  const answer = op === "+" ? a + b : op === "-" ? a - b : op === "x" ? a * b : a / b;
  return { display: `${mathLetters(a)} ${MATH_SYMBOLS[op]} ${mathLetters(b)}`, answer };
}

function mountMath(slotEl, slotIndex) {
  const problem = makeMathProblem();
  if (MATH_DEBUG) console.log("Math:", problem.display, "->", problem.answer);

  const box = document.createElement("div");
  box.className = "math-module";
  box.innerHTML = `<div class="math-display"></div>
    <input inputmode="numeric" maxlength="5" placeholder="answer">
    <button class="confirm-btn">Confirm</button>`;
  box.querySelector(".math-display").textContent = problem.display;   // textContent, so "<>" shows as text
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const input = box.querySelector("input");
  const live = () => bomb.running && !bomb.slots[slotIndex].solved;

  function submit() {
    if (!live() || input.value.trim() === "") return;
    if (Number(input.value) === problem.answer) { solveModule(slotIndex); input.disabled = true; }
    else { addStrike(); input.value = ""; }
  }
  box.querySelector(".confirm-btn").addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}
