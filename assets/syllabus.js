/*
 * Syllabus engine: progress tracking for week pages and the overview page,
 * inline checkpoint questions, project and reflection tracking, and the
 * interactive widgets used in lessons.
 *
 * Progress is kept in localStorage and, when served by serve.py, saved to
 * results/syllabus.json (which also rebuilds results/REPORT.md).
 */
(function () {
  "use strict";

  const P = window.SYLLABUS;
  if (!P) return;
  const WEEK_N = window.SYLLABUS_WEEK || null;
  const WEEK = WEEK_N ? P.weeks.find(w => w.n === WEEK_N) : null;
  const READY = P.weeks.filter(w => w.status === "ready");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- State ---------- */
  const SID = P.id || "syllabus";
  const LS_KEY = "knowledge-audit:" + SID;
  const API = "/api/results/" + SID;
  const PROJECT_STATUS = [
    ["not-started", "Not started"],
    ["in-progress", "In progress"],
    ["tests-passing", P.passingLabel || "Tests passing"],
    ["done", "Done"]
  ];
  const fresh = () => ({ lessons: {}, checks: {}, projects: {}, ratings: {}, notes: {}, activity: {}, updatedAt: 0 });

  function normalize(obj) {
    if (!obj || typeof obj !== "object") return null;
    const s = fresh();
    for (const k of Object.keys(s)) {
      if (k !== "updatedAt" && obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) s[k] = JSON.parse(JSON.stringify(obj[k]));
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

  function weekOf(id) { const m = /^w(\d+)-/.exec(id); return m ? +m[1] : null; }

  function buildSummary() {
    return {
      weeks: READY.map(w => {
        const prefix = `w${w.n}-`;
        const checks = Object.entries(state.checks).filter(([id]) => id.startsWith(prefix));
        const proj = state.projects[w.n] || {};
        return {
          week: w.n,
          title: w.title,
          lessonsDone: w.lessons.filter(l => state.lessons[l.id]).length,
          lessonsTotal: w.lessons.length,
          lessonsMissing: w.lessons.filter(l => !state.lessons[l.id]).map(l => l.title),
          checkpoints: {
            total: w.checkpoints,
            answered: checks.length,
            correct: checks.filter(([, r]) => r.correct).length,
            missed: checks.filter(([, r]) => !r.correct).map(([id, r]) => `${id}: ${r.q || ""}`)
          },
          project: { title: w.project.title, path: w.project.path, status: proj.status || "not-started", notes: proj.notes || "" },
          objectives: w.objectives.map(o => ({ text: o.text, rating: state.ratings[o.id] || null })),
          reflection: state.notes[w.n] || "",
          lastActivity: state.activity[w.n] || 0
        };
      })
    };
  }
  function fileBody() {
    return {
      id: P.id,
      title: P.title,
      updatedAt: state.updatedAt,
      savedAt: state.updatedAt ? new Date(state.updatedAt).toISOString() : null,
      summary: buildSummary(),
      lessons: state.lessons, checks: state.checks, projects: state.projects,
      ratings: state.ratings, notes: state.notes, activity: state.activity
    };
  }

  function persist(weekN) {
    state.updatedAt = Date.now();
    if (weekN) state.activity[weekN] = state.updatedAt;
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
  const debounced = {};
  function persistSoon(key, weekN) {
    clearTimeout(debounced[key]);
    debounced[key] = setTimeout(() => persist(weekN), 700);
  }

  async function fetchResult(id) {
    if (!/^https?:$/.test(location.protocol)) return { server: false, data: null };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch("/api/results/" + encodeURIComponent(id), { cache: "no-store", signal: ctrl.signal });
      if (!res.headers.get("X-Knowledge-Audit")) return { server: false, data: null };
      return { server: true, data: res.ok ? await res.json() : null };
    } finally { clearTimeout(timer); }
  }

  async function connect() {
    try {
      const { server, data } = await fetchResult(SID);
      if (!server) { setSync("local"); return; }
      store.server = true;
      const remote = normalize(data);
      if (remote && remote.updatedAt > state.updatedAt) {
        state = remote;
        saveLocal();
        refresh();
        setSync("server");
      } else if (state.updatedAt && (!remote || state.updatedAt > remote.updatedAt)) {
        pushRemote();
      } else {
        setSync("server");
      }
    } catch (e) { setSync(store.server ? "error" : "local"); }
  }

  const SYNC = {
    connecting: ["", "Checking for the save server…"],
    server: ["ok", `Auto-saving to results/${SID}.json`],
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

  /* ---------- Quiz status (read-only: quizzes save their own files) ---------- */
  async function quizStatus(id) {
    let data = null;
    try { const r = await fetchResult(id); data = r.data; } catch (e) {}
    if (!data) {
      try { data = JSON.parse(localStorage.getItem("knowledge-audit:" + id)); } catch (e) { data = null; }
    }
    if (!data || !data.first) return { answered: 0, correct: 0, passed: false };
    const recs = Object.values(data.first);
    return { answered: recs.length, correct: recs.filter(r => r.correct).length, passed: !!(data.passed && data.passed[1]) };
  }
  function quizLabel(q, total) {
    if (!q || !q.answered) return "Not taken";
    if (q.answered < total) return `In progress · ${q.answered}/${total}`;
    return `${q.correct}/${total} · ${q.passed ? "passed" : "below 70%"}`;
  }

  /* ---------- Week page ---------- */
  function weekCounts(w) {
    const prefix = `w${w.n}-`;
    const checks = Object.entries(state.checks).filter(([id]) => id.startsWith(prefix));
    return {
      lessons: w.lessons.filter(l => state.lessons[l.id]).length,
      checksAnswered: checks.length,
      checksRight: checks.filter(([, r]) => r.correct).length,
      project: (state.projects[w.n] || {}).status || "not-started"
    };
  }
  let quizState = null;

  function renderWeekProgress() {
    const box = $("#week-progress");
    if (!box || !WEEK) return;
    const c = weekCounts(WEEK);
    const statusLabel = Object.fromEntries(PROJECT_STATUS)[c.project];
    const toc = WEEK.lessons.map((l, i) => `<li class="${state.lessons[l.id] ? "done" : ""}">
        <a href="#${l.id}"><span class="tick" aria-hidden="true">${state.lessons[l.id] ? "✓" : i + 1}</span>
        <span>${esc(l.title)}</span><span class="mins">${l.minutes} min</span></a></li>`).join("");
    box.innerHTML = `
      <div class="pc-stats">
        <div><b>${c.lessons}/${WEEK.lessons.length}</b><span>lessons done</span></div>
        <div><b>${c.checksRight}/${WEEK.checkpoints}</b><span>checkpoints right${c.checksAnswered ? ` · ${c.checksAnswered} tried` : ""}</span></div>
        <div><b class="small-b">${esc(statusLabel)}</b><span>project</span></div>
        <div><b class="small-b">${esc(quizLabel(quizState, WEEK.quizQuestions))}</b><span>end-of-week quiz</span></div>
      </div>
      <ol class="toc">${toc}
        <li class="${c.project === "done" ? "done" : ""}"><a href="#project"><span class="tick" aria-hidden="true">${c.project === "done" ? "✓" : "P"}</span><span>Mini-project</span><span class="mins">4–5 h</span></a></li>
        <li class="${quizState && quizState.passed ? "done" : ""}"><a href="#quiz"><span class="tick" aria-hidden="true">${quizState && quizState.passed ? "✓" : "Q"}</span><span>End-of-week quiz</span><span class="mins">30 min</span></a></li>
        <li class="${state.notes[WEEK.n] ? "done" : ""}"><a href="#reflection"><span class="tick" aria-hidden="true">${state.notes[WEEK.n] ? "✓" : "R"}</span><span>Self-rating and reflection</span><span class="mins">15 min</span></a></li>
      </ol>`;
  }

  function setupLessons() {
    $$("section.lesson[id]").forEach(sec => {
      let foot = $(".lesson-foot", sec);
      if (!foot) { foot = document.createElement("div"); foot.className = "lesson-foot"; sec.appendChild(foot); }
      const draw = () => {
        const done = state.lessons[sec.id];
        foot.innerHTML = done
          ? `<span class="done-note">✓ Completed ${esc(new Date(done.doneAt).toLocaleDateString())}</span><button class="btn ghost" type="button">Mark as not done</button>`
          : `<button class="btn primary" type="button">Mark lesson complete</button><span class="small muted">Tick this once you've read it, done the checkpoints and watched the video.</span>`;
        $("button", foot).addEventListener("click", () => {
          if (state.lessons[sec.id]) delete state.lessons[sec.id];
          else state.lessons[sec.id] = { doneAt: Date.now() };
          persist(WEEK_N);
          draw();
          renderWeekProgress();
        });
      };
      draw();
      sec.__draw = draw;
    });
  }

  function setupChecks() {
    $$(".check[data-id]").forEach(box => {
      const id = box.dataset.id;
      const answer = +box.dataset.answer;
      const qEl = $(".check-q", box);
      const items = $$(".check-o > li", box);
      const why = $(".check-why", box);
      const opts = items.map(li => li.innerHTML);
      const list = $(".check-o", box);
      const wrap = document.createElement("div");
      wrap.className = "check-opts";
      list.replaceWith(wrap);
      const result = document.createElement("p");
      result.className = "check-result";
      result.setAttribute("role", "status");
      wrap.after(result);
      if (why) result.after(why);
      const qText = (qEl ? qEl.textContent : "").replace(/\s+/g, " ").trim().slice(0, 140);

      const draw = () => {
        const rec = state.checks[id];
        wrap.innerHTML = opts.map((html, i) => {
          let cls = "";
          if (rec) cls = i === answer ? "right" : i === rec.choice ? "wrong" : "dim";
          return `<button type="button" class="check-btn ${cls}" data-i="${i}" ${rec ? "disabled" : ""}><span class="key">${"ABCD"[i]}</span><span>${html}</span></button>`;
        }).join("");
        if (why) why.hidden = !rec;
        result.textContent = rec ? (rec.correct ? "Correct." : "Not quite. The right answer is highlighted.") : "";
        result.className = "check-result " + (rec ? (rec.correct ? "good" : "bad") : "");
        $$(".check-btn", wrap).forEach(b => b.addEventListener("click", () => {
          if (state.checks[id]) return;
          const choice = +b.dataset.i;
          state.checks[id] = { choice, correct: choice === answer, at: Date.now(), q: qText };
          persist(weekOf(id));
          draw();
          renderWeekProgress();
        }));
      };
      draw();
      box.__draw = draw;
    });
  }

  function setupProject() {
    const box = $("#project-tracker");
    if (!box || !WEEK) return;
    const draw = () => {
      const p = state.projects[WEEK.n] || {};
      const cur = p.status || "not-started";
      box.innerHTML = `
        <div class="seg" role="radiogroup" aria-label="Project status">
          ${PROJECT_STATUS.map(([v, label]) => `<button type="button" role="radio" aria-checked="${v === cur}" class="${v === cur ? "on" : ""}" data-v="${v}">${label}</button>`).join("")}
        </div>
        <label class="field-label" for="project-notes">Project notes: what you built, what was hard, anything a reviewer should look at</label>
        <textarea id="project-notes" rows="4" placeholder="${esc(P.notesPlaceholder || "e.g. All tests pass except utf8_decode on invalid input. Not sure my float32_value handles subnormals.")}">${esc(p.notes || "")}</textarea>`;
      $$(".seg button", box).forEach(b => b.addEventListener("click", () => {
        state.projects[WEEK.n] = Object.assign({}, state.projects[WEEK.n], { status: b.dataset.v, updatedAt: Date.now() });
        persist(WEEK.n);
        draw();
        renderWeekProgress();
      }));
      $("#project-notes", box).addEventListener("input", e => {
        state.projects[WEEK.n] = Object.assign({}, state.projects[WEEK.n], { notes: e.target.value, updatedAt: Date.now() });
        persistSoon("project", WEEK.n);
      });
    };
    draw();
    box.__draw = draw;
  }

  function setupReflection() {
    const box = $("#reflection-form");
    if (!box || !WEEK) return;
    const draw = () => {
      const rows = WEEK.objectives.map(o => {
        const r = state.ratings[o.id] || 0;
        return `<div class="obj-row"><p>${esc(o.text)}</p>
          <div class="rate" role="radiogroup" aria-label="Rate: ${esc(o.text)}">
            ${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${n === r}" class="${n === r ? "on" : ""}" data-o="${o.id}" data-n="${n}">${n}</button>`).join("")}
          </div></div>`;
      }).join("");
      box.innerHTML = `
        <p class="small muted">1 = can't do this yet · 3 = can do it with notes · 5 = could teach it</p>
        <div class="objs">${rows}</div>
        <label class="field-label" for="reflection-notes">Reflection: what clicked, what's still fuzzy, what you'd like more practice on</label>
        <textarea id="reflection-notes" rows="5" placeholder="e.g. Two's complement makes sense now. Still slow at hex conversions. Floating point rounding modes are fuzzy.">${esc(state.notes[WEEK.n] || "")}</textarea>`;
      $$(".rate button", box).forEach(b => b.addEventListener("click", () => {
        state.ratings[b.dataset.o] = +b.dataset.n;
        persist(WEEK.n);
        draw();
      }));
      $("#reflection-notes", box).addEventListener("input", e => {
        state.notes[WEEK.n] = e.target.value;
        persistSoon("reflection", WEEK.n);
        clearTimeout(debounced.toc);
        debounced.toc = setTimeout(renderWeekProgress, 800);
      });
    };
    draw();
    box.__draw = draw;
  }

  async function setupQuizStatus() {
    if (!WEEK) return;
    quizState = await quizStatus(WEEK.quiz);
    const box = $("#quiz-status");
    if (box) box.textContent = quizLabel(quizState, WEEK.quizQuestions);
    renderWeekProgress();
  }

  function refresh() {
    if (WEEK) {
      renderWeekProgress();
      $$("section.lesson[id]").forEach(s => s.__draw && s.__draw());
      $$(".check[data-id]").forEach(b => b.__draw && b.__draw());
      ["#project-tracker", "#reflection-form"].forEach(sel => { const el = $(sel); if (el && el.__draw) el.__draw(); });
    } else {
      renderIndex();
    }
  }

  /* ---------- Overview page ---------- */
  const quizCache = {};
  function renderIndex() {
    const app = $("#app");
    if (!app) return;
    const cards = P.weeks.map(w => {
      if (w.status !== "ready") {
        return `<article class="week-card planned">
          <div class="wk-num">${w.n}</div>
          <div class="wk-body"><div class="row"><h3>${esc(w.title)}</h3><span class="chip">Coming later</span></div><p>${esc(w.summary)}</p></div>
        </article>`;
      }
      const c = weekCounts(w);
      const q = quizCache[w.quiz];
      const parts = [
        c.lessons / w.lessons.length,
        Math.min(1, c.checksAnswered / w.checkpoints),
        { "not-started": 0, "in-progress": 0.4, "tests-passing": 0.8, "done": 1 }[c.project],
        q && q.answered ? Math.min(1, q.answered / w.quizQuestions) : 0
      ];
      const pct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length * 100);
      const started = pct > 0;
      return `<article class="week-card">
        <div class="wk-num">${w.n}</div>
        <div class="wk-body">
          <div class="row"><h3>${esc(w.title)}</h3><span class="chip ${pct === 100 ? "good" : started ? "accent" : ""}">${pct === 100 ? "Complete" : started ? `${pct}%` : "Ready"}</span></div>
          <p>${esc(w.summary)}</p>
          <div class="wk-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
          <span class="small muted mono">${c.lessons}/${w.lessons.length} lessons · ${c.checksRight}/${w.checkpoints} checkpoints right · project ${esc(Object.fromEntries(PROJECT_STATUS)[c.project].toLowerCase())} · quiz ${esc(quizLabel(q, w.quizQuestions).toLowerCase())}</span>
        </div>
        <div class="wk-actions"><a class="btn primary" href="weeks/${w.slug}.html">${started ? "Continue" : "Open week"}</a><a class="btn" href="quizzes/${w.slug}.html">Quiz</a></div>
      </article>`;
    }).join("");

    app.innerHTML = `
      <header class="masthead">
        <nav class="crumbs"><a href="../index.html">← Knowledge Audit</a></nav>
        <span class="eyebrow">${P.weeks.length} weeks · about ${P.hoursPerWeek} hours a week</span>
        <h1>${esc(P.title)}</h1>
        ${P.lede ? `<p class="lede">${P.lede}</p>` : `<p class="lede">The core of a computer science degree, condensed: the 20% of ideas that carry 80% of the weight, from how bits become numbers up to distributed systems and how software companies run. Each week has written lessons with interactive checkpoints, short videos, a hands-on Python project, an end-of-week quiz and a self-rating.</p>`}
      </header>
      ${P.how ? `<div class="how">${P.how.map(h => `<div><strong>${h[0]}</strong><p>${h[1]}</p></div>`).join("")}</div>` : `<div class="how">
        <div><strong>Lessons (4–5 h)</strong><p>Read each lesson, try the widgets, answer the checkpoints and watch the linked video. Mark each lesson complete as you go.</p></div>
        <div><strong>Project (4–5 h)</strong><p>Each week has a Python project in <code>syllabus/projects/</code> with starter code and tests. Make the tests pass, then record your status and notes.</p></div>
        <div><strong>Quiz and reflection (45 min)</strong><p>Finish with the 15-question quiz (70% to pass), then rate yourself on each objective and write a short reflection.</p></div>
      </div>`}
      <section class="weeks">${cards}</section>
      <section class="panel">
        <h3>Sharing your progress</h3>
        <p>Everything you do here is saved to <code>results/</code> when <code>serve.py</code> is running, and <code>results/REPORT.md</code> is rebuilt after every save: lessons done, checkpoint misses, project status and notes, quiz gaps, self-ratings and reflections in one readable file. Commit and push <code>results/</code>, then point a tutor or reviewer at <code>REPORT.md</code> and <code>syllabus/REVIEW.md</code>.</p>
      </section>
      <footer class="foot"><span class="sync-slot"></span></footer>`;
    const slot = $(".sync-slot", app);
    if (slot) slot.replaceWith(syncEl());
  }

  async function loadIndexQuizzes() {
    await Promise.all(READY.map(async w => { quizCache[w.quiz] = await quizStatus(w.quiz); }));
    renderIndex();
  }

  /* ======================================================================
     Widgets
     ====================================================================== */
  const W = {};
  const bin = (n, w) => (n >>> 0).toString(2).padStart(w, "0").slice(-w);
  const hex = (n, w) => (n >>> 0).toString(16).toUpperCase().padStart(w, "0");
  function widgetShell(el, title, body) {
    el.innerHTML = `<div class="wg-head"><span class="eyebrow">Try it</span><strong>${esc(title)}</strong></div><div class="wg-body">${body}</div>`;
    return $(".wg-body", el);
  }

  /* Bit toggler: unsigned or two's complement view of one byte */
  W.bits = el => {
    const signed = el.dataset.mode === "signed";
    let v = signed ? 0b00000101 : 0b00101101;
    let note = "";
    const body = widgetShell(el, signed ? "One byte, read as a signed (two's complement) number" : "One byte: click the bits");
    const draw = () => {
      const bits = bin(v, 8).split("");
      const unsigned = v;
      const sgn = v >= 128 ? v - 256 : v;
      body.innerHTML = `
        <div class="bitrow">${bits.map((b, i) => {
          const place = 2 ** (7 - i);
          const label = signed && i === 0 ? "−128" : String(place);
          return `<button type="button" class="bit ${b === "1" ? "on" : ""}" data-i="${i}" aria-label="Bit worth ${label}, currently ${b}"><b>${b}</b><small>${label}</small></button>`;
        }).join("")}</div>
        <div class="readout">
          <div><span>Binary</span><b class="mono">${bits.join("").replace(/(\d{4})(\d{4})/, "$1 $2")}</b></div>
          <div><span>Hex</span><b class="mono">0x${hex(v, 2)}</b></div>
          <div class="${signed ? "" : "em"}"><span>Unsigned</span><b>${unsigned}</b></div>
          <div class="${signed ? "em" : ""}"><span>Signed (two's complement)</span><b>${sgn}</b></div>
        </div>
        <div class="row wg-controls">
          <button type="button" class="btn" data-a="dec">− 1</button>
          <button type="button" class="btn" data-a="inc">+ 1</button>
          ${signed ? `<button type="button" class="btn" data-a="neg">Negate (flip bits, add 1)</button><button type="button" class="btn" data-a="max">Set to 127</button>` : `<button type="button" class="btn" data-a="shl">Shift left (× 2)</button><button type="button" class="btn" data-a="shr">Shift right (÷ 2)</button>`}
          <button type="button" class="btn ghost" data-a="clear">Clear</button>
        </div>
        <p class="wg-note" role="status">${note}</p>`;
      $$(".bit", body).forEach(b => b.addEventListener("click", () => { v ^= 1 << (7 - +b.dataset.i); note = ""; draw(); }));
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        const before = signed ? (v >= 128 ? v - 256 : v) : v;
        if (a === "inc") v = (v + 1) & 255;
        if (a === "dec") v = (v + 255) & 255;
        if (a === "neg") v = ((~v) + 1) & 255;
        if (a === "max") v = 127;
        if (a === "shl") v = (v << 1) & 255;
        if (a === "shr") v = v >> 1;
        if (a === "clear") v = 0;
        const after = signed ? (v >= 128 ? v - 256 : v) : v;
        note = "";
        if (a === "inc" && after < before) note = `Overflow: ${before} + 1 doesn't fit in 8 bits, so it wrapped around to ${after}.`;
        if (a === "dec" && after > before) note = `Overflow: ${before} − 1 doesn't fit in 8 bits, so it wrapped around to ${after}.`;
        if (a === "neg" && before === -128) note = "−128 has no positive partner in 8 bits: negating it gives −128 again.";
        if (a === "shl" && before >= 128) note = "The top bit fell off the end, so the result is no longer double the original.";
        draw();
      }));
    };
    draw();
  };

  /* Float32 explorer */
  W.float = el => {
    const body = widgetShell(el, "How a 32-bit float stores a number");
    body.innerHTML = `
      <div class="row wg-controls">
        <label class="field-label" for="fl-in" style="margin:0">Number</label>
        <input id="fl-in" class="wg-input" type="text" inputmode="decimal" value="0.1" aria-label="Number to encode">
        ${["0.1", "0.25", "1", "-2.75", "16777217", "1e-45"].map(x => `<button type="button" class="btn ghost" data-x="${x}">${x}</button>`).join("")}
      </div>
      <div class="fl-out"></div>`;
    const input = $("#fl-in", body);
    const out = $(".fl-out", body);
    const exact = x => {
      if (!isFinite(x)) return String(x);
      let s = x.toPrecision(60);
      if (s.includes("e")) return x.toPrecision(12);
      return s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
    };
    const draw = () => {
      const x = Number(input.value.trim());
      if (input.value.trim() === "" || Number.isNaN(x)) { out.innerHTML = `<p class="wg-note">Type a number, like 0.1 or -2.75.</p>`; return; }
      const dv = new DataView(new ArrayBuffer(4));
      dv.setFloat32(0, x);
      const u = dv.getUint32(0);
      const bits = bin(u, 32);
      const sign = bits[0], expBits = bits.slice(1, 9), frac = bits.slice(9);
      const e = parseInt(expBits, 2);
      const stored = dv.getFloat32(0);
      let meaning;
      if (e === 255) meaning = frac.includes("1") ? "Exponent all ones with a non-zero fraction: NaN." : "Exponent all ones, fraction zero: infinity.";
      else if (e === 0) meaning = `Exponent all zeros: a subnormal (or zero). Value = (−1)<sup>${sign}</sup> × 0.${frac.replace(/0+$/, "") || "0"}₂ × 2<sup>−126</sup>`;
      else meaning = `Value = (−1)<sup>${sign}</sup> × 1.${frac.replace(/0+$/, "") || "0"}₂ × 2<sup>${e} − 127 = ${e - 127}</sup>`;
      const diff = stored - x;
      out.innerHTML = `
        <div class="fbits" aria-label="32 bits">
          <span class="f-s" title="sign">${sign}</span><span class="f-e" title="exponent">${expBits}</span><span class="f-m" title="fraction">${frac}</span>
        </div>
        <div class="flegend"><span><i class="f-s"></i>sign (1 bit)</span><span><i class="f-e"></i>exponent (8 bits, bias 127)</span><span><i class="f-m"></i>fraction (23 bits)</span></div>
        <p class="mono small">${meaning}</p>
        <div class="readout">
          <div><span>You typed</span><b class="mono">${esc(input.value.trim())}</b></div>
          <div class="em"><span>Actually stored (float32)</span><b class="mono">${esc(exact(stored))}</b></div>
          <div><span>Error</span><b class="mono">${diff === 0 ? "0 (exact)" : esc(diff.toExponential(3))}</b></div>
        </div>`;
    };
    input.addEventListener("input", draw);
    $$("[data-x]", body).forEach(b => b.addEventListener("click", () => { input.value = b.dataset.x; draw(); }));
    draw();
  };

  /* UTF-8 inspector */
  W.utf8 = el => {
    const body = widgetShell(el, "See the bytes behind text");
    body.innerHTML = `
      <input id="u8-in" class="wg-input wide" type="text" value="Café ✓ 😀" aria-label="Text to encode">
      <div class="u8-out"></div>`;
    const input = $("#u8-in", body);
    const out = $(".u8-out", body);
    const enc = new TextEncoder();
    let dec1252 = null;
    try { dec1252 = new TextDecoder("windows-1252"); } catch (e) {}
    const draw = () => {
      const text = input.value;
      const chars = Array.from(text);
      const rows = chars.map(ch => {
        const cp = ch.codePointAt(0);
        const bytes = Array.from(enc.encode(ch));
        return `<tr><td class="ch">${ch === " " ? "␠" : esc(ch)}</td><td class="mono">U+${cp.toString(16).toUpperCase().padStart(4, "0")}</td>
          <td class="mono">${bytes.map(b => hex(b, 2)).join(" ")}</td><td class="mono bitsmall">${bytes.map(b => bin(b, 8)).join(" ")}</td><td>${bytes.length}</td></tr>`;
      }).join("");
      const all = enc.encode(text);
      out.innerHTML = `
        <div class="table-wrap"><table class="wg-table"><thead><tr><th>Char</th><th>Code point</th><th>UTF-8 bytes</th><th>Bits</th><th>Bytes</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="readout">
          <div><span>Characters (code points)</span><b>${chars.length}</b></div>
          <div class="em"><span>Bytes in UTF-8</span><b>${all.length}</b></div>
          <div><span>JavaScript .length (UTF-16 units)</span><b>${text.length}</b></div>
        </div>
        ${dec1252 ? `<p class="small">Same bytes wrongly decoded as Windows-1252: <span class="mono mojibake">${esc(dec1252.decode(all))}</span></p>` : ""}`;
    };
    input.addEventListener("input", draw);
    draw();
  };

  /* Toy CPU */
  W.cpu = el => {
    const PRESETS = {
      add: { name: "Add two numbers", mem: [["LOAD_A", 14], ["LOAD_B", 15], ["ADD"], ["STORE_A", 13], ["HALT"], 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 14],
        labels: { 13: "result", 14: "x", 15: "y" } },
      mul: { name: "Multiply 3 × 4 with a loop", mem: [["LOAD_A", 13], ["JUMP_IF_ZERO", 10], ["LOAD_B", 15], ["SUB"], ["STORE_A", 13], ["LOAD_A", 12], ["LOAD_B", 14], ["ADD"], ["STORE_A", 12], ["JUMP", 0], ["HALT"], 0, 0, 4, 3, 1],
        labels: { 12: "result", 13: "counter", 14: "value", 15: "one" } }
    };
    const body = widgetShell(el, "A toy CPU: step through fetch, decode, execute");
    let preset = "add", mem, A, B, PC, IR, cycles, halted, log, timer = null;
    const reset = () => {
      mem = PRESETS[preset].mem.map(c => Array.isArray(c) ? c.slice() : c);
      A = 0; B = 0; PC = 0; IR = "—"; cycles = 0; halted = false;
      log = "Press Step. Each step is one full instruction cycle.";
    };
    const fmtCell = c => Array.isArray(c) ? (c.length > 1 ? `${c[0]} ${c[1]}` : c[0]) : String(c);
    const step = () => {
      if (halted) return;
      const cell = mem[PC];
      if (!Array.isArray(cell)) { halted = true; log = `PC points at data (${cell}), not an instruction. The CPU would try to run it anyway; real CPUs don't know the difference.`; return; }
      const [op, arg] = cell;
      const fetched = `Fetch: read memory[${PC}] → "${fmtCell(cell)}" into the instruction register; PC becomes ${PC + 1}.`;
      IR = fmtCell(cell);
      PC += 1;
      let ex;
      switch (op) {
        case "LOAD_A": A = mem[arg]; ex = `A ← memory[${arg}] = ${A}`; break;
        case "LOAD_B": B = mem[arg]; ex = `B ← memory[${arg}] = ${B}`; break;
        case "ADD": A = A + B; ex = `A ← A + B = ${A} (the ALU does the addition)`; break;
        case "SUB": A = A - B; ex = `A ← A − B = ${A}`; break;
        case "STORE_A": mem[arg] = A; ex = `memory[${arg}] ← A = ${A}`; break;
        case "JUMP": PC = arg; ex = `PC ← ${arg} (the next instruction comes from address ${arg})`; break;
        case "JUMP_IF_ZERO": if (A === 0) { PC = arg; ex = `A is 0, so PC ← ${arg}`; } else ex = `A is ${A}, not 0, so carry on at ${PC}`; break;
        case "HALT": halted = true; ex = "Stop."; break;
      }
      cycles += 1;
      log = `${fetched}\nDecode: opcode ${op}${arg !== undefined ? `, operand ${arg}` : ""}.\nExecute: ${ex}`;
    };
    const draw = () => {
      const labels = PRESETS[preset].labels;
      body.innerHTML = `
        <div class="row wg-controls">
          <select id="cpu-preset" class="wg-input" aria-label="Program">${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}" ${k === preset ? "selected" : ""}>${p.name}</option>`).join("")}</select>
          <button type="button" class="btn primary" data-a="step" ${halted ? "disabled" : ""}>Step</button>
          <button type="button" class="btn" data-a="run" ${halted ? "disabled" : ""}>${timer ? "Pause" : "Run"}</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="cpu">
          <div class="regs">
            <div><span>PC</span><b>${PC}</b></div><div><span>Instruction register</span><b class="mono">${esc(IR)}</b></div>
            <div><span>A</span><b>${A}</b></div><div><span>B</span><b>${B}</b></div><div><span>Cycles</span><b>${cycles}</b></div>
          </div>
          <div class="table-wrap"><table class="wg-table mem"><thead><tr><th>Addr</th><th>Contents</th></tr></thead><tbody>
            ${mem.map((c, i) => `<tr class="${i === PC && !halted ? "pc" : ""}"><td class="mono">${i}</td><td class="mono">${esc(fmtCell(c))}${labels[i] ? ` <small class="muted">← ${labels[i]}</small>` : ""}</td></tr>`).join("")}
          </tbody></table></div>
        </div>
        <pre class="wg-log" role="status">${esc(log)}${halted ? "\nHalted." : ""}</pre>`;
      $("#cpu-preset", body).addEventListener("change", e => { stop(); preset = e.target.value; reset(); draw(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "step") { step(); draw(); }
        if (a === "reset") { stop(); reset(); draw(); }
        if (a === "run") {
          if (timer) { stop(); draw(); return; }
          timer = setInterval(() => { step(); if (halted || cycles > 200) stop(); draw(); }, 450);
          draw();
        }
      }));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    reset();
    draw();
  };

  /* Growth rates */
  W.growth = el => {
    const NS = [10, 100, 1000, 1e4, 1e5, 1e6];
    let idx = 2;
    const body = widgetShell(el, "How running time grows with input size");
    const fns = [
      ["O(1)", () => 1], ["O(log n)", n => Math.log2(n)], ["O(n)", n => n],
      ["O(n log n)", n => n * Math.log2(n)], ["O(n²)", n => n * n], ["O(2ⁿ)", n => Math.pow(2, n)]
    ];
    const human = s => {
      if (!isFinite(s) || s > 3.15e7 * 1e10) return "longer than the age of the universe";
      if (s < 1e-6) return `${(s * 1e9).toFixed(0)} ns`;
      if (s < 1e-3) return `${(s * 1e6).toFixed(1)} µs`;
      if (s < 1) return `${(s * 1e3).toFixed(1)} ms`;
      if (s < 60) return `${s.toFixed(1)} s`;
      if (s < 3600) return `${(s / 60).toFixed(1)} min`;
      if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
      if (s < 3.15e7) return `${(s / 86400).toFixed(1)} days`;
      return `${(s / 3.15e7).toExponential(1)} years`;
    };
    const draw = () => {
      const n = NS[idx];
      const rows = fns.map(([name, f]) => {
        const ops = f(n);
        const w = Math.max(1, Math.min(100, (Math.log10(Math.max(ops, 1)) / 12) * 100));
        return `<tr><td class="mono">${name}</td><td class="bar-cell"><span class="gbar" style="width:${w}%"></span></td><td class="mono">${ops > 1e15 ? ops.toExponential(1) : Math.round(ops).toLocaleString()}</td><td>${human(ops / 1e8)}</td></tr>`;
      }).join("");
      body.innerHTML = `
        <label class="field-label" for="g-n">Input size n = <b>${n.toLocaleString()}</b></label>
        <input id="g-n" type="range" min="0" max="${NS.length - 1}" step="1" value="${idx}" class="wg-range">
        <div class="table-wrap"><table class="wg-table"><thead><tr><th>Growth</th><th>Operations (log scale)</th><th>Operations</th><th>Time at 100 million ops/s</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      $("#g-n", body).addEventListener("input", e => { idx = +e.target.value; draw(); $("#g-n", body).focus(); });
    };
    draw();
  };

  /* Hash table with chaining */
  W.hashtable = el => {
    let size = 4, buckets, count, note;
    const SAMPLE = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "kiwi", "lemon", "mango"];
    let sampleIdx = 0;
    const h = key => { let x = 5381; for (const ch of key) x = ((x * 33) ^ ch.codePointAt(0)) >>> 0; return x; };
    const reset = () => { size = 4; buckets = Array.from({ length: size }, () => []); count = 0; note = "Insert a few keys. When the load factor passes 0.75, the table doubles and every key is rehashed."; };
    const insert = key => {
      const hv = h(key), i = hv % size;
      const existing = buckets[i].find(e => e.k === key);
      if (existing) { note = `"${key}" is already in bucket ${i}. A put on an existing key updates its value.`; return; }
      buckets[i].push({ k: key, h: hv });
      count += 1;
      note = `hash("${key}") = ${hv} → ${hv} mod ${size} = bucket ${i}${buckets[i].length > 1 ? `. Collision: bucket ${i} now chains ${buckets[i].length} keys.` : "."}`;
      if (count / size > 0.75) {
        const old = buckets.flat();
        size *= 2;
        buckets = Array.from({ length: size }, () => []);
        old.forEach(e => buckets[e.h % size].push(e));
        note += ` Load factor ${(count / (size / 2)).toFixed(2)} > 0.75, so the table grew to ${size} buckets and all ${count} keys were rehashed.`;
      }
    };
    const lookup = key => {
      const hv = h(key), i = hv % size;
      const chain = buckets[i];
      const pos = chain.findIndex(e => e.k === key);
      note = pos >= 0
        ? `hash("${key}") → bucket ${i}; found after checking ${pos + 1} key${pos ? "s" : ""} in the chain.`
        : `hash("${key}") → bucket ${i}; checked ${chain.length} key${chain.length === 1 ? "" : "s"} there, not found. No other bucket needs checking.`;
    };
    const body = widgetShell(el, "A hash table with chaining");
    const draw = () => {
      body.innerHTML = `
        <div class="row wg-controls">
          <input id="ht-key" class="wg-input" type="text" placeholder="key, e.g. pear" aria-label="Key">
          <button type="button" class="btn primary" data-a="put">Insert</button>
          <button type="button" class="btn" data-a="get">Look up</button>
          <button type="button" class="btn" data-a="sample">Insert next sample word</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <p class="small muted">${count} keys · ${size} buckets · load factor ${(count / size).toFixed(2)}</p>
        <div class="buckets">${buckets.map((b, i) => `<div class="bucket"><span class="bi mono">${i}</span><div class="chain">${b.map(e => `<span class="kv">${esc(e.k)}</span>`).join("") || `<span class="muted small">empty</span>`}</div></div>`).join("")}</div>
        <p class="wg-note" role="status">${esc(note)}</p>`;
      const keyEl = $("#ht-key", body);
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a, key = keyEl.value.trim();
        if (a === "put" && key) insert(key);
        if (a === "get" && key) lookup(key);
        if (a === "sample") { insert(SAMPLE[sampleIdx % SAMPLE.length] + (sampleIdx >= SAMPLE.length ? sampleIdx : "")); sampleIdx++; }
        if (a === "reset") { reset(); sampleIdx = 0; }
        draw();
      }));
      keyEl.addEventListener("keydown", e => { if (e.key === "Enter" && keyEl.value.trim()) { insert(keyEl.value.trim()); draw(); } });
    };
    reset();
    draw();
  };

  /* Binary search stepper */
  W.bsearch = el => {
    const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 77, 81, 90, 95, 99, 104];
    let target = 72, lo, hi, mid, steps, done, note;
    const reset = () => { lo = 0; hi = arr.length - 1; mid = null; steps = 0; done = false; note = `Searching for ${target}. lo = 0, hi = ${arr.length - 1}: the whole array is still possible.`; };
    const step = () => {
      if (done) return;
      if (lo > hi) { done = true; note = `lo (${lo}) > hi (${hi}): nothing left to search. ${target} is not in the array. ${steps} comparisons.`; return; }
      mid = Math.floor((lo + hi) / 2);
      steps += 1;
      if (arr[mid] === target) { done = true; note = `mid = ${mid}, arr[mid] = ${arr[mid]}. Found it after ${steps} comparison${steps > 1 ? "s" : ""}. A linear scan would have needed ${mid + 1}.`; return; }
      if (arr[mid] < target) { note = `mid = ${mid}, arr[mid] = ${arr[mid]} < ${target}, so the target can only be to the right: lo = ${mid + 1}.`; lo = mid + 1; }
      else { note = `mid = ${mid}, arr[mid] = ${arr[mid]} > ${target}, so the target can only be to the left: hi = ${mid - 1}.`; hi = mid - 1; }
    };
    const body = widgetShell(el, "Binary search, one comparison at a time");
    const draw = () => {
      body.innerHTML = `
        <div class="row wg-controls">
          <label class="field-label" for="bs-t" style="margin:0">Target</label>
          <input id="bs-t" class="wg-input narrow" type="number" value="${target}">
          <button type="button" class="btn primary" data-a="step" ${done ? "disabled" : ""}>Step</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="cells">${arr.map((v, i) => {
          const inRange = !done ? i >= lo && i <= hi : (mid === i && arr[i] === target);
          const cls = [inRange ? "live" : "out", i === mid ? "mid" : "", done && arr[i] === target && i === mid ? "found" : ""].join(" ");
          return `<div class="cell ${cls}"><b>${v}</b><small>${i}</small>${!done && i === lo ? `<em>lo</em>` : ""}${!done && i === hi ? `<em class="hi">hi</em>` : ""}</div>`;
        }).join("")}</div>
        <p class="wg-note" role="status">${esc(note)}</p>`;
      $("#bs-t", body).addEventListener("change", e => { target = +e.target.value; reset(); draw(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => { if (b.dataset.a === "step") step(); else reset(); draw(); }));
    };
    reset();
    draw();
  };

  /* Sorting visualizer */
  W.sort = el => {
    const N = 12;
    let algo = el.dataset.algo || "insertion", base, frames, fi, timer = null;
    const shuffle = () => { base = Array.from({ length: N }, (_, i) => i + 1); for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; } };
    const record = () => {
      const a = base.slice(), f = [];
      let comps = 0, writes = 0;
      const snap = (hl, note, extra) => f.push(Object.assign({ a: a.slice(), hl: hl || [], note, comps, writes }, extra || {}));
      snap([], "Start.");
      if (algo === "insertion") {
        for (let i = 1; i < a.length; i++) {
          let j = i;
          while (j > 0) {
            comps++;
            snap([j - 1, j], `Compare ${a[j - 1]} and ${a[j]}.`, { sorted: i });
            if (a[j - 1] <= a[j]) break;
            [a[j - 1], a[j]] = [a[j], a[j - 1]]; writes += 2;
            snap([j - 1, j], `Swap: ${a[j]} moves right, ${a[j - 1]} moves left.`, { sorted: i });
            j--;
          }
        }
      } else if (algo === "merge") {
        const ms = (lo, hi) => {
          if (hi - lo < 1) return;
          const mid = (lo + hi) >> 1;
          ms(lo, mid); ms(mid + 1, hi);
          const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
          let i = 0, j = 0, k = lo;
          while (i < left.length && j < right.length) {
            comps++;
            if (left[i] <= right[j]) a[k++] = left[i++]; else a[k++] = right[j++];
            writes++;
            snap([k - 1], `Merging [${lo}..${mid}] with [${mid + 1}..${hi}]: take the smaller front item.`, { range: [lo, hi] });
          }
          while (i < left.length) { a[k++] = left[i++]; writes++; }
          while (j < right.length) { a[k++] = right[j++]; writes++; }
          snap([], `Merged positions ${lo}–${hi} into one sorted run.`, { range: [lo, hi] });
        };
        ms(0, a.length - 1);
      } else {
        const qs = (lo, hi) => {
          if (lo >= hi) return;
          const pivot = a[hi];
          let i = lo;
          snap([hi], `Partition ${lo}–${hi} around pivot ${pivot}.`, { range: [lo, hi], pivot: hi });
          for (let j = lo; j < hi; j++) {
            comps++;
            const smaller = a[j] < pivot;
            snap([j, hi], `Compare ${a[j]} with pivot ${pivot}: ${smaller ? "smaller, so it moves into the left part" : "not smaller, so it stays on the right"}.`, { range: [lo, hi], pivot: hi });
            if (smaller) { [a[i], a[j]] = [a[j], a[i]]; writes += 2; i++; }
          }
          [a[i], a[hi]] = [a[hi], a[i]]; writes += 2;
          snap([i], `Pivot ${pivot} lands at position ${i}: everything left is smaller, everything right is larger.`, { range: [lo, hi] });
          qs(lo, i - 1); qs(i + 1, hi);
        };
        qs(0, a.length - 1);
      }
      snap([], `Sorted. ${comps} comparisons.`, { done: true });
      frames = f; fi = 0;
    };
    const body = widgetShell(el, "Watch sorting algorithms work");
    const draw = () => {
      const fr = frames[fi];
      body.innerHTML = `
        <div class="row wg-controls">
          <select id="so-algo" class="wg-input" aria-label="Algorithm">
            ${[["insertion", "Insertion sort"], ["merge", "Merge sort"], ["quick", "Quicksort"]].map(([k, l]) => `<option value="${k}" ${k === algo ? "selected" : ""}>${l}</option>`).join("")}
          </select>
          <button type="button" class="btn primary" data-a="step" ${fi >= frames.length - 1 ? "disabled" : ""}>Step</button>
          <button type="button" class="btn" data-a="play" ${fi >= frames.length - 1 ? "disabled" : ""}>${timer ? "Pause" : "Play"}</button>
          <button type="button" class="btn ghost" data-a="shuffle">Shuffle</button>
        </div>
        <div class="bars" aria-hidden="true">${fr.a.map((v, i) => {
          const inRange = fr.range ? i >= fr.range[0] && i <= fr.range[1] : true;
          const cls = [fr.hl.includes(i) ? "hl" : "", fr.pivot === i ? "pivot" : "", inRange ? "" : "dimbar", fr.done ? "fin" : ""].join(" ");
          return `<span class="sbar ${cls}" style="height:${(v / N) * 100}%"><small>${v}</small></span>`;
        }).join("")}</div>
        <p class="small muted mono">Step ${fi} of ${frames.length - 1} · comparisons ${fr.comps} · writes ${fr.writes}</p>
        <p class="wg-note" role="status">${esc(fr.note)}</p>`;
      $("#so-algo", body).addEventListener("change", e => { stop(); algo = e.target.value; record(); draw(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "step") { fi = Math.min(fi + 1, frames.length - 1); draw(); }
        if (a === "shuffle") { stop(); shuffle(); record(); draw(); }
        if (a === "play") {
          if (timer) { stop(); draw(); return; }
          timer = setInterval(() => { fi++; if (fi >= frames.length - 1) { fi = frames.length - 1; stop(); } draw(); }, 140);
          draw();
        }
      }));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    shuffle(); record(); draw();
  };

  /* Grid search: BFS vs DFS */
  W.grid = el => {
    const R = 9, C = 15, S = [4, 1], G = [4, 13];
    const WALLS = ["1,4", "2,4", "3,4", "4,4", "5,4", "6,4", "7,7", "6,7", "5,7", "4,7", "3,7", "2,7", "1,10", "2,10", "3,10", "4,10", "5,10", "7,10", "6,10"];
    let walls = new Set(WALLS), algo = "bfs", visited = [], path = [], shown = 0, timer = null, note = "Pick an algorithm and press Run. Click cells to add or remove walls.";
    const key = (r, c) => `${r},${c}`;
    const search = () => {
      const prev = new Map([[key(...S), null]]);
      const order = [];
      const frontier = [S];
      while (frontier.length) {
        const cur = algo === "bfs" ? frontier.shift() : frontier.pop();
        const k = key(...cur);
        if (algo === "dfs" && order.includes(k)) continue;
        order.push(k);
        if (k === key(...G)) break;
        for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
          const r = cur[0] + dr, c = cur[1] + dc, nk = key(r, c);
          if (r < 0 || c < 0 || r >= R || c >= C || walls.has(nk)) continue;
          if (algo === "bfs") { if (prev.has(nk)) continue; prev.set(nk, k); frontier.push([r, c]); }
          else { if (order.includes(nk)) continue; prev.set(nk, k); frontier.push([r, c]); }
        }
      }
      const p = [];
      if (prev.has(key(...G)) && order.includes(key(...G))) { let k = key(...G); while (k) { p.unshift(k); k = prev.get(k); } }
      visited = order; path = p;
    };
    const body = widgetShell(el, "Breadth-first vs depth-first search on a grid");
    const draw = () => {
      const vis = new Set(visited.slice(0, shown));
      const finished = shown >= visited.length && visited.length > 0;
      const onPath = new Set(finished ? path : []);
      let cells = "";
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const k = key(r, c);
        const cls = k === key(...S) ? "start" : k === key(...G) ? "goal" : walls.has(k) ? "wall" : onPath.has(k) ? "path" : vis.has(k) ? "seen" : "";
        cells += `<button type="button" class="gcell ${cls}" data-k="${k}" aria-label="Cell ${r},${c}${cls ? " " + cls : ""}"></button>`;
      }
      body.innerHTML = `
        <div class="row wg-controls">
          <select id="gr-algo" class="wg-input" aria-label="Algorithm"><option value="bfs" ${algo === "bfs" ? "selected" : ""}>Breadth-first search (queue)</option><option value="dfs" ${algo === "dfs" ? "selected" : ""}>Depth-first search (stack)</option></select>
          <button type="button" class="btn primary" data-a="run">${timer ? "Pause" : "Run"}</button>
          <button type="button" class="btn ghost" data-a="clear">Clear walls</button>
          <button type="button" class="btn ghost" data-a="reset">Reset maze</button>
        </div>
        <div class="grid" style="grid-template-columns:repeat(${C}, minmax(0, 1fr))">${cells}</div>
        <div class="flegend"><span><i class="g-start"></i>start</span><span><i class="g-goal"></i>goal</span><span><i class="g-seen"></i>visited</span><span><i class="g-path"></i>path found</span></div>
        <p class="wg-note" role="status">${esc(finished ? (path.length ? `${algo.toUpperCase()} visited ${visited.length} cells and found a path of ${path.length - 1} steps.${algo === "bfs" ? " BFS guarantees this is a shortest path." : " DFS found a path, but not necessarily the shortest."}` : `No path exists. ${visited.length} cells visited.`) : note)}</p>`;
      $("#gr-algo", body).addEventListener("change", e => { stop(); algo = e.target.value; visited = []; path = []; shown = 0; draw(); });
      $$(".gcell", body).forEach(b => b.addEventListener("click", () => {
        if (timer) return;
        const k = b.dataset.k;
        if (k === key(...S) || k === key(...G)) return;
        walls.has(k) ? walls.delete(k) : walls.add(k);
        visited = []; path = []; shown = 0;
        draw();
      }));
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "clear" || a === "reset") { stop(); walls = a === "clear" ? new Set() : new Set(WALLS); visited = []; path = []; shown = 0; draw(); return; }
        if (timer) { stop(); draw(); return; }
        if (!visited.length || shown >= visited.length) { search(); shown = 0; }
        timer = setInterval(() => { shown += 1; if (shown >= visited.length) stop(); draw(); }, 18);
        draw();
      }));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    draw();
  };

  /* ---------- Week 4 widgets ---------- */

  /* CPU scheduler: FCFS, SJF, round robin */
  W.scheduler = el => {
    const PRESETS = {
      mixed: { name: "Mixed jobs", procs: [[0, 5], [1, 3], [2, 8], [3, 2]] },
      convoy: { name: "One long job arrives first", procs: [[0, 12], [1, 2], [2, 2], [3, 1]] },
      io: { name: "Short interactive jobs", procs: [[0, 6], [0, 1], [1, 1], [2, 6]] }
    };
    let preset = "mixed", algo = "rr", quantum = 2;
    const body = widgetShell(el, "Schedule the same jobs three ways");
    const simulate = () => {
      const ps = PRESETS[preset].procs.map(([arr, burst], i) => ({ i, name: "P" + (i + 1), arr, burst }));
      const n = ps.length, rem = ps.map(p => p.burst), finish = [], first = [];
      const segs = [];
      let t = 0, done = 0;
      const push = (p, start, end) => {
        const last = segs[segs.length - 1];
        if (last && last.p === p && last.end === start) last.end = end; else segs.push({ p, start, end });
        if (p >= 0 && first[p] === undefined) first[p] = start;
      };
      if (algo === "rr") {
        const order = ps.slice().sort((a, b) => a.arr - b.arr || a.i - b.i);
        let next = 0;
        const queue = [];
        const admit = upTo => { while (next < n && order[next].arr <= upTo) queue.push(order[next++].i); };
        admit(0);
        while (done < n) {
          if (!queue.length) { const ta = order[next].arr; push(-1, t, ta); t = ta; admit(t); continue; }
          const p = queue.shift();
          const run = Math.min(quantum, rem[p]);
          push(p, t, t + run);
          t += run; rem[p] -= run;
          admit(t);
          if (rem[p] > 0) queue.push(p); else { finish[p] = t; done++; }
        }
      } else {
        const left = new Set(ps.map(p => p.i));
        while (left.size) {
          const ready = [...left].filter(i => ps[i].arr <= t);
          if (!ready.length) { const ta = Math.min(...[...left].map(i => ps[i].arr)); push(-1, t, ta); t = ta; continue; }
          ready.sort((a, b) => algo === "sjf" ? ps[a].burst - ps[b].burst || ps[a].arr - ps[b].arr : ps[a].arr - ps[b].arr || a - b);
          const p = ready[0];
          push(p, t, t + ps[p].burst);
          t += ps[p].burst; finish[p] = t; left.delete(p);
        }
      }
      const switches = segs.filter(s => s.p >= 0).length - 1;
      const stats = ps.map(p => ({ name: p.name, arr: p.arr, burst: p.burst, finish: finish[p.i], turnaround: finish[p.i] - p.arr, waiting: finish[p.i] - p.arr - p.burst, response: first[p.i] - p.arr }));
      return { segs, stats, total: t, switches };
    };
    const avg = (xs, k) => (xs.reduce((s, x) => s + x[k], 0) / xs.length).toFixed(1);
    const draw = () => {
      const r = simulate();
      const blocks = r.segs.map(s => `<span class="gseg ${s.p < 0 ? "idle" : "p" + s.p}" style="flex:${s.end - s.start}" title="${s.p < 0 ? "idle" : "P" + (s.p + 1)}: ${s.start}–${s.end}"><b>${s.p < 0 ? "idle" : "P" + (s.p + 1)}</b></span>`).join("");
      const ticks = r.segs.map(s => `<span style="flex:${s.end - s.start}">${s.start}</span>`).join("") + `<span class="tick-end">${r.total}</span>`;
      body.innerHTML = `
        <div class="row wg-controls">
          <select id="sc-preset" class="wg-input" aria-label="Jobs">${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}" ${k === preset ? "selected" : ""}>${p.name}</option>`).join("")}</select>
          <div class="seg" role="radiogroup" aria-label="Policy">
            ${[["fcfs", "First come, first served"], ["sjf", "Shortest job first"], ["rr", "Round robin"]].map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === algo}" class="${k === algo ? "on" : ""}" data-algo="${k}">${l}</button>`).join("")}
          </div>
          ${algo === "rr" ? `<label class="small" for="sc-q">Time slice <b>${quantum}</b></label><input id="sc-q" type="range" min="1" max="6" value="${quantum}" class="wg-range" style="width:120px">` : ""}
        </div>
        <div class="table-wrap"><table class="wg-table"><thead><tr><th>Job</th><th>Arrives</th><th>Needs</th><th>Finishes</th><th>Waiting</th><th>Response</th></tr></thead>
          <tbody>${r.stats.map((s, i) => `<tr><td><span class="pdot p${i}"></span>${s.name}</td><td>${s.arr}</td><td>${s.burst}</td><td>${s.finish}</td><td>${s.waiting}</td><td>${s.response}</td></tr>`).join("")}</tbody></table></div>
        <div class="gantt" aria-label="Timeline">${blocks}</div>
        <div class="gticks mono" aria-hidden="true">${ticks}</div>
        <div class="readout">
          <div class="em"><span>Average waiting time</span><b>${avg(r.stats, "waiting")}</b></div>
          <div><span>Average response time</span><b>${avg(r.stats, "response")}</b></div>
          <div><span>Average turnaround</span><b>${avg(r.stats, "turnaround")}</b></div>
          <div><span>Context switches</span><b>${r.switches}</b></div>
        </div>
        <p class="wg-note">${algo === "fcfs" ? "Jobs run to completion in arrival order. Simple, but short jobs stuck behind a long one wait a long time (the convoy effect)." : algo === "sjf" ? "Always run the shortest waiting job next. This minimizes average waiting time, but needs to know job lengths in advance, and long jobs can starve." : "Each job runs for one time slice, then goes to the back of the queue. Response time is good for everyone, at the cost of more context switches. Try different slice sizes."}</p>`;
      $("#sc-preset", body).addEventListener("change", e => { preset = e.target.value; draw(); });
      $$("[data-algo]", body).forEach(b => b.addEventListener("click", () => { algo = b.dataset.algo; draw(); }));
      const q = $("#sc-q", body);
      if (q) q.addEventListener("input", e => { quantum = +e.target.value; draw(); $("#sc-q", body).focus(); });
    };
    draw();
  };

  /* Page replacement: FIFO, LRU, optimal */
  W.pages = el => {
    let refs = "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1", frames = 3;
    const body = widgetShell(el, "Page replacement: which page gets evicted?");
    const run = (seq, algo) => {
      const mem = [], lastUse = {}, loaded = {};
      return seq.map((p, t) => {
        let hit = mem.includes(p), evicted = null;
        if (!hit) {
          if (mem.length < frames) mem.push(p);
          else {
            let victim;
            if (algo === "fifo") victim = mem.reduce((a, b) => loaded[a] <= loaded[b] ? a : b);
            else if (algo === "lru") victim = mem.reduce((a, b) => lastUse[a] <= lastUse[b] ? a : b);
            else victim = mem.reduce((a, b) => {
              const na = seq.indexOf(a, t + 1), nb = seq.indexOf(b, t + 1);
              return (na === -1 ? Infinity : na) >= (nb === -1 ? Infinity : nb) ? a : b;
            });
            mem[mem.indexOf(victim)] = p;
            evicted = victim;
          }
          loaded[p] = t;
        }
        lastUse[p] = t;
        return { p, hit, evicted, mem: mem.slice() };
      });
    };
    const draw = () => {
      const seq = refs.split(/[\s,]+/).filter(Boolean);
      const rows = [["fifo", "FIFO (oldest loaded)"], ["lru", "LRU (least recently used)"], ["opt", "Optimal (used furthest in future)"]].map(([k, label]) => {
        const steps = run(seq, k);
        const faults = steps.filter(s => !s.hit).length;
        return `<div class="pr-row"><div class="pr-head"><b>${label}</b><span class="chip ${k === "opt" ? "good" : ""}">${faults} faults</span></div>
          <div class="table-wrap"><div class="pr-steps">${steps.map(s => `<div class="pr-col ${s.hit ? "hit" : "miss"}"><b>${esc(s.p)}</b>${Array.from({ length: frames }, (_, i) => `<span>${s.mem[i] !== undefined ? esc(s.mem[i]) : "·"}</span>`).join("")}<small>${s.hit ? "hit" : "fault"}</small></div>`).join("")}</div></div></div>`;
      }).join("");
      body.innerHTML = `
        <div class="row wg-controls">
          <input id="pr-refs" class="wg-input wide" type="text" value="${esc(refs)}" aria-label="Page reference string">
          <label class="small" for="pr-f">Frames <b>${frames}</b></label>
          <input id="pr-f" type="range" min="1" max="6" value="${frames}" class="wg-range" style="width:140px">
        </div>
        ${rows}
        <p class="wg-note">Each column is one memory access: the page requested, then what's in the ${frames} physical frames afterwards. A fault means the page had to be loaded from disk. Optimal can't be built (it needs to see the future) but shows the best possible score; LRU usually gets close.</p>`;
      $("#pr-refs", body).addEventListener("change", e => { refs = e.target.value; draw(); });
      $("#pr-f", body).addEventListener("input", e => { frames = +e.target.value; draw(); $("#pr-f", body).focus(); });
    };
    draw();
  };

  /* Race condition stepper */
  W.race = el => {
    let locked = false, counter, th, lockOwner, log;
    const STEPS_PLAIN = ["read", "add", "write"];
    const STEPS_LOCK = ["acquire", "read", "add", "write", "release"];
    const code = {
      acquire: "lock.acquire()", read: "x = counter", add: "x = x + 1", write: "counter = x", release: "lock.release()"
    };
    const reset = () => {
      counter = 0; lockOwner = null;
      th = { A: { pc: 0, x: null }, B: { pc: 0, x: null } };
      log = locked ? "Both threads run the same code. Step them in any order: the lock keeps the three middle steps together." : "Both threads run the same code: read the counter, add one, write it back. Step them in any order.";
    };
    const steps = () => locked ? STEPS_LOCK : STEPS_PLAIN;
    const step = name => {
      const t = th[name], other = name === "A" ? "B" : "A";
      const ss = steps();
      if (t.pc >= ss.length) { log = `Thread ${name} has finished.`; return; }
      const s = ss[t.pc];
      if (s === "acquire") {
        if (lockOwner && lockOwner !== name) { log = `Thread ${name} tries to take the lock, but thread ${other} holds it, so ${name} is blocked. Step ${other} until it releases.`; return; }
        lockOwner = name; log = `Thread ${name} takes the lock.`;
      }
      if (s === "read") { t.x = counter; log = `Thread ${name} reads counter = ${counter} into its own variable x.`; }
      if (s === "add") { t.x += 1; log = `Thread ${name} computes x = ${t.x}. The shared counter is still ${counter}.`; }
      if (s === "write") { const before = counter; counter = t.x; log = `Thread ${name} writes counter = ${t.x}.` + (before === t.x ? ` It was already ${before}: the other thread's increment has been overwritten (a lost update).` : ""); }
      if (s === "release") { lockOwner = null; log = `Thread ${name} releases the lock.`; }
      t.pc += 1;
    };
    const body = widgetShell(el, "Two threads, one shared counter");
    const draw = () => {
      const ss = steps();
      const finished = th.A.pc >= ss.length && th.B.pc >= ss.length;
      const col = name => {
        const t = th[name];
        return `<div class="thread"><div class="th-head"><b>Thread ${name}</b><span class="mono small">x = ${t.x === null ? "?" : t.x}</span></div>
          <ol class="th-code">${ss.map((s, i) => `<li class="${i < t.pc ? "done" : i === t.pc ? "next" : ""}"><code>${code[s]}</code></li>`).join("")}</ol>
          <button type="button" class="btn primary" data-t="${name}" ${t.pc >= ss.length ? "disabled" : ""}>Step thread ${name}</button></div>`;
      };
      body.innerHTML = `
        <div class="row wg-controls">
          <label class="small"><input type="checkbox" id="race-lock" ${locked ? "checked" : ""}> Protect with a lock</label>
          <button type="button" class="btn" data-a="bad">Play the bad interleaving</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="threads">${col("A")}<div class="shared"><span>shared counter</span><b>${counter}</b>${locked ? `<small>lock: ${lockOwner ? "held by " + lockOwner : "free"}</small>` : ""}</div>${col("B")}</div>
        <p class="wg-note" role="status">${esc(log)}${finished ? (counter === 2 ? " Both increments counted: counter = 2." : ` Two increments ran, but counter = ${counter}.`) : ""}</p>`;
      $("#race-lock", body).addEventListener("change", e => { locked = e.target.checked; reset(); draw(); });
      $$("[data-t]", body).forEach(b => b.addEventListener("click", () => { step(b.dataset.t); draw(); }));
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        reset();
        if (b.dataset.a === "bad") {
          const order = locked ? ["A", "B", "A", "A", "A", "B", "B", "A", "B", "B", "B", "B"] : ["A", "B", "A", "B", "A", "B"];
          order.forEach(step);
          if (!locked) log = "A and B both read 0 before either wrote. Both compute 1, both write 1. One increment vanished.";
          else log = "Same attempt to interleave, but B blocked on the lock until A released it. The result is always correct.";
        }
        draw();
      }));
    };
    reset();
    draw();
  };

  /* ---------- Week 5 widgets ---------- */

  /* Encapsulation */
  W.encap = el => {
    const LAYERS = [
      { name: "Application", proto: "HTTP", bytes: 78, color: "l7", fields: ["GET /index.html HTTP/1.1", "Host: example.com", "Accept: text/html"],
        note: "Your browser builds an HTTP request. It knows nothing about how the bytes will travel." },
      { name: "Transport", proto: "TCP", bytes: 20, color: "l4", fields: ["src port 51234", "dst port 443", "seq 1001 · ack 5001", "flags ACK PSH"],
        note: "TCP adds ports (which program on each machine) and sequence numbers (for ordering and retransmission)." },
      { name: "Network", proto: "IP", bytes: 20, color: "l3", fields: ["src 192.168.1.20", "dst 93.184.215.14", "TTL 64 · protocol 6 (TCP)"],
        note: "IP adds source and destination addresses for the whole journey, and a TTL that each router decrements." },
      { name: "Link", proto: "Ethernet / Wi-Fi", bytes: 18, color: "l2", fields: ["dst MAC 3c:84:6a:… (your router)", "src MAC a4:83:e7:… (your laptop)", "type 0x0800 (IPv4)"],
        note: "The link layer adds MAC addresses for just the next hop, here your router. Every router strips this and adds a new one." }
    ];
    let depth = 1;
    const body = widgetShell(el, "Wrap a request in headers, layer by layer");
    const draw = () => {
      let inner = "";
      for (let i = 0; i < depth; i++) {
        const L = LAYERS[i];
        inner = `<div class="enc ${L.color}"><div class="enc-h"><b>${L.proto} ${i === 0 ? "data" : "header"}</b><span class="mono small">${L.fields.map(esc).join(" · ")}</span></div>${inner}</div>`;
      }
      const total = LAYERS.slice(0, depth).reduce((s, L) => s + L.bytes, 0);
      const cur = LAYERS[depth - 1];
      body.innerHTML = `
        <div class="row wg-controls">
          <button type="button" class="btn primary" data-a="down" ${depth >= LAYERS.length ? "disabled" : ""}>Send: wrap in next layer ↓</button>
          <button type="button" class="btn" data-a="up" ${depth <= 1 ? "disabled" : ""}>Receive: unwrap ↑</button>
        </div>
        <div class="enc-stack">${inner}</div>
        <div class="readout">
          <div class="em"><span>Current layer</span><b>${cur.name} (${cur.proto})</b></div>
          <div><span>Bytes on the wire so far</span><b>${total}</b></div>
          <div><span>Headers vs data</span><b>${depth > 1 ? Math.round((total - 78) / total * 100) + "% overhead" : "just data"}</b></div>
        </div>
        <p class="wg-note">${esc(cur.note)}</p>`;
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => { depth += b.dataset.a === "down" ? 1 : -1; draw(); }));
    };
    draw();
  };

  /* Subnet calculator */
  W.subnet = el => {
    let ipText = "192.168.10.77", prefix = 26, testIp = "192.168.10.130";
    const parse = s => {
      const parts = s.trim().split(".");
      if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p) || +p > 255)) return null;
      return parts.reduce((n, p) => (n * 256) + +p, 0) >>> 0;
    };
    const fmt = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join(".");
    const body = widgetShell(el, "Subnet calculator");
    const draw = () => {
      const ip = parse(ipText);
      const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
      let out;
      if (ip === null) out = `<p class="wg-note">Enter an IPv4 address like 192.168.10.77.</p>`;
      else {
        const net = (ip & mask) >>> 0, bcast = (net | (~mask >>> 0)) >>> 0;
        const total = 2 ** (32 - prefix);
        const usable = prefix >= 31 ? total : total - 2;
        const first = prefix >= 31 ? net : net + 1, last = prefix >= 31 ? bcast : bcast - 1;
        const bits = bin(ip, 32).split("").map((b, i) => `<span class="${i < prefix ? "nb" : "hb"}">${b}</span>${i % 8 === 7 && i < 31 ? `<i>.</i>` : ""}`).join("");
        const t = parse(testIp);
        const inside = t !== null && ((t & mask) >>> 0) === net;
        out = `
          <div class="sbits mono" aria-label="Address in binary">${bits}</div>
          <div class="flegend"><span><i class="f-m"></i>network bits (${prefix})</span><span><i class="f-e"></i>host bits (${32 - prefix})</span></div>
          <div class="readout">
            <div class="em"><span>Network address</span><b class="mono">${fmt(net)}/${prefix}</b></div>
            <div><span>Subnet mask</span><b class="mono">${fmt(mask)}</b></div>
            <div><span>Broadcast address</span><b class="mono">${fmt(bcast)}</b></div>
            <div><span>Usable hosts</span><b class="mono">${fmt(first)} – ${fmt(last)}</b></div>
            <div><span>Number of usable hosts</span><b>${usable.toLocaleString()}</b></div>
          </div>
          <div class="row wg-controls"><label class="small" for="sn-test">Is this address in the subnet?</label>
            <input id="sn-test" class="wg-input" value="${esc(testIp)}" aria-label="Address to test">
            <span class="chip ${t === null ? "" : inside ? "good" : "bad"}">${t === null ? "enter an address" : inside ? "yes, same subnet" : "no, needs a router"}</span></div>`;
      }
      body.innerHTML = `
        <div class="row wg-controls">
          <input id="sn-ip" class="wg-input" value="${esc(ipText)}" aria-label="IP address">
          <span class="mono">/</span>
          <input id="sn-p" type="range" min="8" max="32" value="${prefix}" class="wg-range" style="width:180px" aria-label="Prefix length">
          <b class="mono">/${prefix}</b>
        </div>${out}`;
      $("#sn-ip", body).addEventListener("change", e => { ipText = e.target.value; draw(); });
      $("#sn-p", body).addEventListener("input", e => { prefix = +e.target.value; draw(); $("#sn-p", body).focus(); });
      const te = $("#sn-test", body);
      if (te) te.addEventListener("change", e => { testIp = e.target.value; draw(); });
    };
    draw();
  };

  /* TCP sequence diagram */
  W.tcp = el => {
    let lossy = false, shown = 1;
    const script = () => {
      const s = [
        ["c", "SYN", "seq=1000", "The client picks a random starting sequence number and asks to connect."],
        ["s", "SYN-ACK", "seq=5000, ack=1001", "The server agrees, picks its own sequence number, and acknowledges the client's (1000 + 1)."],
        ["c", "ACK", "ack=5001", "Connection established. That cost one full round trip before any data was sent."],
        ["c", "DATA", "seq=1001, 500 bytes", "The client sends 500 bytes, numbered 1001–1500."],
        ["s", "ACK", "ack=1501", "\"I've received everything up to byte 1500; send 1501 next.\""]
      ];
      if (lossy) s.push(
        ["c", "DATA", "seq=1501, 500 bytes", "This segment is lost somewhere in the network.", "lost"],
        ["n", "", "", "No ACK for byte 2000 arrives. The client's retransmission timer expires."],
        ["c", "DATA", "seq=1501, 500 bytes (again)", "TCP resends the missing segment. The application never sees the loss, only a delay."],
        ["s", "ACK", "ack=2001", "Now acknowledged. TCP also takes the loss as a sign of congestion and slows its sending rate."]
      ); else s.push(
        ["c", "DATA", "seq=1501, 500 bytes", "The next 500 bytes, 1501–2000."],
        ["s", "ACK", "ack=2001", "Acknowledged. In practice many segments are in flight before any ACK comes back (the window)."]
      );
      s.push(
        ["c", "FIN", "seq=2001", "The client has nothing more to send and starts closing its side."],
        ["s", "ACK + FIN", "ack=2002", "The server acknowledges, and closes its own side too."],
        ["c", "ACK", "ack=5002", "Closed. The client waits a short while (TIME_WAIT) in case the last ACK was lost."]
      );
      return s;
    };
    const body = widgetShell(el, "A TCP conversation, one segment at a time");
    const draw = () => {
      const s = script();
      const rows = s.slice(0, shown).map(([dir, name, detail, , lost]) => dir === "n"
        ? `<div class="sq-note">⏱ timeout</div>`
        : `<div class="sq-row ${dir === "s" ? "rtl" : ""} ${lost ? "lost" : ""}"><div class="sq-arrow"><b>${esc(name)}</b><span class="mono small">${esc(detail)}</span>${lost ? `<em>✕ lost</em>` : ""}</div></div>`).join("");
      body.innerHTML = `
        <div class="row wg-controls">
          <button type="button" class="btn primary" data-a="next" ${shown >= s.length ? "disabled" : ""}>Next segment</button>
          <button type="button" class="btn" data-a="all">Show all</button>
          <label class="small"><input type="checkbox" id="tcp-loss" ${lossy ? "checked" : ""}> Lose a packet</label>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="sq"><div class="sq-ends"><b>Client</b><b>Server</b></div>${rows}</div>
        <p class="wg-note" role="status">${esc(s[shown - 1][3])}</p>`;
      $("#tcp-loss", body).addEventListener("change", e => { lossy = e.target.checked; shown = 1; draw(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "next") shown = Math.min(shown + 1, s.length);
        if (a === "all") shown = s.length;
        if (a === "reset") shown = 1;
        draw();
      }));
    };
    draw();
  };

  /* ---------- Week 6 widgets ---------- */

  function sha256(bytes) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const len = bytes.length, total = ((len + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(total);
    m.set(bytes); m[len] = 0x80;
    const bitLen = len * 8;
    for (let i = 0; i < 4; i++) m[total - 1 - i] = (bitLen >>> (8 * i)) & 255;
    m[total - 5] = Math.floor(bitLen / 2 ** 32) & 255;
    const w = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = (m[off + 4 * i] << 24) | (m[off + 4 * i + 1] << 16) | (m[off + 4 * i + 2] << 8) | m[off + 4 * i + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }
  W._sha256 = sha256;

  /* Hash avalanche */
  W.hash = el => {
    let a = "Transfer $100 to Bob", b = "Transfer $900 to Bob";
    const enc = new TextEncoder();
    const body = widgetShell(el, "Hashing vs encoding: change one character");
    const b64 = s => { let bin2 = ""; enc.encode(s).forEach(x => { bin2 += String.fromCharCode(x); }); return btoa(bin2); };
    const draw = () => {
      const ha = sha256(enc.encode(a)), hb = sha256(enc.encode(b));
      let diffBits = 0;
      for (let i = 0; i < 64; i += 8) {
        let x = (parseInt(ha.slice(i, i + 8), 16) ^ parseInt(hb.slice(i, i + 8), 16)) >>> 0;
        while (x) { diffBits += x & 1; x >>>= 1; }
      }
      const mark = (h, o) => h.split("").map((c, i) => c === o[i] ? c : `<span class="dc">${c}</span>`).join("");
      body.innerHTML = `
        <label class="field-label" for="hs-a">Message A</label><input id="hs-a" class="wg-input wide" value="${esc(a)}">
        <label class="field-label" for="hs-b">Message B</label><input id="hs-b" class="wg-input wide" value="${esc(b)}">
        <div class="table-wrap"><table class="wg-table"><thead><tr><th></th><th>SHA-256 (one-way hash)</th></tr></thead><tbody>
          <tr><td>A</td><td class="mono hashcell">${ha}</td></tr>
          <tr><td>B</td><td class="mono hashcell">${mark(hb, ha)}</td></tr>
        </tbody></table></div>
        <div class="readout">
          <div class="em"><span>Bits that differ between the two hashes</span><b>${diffBits} of 256</b></div>
          <div><span>Base64 of A (an encoding)</span><b class="mono">${esc(b64(a))}</b></div>
        </div>
        <p class="wg-note">${a === b ? "Identical inputs always give identical hashes." : "A tiny change to the input flips about half of the output bits (the avalanche effect), so the hash reveals nothing about how similar the inputs were. The Base64 line, by contrast, is just a reversible re-spelling of the bytes: anyone can decode it."}</p>`;
      $("#hs-a", body).addEventListener("input", e => { a = e.target.value; draw(); const i = $("#hs-a", body); i.focus(); i.setSelectionRange(i.value.length, i.value.length); });
      $("#hs-b", body).addEventListener("input", e => { b = e.target.value; draw(); const i = $("#hs-b", body); i.focus(); i.setSelectionRange(i.value.length, i.value.length); });
    };
    draw();
  };

  /* Toy Diffie-Hellman */
  W.dh = el => {
    const modpow = (base, exp, mod) => { let r = 1n; base %= mod; while (exp > 0n) { if (exp & 1n) r = r * base % mod; base = base * base % mod; exp >>= 1n; } return r; };
    let size = "small", a = 6, b = 15;
    const SIZES = { small: { p: 23n, g: 5n, max: 22 }, medium: { p: 2147483647n, g: 7n, max: 2147483646 } };
    const body = widgetShell(el, "Agree on a secret in public (Diffie–Hellman)");
    const draw = () => {
      const { p, g, max } = SIZES[size];
      const A = modpow(g, BigInt(a), p), B = modpow(g, BigInt(b), p);
      const sa = modpow(B, BigInt(a), p), sb = modpow(A, BigInt(b), p);
      body.innerHTML = `
        <div class="row wg-controls">
          <div class="seg" role="radiogroup" aria-label="Number size">
            ${[["small", "Tiny numbers (p = 23)"], ["medium", "Bigger (p = 2³¹ − 1)"]].map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === size}" class="${k === size ? "on" : ""}" data-size="${k}">${l}</button>`).join("")}
          </div>
          <button type="button" class="btn" data-a="random">New random secrets</button>
        </div>
        <div class="dh">
          <div class="dh-col"><b>Alice</b><span>secret a = <span class="mono secret">${a}</span></span><span>sends A = g<sup>a</sup> mod p = <span class="mono">${A}</span></span><span>computes B<sup>a</sup> mod p = <span class="mono em-txt">${sa}</span></span></div>
          <div class="dh-col public"><b>Public (Eve sees all of this)</b><span>p = <span class="mono">${p}</span>, g = <span class="mono">${g}</span></span><span>A = <span class="mono">${A}</span></span><span>B = <span class="mono">${B}</span></span></div>
          <div class="dh-col"><b>Bob</b><span>secret b = <span class="mono secret">${b}</span></span><span>sends B = g<sup>b</sup> mod p = <span class="mono">${B}</span></span><span>computes A<sup>b</sup> mod p = <span class="mono em-txt">${sb}</span></span></div>
        </div>
        <p class="wg-note">${sa === sb ? `Both sides arrive at the same shared secret, ${sa}, without ever sending it. ` : ""}${size === "small" ? "With p = 23, Eve can try all 22 possible values of a in an instant. Switch to bigger numbers." : "Now Eve would have to try up to about 2 billion values of a. Real TLS uses 2048-bit numbers or elliptic curves, where trying every value would take longer than the age of the universe."}</p>`;
      $$("[data-size]", body).forEach(x => x.addEventListener("click", () => { size = x.dataset.size; const m = SIZES[size].max; a = 2 + Math.floor(Math.random() * (m - 2)); b = 2 + Math.floor(Math.random() * (m - 2)); draw(); }));
      $("[data-a=random]", body).addEventListener("click", () => { const m = SIZES[size].max; a = 2 + Math.floor(Math.random() * (m - 2)); b = 2 + Math.floor(Math.random() * (m - 2)); draw(); });
    };
    draw();
  };

  /* SQL injection playground */
  W.sqli = el => {
    const USERS = [{ id: 1, username: "alice", password: "wonderland42" }, { id: 2, username: "bob", password: "builder99" }, { id: 3, username: "admin", password: "kT9#qL2!vZ" }];
    let user = "admin' --", pass = "anything", safe = false;
    const PRESETS = [["alice", "wonderland42", "Normal login"], ["alice", "wrong", "Wrong password"], ["admin' --", "anything", "Comment out the password check"], ["' OR '1'='1' --", "", "Make the condition always true"]];
    // A tiny evaluator for: col = 'str' / 'a' = 'b' joined by AND / OR, with -- comments.
    function evaluate(sql, row) {
      const where = sql.split(/\bWHERE\b/i)[1] || "";
      const toks = [];
      let i = 0;
      while (i < where.length) {
        const c = where[i];
        if (/\s/.test(c)) { i++; continue; }
        if (where.startsWith("--", i)) break;
        if (c === "'") {
          let j = i + 1, s = "";
          for (;;) {
            if (j >= where.length) throw new Error("unterminated string literal");
            if (where[j] === "'" && where[j + 1] === "'") { s += "'"; j += 2; continue; }
            if (where[j] === "'") break;
            s += where[j++];
          }
          toks.push({ t: "str", v: s }); i = j + 1; continue;
        }
        if (c === "=") { toks.push({ t: "=" }); i++; continue; }
        if (c === ";") { i++; continue; }
        const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(where.slice(i));
        if (m) {
          const w = m[0].toUpperCase();
          toks.push(w === "AND" || w === "OR" ? { t: w } : { t: "id", v: m[0] });
          i += m[0].length; continue;
        }
        const n = /^\d+/.exec(where.slice(i));
        if (n) { toks.push({ t: "str", v: n[0] }); i += n[0].length; continue; }
        throw new Error(`syntax error near "${where.slice(i, i + 12)}"`);
      }
      let k = 0;
      const val = () => { const tk = toks[k++]; if (!tk) throw new Error("incomplete expression"); if (tk.t === "str") return tk.v; if (tk.t === "id") { if (!(tk.v in row)) throw new Error(`no such column: ${tk.v}`); return String(row[tk.v]); } throw new Error("syntax error"); };
      const cmp = () => { const l = val(); if (!toks[k] || toks[k].t !== "=") throw new Error("expected ="); k++; return l === val(); };
      const and = () => { let r = cmp(); while (toks[k] && toks[k].t === "AND") { k++; r = cmp() && r; } return r; };
      const or = () => { let r = and(); while (toks[k] && toks[k].t === "OR") { k++; r = and() || r; } return r; };
      const res = or();
      if (k < toks.length) throw new Error("syntax error");
      return res;
    }
    const body = widgetShell(el, "SQL injection playground");
    const draw = () => {
      const unsafeSql = `SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'`;
      let result, err = null;
      if (safe) result = USERS.filter(r => r.username === user && r.password === pass);
      else { try { result = USERS.filter(r => evaluate(unsafeSql, r)); } catch (e) { err = e.message; } }
      const shownSql = safe
        ? `SELECT * FROM users WHERE username = ? AND password = ?`
        : `SELECT * FROM users WHERE username = '<span class="inj">${esc(user)}</span>' AND password = '<span class="inj">${esc(pass)}</span>'`;
      body.innerHTML = `
        <div class="row wg-controls">
          <label class="small"><input type="checkbox" id="sq-safe" ${safe ? "checked" : ""}> Use a parameterized query</label>
          ${PRESETS.map((p, i) => `<button type="button" class="btn ghost" data-p="${i}">${esc(p[2])}</button>`).join("")}
        </div>
        <div class="row wg-controls">
          <input id="sq-u" class="wg-input" value="${esc(user)}" aria-label="Username" placeholder="username">
          <input id="sq-p" class="wg-input" value="${esc(pass)}" aria-label="Password" placeholder="password">
        </div>
        <pre class="wg-log">${shownSql}${safe ? `\nparameters: [${esc(JSON.stringify(user))}, ${esc(JSON.stringify(pass))}]` : ""}</pre>
        <div class="readout"><div class="${err ? "" : result.length ? "em" : ""}"><span>Result</span><b>${err ? "SQL error: " + esc(err) : result.length ? "Logged in as " + esc(result[0].username) : "Login failed (no matching row)"}</b></div></div>
        <p class="wg-note">${safe ? "With parameters, the input is sent separately from the SQL text, so quotes and dashes are just characters in a username. No input can change the query's structure." : err ? "An error from a quote in the input is itself a giveaway: user text is being spliced into SQL." : "The highlighted text is whatever the user typed, pasted straight into the SQL. A quote ends the string early, and everything after it is interpreted as SQL."}</p>`;
      $("#sq-safe", body).addEventListener("change", e => { safe = e.target.checked; draw(); });
      $("#sq-u", body).addEventListener("change", e => { user = e.target.value; draw(); });
      $("#sq-p", body).addEventListener("change", e => { pass = e.target.value; draw(); });
      $$("[data-p]", body).forEach(x => x.addEventListener("click", () => { [user, pass] = PRESETS[+x.dataset.p]; draw(); }));
    };
    draw();
  };

  /* ---------- Week 7 widgets ---------- */

  /* SQL joins */
  W.joins = el => {
    const AUTHORS = [[1, "Le Guin"], [2, "Pratchett"], [3, "Jemisin"], [4, "Chiang"]];
    const BOOKS = [[10, "Earthsea", 1], [11, "The Dispossessed", 1], [12, "Mort", 2], [13, "The Fifth Season", 3], [14, "Anonymous Pamphlet", null]];
    let kind = "inner";
    const body = widgetShell(el, "Join two tables");
    const run = () => {
      const rows = [];
      const matchedBooks = new Set();
      if (kind === "cross") {
        AUTHORS.forEach(a => BOOKS.forEach(b => rows.push([a[1], b[1]])));
        return rows;
      }
      AUTHORS.forEach(a => {
        const bs = BOOKS.filter(b => b[2] === a[0]);
        bs.forEach(b => { matchedBooks.add(b[0]); rows.push([a[1], b[1]]); });
        if (!bs.length && (kind === "left" || kind === "full")) rows.push([a[1], null]);
      });
      if (kind === "full") BOOKS.filter(b => !matchedBooks.has(b[0])).forEach(b => rows.push([null, b[1]]));
      return rows;
    };
    const SQL = {
      inner: "SELECT a.name, b.title\nFROM authors a\nJOIN books b ON b.author_id = a.id;",
      left: "SELECT a.name, b.title\nFROM authors a\nLEFT JOIN books b ON b.author_id = a.id;",
      full: "SELECT a.name, b.title\nFROM authors a\nFULL OUTER JOIN books b ON b.author_id = a.id;",
      cross: "SELECT a.name, b.title\nFROM authors a\nCROSS JOIN books b;     -- every pairing"
    };
    const NOTE = {
      inner: "Only rows with a match on both sides. Chiang (no books) and the pamphlet (no author) disappear.",
      left: "Every author, matched where possible. Chiang appears with NULL for the title. The pamphlet still doesn't appear, because it isn't in the left table.",
      full: "Everything from both sides, with NULLs filling the gaps. Useful for finding mismatches between two data sets.",
      cross: "Every author paired with every book: 4 × 5 = 20 rows. Forgetting a join condition does this by accident, which can explode result sizes."
    };
    const tbl = (head, rows) => `<table class="wg-table"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td class="${c === null ? "nullc" : ""}">${c === null ? "NULL" : esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const draw = () => {
      const rows = run();
      body.innerHTML = `
        <div class="seg" role="radiogroup" aria-label="Join type">
          ${[["inner", "INNER JOIN"], ["left", "LEFT JOIN"], ["full", "FULL OUTER JOIN"], ["cross", "CROSS JOIN"]].map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === kind}" class="${k === kind ? "on" : ""}" data-k="${k}">${l}</button>`).join("")}
        </div>
        <div class="join-in">
          <div class="table-wrap"><b class="small">authors</b>${tbl(["id", "name"], AUTHORS)}</div>
          <div class="table-wrap"><b class="small">books</b>${tbl(["id", "title", "author_id"], BOOKS)}</div>
        </div>
        <pre class="wg-log">${esc(SQL[kind])}</pre>
        <div class="table-wrap"><b class="small">Result: ${rows.length} rows</b>${tbl(["name", "title"], rows)}</div>
        <p class="wg-note">${NOTE[kind]}</p>`;
      $$("[data-k]", body).forEach(b => b.addEventListener("click", () => { kind = b.dataset.k; draw(); }));
    };
    draw();
  };

  /* B-tree index vs full scan */
  W.btree = el => {
    const TREE = { keys: [40, 80], kids: [
      { keys: [10, 25], kids: [[3, 7], [12, 18, 21], [28, 33, 37]] },
      { keys: [55, 68], kids: [[42, 47, 51], [58, 63], [70, 74, 77]] },
      { keys: [90], kids: [[83, 86], [93, 97, 99]] }
    ] };
    let target = 63, size = 6;
    const body = widgetShell(el, "Find a row: B-tree index vs full table scan");
    const search = () => {
      const path = [];
      let node = TREE, depth = 0;
      while (node && !Array.isArray(node)) {
        let i = node.keys.findIndex(k => target < k);
        if (i === -1) i = node.keys.length;
        path.push({ depth, keys: node.keys, child: i });
        node = node.kids[i];
        depth++;
      }
      return { path, leaf: node, found: node.includes(target) };
    };
    const draw = () => {
      const r = search();
      const n = 10 ** size;
      const levels = Math.max(1, Math.ceil(Math.log(n) / Math.log(200)));
      const leafRow = TREE.kids.map((mid, mi) => mid.kids.map((leaf, li) => {
        const on = r.path[0].child === mi && r.path[1] && r.path[1].child === li;
        return `<span class="bt-node leaf ${on ? "on" : ""}">${leaf.map(k => `<i class="${on && k === target ? "hit" : ""}">${k}</i>`).join("")}</span>`;
      }).join("")).join("");
      body.innerHTML = `
        <div class="row wg-controls"><label class="small" for="bt-k">Find key</label><input id="bt-k" class="wg-input narrow" type="number" value="${target}"></div>
        <div class="bt">
          <div class="bt-level"><span class="bt-node on">${TREE.keys.map(k => `<i>${k}</i>`).join("")}</span></div>
          <div class="bt-level">${TREE.kids.map((m, i) => `<span class="bt-node ${r.path[0].child === i ? "on" : ""}">${m.keys.map(k => `<i>${k}</i>`).join("")}</span>`).join("")}</div>
          <div class="bt-level">${leafRow}</div>
        </div>
        <p class="wg-note">${r.found ? `Found ${target} after reading 3 nodes: at each node, the keys say which child to follow.` : `Read 3 nodes and reached the leaf where ${target} would be. It isn't there, so it's not in the table.`} A real index node holds hundreds of keys (one disk page), so the tree stays very shallow.</p>
        <label class="field-label" for="bt-n">Table size: <b>${n.toLocaleString()}</b> rows</label>
        <input id="bt-n" type="range" min="3" max="9" value="${size}" class="wg-range">
        <div class="readout">
          <div><span>Full table scan: rows read</span><b>${n.toLocaleString()}</b></div>
          <div class="em"><span>B-tree lookup (about 200 keys per page): pages read</span><b>${levels + 1}</b></div>
        </div>`;
      $("#bt-k", body).addEventListener("change", e => { target = +e.target.value; draw(); });
      $("#bt-n", body).addEventListener("input", e => { size = +e.target.value; draw(); $("#bt-n", body).focus(); });
    };
    draw();
  };

  /* Transaction isolation: lost update */
  W.isolation = el => {
    const PROGRAMS = {
      naive: { label: "Read, then write (no lock)", steps: amt => [["begin", "BEGIN"], ["read", "SELECT balance → x"], ["write", `UPDATE balance = x − ${amt}`], ["commit", "COMMIT"]] },
      atomic: { label: "Atomic UPDATE", steps: amt => [["begin", "BEGIN"], ["atomic", `UPDATE balance = balance − ${amt}`], ["commit", "COMMIT"]] },
      locking: { label: "SELECT … FOR UPDATE", steps: amt => [["begin", "BEGIN"], ["lockread", "SELECT balance … FOR UPDATE → x"], ["write", `UPDATE balance = x − ${amt}`], ["commit", "COMMIT"]] }
    };
    let mode = "naive", bal, tx, lock, log;
    const AMT = { T1: 30, T2: 50 };
    const reset = () => { bal = 100; lock = null; tx = { T1: { pc: 0, x: null }, T2: { pc: 0, x: null } }; log = "The balance is 100. T1 withdraws 30 and T2 withdraws 50, at the same time. The right answer is 20."; };
    const step = name => {
      const t = tx[name], steps = PROGRAMS[mode].steps(AMT[name]);
      if (t.pc >= steps.length) { log = `${name} has already committed.`; return; }
      const [op] = steps[t.pc];
      const other = name === "T1" ? "T2" : "T1";
      if ((op === "atomic" || op === "lockread") && lock && lock !== name) { log = `${name} must wait: ${other} holds a lock on this row until it commits.`; return; }
      if (op === "read") { t.x = bal; log = `${name} reads balance = ${bal}.`; }
      if (op === "lockread") { lock = name; t.x = bal; log = `${name} locks the row and reads balance = ${bal}.`; }
      if (op === "atomic") { lock = name; bal -= AMT[name]; log = `${name} locks the row and subtracts ${AMT[name]} from the current value: balance = ${bal}.`; }
      if (op === "write") { const before = bal; bal = t.x - AMT[name]; log = `${name} writes balance = ${t.x} − ${AMT[name]} = ${bal}.` + (before !== t.x ? ` It overwrote ${before}, so the other withdrawal is lost.` : ""); }
      if (op === "commit") { if (lock === name) lock = null; log = `${name} commits${mode !== "naive" ? " and releases its lock" : ""}.`; }
      if (op === "begin") log = `${name} begins a transaction.`;
      t.pc++;
    };
    const body = widgetShell(el, "Two transactions, one account");
    const draw = () => {
      const col = name => {
        const t = tx[name], steps = PROGRAMS[mode].steps(AMT[name]);
        return `<div class="thread"><div class="th-head"><b>${name} (−${AMT[name]})</b><span class="mono small">${t.x === null ? "" : "x = " + t.x}</span></div>
          <ol class="th-code">${steps.map((s, i) => `<li class="${i < t.pc ? "done" : i === t.pc ? "next" : ""}"><code>${esc(s[1])}</code></li>`).join("")}</ol>
          <button type="button" class="btn primary" data-t="${name}" ${t.pc >= steps.length ? "disabled" : ""}>Step ${name}</button></div>`;
      };
      const done = ["T1", "T2"].every(n => tx[n].pc >= PROGRAMS[mode].steps(AMT[n]).length);
      body.innerHTML = `
        <div class="row wg-controls">
          <select id="iso-mode" class="wg-input" aria-label="Approach">${Object.entries(PROGRAMS).map(([k, p]) => `<option value="${k}" ${k === mode ? "selected" : ""}>${p.label}</option>`).join("")}</select>
          <button type="button" class="btn" data-a="race">Interleave them</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="threads">${col("T1")}<div class="shared"><span>balance</span><b>${bal}</b><small>${lock ? "row locked by " + lock : "no lock"}</small></div>${col("T2")}</div>
        <p class="wg-note" role="status">${esc(log)}${done ? (bal === 20 ? " Final balance 20: correct." : ` Final balance ${bal}, but it should be 20.`) : ""}</p>`;
      $("#iso-mode", body).addEventListener("change", e => { mode = e.target.value; reset(); draw(); });
      $$("[data-t]", body).forEach(b => b.addEventListener("click", () => { step(b.dataset.t); draw(); }));
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        reset();
        if (b.dataset.a === "race") {
          ["T1", "T2", "T1", "T2", "T1", "T2", "T1", "T2", "T2", "T2"].forEach(step);
          log = mode === "naive" ? "Both read 100 before either wrote, so the last write wins and one withdrawal vanishes." : "Same interleaving attempt, but T2 had to wait for T1's lock, so both withdrawals count.";
        }
        draw();
      }));
    };
    reset();
    draw();
  };

  /* ---------- Week 8 widgets ---------- */

  /* Git graph */
  W.gitgraph = el => {
    let commits, branches, head, n, note;
    const reset = () => {
      commits = [{ id: "c1", lane: 0, parents: [] }, { id: "c2", lane: 0, parents: ["c1"] }];
      branches = { main: "c2" }; head = "main"; n = 3;
      note = "You're on main. Try: create a branch, commit on it, switch back, commit on main, then merge or rebase.";
    };
    const byId = id => commits.find(c => c.id === id);
    const ancestors = id => { const s = new Set(), st = [id]; while (st.length) { const c = st.pop(); if (c && !s.has(c)) { s.add(c); st.push(...byId(c).parents); } } return s; };
    const laneOf = b => b === "main" ? 0 : 1;
    const act = a => {
      if (a === "commit") {
        const id = "c" + n++;
        commits.push({ id, lane: laneOf(head), parents: [branches[head]] });
        branches[head] = id;
        note = `New commit ${id} on ${head}. A commit is a snapshot plus a pointer to its parent; the branch label just moves forward.`;
      }
      if (a === "branch") {
        if (branches.feature) { note = "The feature branch already exists."; return; }
        branches.feature = branches.main; head = "feature";
        note = "Created and switched to feature. A branch is just a movable label pointing at a commit: no files were copied.";
      }
      if (a === "switch") {
        if (!branches.feature) { note = "Create a branch first."; return; }
        head = head === "main" ? "feature" : "main";
        note = `Switched to ${head}. Your working files now match the commit it points to.`;
      }
      if (a === "merge") {
        if (!branches.feature) { note = "Create a branch first."; return; }
        const m = branches.main, f = branches.feature;
        if (ancestors(m).has(f)) { note = "main already contains everything on feature. Nothing to merge."; return; }
        if (ancestors(f).has(m)) { branches.main = f; head = "main"; note = "Fast-forward: main hadn't moved, so its label simply moved up to feature's commit. No merge commit needed."; return; }
        const id = "c" + n++;
        commits.push({ id, lane: 0, parents: [m, f], merge: true });
        branches.main = id; head = "main";
        note = `Merge commit ${id} has two parents, joining both histories. Nothing was rewritten.`;
      }
      if (a === "rebase") {
        if (!branches.feature) { note = "Create a branch first."; return; }
        const mainSet = ancestors(branches.main);
        const own = [...ancestors(branches.feature)].filter(id => !mainSet.has(id)).map(byId).sort((x, y) => +x.id.slice(1).replace("′", "") - +y.id.slice(1).replace("′", ""));
        if (!own.length) { note = "feature has no commits of its own to rebase."; return; }
        let base = branches.main;
        own.forEach(c => { c.orphan = true; const id = c.id + "′"; commits.push({ id, lane: 1, parents: [base] }); base = id; });
        branches.feature = base; head = "feature";
        note = `Rebased: feature's ${own.length} commit${own.length > 1 ? "s were" : " was"} replayed on top of main as new commits (marked ′). The originals (faded) are no longer on any branch. History is linear, but the commits are new, so never rebase commits others have already pulled.`;
      }
    };
    const body = widgetShell(el, "Branch, merge and rebase");
    const draw = () => {
      const X = i => 30 + i * 46, Y = l => 30 + l * 46;
      const pos = Object.fromEntries(commits.map((c, i) => [c.id, [X(i), Y(c.lane)]]));
      const edges = commits.flatMap(c => c.parents.map(p => {
        const [x1, y1] = pos[p], [x2, y2] = pos[c.id];
        return `<path class="ge ${c.orphan ? "orph" : ""}" d="M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}"/>`;
      })).join("");
      const nodes = commits.map(c => { const [x, y] = pos[c.id]; return `<g class="gn ${c.orphan ? "orph" : ""} ${c.lane ? "f" : "m"}"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 28}" text-anchor="middle">${c.id}</text></g>`; }).join("");
      const labels = Object.entries(branches).map(([b, id], i) => { const [x, y] = pos[id]; return `<text class="gl ${b === head ? "head" : ""}" x="${x}" y="${y - 18 - (b === "feature" && branches.main === id ? 12 : 0)}" text-anchor="middle">${b}${b === head ? " (HEAD)" : ""}</text>`; }).join("");
      const w = X(commits.length) + 40;
      body.innerHTML = `
        <div class="row wg-controls">
          <button type="button" class="btn primary" data-a="commit">Commit on ${head}</button>
          <button type="button" class="btn" data-a="branch">Create branch "feature"</button>
          <button type="button" class="btn" data-a="switch">Switch branch</button>
          <button type="button" class="btn" data-a="merge">Merge feature into main</button>
          <button type="button" class="btn" data-a="rebase">Rebase feature onto main</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="table-wrap"><svg class="ggraph" width="${w}" height="120" viewBox="0 0 ${w} 120" role="img" aria-label="Commit graph">${edges}${nodes}${labels}</svg></div>
        <p class="wg-note" role="status">${esc(note)}</p>`;
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => { if (b.dataset.a === "reset") reset(); else act(b.dataset.a); draw(); }));
    };
    reset();
    draw();
  };

  /* Canary release */
  W.canary = el => {
    const STAGES = [1, 5, 25, 50, 100];
    const BASE = 0.2, RPM = 10000;
    let errRate = 4, stage = -1, log = [], rolledBack = false;
    const body = widgetShell(el, "Roll out a release gradually");
    const noise = i => 1 + 0.25 * Math.sin(i * 12.9898 + errRate * 7.13);
    const advance = () => {
      if (rolledBack || stage >= STAGES.length - 1) return;
      stage++;
      const pct = STAGES[stage];
      const canaryReqs = RPM * 10 * pct / 100;
      const observed = +(errRate * noise(stage)).toFixed(2);
      const failed = Math.round(canaryReqs * observed / 100);
      const bad = observed > Math.max(1, BASE * 3);
      log.push({ pct, observed, failed, bad });
      if (bad) rolledBack = true;
    };
    const draw = () => {
      const totalFailed = log.reduce((s, x) => s + x.failed, 0);
      const bigBang = Math.round(RPM * 10 * errRate / 100);
      body.innerHTML = `
        <label class="field-label" for="cn-e">The new version's real error rate: <b>${errRate}%</b> (the old version: ${BASE}%)</label>
        <input id="cn-e" type="range" min="0" max="10" step="0.5" value="${errRate}" class="wg-range">
        <div class="row wg-controls">
          <button type="button" class="btn primary" data-a="go" ${rolledBack || stage >= STAGES.length - 1 ? "disabled" : ""}>${stage < 0 ? "Start canary at 1%" : "Next stage"}</button>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="stages">${STAGES.map((p, i) => { const r = log[i]; return `<div class="stage ${r ? (r.bad ? "bad" : "ok") : ""}"><b>${p}%</b><small>${r ? r.observed + "% errors" : "not yet"}</small></div>`; }).join("")}</div>
        <div class="readout">
          <div class="em"><span>Failed requests during this rollout (10 min per stage)</span><b>${totalFailed.toLocaleString()}</b></div>
          <div><span>If you'd shipped to 100% at once (10 min)</span><b>${bigBang.toLocaleString()}</b></div>
        </div>
        <p class="wg-note">${rolledBack ? `Automatic rollback at ${log[log.length - 1].pct}%: the canary's error rate (${log[log.length - 1].observed}%) breached the gate (over 3× the old version's rate and above 1%). Only the users in the canary saw the problem.` : stage >= STAGES.length - 1 ? "Fully rolled out. Every stage passed the error-rate gate." : "Each stage sends a slice of real traffic to the new version for 10 minutes and compares its error rate with the old version before going further."}</p>`;
      $("#cn-e", body).addEventListener("input", e => { errRate = +e.target.value; stage = -1; log = []; rolledBack = false; draw(); $("#cn-e", body).focus(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => { if (b.dataset.a === "go") advance(); else { stage = -1; log = []; rolledBack = false; } draw(); }));
    };
    draw();
  };

  /* Mutation testing */
  W.mutation = el => {
    const CODE = `def shipping_cost(weight_kg, express):
    if weight_kg <= 0:
        raise ValueError("weight must be positive")
    if weight_kg >= 20:
        return 0                    # free shipping for heavy orders
    cost = 5 + 2 * weight_kg
    if express:
        cost = cost * 2
    return cost`;
    const orig = (w, e) => { if (w <= 0) return "error"; if (w >= 20) return 0; let c = 5 + 2 * w; if (e) c *= 2; return c; };
    const MUTANTS = [
      ["<code>&gt;= 20</code> → <code>&gt; 20</code>", (w, e) => { if (w <= 0) return "error"; if (w > 20) return 0; let c = 5 + 2 * w; if (e) c *= 2; return c; }],
      ["<code>5 + 2 *</code> → <code>5 - 2 *</code>", (w, e) => { if (w <= 0) return "error"; if (w >= 20) return 0; let c = 5 - 2 * w; if (e) c *= 2; return c; }],
      ["<code>cost * 2</code> → <code>cost + 2</code>", (w, e) => { if (w <= 0) return "error"; if (w >= 20) return 0; let c = 5 + 2 * w; if (e) c += 2; return c; }],
      ["<code>if express</code> → <code>if not express</code>", (w, e) => { if (w <= 0) return "error"; if (w >= 20) return 0; let c = 5 + 2 * w; if (!e) c *= 2; return c; }],
      ["<code>&lt;= 0</code> → <code>&lt; 0</code>", (w, e) => { if (w < 0) return "error"; if (w >= 20) return 0; let c = 5 + 2 * w; if (e) c *= 2; return c; }],
      ["<code>return 0</code> → <code>return 1</code>", (w, e) => { if (w <= 0) return "error"; if (w >= 20) return 1; let c = 5 + 2 * w; if (e) c *= 2; return c; }]
    ];
    const TESTS = [
      ["2 kg, standard → 9", 2, false, [1, 2, 4, 6, 7, 9]],
      ["1 kg, express → 14", 1, true, [1, 2, 4, 6, 7, 8, 9]],
      ["25 kg → free", 25, false, [1, 2, 4, 5]],
      ["exactly 20 kg → free", 20, false, [1, 2, 4, 5]],
      ["0 kg → error", 0, false, [1, 2, 3]],
      ["3 kg, standard → 11", 3, false, [1, 2, 4, 6, 7, 9]]
    ];
    let on = [true, false, true, false, false, false];
    const body = widgetShell(el, "Do your tests actually catch bugs?");
    const draw = () => {
      const active = TESTS.filter((_, i) => on[i]);
      const lines = new Set(active.flatMap(t => t[3]));
      const coverage = Math.round(lines.size / 9 * 100);
      const killed = MUTANTS.map(([, fn]) => active.some(([, w, e]) => fn(w, e) !== orig(w, e)));
      const score = Math.round(killed.filter(Boolean).length / MUTANTS.length * 100);
      body.innerHTML = `
        <pre class="wg-log">${esc(CODE)}</pre>
        <div class="mt-cols">
          <div><b class="small">Your tests</b>${TESTS.map((t, i) => `<label class="mt-row"><input type="checkbox" data-i="${i}" ${on[i] ? "checked" : ""}> ${esc(t[0])}</label>`).join("")}</div>
          <div><b class="small">Mutants (deliberate bugs)</b>${MUTANTS.map((m, i) => `<div class="mt-row"><span class="chip ${killed[i] ? "good" : "bad"}">${killed[i] ? "killed" : "survived"}</span> ${m[0]}</div>`).join("")}</div>
        </div>
        <div class="readout">
          <div><span>Line coverage</span><b>${coverage}%</b></div>
          <div class="em"><span>Mutation score (bugs caught)</span><b>${score}%</b></div>
        </div>
        <p class="wg-note">${coverage === 100 && score < 100 ? "100% line coverage, yet some bugs survive: every line ran, but no test checked the result closely enough. Boundary values (exactly 20 kg, exactly 0 kg) are where tests usually miss." : "A mutant is killed when at least one test fails on the buggy version. Tick tests to see which bugs they catch. Coverage says what ran; the mutation score says what was actually checked."}</p>`;
      $$("[data-i]", body).forEach(c => c.addEventListener("change", () => { on[+c.dataset.i] = c.checked; draw(); }));
    };
    draw();
  };

  /* ---------- Week 9 widgets ---------- */

  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; };

  /* Consistent hashing */
  W.hashring = el => {
    let servers = 4, vnodes = true;
    const KEYS = Array.from({ length: 600 }, (_, i) => "user:" + i);
    const ringFor = (count, v) => {
      const pts = [];
      for (let s = 0; s < count; s++) for (let r = 0; r < (v ? 50 : 1); r++) pts.push([fnv(`server-${s}#${r}`), s]);
      return pts.sort((a, b) => a[0] - b[0]);
    };
    const lookup = (ring, key) => { const h = fnv(key); const p = ring.find(x => x[0] >= h) || ring[0]; return p[1]; };
    const body = widgetShell(el, "Add a server: which keys move?");
    const draw = () => {
      const r1 = ringFor(servers, vnodes), r2 = ringFor(servers + 1, vnodes);
      const ringMoved = KEYS.filter(k => lookup(r1, k) !== lookup(r2, k)).length;
      const modMoved = KEYS.filter(k => fnv(k) % servers !== fnv(k) % (servers + 1)).length;
      const load = Array(servers).fill(0); KEYS.forEach(k => load[lookup(r1, k)]++);
      const max = Math.max(...load);
      const ideal = KEYS.length / servers;
      const cx = 90, cy = 90, R = 70;
      const dots = r1.map(([h, s]) => { const a = h / 2 ** 32 * 2 * Math.PI - Math.PI / 2; return `<circle class="rs s${s % 6}" cx="${(cx + R * Math.cos(a)).toFixed(1)}" cy="${(cy + R * Math.sin(a)).toFixed(1)}" r="${vnodes ? 3 : 7}"/>`; }).join("");
      body.innerHTML = `
        <div class="row wg-controls">
          <label class="small" for="hr-n">Servers <b>${servers}</b></label>
          <input id="hr-n" type="range" min="2" max="8" value="${servers}" class="wg-range" style="width:140px">
          <label class="small"><input type="checkbox" id="hr-v" ${vnodes ? "checked" : ""}> Virtual nodes (50 per server)</label>
        </div>
        <div class="hr-wrap">
          <svg viewBox="0 0 180 180" width="180" height="180" class="ring" role="img" aria-label="Hash ring"><circle cx="90" cy="90" r="70" class="ring-c"/>${dots}</svg>
          <div class="hr-bars">${load.map((l, i) => `<div class="hr-bar"><span class="mono small">server ${i}</span><span class="hb"><i class="s${i % 6}" style="width:${(l / max * 100).toFixed(0)}%"></i></span><span class="mono small">${l}</span></div>`).join("")}</div>
        </div>
        <div class="readout">
          <div><span>Keys that move with hash % N (${servers} → ${servers + 1})</span><b>${Math.round(modMoved / KEYS.length * 100)}%</b></div>
          <div class="em"><span>Keys that move with consistent hashing</span><b>${Math.round(ringMoved / KEYS.length * 100)}%</b></div>
          <div><span>Busiest server vs ideal</span><b>${(max / ideal).toFixed(2)}×</b></div>
        </div>
        <p class="wg-note">With modulo, changing the number of servers sends almost every key somewhere new: a cache would lose nearly all its hits at once. On a ring, a new server only takes keys from its neighbors, about 1/${servers + 1} of them. Without virtual nodes, the load is uneven because a few points split the ring badly.</p>`;
      $("#hr-n", body).addEventListener("input", e => { servers = +e.target.value; draw(); $("#hr-n", body).focus(); });
      $("#hr-v", body).addEventListener("change", e => { vnodes = e.target.checked; draw(); });
    };
    draw();
  };

  /* Cache simulator */
  W.cachesim = el => {
    let capacity = 100, skew = 1.0;
    const ITEMS = 1000, REQS = 20000;
    const body = widgetShell(el, "How big should the cache be?");
    const simulate = () => {
      const weights = Array.from({ length: ITEMS }, (_, i) => 1 / Math.pow(i + 1, skew));
      const total = weights.reduce((a, b) => a + b, 0);
      const cum = []; let acc = 0; weights.forEach(w => { acc += w / total; cum.push(acc); });
      let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      const cache = new Map(); let hits = 0;
      for (let r = 0; r < REQS; r++) {
        const u = rnd(); let lo = 0, hi = ITEMS - 1;
        while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < u) lo = m + 1; else hi = m; }
        if (cache.has(lo)) { hits++; cache.delete(lo); cache.set(lo, 1); }
        else if (capacity > 0) { cache.set(lo, 1); if (cache.size > capacity) cache.delete(cache.keys().next().value); }
      }
      return hits / REQS;
    };
    const draw = () => {
      const hit = simulate();
      const lat = hit * 1 + (1 - hit) * 20;
      body.innerHTML = `
        <label class="field-label" for="cs-c">Cache size: <b>${capacity}</b> of ${ITEMS} items (${(capacity / ITEMS * 100).toFixed(0)}%)</label>
        <input id="cs-c" type="range" min="0" max="1000" step="10" value="${capacity}" class="wg-range">
        <label class="field-label" for="cs-s">How concentrated is traffic on popular items? <b>${skew < 0.5 ? "evenly spread" : skew < 1.05 ? "typical" : "very concentrated"}</b></label>
        <input id="cs-s" type="range" min="0" max="1.6" step="0.1" value="${skew}" class="wg-range">
        <div class="readout">
          <div class="em"><span>Hit rate (LRU)</span><b>${(hit * 100).toFixed(1)}%</b></div>
          <div><span>Database queries per 1,000 requests</span><b>${Math.round((1 - hit) * 1000)}</b></div>
          <div><span>Average latency (hit 1 ms, miss 20 ms)</span><b>${lat.toFixed(1)} ms</b></div>
        </div>
        <p class="wg-note">${skew >= 0.8 ? "Real traffic is usually skewed: a small share of items gets most requests, so a cache holding 10% of items can serve most reads. Notice the diminishing returns as the cache grows." : "With evenly spread traffic, the hit rate is roughly the fraction of items cached, so caching helps far less. Know your access pattern before sizing a cache."}</p>`;
      $("#cs-c", body).addEventListener("input", e => { capacity = +e.target.value; draw(); $("#cs-c", body).focus(); });
      $("#cs-s", body).addEventListener("input", e => { skew = +e.target.value; draw(); $("#cs-s", body).focus(); });
    };
    draw();
  };

  /* Circuit breaker */
  W.breaker = el => {
    const THRESHOLD = 3, COOLDOWN = 30;
    let state, failures, openedAt, now, healthy, log;
    const reset = () => { state = "closed"; failures = 0; openedAt = null; now = 0; healthy = true; log = []; };
    const send = () => {
      if (state === "open") {
        if (now - openedAt >= COOLDOWN) { state = "half-open"; log.unshift(`t=${now}s: cooldown over → HALF-OPEN; letting one trial request through.`); }
        else { log.unshift(`t=${now}s: OPEN → failed fast without calling the dependency (${COOLDOWN - (now - openedAt)}s of cooldown left).`); return; }
      }
      if (healthy) {
        log.unshift(`t=${now}s: request succeeded.` + (state === "half-open" ? " Trial worked → CLOSED." : ""));
        state = "closed"; failures = 0;
      } else {
        failures++;
        if (state === "half-open") { state = "open"; openedAt = now; log.unshift(`t=${now}s: trial request failed → back to OPEN for ${COOLDOWN}s.`); }
        else if (failures >= THRESHOLD) { state = "open"; openedAt = now; log.unshift(`t=${now}s: request timed out (failure ${failures}/${THRESHOLD}) → OPEN. Stop calling the dependency for ${COOLDOWN}s.`); }
        else log.unshift(`t=${now}s: request timed out (failure ${failures}/${THRESHOLD}).`);
      }
    };
    const body = widgetShell(el, "A circuit breaker in action");
    const draw = () => {
      body.innerHTML = `
        <div class="row wg-controls">
          <button type="button" class="btn primary" data-a="send">Send request</button>
          <button type="button" class="btn" data-a="wait">Wait 10 seconds</button>
          <label class="small"><input type="checkbox" id="cb-h" ${healthy ? "checked" : ""}> Dependency is healthy</label>
          <button type="button" class="btn ghost" data-a="reset">Reset</button>
        </div>
        <div class="cb-states">${["closed", "open", "half-open"].map(s => `<span class="cb-state ${s === state ? "on " + s : ""}">${s.toUpperCase()}</span>`).join('<span class="muted">→</span>')}</div>
        <div class="readout"><div><span>Time</span><b>${now}s</b></div><div><span>Consecutive failures</span><b>${failures}</b></div></div>
        <pre class="wg-log" role="status">${esc(log.slice(0, 7).join("\n") || "Untick \"healthy\" and send a few requests.")}</pre>
        <p class="wg-note">While OPEN, callers get an instant error instead of waiting for a timeout, and the struggling dependency gets breathing room to recover instead of being hammered by retries.</p>`;
      $("#cb-h", body).addEventListener("change", e => { healthy = e.target.checked; draw(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "send") send();
        if (a === "wait") now += 10;
        if (a === "reset") reset();
        draw();
      }));
    };
    reset();
    draw();
  };

  /* ---------- Week 10 widgets ---------- */

  /* Error budget */
  W.budget = el => {
    const SLOS = [99, 99.5, 99.9, 99.95, 99.99];
    let slo = 2, used = 20, reqs = 50;
    const body = widgetShell(el, "Error budget calculator");
    const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h ${Math.round(m % 60)} min` : m >= 1 ? `${m.toFixed(1)} min` : `${(m * 60).toFixed(0)} s`;
    const draw = () => {
      const target = SLOS[slo];
      const budgetMin = 30 * 24 * 60 * (1 - target / 100);
      const allowedFailures = reqs * 1e6 * (1 - target / 100);
      const left = budgetMin - used;
      const pct = Math.max(0, left / budgetMin * 100);
      body.innerHTML = `
        <div class="seg" role="radiogroup" aria-label="SLO">${SLOS.map((s, i) => `<button type="button" role="radio" aria-checked="${i === slo}" class="${i === slo ? "on" : ""}" data-s="${i}">${s}%</button>`).join("")}</div>
        <label class="field-label" for="eb-u">Downtime so far this month: <b>${used} min</b></label>
        <input id="eb-u" type="range" min="0" max="500" step="1" value="${used}" class="wg-range">
        <div class="eb-bar" aria-hidden="true"><i class="${pct < 25 ? "low" : ""}" style="width:${pct.toFixed(1)}%"></i></div>
        <div class="readout">
          <div class="em"><span>Error budget (30 days)</span><b>${fmtMin(budgetMin)}</b></div>
          <div><span>Remaining</span><b>${left >= 0 ? fmtMin(left) : "overspent by " + fmtMin(-left)}</b></div>
          <div><span>Failed requests allowed (of ${reqs}M / month)</span><b>${Math.round(allowedFailures).toLocaleString()}</b></div>
        </div>
        <p class="wg-note">${left < 0 ? "Budget exhausted. A typical policy: freeze risky launches and spend engineering time on reliability until the service is back within its SLO." : pct < 25 ? "Budget nearly spent: slow down risky changes and prioritize reliability work." : "Budget available: the team can keep shipping at full speed. Unused budget is permission to take reasonable risks, not a target to hit."} Each extra nine cuts the budget tenfold.</p>`;
      $$("[data-s]", body).forEach(b => b.addEventListener("click", () => { slo = +b.dataset.s; draw(); }));
      $("#eb-u", body).addEventListener("input", e => { used = +e.target.value; draw(); $("#eb-u", body).focus(); });
    };
    draw();
  };

  /* Build vs buy */
  W.tco = el => {
    let devs = 2, months = 4, salary = 150, maint = 25, vendor = 3, years = 5;
    const body = widgetShell(el, "Build or buy? Total cost over time");
    const draw = () => {
      const buildFirst = devs * salary * months / 12;
      const buildYear = buildFirst * maint / 100;
      const buyYear = vendor * 12;
      const pts = [];
      for (let y = 0; y <= years; y++) pts.push([y, buildFirst + buildYear * y, buyYear * y + (y === 0 ? 0 : 0)]);
      const maxV = Math.max(...pts.map(p => Math.max(p[1], p[2]))) * 1.1 || 1;
      const W2 = 320, H = 160, P = 30;
      const sx = y => P + y / years * (W2 - P - 10), sy = v => H - P + 10 - v / maxV * (H - P);
      const line = i => pts.map((p, k) => `${k ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[i]).toFixed(1)}`).join(" ");
      let breakEven = null;
      if (buyYear > buildYear) breakEven = buildFirst / (buyYear - buildYear);
      body.innerHTML = `
        <div class="tco-in">
          <label>Engineers to build <input class="wg-input narrow" type="number" min="1" max="20" data-k="devs" value="${devs}"></label>
          <label>Months to build <input class="wg-input narrow" type="number" min="1" max="36" data-k="months" value="${months}"></label>
          <label>Cost per engineer ($k/yr, loaded) <input class="wg-input narrow" type="number" min="20" max="500" data-k="salary" value="${salary}"></label>
          <label>Upkeep (% of build cost/yr) <input class="wg-input narrow" type="number" min="0" max="100" data-k="maint" value="${maint}"></label>
          <label>Vendor price ($k/month) <input class="wg-input narrow" type="number" min="0" max="200" step="0.5" data-k="vendor" value="${vendor}"></label>
        </div>
        <div class="table-wrap"><svg viewBox="0 0 ${W2} ${H}" width="${W2}" height="${H}" class="tco-chart" role="img" aria-label="Cumulative cost">
          <line x1="${P}" y1="${H - P + 10}" x2="${W2 - 10}" y2="${H - P + 10}" class="axis"/>
          ${pts.map(p => `<text x="${sx(p[0])}" y="${H - 4}" text-anchor="middle" class="tick">yr ${p[0]}</text>`).join("")}
          <path d="${line(1)}" class="l-build"/><path d="${line(2)}" class="l-buy"/>
        </svg></div>
        <div class="flegend"><span><i class="lg-build"></i>build (cumulative)</span><span><i class="lg-buy"></i>buy (cumulative)</span></div>
        <div class="readout">
          <div><span>Build: up front, then per year</span><b>$${Math.round(buildFirst)}k + $${Math.round(buildYear)}k/yr</b></div>
          <div><span>Buy: per year</span><b>$${Math.round(buyYear)}k/yr</b></div>
          <div class="em"><span>Building pays off after</span><b>${breakEven === null ? "never" : breakEven > years ? `${breakEven.toFixed(1)} yrs (beyond ${years})` : breakEven.toFixed(1) + " years"}</b></div>
        </div>
        <p class="wg-note">This leaves out the biggest cost of building: the opportunity cost of not spending those engineer-months on your actual product. Buy what isn't your differentiator, unless scale, control or cost clearly favor building.</p>`;
      $$("[data-k]", body).forEach(inp => inp.addEventListener("change", e => {
        const v = Math.max(0, +e.target.value || 0);
        ({ devs: () => devs = v, months: () => months = v, salary: () => salary = v, maint: () => maint = v, vendor: () => vendor = v })[e.target.dataset.k]();
        draw();
      }));
    };
    draw();
  };

  /* One request through the stack */
  W.trace = el => {
    let warm = false, cacheHit = false, shown = 0;
    const steps = () => [
      { name: "Browser cache and URL parsing", ms: 1, wk: 6, note: "The browser checks whether it already has a fresh copy (Cache-Control) before going to the network." },
      { name: "DNS lookup", ms: warm ? 0 : 25, wk: 5, note: warm ? "Answer already cached (within its TTL)." : "Recursive resolver walks root → .com → the domain's nameserver, or answers from cache." },
      { name: "TCP handshake", ms: warm ? 0 : 20, wk: 5, note: warm ? "Reusing an open connection (keep-alive)." : "SYN, SYN-ACK, ACK: one round trip." },
      { name: "TLS handshake", ms: warm ? 0 : 20, wk: 6, note: warm ? "Session already established." : "Key exchange and certificate check: one more round trip in TLS 1.3." },
      { name: "HTTP request reaches the load balancer", ms: 10, wk: 9, note: "The load balancer picks a healthy app server (round robin or least connections)." },
      { name: "App server handles it", ms: 2, wk: 4, note: "A worker thread or async task in the server process parses the request and runs your code." },
      { name: cacheHit ? "Cache hit" : "Cache miss", ms: 1, wk: 9, note: cacheHit ? "The result is in Redis or memory: skip the database." : "Not in the cache, so go to the database (cache-aside)." },
      ...(cacheHit ? [] : [
        { name: "Database query via an index", ms: 4, wk: 7, note: "The B-tree index finds the row in a few page reads; most pages are already in the database's memory." },
        { name: "Disk read for a cold page", ms: 0.1, wk: 4, note: "An SSD read for the one page not cached in RAM (about 100 µs)." }
      ]),
      { name: "Logs, metrics and a trace span recorded", ms: 0.2, wk: 8, note: "Latency, status code and a trace ID, so this request can be found and measured later." },
      { name: "Response travels back", ms: 10, wk: 5, note: "Half a round trip back through the load balancer and the internet." },
      { name: "Browser parses and renders", ms: 30, wk: 6, note: "Parse HTML, fetch CSS and JavaScript (often over the same connection), lay out and paint." }
    ];
    const body = widgetShell(el, "Follow one request through everything you've learned");
    const draw = () => {
      const s = steps();
      const total = s.reduce((a, x) => a + x.ms, 0);
      const elapsed = s.slice(0, shown).reduce((a, x) => a + x.ms, 0);
      body.innerHTML = `
        <div class="row wg-controls">
          <button type="button" class="btn primary" data-a="next" ${shown >= s.length ? "disabled" : ""}>Next step</button>
          <button type="button" class="btn" data-a="all">Show all</button>
          <label class="small"><input type="checkbox" id="tr-warm" ${warm ? "checked" : ""}> Repeat visit (warm connection)</label>
          <label class="small"><input type="checkbox" id="tr-hit" ${cacheHit ? "checked" : ""}> Cache hit</label>
        </div>
        <ol class="trace">${s.map((x, i) => `<li class="${i < shown ? "done" : ""}"><span class="tr-name"><b>${esc(x.name)}</b><small>${i < shown ? esc(x.note) : ""}</small></span><span class="mono small">${x.ms ? x.ms + " ms" : "0 ms"}</span><a class="chip" href="week-${String(x.wk).padStart(2, "0")}.html">week ${x.wk}</a></li>`).join("")}</ol>
        <div class="readout">
          <div class="em"><span>Elapsed so far</span><b>${elapsed.toFixed(1)} ms</b></div>
          <div><span>Total for this request</span><b>${total.toFixed(1)} ms</b></div>
        </div>
        <p class="wg-note">Most of the time goes on network round trips and rendering, not your code. That's why connection reuse, caching and CDNs (which shorten round trips) matter so much.</p>`;
      $("#tr-warm", body).addEventListener("change", e => { warm = e.target.checked; draw(); });
      $("#tr-hit", body).addEventListener("change", e => { cacheHit = e.target.checked; shown = Math.min(shown, steps().length); draw(); });
      $$("[data-a]", body).forEach(b => b.addEventListener("click", () => { shown = b.dataset.a === "all" ? steps().length : Math.min(shown + 1, steps().length); draw(); }));
    };
    draw();
  };

  /* ---------- Embedded course widgets ---------- */

  /* PWM duty cycle */
  W.pwm = el => {
    let duty = 25, volts = 3.3;
    const body = widgetShell(el, "Pulse-width modulation");
    const render = () => {
      const W_ = 300, H = 60, per = 75, hi = 10, lo = 50;
      let d = `M0 ${lo}`;
      for (let x = 0; x < W_; x += per) {
        const on = per * duty / 100;
        d += on > 0 ? ` L${x} ${hi} L${x + on} ${hi} L${x + on} ${lo}` : "";
        d += ` L${x + per} ${lo}`;
      }
      const avg = volts * duty / 100;
      const avgY = lo - (lo - hi) * duty / 100;
      body.innerHTML = `
        <label class="small">Duty cycle: <b>${duty}%</b> <input type="range" min="0" max="100" step="5" value="${duty}" style="width:100%"></label>
        <div class="row" style="gap:8px;margin:6px 0"><button class="btn" data-v="3.3">3.3 V (ESP32)</button><button class="btn" data-v="5">5 V (Arduino)</button></div>
        <svg viewBox="0 0 300 64" style="width:100%;max-width:520px;height:auto" role="img" aria-label="PWM waveform">
          <path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>
          <line x1="0" x2="300" y1="${avgY}" y2="${avgY}" stroke="currentColor" stroke-dasharray="4 4" opacity=".5"/>
        </svg>
        <div class="readout">
          <div><span>Average voltage</span><b>${avg.toFixed(2)} V</b></div>
          <div><span>LED brightness</span><b><i style="display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:-2px;background:rgba(230,60,40,${(duty / 100).toFixed(2)});border:1px solid currentColor"></i> ${duty}%</b></div>
          <div><span>MicroPython duty_u16</span><b class="mono">${Math.round(65535 * duty / 100)}</b></div>
        </div>
        <p class="wg-note">The pin is only ever fully on or fully off. A slow load (an LED seen by your eye, a motor with inertia) responds to the average: duty × ${volts} V. The dashed line is that average.</p>`;
      $("input", body).oninput = e => { duty = +e.target.value; render(); };
      body.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { volts = +b.dataset.v; render(); });
    };
    render();
  };

  /* ---------- Markets course widgets ---------- */

  /* Market-cap weighted index */
  W.capweight = el => {
    const co = [["MegaTech A", 3500], ["MegaTech B", 3200], ["MegaTech C", 2900], ["Bank", 600], ["Retailer", 400], ["Energy", 450], ["Pharma", 500], ["Industrial", 250], ["Utility", 150], ["Small co.", 50]];
    const ch = co.map(() => 0);
    const body = widgetShell(el, "How a few giants move an index");
    const render = focusI => {
      const total = co.reduce((a, c) => a + c[1], 0);
      const idx = co.reduce((a, c, i) => a + c[1] * ch[i] / 100, 0) / total * 100;
      const eq = ch.reduce((a, b) => a + b, 0) / co.length;
      const sign = x => (x > 0 ? "+" : "") + x.toFixed(2) + "%";
      body.innerHTML = `<div class="table-wrap"><table><tr><th>Company</th><th>Market cap ($bn)</th><th>Weight</th><th>Price change</th></tr>
        ${co.map((c, i) => `<tr><td>${c[0]}</td><td>${c[1].toLocaleString()}</td><td>${(c[1] / total * 100).toFixed(1)}%</td>
        <td><input type="range" min="-50" max="50" step="5" value="${ch[i]}" data-i="${i}" aria-label="${c[0]} price change" style="width:100px"> <b>${ch[i] > 0 ? "+" : ""}${ch[i]}%</b></td></tr>`).join("")}</table></div>
        <div class="readout"><div class="em"><span>Cap-weighted index</span><b>${sign(idx)}</b></div><div><span>Equal-weighted average</span><b>${sign(eq)}</b></div>
        <div><span>Top 3 share of index</span><b>${((co[0][1] + co[1][1] + co[2][1]) / total * 100).toFixed(0)}%</b></div></div>
        <p class="wg-note">Try moving only the three giants down 20% while every other company rises 20%. The index still falls, even though seven of ten companies went up.</p>`;
      body.querySelectorAll("input").forEach(r => r.oninput = e => { ch[+e.target.dataset.i] = +e.target.value; render(e.target.dataset.i); });
      if (focusI != null) body.querySelector(`[data-i="${focusI}"]`).focus();
    };
    render();
  };

  /* Compound growth with fees */
  W.compound = el => {
    const v = { start: 10000, monthly: 200, ret: 7, fee: 1.5, years: 30 };
    const body = widgetShell(el, "Compounding and the cost of fees");
    const grow = fee => { let b = v.start; const r = (v.ret - fee) / 100 / 12; for (let m = 0; m < v.years * 12; m++) b = b * (1 + r) + v.monthly; return b; };
    const money = x => "$" + Math.round(x).toLocaleString();
    const F = [["start", "Starting amount ($)", 0, 100000, 1000], ["monthly", "Added each month ($)", 0, 2000, 50], ["ret", "Return before fees (%/yr)", 0, 12, 0.5], ["fee", "Fund fee (%/yr)", 0, 3, 0.1], ["years", "Years", 1, 50, 1]];
    const render = focusK => {
      const cheap = grow(0.1), dear = grow(v.fee), paid = v.start + v.monthly * 12 * v.years;
      body.innerHTML = F.map(f => `<label class="small" style="display:block">${f[1]}: <b>${v[f[0]]}</b><input type="range" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${v[f[0]]}" data-k="${f[0]}" style="width:100%"></label>`).join("") +
        `<div class="readout"><div><span>You put in</span><b>${money(paid)}</b></div><div class="em"><span>With a 0.1% index fund</span><b>${money(cheap)}</b></div>
        <div><span>With a ${v.fee}% fee</span><b>${money(dear)}</b></div><div><span>Lost to the higher fee</span><b>${money(cheap - dear)} (${((1 - dear / cheap) * 100).toFixed(0)}%)</b></div></div>
        <p class="wg-note">Rule of 72: at ${v.ret}%, money doubles about every ${v.ret > 0 ? (72 / v.ret).toFixed(1) : "∞"} years. Real returns aren't smooth; this assumes a steady average.</p>`;
      body.querySelectorAll("input").forEach(r => r.oninput = e => { v[e.target.dataset.k] = +e.target.value; render(e.target.dataset.k); });
      if (focusK) body.querySelector(`[data-k="${focusK}"]`).focus();
    };
    render();
  };

  /* Bond price vs yield */
  W.bondprice = el => {
    let y = 5;
    const coupon = 3;
    const body = widgetShell(el, "Why bond prices fall when yields rise");
    const price = (yrs, yld) => { const r = yld / 100; let p = 0; for (let t = 1; t <= yrs; t++) p += coupon * 10 / (1 + r) ** t; return p + 1000 / (1 + r) ** yrs; };
    const render = focus => {
      body.innerHTML = `<p class="small">You own a $1,000 bond paying a ${coupon}% coupon ($30 a year). Market yields for similar new bonds are now:</p>
        <label class="small" style="display:block">Market yield: <b>${y.toFixed(1)}%</b><input type="range" min="0.5" max="10" step="0.5" value="${y}" style="width:100%"></label>
        <div class="readout">${[2, 10, 30].map(n => { const p = price(n, y); return `<div class="${n === 10 ? "em" : ""}"><span>${n}-year bond's price</span><b>$${p.toFixed(0)} (${p >= 1000 ? "+" : ""}${((p / 1000 - 1) * 100).toFixed(1)}%)</b></div>`; }).join("")}</div>
        <p class="wg-note">${y > coupon ? "New bonds pay more than yours, so buyers will only take yours at a discount." : y < coupon ? "Yours pays more than new bonds, so it's worth more than face value." : "Your coupon matches the market, so it trades at face value."} Longer bonds swing much more: this sensitivity is called duration.</p>`;
      const input = $("input", body);
      input.oninput = e => { y = +e.target.value; render(true); };
      if (focus) $("input", body).focus();
    };
    render();
  };

  /* Crash explorer */
  W.crashes = el => {
    const C = [
      ["1929", "Dow", -89, 34, 300, "Margin debt, bank failures and policy mistakes. Nominal recovery in 1954 (sooner with dividends and deflation counted)."],
      ["1973–74", "S&P 500", -48, 21, 90, "Oil shock, high inflation and the end of the 'Nifty Fifty' growth stocks."],
      ["1987", "Dow", -36, 2, 21, "Black Monday: −22.6% in one day, amplified by portfolio insurance. No recession followed."],
      ["2000–02", "Nasdaq", -78, 31, 180, "Dot-com bubble: no-profit companies on extreme valuations. The S&P 500 fell 49% and recovered by 2007."],
      ["2007–09", "S&P 500", -57, 17, 66, "Housing and credit bubble, 30:1 bank leverage, and Lehman's failure."],
      ["2020", "S&P 500", -34, 1, 6, "COVID shock, with an immediate, massive policy response."],
      ["2022", "S&P 500", -25, 9, 24, "Inflation and the fastest rate rises in 40 years. The Nasdaq fell about 35%."]];
    let sel = 4;
    const body = widgetShell(el, "Crash explorer: depth and recovery");
    const render = () => {
      const c = C[sel], need = (1 / (1 + c[2] / 100) - 1) * 100;
      body.innerHTML = `<div class="row" style="gap:6px;flex-wrap:wrap">${C.map((x, i) => `<button type="button" class="btn ${i === sel ? "primary" : ""}" data-i="${i}">${x[0]}</button>`).join("")}</div>
        <div style="margin:10px 0">${C.map((x, i) => `<div class="small" style="display:flex;align-items:center;gap:8px;margin:3px 0"><span style="width:62px;flex:none">${x[0]}</span><span style="height:12px;width:${(-x[2] * 0.7).toFixed(0)}%;background:currentColor;opacity:${i === sel ? 0.9 : 0.25};border-radius:3px"></span><span>${x[2]}%</span></div>`).join("")}</div>
        <div class="readout"><div class="em"><span>${c[1]} peak to trough</span><b>${c[2]}%</b></div><div><span>Months falling</span><b>${c[3]}</b></div>
        <div><span>Months to regain the peak (approx.)</span><b>${c[4]}</b></div><div><span>Gain needed to recover</span><b>+${need.toFixed(0)}%</b></div></div>
        <p class="wg-note">${c[5]} Figures are approximate, price-only and not adjusted for inflation.</p>`;
      body.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { sel = +b.dataset.i; render(); });
    };
    render();
  };

  /* From revenue to share price */
  W.statements = el => {
    const v = { revenue: 10, margin: 20, shares: 1, pe: 20, growth: 10 };
    const F = [["revenue", "Revenue ($bn)", 1, 100, 1], ["margin", "Net margin (%)", -10, 50, 1], ["shares", "Shares outstanding (bn)", 0.2, 5, 0.1], ["pe", "P/E the market pays", 5, 60, 1], ["growth", "Revenue growth next year (%)", -30, 60, 5]];
    const body = widgetShell(el, "From revenue to share price");
    const money = x => (x < 0 ? "−$" : "$") + Math.abs(x).toFixed(2);
    const render = focusK => {
      const ni = v.revenue * v.margin / 100, eps = ni / v.shares, price = eps * v.pe;
      const ni2 = v.revenue * (1 + v.growth / 100) * v.margin / 100, price2 = ni2 / v.shares * v.pe;
      body.innerHTML = F.map(f => `<label class="small" style="display:block">${f[1]}: <b>${v[f[0]]}</b><input type="range" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${v[f[0]]}" data-k="${f[0]}" style="width:100%"></label>`).join("") +
        `<div class="readout"><div><span>Net income</span><b>${money(ni)}bn</b></div><div><span>Earnings per share</span><b>${money(eps)}</b></div>
        <div class="em"><span>Share price (EPS × P/E)</span><b>${eps > 0 ? money(price) : "No earnings: P/E meaningless"}</b></div><div><span>Market cap</span><b>${eps > 0 ? money(price * v.shares) + "bn" : "—"}</b></div>
        <div><span>Price next year, same margin and P/E</span><b>${eps > 0 ? money(price2) + " (" + (v.growth >= 0 ? "+" : "") + v.growth + "%)" : "—"}</b></div></div>
        <p class="wg-note">Try halving the P/E while growth stays at 10%: the price falls even though the business grew. That's multiple compression, the story of many tech stocks after 2000 and in 2022.</p>`;
      body.querySelectorAll("input").forEach(r => r.oninput = e => { v[e.target.dataset.k] = +e.target.value; render(e.target.dataset.k); });
      if (focusK) body.querySelector(`[data-k="${focusK}"]`).focus();
    };
    render();
  };

  /* Asset mix: approximate US history 1926 onwards */
  W.mix = el => {
    // [shares %, average annual return %, worst calendar year %], approximate long-run US figures
    const P = [[0, 5.3, -13.1], [20, 6.7, -10.1], [40, 7.8, -18.4], [60, 8.8, -26.6], [80, 9.6, -34.9], [100, 10.3, -43.1]];
    let s = 60;
    const body = widgetShell(el, "Shares versus bonds: return and pain");
    const interp = (i) => { const lo = P[Math.floor(s / 20)], hi = P[Math.min(5, Math.ceil(s / 20))]; const t = lo === hi ? 0 : (s - lo[0]) / 20; return lo[i] + (hi[i] - lo[i]) * t; };
    const render = focus => {
      const ret = interp(1), worst = interp(2), grow = 10000 * (1 + ret / 100) ** 30;
      body.innerHTML = `<label class="small" style="display:block">Shares <b>${s}%</b> · bonds <b>${100 - s}%</b><input type="range" min="0" max="100" step="10" value="${s}" style="width:100%"></label>
        <div style="display:flex;height:14px;border-radius:4px;overflow:hidden;margin:8px 0"><span style="width:${s}%;background:currentColor;opacity:.8"></span><span style="width:${100 - s}%;background:currentColor;opacity:.25"></span></div>
        <div class="readout"><div class="em"><span>Average annual return (approx.)</span><b>${ret.toFixed(1)}%</b></div><div><span>Worst calendar year (approx.)</span><b>${worst.toFixed(1)}%</b></div>
        <div><span>$100,000 in that worst year</span><b>$${Math.round(100000 * (1 + worst / 100)).toLocaleString()}</b></div><div><span>$10,000 after 30 years at the average</span><b>$${Math.round(grow).toLocaleString()}</b></div></div>
        <p class="wg-note">Approximate US figures from 1926, before fees, tax and inflation, in the style of published long-run model portfolio studies. The future will differ: the point is the shape of the trade-off, not the exact numbers.</p>`;
      $("input", body).oninput = e => { s = +e.target.value; render(true); };
      if (focus) $("input", body).focus();
    };
    render();
  };

  /* Day trading simulator */
  W.daytrader = el => {
    const v = { win: 50, payoff: 1.0, cost: 0.1, trades: 4 };
    const F = [["win", "Win rate (%)", 30, 70, 1], ["payoff", "Average win ÷ average loss", 0.5, 3, 0.1], ["cost", "Costs per trade (fraction of the amount risked)", 0, 0.3, 0.02], ["trades", "Trades per day", 1, 10, 1]];
    const body = widgetShell(el, "1,000 day traders, one year");
    let seed = 7;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const render = focusK => {
      seed = 7;
      const n = v.trades * 250, results = [];
      for (let t = 0; t < 1000; t++) {
        let r = 0;
        for (let i = 0; i < n; i++) {
          r += ((rnd() < v.win / 100 ? v.payoff : -1) - v.cost) * 0.5;   // each trade risks 0.5% of the starting account
          if (r <= -100) { r = -100; break; }                           // the account is wiped out
        }
        results.push(r);
      }
      results.sort((a, b) => a - b);
      const prof = results.filter(x => x > 0).length / 10, wiped = results.filter(x => x <= -100).length / 10, edge = v.win / 100 * v.payoff - (1 - v.win / 100) - v.cost;
      const pct = x => { const r = Math.round(x) || 0; return (r > 0 ? "+" : "") + r + "%"; };
      body.innerHTML = F.map(f => `<label class="small" style="display:block">${f[1]}: <b>${v[f[0]]}</b><input type="range" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${v[f[0]]}" data-k="${f[0]}" style="width:100%"></label>`).join("") +
        `<div class="readout"><div class="em"><span>Traders profitable after a year</span><b>${prof.toFixed(1)}%</b></div><div><span>Expected result per trade</span><b>${edge >= 0 ? "+" : ""}${edge.toFixed(2)} × risk</b></div>
        <div><span>Median trader's year</span><b>${pct(results[500])}</b></div><div><span>Accounts wiped out</span><b>${wiped.toFixed(1)}%</b></div><div><span>Unluckiest 5% / luckiest 5%</span><b>${pct(results[50])} / ${pct(results[950])}</b></div></div>
        <p class="wg-note">Each trade risks 0.5% of the starting account (not compounded), and an account that reaches −100% stops, ${n.toLocaleString()} trades a year. With a 50% win rate and equal wins and losses, costs alone make everyone lose. Raise the win rate until the expected result is near zero: luck alone then splits traders into winners and losers, and the winners are the ones you hear about.</p>`;
      body.querySelectorAll("input").forEach(r => r.oninput = e => { v[e.target.dataset.k] = +e.target.value; render(e.target.dataset.k); });
      if (focusK) body.querySelector(`[data-k="${focusK}"]`).focus();
    };
    render();
  };

  function setupWidgets() {
    $$("[data-widget]").forEach(el => {
      const fn = W[el.dataset.widget];
      if (!fn) return;
      el.classList.add("widget");
      try { fn(el); } catch (e) { el.innerHTML = `<p class="notice error">This widget failed to load: ${esc(e.message)}</p>`; }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    if (WEEK) {
      setupWidgets();
      setupLessons();
      setupChecks();
      setupProject();
      setupReflection();
      renderWeekProgress();
      const slot = $(".sync-slot");
      if (slot) slot.replaceWith(syncEl());
      setupQuizStatus();
    } else {
      renderIndex();
      loadIndexQuizzes();
    }
    connect();
  }
  boot();
})();
