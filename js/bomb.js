// ---------- Settings ----------
const START_SECONDS = 300;      // 5 minutes
const MAX_STRIKES = 3;
const SLOT_COUNT = 6;           // first 2 go on the front, the rest on the back
const SPEED_PER_STRIKE = 0.25;  // each strike makes the timer 25% faster
const ALL_PORTS = ["DVI", "HDMI", "USB-C", "Parallel", "Audio Jack", "Display Port", "Ethernet", "XLR"];
const BATTERY_TYPES = ["AA", "D"];

// ---------- Helpers ----------
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const $ = (id) => document.getElementById(id);

function makeSerial() {
  const letters = "BCDFGHJKLMNPQRSTVWXZ"; // no vowels, so no accidental words
  const digits = "0123456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += Math.random() < 0.5 ? pick(letters) : pick(digits);
  return s + pick(digits); // last character is always a digit
}

function makePorts() {                       // 0 to 4 different ports
  const shuffled = [...ALL_PORTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, rand(5));
}

function makeBatteries() {                   // 0 to 4 batteries, each AA or D
  const count = rand(5);
  const list = [];
  for (let i = 0; i < count; i++) list.push(pick(BATTERY_TYPES));
  return list;
}

// ---------- Bomb state ----------
// Manual rules read from here, e.g. bomb.batteries.includes("AA") or bomb.batteries.length >= 2
const bomb = {
  serial: makeSerial(),
  batteries: makeBatteries(),   // e.g. ["AA", "D", "AA"]
  ports: makePorts(),           // e.g. ["DVI", "XLR"]
  timeLeft: START_SECONDS,
  strikes: 0,
  running: false,
  slots: []
};
let tickHandle = null;

// ---------- Display ----------
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Your DVI drawing, as HTML. Other ports are plain labeled chips until you draw them.
const DVI_HTML = `<div class="dvi"><span class="hole"></span><div class="shell"><div class="pins"></div><div class="divider"></div><div class="blade"></div></div><span class="hole"></span></div>`;

function renderInfo() {
  $("serial").textContent = bomb.serial;
  $("batteries").innerHTML = bomb.batteries
    .map((t) => `<div class="battery ${t.toLowerCase()}"><span>${t}</span></div>`)
    .join("");
  $("ports").innerHTML = bomb.ports
    .map((p) => (p === "DVI" ? `<div class="port-cell tall">${DVI_HTML}</div>` : `<div class="port-chip">${p}</div>`))
    .join("");
}
function renderTimer() { $("timer").textContent = formatTime(bomb.timeLeft); }
function renderStrikes() {
  let html = "";
  for (let i = 0; i < MAX_STRIKES; i++) {
    html += `<span class="${i < bomb.strikes ? "on" : ""}">X</span> `;
  }
  $("strikes").innerHTML = html;
}
function say(text) { $("message").textContent = text; }

// ---------- 3D rotation ----------
let rotX = -10, rotY = 15;
const cube = $("cube");
const scene = $("scene");

function applyRotation() {
  cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}
function fitToScreen() {
  const scale = Math.min(1, (window.innerWidth - 20) / 600, (window.innerHeight - 140) / 460);
  scene.style.transform = `scale(${scale})`;
}

let dragging = false, lastX = 0, lastY = 0;
scene.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button, .wire, input, .seg")) return;   // clicks on controls should not spin the bomb
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  cube.classList.remove("snap");
  scene.classList.add("dragging");
  scene.setPointerCapture(e.pointerId);
});
scene.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  rotY += (e.clientX - lastX) * 0.5;
  rotX -= (e.clientY - lastY) * 0.5;
  rotX = Math.max(-80, Math.min(80, rotX));
  lastX = e.clientX;
  lastY = e.clientY;
  applyRotation();
});
function stopDrag() { dragging = false; scene.classList.remove("dragging"); }
scene.addEventListener("pointerup", stopDrag);
scene.addEventListener("pointercancel", stopDrag);

function snapTo(x, y) {
  cube.classList.add("snap");
  rotX = x;
  rotY = y;
  applyRotation();
}

// ---------- Slots ----------
// Each slot has an LED (top right) that turns green when the module is solved.
function buildSlots() {
  for (let i = 0; i < SLOT_COUNT; i++) {
    bomb.slots.push({ solved: false });
    const div = document.createElement("div");
    div.className = "slot";
    div.id = `slot-${i}`;
    div.innerHTML = `
      <span class="led"></span>
      <div class="slot-body">
        <span>Empty module ${i + 1}</span>
        <button data-solve="${i}">Test: solve</button>
        <button data-strike="${i}">Test: strike</button>
      </div>`;
    $(i < 2 ? "slots-front" : "slots-back").appendChild(div);
    const mounters = [window.mountWires, window.mountButton, window.mountTimerModule, window.mountMath, window.mountMorse].filter(Boolean);   // add new modules to this list
    if (mounters.length) pick(mounters)(div, i);   // every slot gets a random module, repeats allowed
  }
  cube.addEventListener("click", (e) => {
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
  el.classList.add("solved");                       // this also lights the LED
  if (!el.querySelector(".wires, .button-module, .gauge-module, .math-module, .morse-module")) el.querySelector(".slot-body").innerHTML = "<span>Module solved</span>";
  if (bomb.slots.every((s) => s.solved)) win();
}

function addStrike() {
  bomb.strikes++;
  renderStrikes();
  document.querySelectorAll(".face").forEach((f) => {
    f.classList.remove("flash");
    void f.offsetWidth;
    f.classList.add("flash");
  });
  if (bomb.strikes >= MAX_STRIKES) lose("Probably not that one. Boom!");
  else say("Strike! Probably not that one. The timer just got faster.");
}

// The timer reschedules itself every second, and the delay shrinks with each strike.
function scheduleTick() {
  const delay = 1000 / (1 + SPEED_PER_STRIKE * bomb.strikes);
  tickHandle = setTimeout(() => {
    tick();
    if (bomb.running) scheduleTick();
  }, delay);
}

function tick() {
  bomb.timeLeft--;
  renderTimer();
  if (bomb.timeLeft <= 0) lose("Time's up. Boom!");
}

function start() {
  bomb.running = true;
  document.body.classList.remove("pre-start");   // reveal the bomb
  say("Defuse it!");
  $("startBtn").style.display = "none";
  scheduleTick();
}

function endGame() {
  bomb.running = false;
  clearTimeout(tickHandle);
  $("startBtn").textContent = "Try again";
  $("startBtn").style.display = "inline-block";
  $("startBtn").onclick = () => location.reload();
}
function win() { endGame(); say("Probably defused!"); }
function lose(reason) { endGame(); say(reason); }

// ---------- Setup ----------
renderInfo();
renderTimer();
renderStrikes();
buildSlots();
applyRotation();
fitToScreen();
window.addEventListener("resize", fitToScreen);
$("startBtn").onclick = start;
$("frontBtn").onclick = () => snapTo(0, 0);
$("backBtn").onclick = () => snapTo(0, 180);
