// Keypad module (manual: Module 8). Four symbols from ONE column of the manual's table;
// the player presses them in the order they appear in that column, top to bottom.
const KEYPAD_DEBUG = false;   // set to true to print the correct order in the browser console while testing
const KEYPAD_COLUMNS = [["☄", "☆", "Ⰾ", "Ѡ", "Ѫ"], ["🜔", "Ϡ", "☿", "¿", "Ϙ"], ["♂", "ƛ", "∆", "Ѧ", "≠"], ["♀", "©", "ϗ", "∞", "Ɔ"]];   // copied from the manual's table

const shuffled = (list) => [...list].sort(() => Math.random() - 0.5);

function mountKeypad(slotEl, slotIndex) {
  const column = pick(KEYPAD_COLUMNS);
  const chosen = shuffled(column).slice(0, 4);               // 4 of that column's 5 symbols
  const order = column.filter((s) => chosen.includes(s));    // right order = top to bottom in the column
  const shown = shuffled(chosen);                            // the buttons sit in a random layout
  if (KEYPAD_DEBUG) console.log("Keypad:", order.join(" "));

  const box = document.createElement("div");
  box.className = "keypad-module";
  box.innerHTML = `<div class="keypad-grid">${shown.map((s) => `<button class="key">${s}</button>`).join("")}</div>`;
  slotEl.querySelector(".slot-body").replaceChildren(box);

  const buttons = [...box.querySelectorAll(".key")];
  let next = 0;                                              // how many symbols are done so far
  buttons.forEach((btn, i) =>
    btn.addEventListener("click", () => {
      if (!bomb.running || bomb.slots[slotIndex].solved || btn.classList.contains("lit")) return;
      if (shown[i] === order[next]) {
        btn.classList.add("lit");
        next++;
        if (next === order.length) solveModule(slotIndex);
      } else {
        addStrike();                                         // wrong symbol: strike, and start the order again
        next = 0;
        buttons.forEach((b) => b.classList.remove("lit"));
      }
    })
  );
}
