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
