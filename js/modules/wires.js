// Wires module. The rules below are copied from manual.md (Module 1: Wires).
// Remember: the manual counts from 1 ("first wire"), code counts from 0, so first = 0, second = 1, ...
const WIRE_DEBUG = false;   // set to true to print the answer in the browser console while testing
const WIRE_COLORS = {
  blue: "#2f6fe4", green: "#2fb34a", red: "#e0322b",
  yellow: "#f2c41c", pink: "#f07ab8", black: "#1a1a1a"
};

// Returns a list of wire positions (0-based) the player must cut.
// Rules are checked top to bottom, and the first one that applies wins.
function wiresAnswer(wires, bomb) {
  const count = (c) => wires.filter((w) => w === c).length;
  const has = (c) => count(c) > 0;
  const last = wires.length - 1;
  const lastDigit = Number(bomb.serial.slice(-1));
  const firstDigit = Number(bomb.serial.match(/\d/)[0]);

  if (wires.length === 3) {
    if (has("blue")) return [last];
    if (!has("red")) return [0];
    return [1];
  }

  if (wires.length === 4) {
    if (has("yellow")) return [2];
    if (has("green")) return [1];
    if (!has("red")) return [3];
    return [0];
  }

  if (wires.length === 5) {
    // Rule 1 only applies if exactly one color appears exactly twice and no color appears 3+ times.
    const counts = {};
    wires.forEach((w) => (counts[w] = (counts[w] || 0) + 1));
    const pairs = Object.keys(counts).filter((c) => counts[c] === 2);
    const anyBigger = Object.values(counts).some((n) => n > 2);
    if (pairs.length === 1 && !anyBigger) {
      return wires.map((w, i) => (w === pairs[0] ? i : -1)).filter((i) => i >= 0);
    }
    if (has("yellow")) return [4];
    if (wires[1] === "blue") return [1];
    if (wires[last] === "black" && lastDigit % 2 === 1) return [3];
    return [0];
  }

  // 6 wires
  if (!has("pink") && firstDigit % 2 === 0) return [5];
  if (has("pink") && lastDigit % 2 === 0) return [1];
  if (count("blue") >= 2) return [2];
  if (bomb.batteries.length >= 2 && has("yellow")) return [4];
  if (wires[last] === "green") return [3];
  return [0];
}

// Draws the module inside a slot and handles clicks.
function mountWires(slotEl, slotIndex) {
  const colorNames = Object.keys(WIRE_COLORS);
  const wires = Array.from({ length: 3 + rand(4) }, () => pick(colorNames)); // 3 to 6 wires
  const required = new Set(wiresAnswer(wires, bomb));
  if (WIRE_DEBUG) console.log("Wires:", wires.join(", "), "-> cut (0-based):", [...required]);

  const box = document.createElement("div");
  box.className = "wires";
  wires.forEach((color, i) => {
    const w = document.createElement("div");
    w.className = "wire";
    w.style.setProperty("--c", WIRE_COLORS[color]);
    w.addEventListener("click", () => cutWire(w, i));
    box.appendChild(w);
  });
  slotEl.querySelector(".slot-body").replaceChildren(box);

  function cutWire(el, i) {
    if (!bomb.running || bomb.slots[slotIndex].solved || el.classList.contains("cut")) return;
    el.classList.add("cut");
    if (required.has(i)) {
      required.delete(i);
      if (required.size === 0) solveModule(slotIndex);   // all needed wires are cut
    } else {
      addStrike();                                       // wrong wire
    }
  }
}
