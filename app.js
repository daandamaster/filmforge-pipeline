const STAGES = ["ingested","planning","planned","fanned_out","rendering","stitching","mastering","delivered"];
const STAGE_NL = {
  ingested: "Ingeslikt",
  planning: "Planning",
  planned: "Gepland",
  fanned_out: "Uitgewaaierd",
  rendering: "Opname",
  stitching: "Montage",
  mastering: "Master",
  delivered: "Picture-lock"
};
const WORKCUT = "https://media.githubusercontent.com/media/daandamaster/daniel-volt/main/DANIEL_VOLT.mp4";
const POSTER = "https://raw.githubusercontent.com/daandamaster/daniel-volt/main/poster.jpg";
const PROOF = "https://github.com/daandamaster/daniel-volt";

const SHOTS = [
  { n:"01", title:"palm / volt", optics:"2.39:1 · 35mm 500T · tungsten · palm open, volt-gloed in de lijnen · slow push-in 15s", seed:"lock-still" },
  { n:"02", title:"don’t come in", optics:"last-frame van 01 · deurlinie · jas dicht aan de keel · mond: Kom niet binnen", seed:"last-frame 01" },
  { n:"03", title:"mara wrist", optics:"last-frame van 02 · pols links in beeld · gouden ring · geen nieuw gezicht", seed:"last-frame 02" },
  { n:"04", title:"door", optics:"zelfde hangar · deur opent een spleet · regen op het kozijn", seed:"last-frame 03" },
  { n:"05", title:"carpark silent", optics:"natte parkeerplaats · sodium · geen score · adem + bandengeluid", seed:"last-frame 04" },
  { n:"06", title:"bumper", optics:"bumperhoog · split knuckle op metaal · volt-draad dooft", seed:"last-frame 05" },
  { n:"07", title:"kneel boy", optics:"kinderenkniel · camera laag · jas valt open één knoop", seed:"last-frame 06" },
  { n:"08", title:"skipped — IP", optics:"niet gedraaid. IP-gate. Keten springt naar 09.", seed:"skip" },
  { n:"09", title:"mara phone", optics:"schermgloed op haar gezicht · geen UI-tekst leesbaar", seed:"last-frame 07" },
  { n:"10", title:"not hiding", optics:"Daniel in de deuropening · palm half dicht · geen hero-shot", seed:"last-frame 09" },
  { n:"11", title:"palm silent", optics:"close palm · volt uit · regen. Native audio only.", seed:"last-frame 10" },
  { n:"12", title:"walk-off", optics:"rug · charcoal coat · Gelderland rain · 15s hold then cut", seed:"last-frame 11" }
];

const FILMS = [
  { id:"daniel-volt", title:"DANIEL / VOLT", logline:"Gelderland rain. Charcoal coat. Split knuckle. Volt onder de huid van een palm.", engine:"grok-imagine-video-1.5", runtime:"2:13", shots:11, status:"rendering", credit:38 },
  { id:"kronos", title:"KRONOS AKTE I", logline:"Een klok die achteruit tikt in een lege zaal.", engine:"grok-imagine-video-1.5", runtime:"—", shots:0, status:"planned", credit:12 },
  { id:"stigmata", title:"INQUISITOR STIGMATA", logline:"Wonden die licht geven in plaats van bloed.", engine:"grok-imagine-video-1.5", runtime:"—", shots:0, status:"planning", credit:8 },
  { id:"alex", title:"ALEX — HET RODE WOUD", logline:"Een jongen loopt het bos in. Het bos loopt terug.", engine:"grok-imagine-video-1.5", runtime:"—", shots:0, status:"ingested", credit:6 },
  { id:"ermelo", title:"DE SCHADUW VAN ERMELO", logline:"Picture-lock. Hangar-proof.", engine:"grok-imagine-video-1.5", runtime:"locked", shots:12, status:"delivered", credit:0 }
];

const state = {
  user: null,
  view: "hangar",
  film: FILMS[0],
  stageI: 0,
  log: [],
  running: false,
  timer: null
};

function $(sel){ return document.querySelector(sel); }
function html(s){ const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content; }
function save(){ try { localStorage.setItem("ff.session", JSON.stringify({ user: state.user })); } catch(e){} }
function load(){ try { const s = JSON.parse(localStorage.getItem("ff.session")||"null"); if(s&&s.user) state.user = s.user; } catch(e){} }

function log(line){
  const t = new Date().toLocaleTimeString("nl-NL", { hour12:false });
  state.log.push("["+t+"] "+line);
  const el = $("#runlog");
  if(el){ el.textContent = state.log.join("\n"); el.scrollTop = el.scrollHeight; }
}

function chrome(){
  return `<header class="chrome">
    <div class="brand"><strong>FILMFORGE</strong><span class="hud">Pipeline v4.0 · Mk VII</span></div>
    <nav class="nav">
      <a href="#hangar" class="${state.view==="hangar"?"on":""}">Hangar</a>
      <a href="#console" class="${state.view==="console"?"on":""}">Console</a>
      <a href="#board" class="${state.view==="board"?"on":""}">Shot-board</a>
      <a href="#master" class="${state.view==="master"?"on":""}">Master</a>
    </nav>
    <div class="meter">CR <b>${state.film.credit}</b> · ${state.film.engine}</div>
  </header>`;
}

function sluis(){
  return `<section class="sluis"><div class="title-card">
    <div class="mark">FF</div>
    <h1>FILMFORGE<span>PIPELINE v4.0</span></h1>
    <p class="slug hud live">Open de hangar</p>
    <form class="gate" id="gate">
      <h2>SLUIS</h2>
      <p class="lede">Start je pipeline. Lokale lock — geen Viktor-credentials.</p>
      <label>E-mail</label><input name="email" type="email" required autocomplete="username" />
      <label>Wachtwoord</label><input name="pass" type="password" required autocomplete="current-password" />
      <p class="err" id="gerr"></p>
      <button class="btn gold full" type="submit">Open hangar</button>
    </form>
  </div></section>`;
}

function filmRow(f){
  return `<article class="film" data-id="${f.id}">
    <div class="thumb"></div>
    <div><h3>${f.title}</h3><p class="meta">${f.logline}</p></div>
    <span class="slate ${f.status}">${STAGE_NL[f.status]||f.status}</span>
  </article>`;
}

function hangar(){
  return `${chrome()}<main class="stage">
    <div class="hero">
      <p class="hud">ACTIEVE TAKE</p>
      <h1>DANIEL / VOLT</h1>
      <p>Gelderland rain. Charcoal coat. Split knuckle. Engine locked: grok-imagine-video-1.5 · 15s · native audio. Last-frame seedt de volgende still.</p>
      <div class="row">
        <button class="btn gold" id="runbtn">▸ Run pipeline</button>
        <a class="btn" href="#master">Open master</a>
        <a class="btn ghost" href="${PROOF}" target="_blank" rel="noopener">Workcut repo</a>
      </div>
    </div>
    <div class="stats">
      <div class="runs">${FILMS.map(filmRow).join("")}</div>
      <aside class="credit"><div class="hud">CREDIT</div><p>38 / 100 CR op DANIEL / VOLT</p><div class="bar"><i></i></div></aside>
    </div>
  </main>`;
}

function strip(){
  return `<div class="strip">${STAGES.map((s,i)=>{
    const cls = i < state.stageI ? "done" : i===state.stageI ? (state.film.status==="delivered"?"done":"live") : "";
    return `<span class="${cls}">${STAGE_NL[s]}</span>`;
  }).join("")}</div>`;
}

function consoleView(){
  return `${chrome()}<main class="stage">
    <p class="hud">CONSOLE · ${state.film.title}</p>
    <h2 class="display">${STAGE_NL[STAGES[Math.min(state.stageI, STAGES.length-1)]]}</h2>
    ${strip()}
    <div class="row" style="margin-bottom:16px">
      <button class="btn gold" id="runbtn">${state.running?"Opname loopt…":"▸ Run pipeline"}</button>
      <button class="btn ghost" id="cutbtn">Cut</button>
    </div>
    <pre class="log" id="runlog">${state.log.join("\n")||"Wachten op Run."}</pre>
  </main>`;
}

function board(){
  return `${chrome()}<main class="stage">
    <p class="hud">SHOT-BOARD · 12 UNITS · 08 SKIP</p>
    <h2 class="display">DANIEL / VOLT</h2>
    ${strip()}
    <div class="board">${SHOTS.map(s=>`<article class="shot">
      <div class="frame"><b>UNIT ${s.n}</b></div>
      <div><h3>${s.title}</h3><p class="optics">${s.optics}</p><p class="meta">seed: ${s.seed}</p></div>
    </article>`).join("")}</div>
  </main>`;
}

function master(){
  return `${chrome()}<main class="stage">
    <p class="hud">MASTER · WORKCUT 2:13 · 11 SHOTS</p>
    <h2 class="display">PICTURE-LOCK</h2>
    <div class="shot" style="margin-top:18px">
      <div class="frame" style="aspect-ratio:16/9;padding:0;overflow:hidden">
        <video controls playsinline preload="metadata" poster="${POSTER}" style="width:100%;height:100%;object-fit:cover;display:block">
          <source src="${WORKCUT}" type="video/mp4" />
        </video>
      </div>
      <div>
        <h3>DANIEL / VOLT</h3>
        <p class="optics">grok-imagine-video-1.5 · native audio · 720p web encode · 08 skipped IP</p>
        <div class="row" style="margin-top:12px">
          <a class="btn gold" href="${WORKCUT}" target="_blank" rel="noopener">Download mp4</a>
          <a class="btn" href="${PROOF}" target="_blank" rel="noopener">Repo</a>
        </div>
      </div>
    </div>
  </main>`;
}

function render(){
  const root = $("#app");
  if(!state.user){ root.replaceChildren(html(sluis())); bind(); return; }
  const views = { hangar, console: consoleView, board, master };
  root.replaceChildren(html((views[state.view]||hangar)()));
  bind();
  const rec = $("#rec");
  if(rec) rec.textContent = state.running ? "REC · LIVE" : "FF · MK VII";
}

function bind(){
  const gate = $("#gate");
  if(gate) gate.addEventListener("submit", e=>{
    e.preventDefault();
    const fd = new FormData(gate);
    const email = String(fd.get("email")||"").trim();
    const pass = String(fd.get("pass")||"");
    if(!email.includes("@") || pass.length < 1){ $("#gerr").textContent = "E-mail + wachtwoord."; return; }
    state.user = email; save(); state.view = "console"; startRun(); render();
  });
  $("#runbtn")?.addEventListener("click", ()=>{ state.view="console"; startRun(); render(); });
  $("#cutbtn")?.addEventListener("click", cut);
  document.querySelectorAll(".film").forEach(el=>el.addEventListener("click", ()=>{
    const f = FILMS.find(x=>x.id===el.dataset.id); if(!f) return;
    state.film = f; state.view = f.id==="daniel-volt"?"console":"board"; render();
  }));
  document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click", e=>{
    e.preventDefault(); state.view = a.getAttribute("href").slice(1); render();
  }));
}

function startRun(){
  if(state.film.id !== "daniel-volt"){ log("Geen shot-board — Run geweigerd."); return; }
  if(state.running) return;
  state.running = true;
  state.stageI = 0;
  state.log = [];
  state.film.status = "ingested";
  log("RUN · DANIEL / VOLT");
  log("Engine lock · grok-imagine-video-1.5 · 15s · native audio");
  log("Shot-board 12 units · 08 IP skip");
  tick();
}

function tick(){
  const s = STAGES[state.stageI];
  state.film.status = s;
  const lines = {
    ingested: "Ingeslikt. Bible + workcut aanwezig.",
    planning: "Planning. Face lock · charcoal coat · Gelderland rain.",
    planned: "Gepland. 12 units. Continuïteit: last-frame → first-frame.",
    fanned_out: "Uitgewaaierd. Prompts per unit. Geen Veo. Geen FAL.",
    rendering: "OPNAME. Unit 01 palm/volt → 02 don’t come in → 03 mara wrist.",
    stitching: "Montage. 11 shots. 08 skipped. Loudnorm −16.",
    mastering: "Master 2:13 · 720p web encode.",
    delivered: "PICTURE-LOCK. Workcut hangt in Master."
  };
  log(lines[s]);
  if(s==="rendering"){
    SHOTS.forEach(sh=>{
      if(sh.n==="08") log("UNIT 08 · SKIP · IP-gate");
      else log("UNIT "+sh.n+" · "+sh.title+" · 15s · seed "+sh.seed);
    });
  }
  render();
  if(state.stageI >= STAGES.length-1){
    state.running = false;
    state.film.status = "delivered";
    log("CUT. Picture-lock. Open Master voor de workcut.");
    render();
    return;
  }
  state.stageI += 1;
  state.timer = setTimeout(tick, 900);
}

function cut(){
  if(state.timer) clearTimeout(state.timer);
  state.running = false;
  log("CUT door operator.");
  render();
}

window.addEventListener("hashchange", ()=>{
  const h = location.hash.slice(1);
  if(["hangar","console","board","master"].includes(h)){ state.view = h; render(); }
});

load();
const boot = location.hash.slice(1);
if(["hangar","console","board","master"].includes(boot)) state.view = boot;
if(state.user && (boot==="console" || boot==="run" || boot==="")) {
  if(boot==="run" || boot==="console") startRun();
}
render();
