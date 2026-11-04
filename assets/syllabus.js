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
  const LS_KEY = "knowledge-audit:syllabus";
  const API = "/api/results/syllabus";
  const PROJECT_STATUS = [
    ["not-started", "Not started"],
    ["in-progress", "In progress"],
    ["tests-passing", "Tests passing"],
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
      const { server, data } = await fetchResult("syllabus");
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
    server: ["ok", "Auto-saving to results/syllabus.json"],
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
        <textarea id="project-notes" rows="4" placeholder="e.g. All tests pass except utf8_decode on invalid input. Not sure my float32_value handles subnormals.">${esc(p.notes || "")}</textarea>`;
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
        <p class="lede">The core of a computer science degree, condensed: the 20% of ideas that carry 80% of the weight, from how bits become numbers up to distributed systems and how software companies run. Each week has written lessons with interactive checkpoints, short videos, a hands-on Python project, an end-of-week quiz and a self-rating.</p>
      </header>
      <div class="how">
        <div><strong>Lessons (4–5 h)</strong><p>Read each lesson, try the widgets, answer the checkpoints and watch the linked video. Mark each lesson complete as you go.</p></div>
        <div><strong>Project (4–5 h)</strong><p>Each week has a Python project in <code>syllabus/projects/</code> with starter code and tests. Make the tests pass, then record your status and notes.</p></div>
        <div><strong>Quiz and reflection (45 min)</strong><p>Finish with the 15-question quiz (70% to pass), then rate yourself on each objective and write a short reflection.</p></div>
      </div>
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
