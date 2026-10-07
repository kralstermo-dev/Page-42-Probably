// Calculator for the manual page. Supports + - x / and brackets, with normal order of operations.
// calcEvaluate never uses eval(): it reads the text itself, so nothing odd can run.
function calcEvaluate(text) {
  const src = text.replace(/[×x]/gi, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
  if (src === "" || !/^[0-9+\-*/().]+$/.test(src)) throw new Error("bad input");
  let i = 0;
  const peek = () => src[i];

  function value() {                       // a number, a bracket group, or a minus sign in front of one
    if (peek() === "-") { i++; return -value(); }
    if (peek() === "(") {
      i++;
      const v = sum();
      if (peek() !== ")") throw new Error("missing )");
      i++;
      return v;
    }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i));
    if (!m) throw new Error("bad input");
    i += m[0].length;
    return parseFloat(m[0]);
  }
  function product() {                     // * and / bind tighter than + and -
    let v = value();
    while (peek() === "*" || peek() === "/") {
      const op = src[i++];
      const r = value();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function sum() {
    let v = product();
    while (peek() === "+" || peek() === "-") {
      const op = src[i++];
      const r = product();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  const result = sum();
  if (i !== src.length) throw new Error("bad input");
  return result;
}

function calcFormat(n) {
  if (!Number.isFinite(n)) throw new Error("not a number");
  return String(parseFloat(n.toPrecision(12)));   // trims things like 0.1 + 0.2 = 0.30000000000000004
}

if (typeof document !== "undefined") {
  (function () {
    const panel = document.getElementById("calc");
    const display = document.getElementById("calcDisplay");
    const grid = document.getElementById("calcKeys");
    const keys = ["C", "⌫", "(", ")", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"];

    function equals() {
      try { display.value = calcFormat(calcEvaluate(display.value)); }
      catch (e) { display.value = "Error"; }
    }
    function press(k) {
      if (display.value === "Error") display.value = "";
      if (k === "C") display.value = "";
      else if (k === "⌫") display.value = display.value.slice(0, -1);
      else if (k === "=") equals();
      else display.value += k;
      display.focus();
    }

    keys.forEach((k) => {
      const b = document.createElement("button");
      b.textContent = k;
      if ("÷×−+=".includes(k)) b.className = "op";
      b.addEventListener("click", () => press(k));
      grid.appendChild(b);
    });
    document.getElementById("calcToggle").addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) display.focus();
    });
    display.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); equals(); }
    });
  })();
}
