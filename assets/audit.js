/*
 * Quiz engine shared by every audit page.
 *
 * Each page loads its question bank first (it sets window.AUDIT), then this
 * file. Progress is always kept in localStorage. When the page is served by
 * serve.py it is also saved to results/<audit-id>.json so it can be committed.
 */
(function () {
  "use strict";

  const A = window.AUDIT;
  const app = document.getElementById("app");
  if (!A || !app) return;

  const TOPICS = A.topics;
  const TOPIC_ORDER = A.topicOrder;
  const LEVELS = A.levels;
  const Q = A.questions;
  const KINDS = Object.assign({
    concept: "Concept", scenario: "Scenario", snippet: "Read the snippet", calc: "Calculate",
    order: "Put in order", argument: "Evaluate the argument", puzzle: "Logic puzzle", data: "Read the data"
  }, A.kinds || {});
  const LEVEL_IDS = Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  const PASS = 0.7;
  const QBY = Object.fromEntries(Q.map(q => [q.id, q]));
  const byLevel = l => Q.filter(q => q.l === l);
  const need = l => Math.ceil(PASS * byLevel(l).length);
  const SINGLE = LEVEL_IDS.length === 1;
  const NOUN = A.noun || "audit";
  const BACK = A.back || { href: "../index.html", label: "All audits" };

  const STATUS = {
    misc:  { label: "Misconception", chip: "bad",  desc: "Wrong but certain. Fix these first." },
    gap:   { label: "Gap",           chip: "bad",  desc: "Wrong or skipped." },
    luck:  { label: "Lucky guess",   chip: "warn", desc: "Right, but guessed." },
    ok:    { label: "Okay",          chip: "",     desc: "Right, fairly sure." },
    solid: { label: "Solid",         chip: "good", desc: "Right and certain." }
  };
  const CONF = {
    sure:  { label: "Certain",     target: "aim for 90%+" },
    fair:  { label: "Fairly sure", target: "about 70–80%" },
    guess: { label: "Guessing",    target: "50% or less is normal" }
  };

  /* ---------- State ---------- */
  const LS_KEY = "knowledge-audit:" + A.id;
  const API = "/api/results/" + encodeURIComponent(A.id);
  const fresh = () => ({ answers: {}, first: {}, attempts: {}, passed: {}, updatedAt: 0 });

  // Accepts anything that looks like saved progress (localStorage, a results
  // file, or an exported file) and returns a clean state object.
  function normalize(obj) {
    if (!obj || typeof obj !== "object") return null;
    const s = fresh();
    for (const k of ["answers", "first", "attempts", "passed"]) {
      if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) s[k] = JSON.parse(JSON.stringify(obj[k]));
    }
    for (const k of ["answers", "first"]) {
      for (const id of Object.keys(s[k])) if (!QBY[id]) delete s[k][id];
    }
    s.updatedAt = Number(obj.updatedAt) || 0;
    return s;
  }
  function loadLocal() {
    try { const raw = localStorage.getItem(LS_KEY); return raw ? normalize(JSON.parse(raw)) : null; } catch (e) { return null; }
  }
  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  let state = loadLocal() || fresh();
  const store = { server: false, mode: "connecting" };
  let writing = Promise.resolve();
  let queued = false;

  // The shape written to results/<id>.json and to exported files.
  function fileBody() {
    return {
      audit: A.id,
      title: A.title,
      updatedAt: state.updatedAt,
      savedAt: state.updatedAt ? new Date(state.updatedAt).toISOString() : null,
      summary: buildSummary(),
      passed: state.passed,
      attempts: state.attempts,
      first: state.first,
      answers: state.answers
    };
  }

  function persist() {
    state.updatedAt = Date.now();
    saveLocal();
    if (store.server) pushRemote();
  }
  function pushRemote() {
    if (queued) return;
    queued = true;
    writing = writing.then(async () => {
      queued = false;
      try {
        const res = await fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fileBody()) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setSync("server");
      } catch (e) { setSync("error"); }
    });
  }

  async function connect() {
    if (!/^https?:$/.test(location.protocol)) { setSync("local"); return; }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(API, { cache: "no-store", signal: ctrl.signal });
      clearTimeout(timer);
      // Only serve.py sets this header; any other static server means "no save server".
      if (!res.headers.get("X-Knowledge-Audit")) { setSync("local"); return; }
      store.server = true;
      const remote = res.ok ? normalize(await res.json()) : null;
      if (remote && remote.updatedAt > state.updatedAt) {
        state = remote;
        saveLocal();
        if (ui.view !== "quiz") render();
        setSync("server");
      } else if (state.updatedAt && (!remote || state.updatedAt > remote.updatedAt)) {
        pushRemote();
      } else {
        setSync("server");
      }
    } catch (e) {
      setSync(store.server ? "error" : "local");
    }
  }

  const SYNC = {
    connecting: ["", "Checking for the save server…"],
    server: ["ok", "Auto-saving to results/" + A.id + ".json"],
    local: ["", "Saved in this browser. Run serve.py to save to the repo."],
    error: ["err", "Couldn't reach the save server. Progress is kept in this browser."]
  };
  function syncEl() {
    const span = document.createElement("span");
    span.className = "sync";
    span.id = "sync";
    const [cls, label] = SYNC[store.mode] || SYNC.local;
    const dot = document.createElement("i");
    dot.className = "dot " + cls;
    span.append(dot, document.createTextNode(label));
    return span;
  }
  function setSync(mode) {
    store.mode = mode;
    const el = document.getElementById("sync");
    if (el) el.replaceWith(syncEl());
  }

  /* ---------- Scoring ---------- */
  function status(rec) {
    if (!rec) return null;
    if (rec.skip) return "gap";
    if (!rec.correct) return rec.conf === "sure" ? "misc" : "gap";
    if (rec.conf === "guess") return "luck";
    if (rec.conf === "sure") return "solid";
    return "ok";
  }
  function levelStats(l, src) {
    const qs = byLevel(l);
    const recs = qs.map(q => src[q.id]).filter(Boolean);
    const correct = recs.filter(r => r.correct).length;
    return { total: qs.length, answered: recs.length, correct, pct: qs.length ? correct / qs.length : 0, done: recs.length === qs.length };
  }
  function isUnlocked(l) { return l === LEVEL_IDS[0] || !!state.passed[l - 1]; }
  function firstUnanswered(l) {
    const qs = byLevel(l);
    const i = qs.findIndex(q => !state.answers[q.id]);
    return i === -1 ? qs.length : i;
  }
  function calibration(src) {
    return ["sure", "fair", "guess"].map(c => {
      const rs = Object.values(src).filter(r => !r.skip && r.conf === c);
      const k = rs.filter(r => r.correct).length;
      return { c, n: rs.length, k, pct: rs.length ? k / rs.length : null };
    });
  }
  function buildSummary() {
    const out = { levels: {}, topics: {}, calibration: {}, review: [] };
    for (const l of LEVEL_IDS) {
      const s = levelStats(l, state.first), cur = levelStats(l, state.answers);
      out.levels[l] = { name: LEVELS[l].name, firstAttempt: `${s.correct}/${s.total}`, answered: s.answered, latest: `${cur.correct}/${cur.total}`, passed: !!state.passed[l], retakes: state.attempts[l] || 0 };
    }
    for (const t of TOPIC_ORDER) {
      const qs = Q.filter(q => q.t === t && state.first[q.id]);
      out.topics[TOPICS[t].name] = { answered: qs.length, correct: qs.filter(q => state.first[q.id].correct).length };
    }
    for (const r of calibration(state.first)) out.calibration[CONF[r.c].label] = r.n ? `${r.k}/${r.n}` : "0/0";
    for (const q of Q) {
      const st = status(state.first[q.id]);
      if (st === "misc" || st === "gap" || st === "luck") out.review.push({ id: q.id, level: q.l, topic: TOPICS[q.t].short, concept: q.c, status: STATUS[st].label });
    }
    return out;
  }

  /* ---------- Option order (stable per question and attempt) ---------- */
  function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  function order(q) {
    const rnd = seeded(q.id + ":" + (state.attempts[q.l] || 0));
    const idx = q.o.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx;
  }

  /* ---------- Rendering helpers ---------- */
  const ui = { view: "home", level: LEVEL_IDS[0], idx: 0, pick: null, confirmReset: false, pendingImport: null, notice: null, copied: false };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const pct = x => Math.round(x * 100) + "%";
  const LETTERS = ["A", "B", "C", "D", "E"];

  function render() {
    const v = ui.view;
    app.innerHTML = v === "quiz" ? viewQuiz() : v === "summary" ? viewSummary() : v === "report" ? viewReport() : viewHome();
    const slot = app.querySelector(".sync-slot");
    if (slot) slot.replaceWith(syncEl());
    wire();
  }

  function snippet(q) {
    if (!q.x) return "";
    const label = `<span class="snip-l">${esc(q.xl || "code")}</span>`;
    if (q.xt === "prose") return `<div class="snip prose">${label}<div class="passage">${fmt(q.x).replace(/\n/g, "<br>")}</div></div>`;
    return `<div class="snip">${label}<pre><code>${esc(q.x)}</code></pre></div>`;
  }

  /* ---------- Views ---------- */
  function viewHome() {
    const anyFirst = Object.keys(state.first).length;
    const first = LEVEL_IDS[0];
    const rungs = LEVEL_IDS.map(l => {
      const s = levelStats(l, state.answers);
      const unlocked = isUnlocked(l), passed = !!state.passed[l];
      let cls = "locked", chip = `<span class="chip">Locked</span>`, btn = `<span class="small muted">Score 70% on level ${l - 1} to unlock</span>`;
      if (unlocked) {
        if (s.done) {
          cls = passed ? "passed" : "progress";
          chip = passed ? `<span class="chip good">Passed · ${s.correct}/${s.total}</span>` : `<span class="chip bad">${s.correct}/${s.total} · below 70%</span>`;
          btn = `<button class="btn" data-act="summary" data-l="${l}">Review</button>`;
        } else if (s.answered) {
          cls = "progress";
          chip = `<span class="chip accent">In progress · ${s.answered}/${s.total}</span>`;
          btn = `<button class="btn primary" data-act="start" data-l="${l}">Resume</button>`;
        } else {
          cls = "open";
          chip = `<span class="chip accent">Ready</span>`;
          btn = `<button class="btn primary" data-act="start" data-l="${l}">${SINGLE ? "Start quiz" : `Start level ${l}`}</button>`;
        }
      }
      const kc = Object.keys(KINDS).map(k => [k, byLevel(l).filter(q => q.k === k).length]).filter(x => x[1]);
      return `<div class="rung ${cls}">
        <div class="lvl" aria-hidden="true">L${l}</div>
        <div class="rung-body">
          <div class="row"><h3>${esc(LEVELS[l].name)}</h3>${chip}</div>
          <p>${esc(LEVELS[l].desc)}</p>
          <span class="small muted mono kinds"><span>${byLevel(l).length} questions</span> · ${kc.map(([k, n]) => `<span>${KINDS[k]} ${n}</span>`).join(" · ")}</span>
        </div>
        <div class="rung-actions">${btn}</div>
      </div>`;
    }).join("");

    let controls;
    if (ui.confirmReset) {
      controls = `<span class="confirm"><span>Erase all answers and start over?</span><button class="btn danger" data-act="reset-yes">Erase everything</button><button class="btn ghost" data-act="reset-no">Cancel</button></span>`;
    } else if (ui.pendingImport) {
      const p = ui.pendingImport;
      controls = `<span class="confirm"><span>Replace your progress with ${esc(p.name)} (${p.n} answered${p.savedAt ? `, saved ${esc(p.savedAt)}` : ""})?</span><button class="btn primary" data-act="import-yes">Replace</button><button class="btn ghost" data-act="import-no">Cancel</button></span>`;
    } else {
      controls = `<button class="btn" data-act="export" ${anyFirst ? "" : "disabled"}>Export results</button>
        <button class="btn" data-act="import">Import results</button>
        <button class="btn ghost" data-act="reset" ${anyFirst ? "" : "disabled"}>Start over</button>`;
    }

    return `
    <header class="masthead">
      <nav class="crumbs"><a href="${esc(BACK.href)}">← ${esc(BACK.label)}</a></nav>
      <span class="eyebrow">${esc(A.eyebrow || "Self-assessment")} · ${Q.length} questions${SINGLE ? "" : ` · ${LEVEL_IDS.length} levels`} · ${TOPIC_ORDER.length} areas</span>
      <h1>${esc(A.title)}</h1>
      <p class="lede">${esc(A.lede)}</p>
    </header>
    <div class="how">
      <div><strong>Pick, then rate</strong><p>Choose an answer, then lock it in as a guess, fairly sure, or certain. Confident wrong answers get flagged as misconceptions.</p></div>
      <div><strong>Skip what you don't know</strong><p>An honest skip is more useful than a lucky guess. It goes straight into your study list.</p></div>
      ${SINGLE
        ? `<div><strong>Pass at 70%</strong><p>Score ${need(first)} of ${byLevel(first).length} to pass. Your gap report shows what to revisit before moving on.</p></div>`
        : `<div><strong>Unlock as you go</strong><p>Score 70% (${need(first)} of ${byLevel(first).length}) on a level to open the next one. Your gap report and study plan build as you answer.</p></div>`}
    </div>
    <section class="ladder" aria-label="Levels">${rungs}</section>
    <section class="panel">
      <div class="row" style="justify-content:space-between">
        <div class="stack" style="gap:4px">
          <h3>Gap report and study plan</h3>
          <p class="small muted">${anyFirst ? `Based on your first attempt at ${anyFirst} of ${Q.length} questions.` : "Appears once you've answered some questions."}</p>
        </div>
        <button class="btn${anyFirst ? " primary" : ""}" data-act="report" ${anyFirst ? "" : "disabled"}>Open report</button>
      </div>
    </section>
    <footer class="foot">
      <span class="sync-slot"></span>
      <div class="row">${controls}</div>
    </footer>
    ${ui.notice ? `<p class="notice ${ui.notice.kind}" role="status">${esc(ui.notice.text)}</p>` : ""}`;
  }

  function viewQuiz() {
    const qs = byLevel(ui.level);
    const q = qs[ui.idx];
    const rec = state.answers[q.id];
    const locked = !!rec;
    const bar = qs.map((x, i) => `<i class="${state.answers[x.id] ? "done" : i === ui.idx ? "cur" : ""}"></i>`).join("");

    const opts = order(q).map((oi, pos) => {
      let cls = "", mark = "";
      if (locked) {
        if (oi === q.a) { cls = "right"; mark = "Answer"; }
        else if (!rec.skip && oi === rec.choice) { cls = "wrong"; mark = "Your pick"; }
        else cls = "dim";
      } else if (ui.pick === oi) cls = "sel";
      return `<button class="opt ${cls}" data-act="pick" data-o="${oi}" ${locked ? "disabled" : ""} aria-pressed="${ui.pick === oi || (locked && rec.choice === oi)}">
        <span class="key">${LETTERS[pos]}</span><span class="txt">${fmt(q.o[oi])}</span><span class="mark">${mark}</span></button>`;
    }).join("");

    let lower;
    if (!locked) {
      const dis = ui.pick === null ? "disabled" : "";
      lower = `<div class="lockin">
        <div class="row" style="justify-content:space-between"><strong>How sure are you?</strong><span class="kbd">${ui.pick === null ? "Pick an answer first" : "This locks in your answer"}</span></div>
        <div class="conf">
          <button class="btn" data-act="lock" data-c="guess" ${dis}>Guessing <span>coin flip</span></button>
          <button class="btn" data-act="lock" data-c="fair" ${dis}>Fairly sure <span>think so</span></button>
          <button class="btn primary" data-act="lock" data-c="sure" ${dis}>Certain <span>would bet on it</span></button>
        </div>
        <div class="row"><button class="btn ghost" data-act="skip">I don't know this, skip</button></div>
      </div>`;
    } else {
      const st = status(rec);
      const vcls = rec.correct ? (st === "luck" ? "warn" : "good") : "bad";
      const head = rec.skip ? "Skipped" : rec.correct ? "Correct" : "Not quite";
      const note = st === "misc" ? "You were certain, so this is flagged as a misconception: the top thing to fix."
        : st === "luck" ? "Right, but guessed, so it still counts as shaky in your report."
        : st === "gap" ? "Added to your study list." : "";
      const last = qs.every(x => state.answers[x.id]);
      lower = `<div class="verdict ${vcls}">
        <div class="head">${head}<span class="chip ${STATUS[st].chip}">${STATUS[st].label}</span></div>
        ${note ? `<p class="note">${note}</p>` : ""}
        <p>${fmt(q.e)}</p>
        <p class="study"><b>To study:</b> ${fmt(q.s)}</p>
      </div>
      <div class="row" style="justify-content:flex-end"><span class="kbd">Enter ↵</span><button class="btn primary" data-act="next">${last ? "See level results" : "Next question"}</button></div>`;
    }

    const answeredHere = qs.filter(x => state.answers[x.id]).length;
    return `
    <div class="qtop">
      <div class="qmeta">
        <button class="btn ghost" data-act="home">← All levels</button>
        <span class="eyebrow">L${ui.level} ${esc(LEVELS[ui.level].name)} · ${ui.idx + 1} of ${qs.length}</span>
      </div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${qs.length}" aria-valuenow="${answeredHere}">${bar}</div>
    </div>
    <article class="qcard">
      <div class="row">
        <span class="chip accent">${esc(TOPICS[q.t].name)}</span>
        <span class="chip">${esc(KINDS[q.k] || q.k)}</span>
        <span class="qid" style="margin-left:auto">${q.id.toUpperCase()}</span>
      </div>
      <p class="prompt">${fmt(q.p)}</p>
      ${snippet(q)}
      <div class="opts" role="group" aria-label="Answer options">${opts}</div>
      ${lower}
    </article>
    ${!locked ? `<p class="kbd">Keys: 1–4 to pick · G / F / C to lock in · S to skip</p>` : ""}`;
  }

  function viewSummary() {
    const l = ui.level;
    const s = levelStats(l, state.answers);
    const passed = s.pct >= PASS;
    const qs = byLevel(l);
    const last = l === LEVEL_IDS[LEVEL_IDS.length - 1];
    const rows = qs.map(q => {
      const st = status(state.answers[q.id]);
      return `<div class="qrow"><span class="mono">${q.id.toUpperCase()} · ${esc(TOPICS[q.t].short)}</span><span>${esc(q.c)}</span><span class="chip ${STATUS[st].chip}">${STATUS[st].label}</span></div>`;
    }).join("");
    const byTopic = TOPIC_ORDER.map(t => {
      const tq = qs.filter(q => q.t === t);
      if (!tq.length) return "";
      const c = tq.filter(q => state.answers[q.id] && state.answers[q.id].correct).length;
      return `<span class="chip ${c === tq.length ? "good" : c / tq.length >= 0.5 ? "" : "bad"}">${esc(TOPICS[t].short)} ${c}/${tq.length}</span>`;
    }).join("");
    const next = !last && passed ? `<button class="btn primary" data-act="start" data-l="${l + 1}">Start level ${l + 1}: ${esc(LEVELS[l + 1].name)}</button>` : "";
    return `
    <div class="qmeta"><button class="btn ghost" data-act="home">← All levels</button><span class="eyebrow">Level ${l} results${state.attempts[l] ? ` · attempt ${state.attempts[l] + 1}` : ""}</span></div>
    <section class="panel enter">
      <span class="eyebrow">L${l} ${esc(LEVELS[l].name)}</span>
      <div class="score"><span class="big">${s.correct}/${s.total}</span><span class="chip ${passed ? "good" : "bad"}">${pct(s.pct)} · ${passed ? (last ? "Passed" : `Level ${l + 1} unlocked`) : "Below 70%"}</span></div>
      <p>${passed
        ? (last ? `You've finished the ${NOUN}. Open the gap report for your study plan.` : "You've cleared this level. Your misses and guesses are already in the gap report.")
        : `You need 70% (${need(l)} of ${s.total}) to ${last ? "pass" : "unlock the next level"}. Review the explanations, then retake. Your first attempt stays in the gap report either way, so retaking won't hide what you missed.`}</p>
      <div class="row">${byTopic}</div>
      <div class="row">${next}<button class="btn${next ? "" : " primary"}" data-act="report">Open gap report</button><button class="btn" data-act="retake" data-l="${l}">Retake level</button></div>
    </section>
    <section class="stack">
      <h3>Question by question</h3>
      <div class="qlist">${rows}</div>
      <p class="small muted">Retaking reshuffles the answer order.</p>
    </section>`;
  }

  function calNote(rows) {
    const [sure, , guess] = rows;
    if (sure.n >= 5 && sure.pct < 0.8) return `When you felt certain, you were right ${pct(sure.pct)} of the time. Treat that feeling as a cue to double-check, especially on questions that look easy.`;
    if (guess.n >= 5 && guess.pct >= 0.75) return `Your guesses were right ${pct(guess.pct)} of the time, so you know more than you think. You can trust your reasoning a little more.`;
    if (sure.n >= 5) return "Your confidence broadly matches your accuracy. Keep rating honestly so this stays useful.";
    return "Rate more answers to get a reliable read on this. Five or more \"Certain\" answers is a reasonable minimum.";
  }

  function viewCalibration(src) {
    const rows = calibration(src);
    if (!rows.some(r => r.n)) return "";
    const lines = rows.map(r => `<div class="cal-row">
        <span class="cal-label">${CONF[r.c].label}<small>${CONF[r.c].target}</small></span>
        <span class="cal-bar" aria-hidden="true"><i style="width:${r.pct === null ? 0 : Math.round(r.pct * 100)}%"></i></span>
        <span class="cal-num">${r.n ? `${pct(r.pct)}<small>${r.k}/${r.n}</small>` : `<small>none yet</small>`}</span>
      </div>`).join("");
    return `<section class="stack">
      <h3>How well calibrated are you?</h3>
      <p class="muted small">How often you were right at each confidence level. Good calibration means "Certain" is almost always right, and guesses are hit and miss.</p>
      <div class="panel cal">${lines}<p class="small">${calNote(rows)}</p></div>
    </section>`;
  }

  function viewReport() {
    const src = state.first;
    const answered = Object.keys(src).length;
    const counts = { misc: 0, gap: 0, luck: 0, ok: 0, solid: 0 };
    Object.values(src).forEach(r => counts[status(r)]++);
    const correct = Object.values(src).filter(r => r.correct).length;
    const tally = ["misc", "gap", "luck", "ok", "solid"].map(k =>
      `<div class="${k}"><span class="n">${counts[k]}</span><span class="l"><b>${STATUS[k].label}</b><br>${STATUS[k].desc}</span></div>`).join("");

    const head = `<tr><th scope="col">Area</th>${LEVEL_IDS.map(l => `<th scope="col">L${l} ${esc(LEVELS[l].name)}</th>`).join("")}<th scope="col">Overall</th></tr>`;
    const cell = qs => {
      const recs = qs.filter(q => src[q.id]);
      if (!recs.length) return `<span class="cell na"><b>—</b><small>not taken</small></span>`;
      const c = recs.filter(q => src[q.id].correct).length;
      const firm = recs.filter(q => src[q.id].correct && src[q.id].conf !== "guess").length;
      const ratio = firm / recs.length;
      const t = ratio >= 0.75 ? "t2" : ratio >= 0.5 ? "t1" : "t0";
      const g = c - firm;
      return `<span class="cell ${t}"><b>${c}/${recs.length}</b><small>${g ? `${g} guessed` : "no guesses"}</small></span>`;
    };
    const body = TOPIC_ORDER.map(t => {
      const tq = Q.filter(q => q.t === t);
      return `<tr><th scope="row">${esc(TOPICS[t].name)}</th>${LEVEL_IDS.map(l => `<td>${cell(tq.filter(q => q.l === l))}</td>`).join("")}<td>${cell(tq)}</td></tr>`;
    }).join("");

    const weight = { misc: 3, gap: 2, luck: 1, ok: 0, solid: 0 };
    const rank = { misc: 0, gap: 1, luck: 2 };
    const topics = TOPIC_ORDER.map(t => {
      const items = Q.filter(q => q.t === t && src[q.id]).map(q => ({ q, st: status(src[q.id]) }));
      const weak = items.filter(x => x.st in rank).sort((a, b) => rank[a.st] - rank[b.st] || a.q.l - b.q.l);
      const score = items.length ? items.reduce((n, x) => n + weight[x.st], 0) / items.length : 0;
      return { t, items, weak, score };
    }).filter(x => x.items.length).sort((a, b) => b.score - a.score);

    const focus = topics.map(({ t, items, weak }) => {
      const c = items.filter(x => src[x.q.id].correct).length;
      const list = weak.length
        ? `<ul class="items">${weak.map(({ q, st }) => `<li><span class="chip ${STATUS[st].chip}">${STATUS[st].label}</span><p><span class="c">${esc(q.c)}</span> <span class="small muted mono">L${q.l} · ${q.id.toUpperCase()}</span><br><span class="s">${fmt(q.s)}</span></p></li>`).join("")}</ul>`
        : `<p class="muted">No gaps found here so far. Everything you answered was right and not a guess.</p>`;
      return `<div class="topic">
        <div class="topic-head"><h3>${esc(TOPICS[t].name)}</h3><span class="small muted mono">${c}/${items.length} right · ${weak.length} to review</span></div>
        ${list}
        ${weak.length ? `<div class="res"><span class="eyebrow">Good places to start</span>${TOPICS[t].res.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join("")}</div>` : ""}
      </div>`;
    }).join("");

    const remaining = Q.length - answered;
    return `
    <div class="qmeta"><button class="btn ghost" data-act="home">← All levels</button><span class="eyebrow">Gap report · first attempts</span></div>
    <header class="masthead">
      <h2>Your gap report</h2>
      <p class="lede">${answered} of ${Q.length} questions answered, ${correct} right (${answered ? pct(correct / answered) : "0%"}). ${remaining ? `${remaining} still to go, so this picture fills in as you continue.` : "The audit is complete."} Only your first attempt at each question counts here, so retakes don't hide anything.</p>
    </header>
    <section class="tally" aria-label="Answer breakdown">${tally}</section>
    <section class="stack">
      <h3>Where you stand</h3>
      <div class="matrix-wrap"><table class="matrix"><thead>${head}</thead><tbody>${body}</tbody></table></div>
      <div class="legend"><span><span class="chip good">Green</span> 75%+ right without guessing</span><span><span class="chip warn">Amber</span> 50–74%</span><span><span class="chip bad">Red</span> under 50%</span></div>
    </section>
    ${viewCalibration(src)}
    <section class="focus">
      <h3>Study plan, weakest area first</h3>
      <p class="muted small">Within each area: misconceptions first (confidently wrong), then gaps, then lucky guesses.</p>
      ${focus}
    </section>
    <section class="panel">
      <h3>Plain-text summary</h3>
      <p>A short version of this report to paste into your notes or a study plan.</p>
      <textarea class="copybox" id="copybox" readonly>${esc(summaryText())}</textarea>
      <div class="row"><button class="btn primary" data-act="copy">${ui.copied ? "Copied" : "Copy summary"}</button><button class="btn" data-act="export">Export results file</button></div>
    </section>
    <footer class="foot"><span class="sync-slot"></span></footer>`;
  }

  function summaryText() {
    const src = state.first;
    const lines = [A.title + ": first-attempt results", ""];
    for (const l of LEVEL_IDS) {
      const s = levelStats(l, src);
      lines.push(`Level ${l} ${LEVELS[l].name}: ${s.answered ? `${s.correct}/${s.answered} answered right` : "not taken"}`);
    }
    lines.push("");
    for (const t of TOPIC_ORDER) {
      const tq = Q.filter(q => q.t === t && src[q.id]);
      if (tq.length) lines.push(`${TOPICS[t].name}: ${tq.filter(q => src[q.id].correct).length}/${tq.length}`);
    }
    const cal = calibration(src).filter(r => r.n);
    if (cal.length) {
      lines.push("", "Calibration (right / answered):");
      cal.forEach(r => lines.push(`- ${CONF[r.c].label}: ${r.k}/${r.n} (${pct(r.pct)})`));
    }
    lines.push("", "Items to review:");
    const rank = { misc: 0, gap: 1, luck: 2 };
    Q.filter(q => src[q.id] && status(src[q.id]) in rank)
      .sort((a, b) => rank[status(src[a.id])] - rank[status(src[b.id])] || a.l - b.l)
      .forEach(q => lines.push(`- [${STATUS[status(src[q.id])].label}] L${q.l} ${TOPICS[q.t].short}: ${q.c}`));
    return lines.join("\n");
  }

  /* ---------- Actions ---------- */
  function go(view, extra) {
    Object.assign(ui, { view, pick: null, copied: false, confirmReset: false, pendingImport: null, notice: null }, extra || {});
    render();
    window.scrollTo({ top: 0 });
  }
  function notify(kind, text) { ui.notice = { kind, text }; ui.pendingImport = null; render(); }

  function answer(conf, skip) {
    const q = byLevel(ui.level)[ui.idx];
    if (state.answers[q.id]) return;
    if (!skip && ui.pick === null) return;
    const rec = skip
      ? { choice: -1, skip: true, conf: null, correct: false, at: Date.now() }
      : { choice: ui.pick, conf, correct: ui.pick === q.a, at: Date.now() };
    state.answers[q.id] = rec;
    if (!state.first[q.id]) state.first[q.id] = rec;
    const s = levelStats(ui.level, state.answers);
    if (s.done && s.pct >= PASS) state.passed[ui.level] = true;
    persist();
    ui.pick = null;
    render();
  }
  function next() {
    const qs = byLevel(ui.level);
    const nx = qs.findIndex((q, i) => i > ui.idx && !state.answers[q.id]);
    const target = nx !== -1 ? nx : firstUnanswered(ui.level);
    if (target >= qs.length) return go("summary");
    go("quiz", { idx: target });
  }

  function exportFile() {
    const blob = new Blob([JSON.stringify(fileBody(), null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = A.id + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.hidden = true;
  fileInput.id = "import-file";
  document.body.appendChild(fileInput);
  fileInput.addEventListener("change", async () => {
    const f = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (!f) return;
    let data;
    try { data = JSON.parse(await f.text()); } catch (e) { return notify("error", `${f.name} isn't a valid results file.`); }
    if (!data || data.audit !== A.id) {
      return notify("error", `${f.name} belongs to ${data && data.title ? data.title : "a different audit"}, not the ${A.title}.`);
    }
    const s = normalize(data);
    ui.pendingImport = { state: s, name: f.name, n: Object.keys(s.first).length, savedAt: data.savedAt ? new Date(data.savedAt).toLocaleString() : "" };
    ui.notice = null;
    ui.confirmReset = false;
    render();
  });

  function wire() {
    app.querySelectorAll("[data-act]").forEach(el => el.addEventListener("click", () => {
      const act = el.dataset.act, l = +el.dataset.l;
      if (act === "home") go("home");
      else if (act === "start") { const i = firstUnanswered(l); i >= byLevel(l).length ? go("summary", { level: l }) : go("quiz", { level: l, idx: i }); }
      else if (act === "summary") go("summary", { level: l });
      else if (act === "report") go("report");
      else if (act === "pick") { ui.pick = +el.dataset.o; render(); }
      else if (act === "lock") answer(el.dataset.c, false);
      else if (act === "skip") answer(null, true);
      else if (act === "next") next();
      else if (act === "retake") {
        byLevel(l).forEach(q => delete state.answers[q.id]);
        state.attempts[l] = (state.attempts[l] || 0) + 1;
        persist();
        go("quiz", { level: l, idx: 0 });
      }
      else if (act === "reset") { ui.confirmReset = true; ui.notice = null; render(); }
      else if (act === "reset-no") { ui.confirmReset = false; render(); }
      else if (act === "reset-yes") { state = fresh(); persist(); go("home"); }
      else if (act === "export") exportFile();
      else if (act === "import") fileInput.click();
      else if (act === "import-no") { ui.pendingImport = null; render(); }
      else if (act === "import-yes") {
        const n = ui.pendingImport.n;
        state = ui.pendingImport.state;
        persist();
        go("home");
        notify("ok", `Imported ${n} answers.`);
      }
      else if (act === "copy") {
        const box = document.getElementById("copybox");
        const done = () => { ui.copied = true; el.textContent = "Copied"; };
        const fallback = () => { box.focus(); box.select(); };
        try { navigator.clipboard.writeText(box.value).then(done, fallback); } catch (e) { fallback(); }
      }
    }));
  }

  document.addEventListener("keydown", e => {
    if (ui.view !== "quiz" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")) return;
    const q = byLevel(ui.level)[ui.idx];
    const k = e.key.toLowerCase();
    if (state.answers[q.id]) { if (k === "enter") { e.preventDefault(); next(); } return; }
    const pos = k.length === 1 ? "1234".indexOf(k) : -1;
    if (pos !== -1 && pos < q.o.length) { ui.pick = order(q)[pos]; render(); return; }
    if (k === "g" && ui.pick !== null) answer("guess");
    else if (k === "f" && ui.pick !== null) answer("fair");
    else if (k === "c" && ui.pick !== null) answer("sure");
    else if (k === "s") answer(null, true);
  });

  render();
  connect();
})();
