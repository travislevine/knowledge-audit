/* Where progress is saved. Shared by the audits, quizzes and course pages.
 *
 * Two backends, tried in order:
 *   server  – serve.py on this computer: results/<id>.json, and REPORT.md is rebuilt
 *   local   – this browser only (any other static host, or a file:// page)
 *
 * Every page also keeps its own copy in localStorage, so nothing is lost offline.
 * The landing page uses KAStore to export and import everything as one bundle file.
 */
(function () {
  "use strict";

  const FILE_KEY = id => "knowledge-audit:file:" + id;
  const pad = n => String(n).padStart(2, "0");
  const range = (n, f) => Array.from({ length: n }, (_, i) => f(i + 1));

  // Every results id the site can write.
  const ALL_IDS = [
    "cs-foundations", "engineering-theory", "thinking-skills",
    "syllabus", "thinking", "embedded", "finance",
    ...range(10, n => `week-${pad(n)}-quiz`),
    ...range(4, n => `thinking-${pad(n)}-quiz`),
    ...range(4, n => `embedded-${pad(n)}-quiz`),
    ...range(10, n => `finance-${pad(n)}-quiz`),
    "finance-final"
  ];

  async function probeServer() {
    if (!/^https?:$/.test(location.protocol)) return false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch("/api/results/syllabus", { cache: "no-store", signal: ctrl.signal });
      return !!res.headers.get("X-Knowledge-Audit");
    } catch (e) {
      return false;
    } finally { clearTimeout(timer); }
  }

  const backend = (async () => {
    if (await probeServer()) return { kind: "server" };
    return { kind: "local" };
  })();

  function getLocal(id) {
    try {
      const file = JSON.parse(localStorage.getItem(FILE_KEY(id)));
      if (file) return file;
      return JSON.parse(localStorage.getItem("knowledge-audit:" + id));
    } catch (e) { return null; }
  }
  function putLocal(id, body) {
    try { localStorage.setItem(FILE_KEY(id), JSON.stringify(body)); } catch (e) {}
  }

  async function get(id) {
    const b = await backend;
    if (b.kind === "server") {
      const res = await fetch("/api/results/" + encodeURIComponent(id), { cache: "no-store" });
      return res.ok ? res.json() : null;
    }
    return getLocal(id);
  }

  async function put(id, body) {
    putLocal(id, body);
    const b = await backend;
    if (b.kind === "server") {
      const res = await fetch("/api/results/" + encodeURIComponent(id), {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
    }
  }

  // The shape the page engines expect: is there a remote store, and what's in it?
  async function fetchResult(id) {
    const b = await backend;
    if (b.kind === "local") return { server: false, data: null };
    return { server: true, data: await get(id) };
  }

  async function label(id) {
    const b = await backend;
    if (b.kind === "server") return "Auto-saving to results/" + id + ".json";
    return "Saved in this browser. Run serve.py to save to the repo.";
  }

  /* ---------- Bundle export and import (all progress in one file) ---------- */

  async function exportBundle() {
    const files = {};
    for (const id of ALL_IDS) {
      let body = null;
      try { body = await get(id); } catch (e) {}
      if (!body) body = getLocal(id);
      if (body && (body.audit || body.id)) files[id] = body;
    }
    return { format: "knowledge-audit-bundle", version: 1, exportedAt: new Date().toISOString(), files };
  }

  // Newest wins: a file in the bundle replaces the stored one only if it was saved later.
  async function importBundle(bundle) {
    if (!bundle || bundle.format !== "knowledge-audit-bundle" || !bundle.files) throw new Error("not a progress bundle");
    const result = { imported: [], skipped: [] };
    for (const [id, body] of Object.entries(bundle.files)) {
      if (!ALL_IDS.includes(id) || !body || (body.audit || body.id) !== id) { result.skipped.push(id); continue; }
      let current = null;
      try { current = await get(id); } catch (e) {}
      if (current && (Number(current.updatedAt) || 0) >= (Number(body.updatedAt) || 0)) { result.skipped.push(id); continue; }
      await put(id, body);
      // Make the page's own browser copy match, so it doesn't push older progress back.
      try { localStorage.setItem("knowledge-audit:" + id, JSON.stringify(body)); } catch (e) {}
      result.imported.push(id);
    }
    return result;
  }

  // Save a file through a normal download link.
  async function download(filename, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return true;
  }

  window.KAStore = { ALL_IDS, backend, get, put, putLocal, fetchResult, label, exportBundle, importBundle, download };
})();
