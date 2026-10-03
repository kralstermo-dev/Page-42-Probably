// ---------- Settings ----------
const START_SECONDS = 300;   // 5 minutes
const MAX_STRIKES = 3;
const SLOT_COUNT = 4;
const ALL_PORTS = ["Parallel", "Serial", "USB", "HDMI", "Audio"];

// ---------- Helpers ----------
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

function makeSerial() {
  const letters = "BCDFGHJKLMNPQRSTVWXZ"; // no vowels, so no accidental words
  const digits = "0123456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += Math.random() < 0.5 ? pick(letters) : pick(digits);
  return s + pick(digits); // last character is always a digit (handy for manual rules)
}

function makePorts() {
  return ALL_PORTS.filter(() => Math.random() < 0.4);
}

// ---------- Bomb state ----------
// Modules will read bomb.serial, bomb.batteries and bomb.ports to work out answers.
const bomb = {
  serial: makeSerial(),
  batteries: rand(5),
  ports: makePorts(),
  timeLeft: START_SECONDS,
  strikes: 0,
  running: false,
  slots: []            // one entry per slot: { solved: false }
};

let tickHandle = null;

// ---------- Display ----------
const $ = (id) => document.getElementById(id);

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function renderInfo() {
  $("serial").textContent = bomb.serial;
  $("batteries").textContent = bomb.batteries;
  $("ports").textContent = bomb.ports.length ? bomb.ports.join(", ") : "none";
}

function renderTimer() {
  $("timer").textContent = formatTime(bomb.timeLeft);
}

function renderStrikes() {
  let html = "";
  for (let i = 0; i < MAX_STRIKES; i++) {
    html += `<span class="${i < bomb.strikes ? "on" : ""}">X</span> `;
  }
  $("strikes").innerHTML = html;
}

function say(text) {
  $("message").textContent = text;
}

// ---------- Slots ----------
// Later, each real module will fill a slot instead of this placeholder.
function buildSlots() {
  const container = $("slots");
  container.innerHTML = "";
  for (let i = 0; i < SLOT_COUNT; i++) {
    bomb.slots.push({ solved: false });
    const div = document.createElement("div");
    div.className = "slot";
    div.id = `slot-${i}`;
    div.innerHTML = `
      <span>Empty module ${i + 1}</span>
      <button data-solve="${i}">Test: solve</button>
      <button data-strike="${i}">Test: strike</button>`;
    container.appendChild(div);
  }
  container.addEventListener("click", (e) => {
    if (!bomb.running) return;
    if (e.target.dataset.solve !== undefined) solveModule(Number(e.target.dataset.solve));
    if (e.target.dataset.strike !== undefined) addStrike();
  });
}

// ---------- Game actions (modules will call these) ----------
function solveModule(i) {
  if (bomb.slots[i].solved) return;
  bomb.slots[i].solved = true;
  const el = $(`slot-${i}`);
  el.classList.add("solved");
  el.innerHTML = "<span>Module solved</span>";
  if (bomb.slots.every((s) => s.solved)) win();
}

function addStrike() {
  bomb.strikes++;
  renderStrikes();
  $("bomb").classList.remove("flash");
  void $("bomb").offsetWidth; // restarts the CSS animation
  $("bomb").classList.add("flash");
  if (bomb.strikes >= MAX_STRIKES) lose("Probably not that one. Boom!");
  else say("Strike! Probably not that one.");
}

function tick() {
  bomb.timeLeft--;
  renderTimer();
  if (bomb.timeLeft <= 0) lose("Time's up. Boom!");
}

function start() {
  bomb.running = true;
  say("Defuse it!");
  $("startBtn").style.display = "none";
  tickHandle = setInterval(tick, 1000);
}

function endGame() {
  bomb.running = false;
  clearInterval(tickHandle);
  $("startBtn").textContent = "Try again";
  $("startBtn").style.display = "inline-block";
  $("startBtn").onclick = () => location.reload(); // new random bomb
}

function win() {
  endGame();
  say("Probably defused!");
}

function lose(reason) {
  endGame();
  say(reason);
}

// ---------- Setup ----------
renderInfo();
renderTimer();
renderStrikes();
buildSlots();
$("startBtn").onclick = start;
