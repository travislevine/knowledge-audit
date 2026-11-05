#!/usr/bin/env python3
"""Build results/REPORT.md, a readable summary of everything in results/.

serve.py runs this after every save. Run it by hand with:

    python report.py
"""
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RESULTS = ROOT / "results"
REPORT = RESULTS / "REPORT.md"

PROJECT_STATUS = {
    "not-started": "Not started",
    "in-progress": "In progress",
    "tests-passing": "Tests passing",
    "done": "Done",
}
WEEK_QUIZ = re.compile(r"^week-(\d+)-quiz$")
EXTRA_COURSES = [("thinking", re.compile(r"^thinking-(\d+)-quiz$"), "Thinking Skills course"),
                 ("embedded", re.compile(r"^embedded-(\d+)-quiz$"), "Embedded Systems and IoT course")]


def load_results():
    files = {}
    for path in sorted(RESULTS.glob("*.json")):
        try:
            files[path.stem] = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
    return files


def when(ms):
    if not ms:
        return "never"
    return datetime.fromtimestamp(ms / 1000).strftime("%Y-%m-%d %H:%M")


def quote(text):
    return "\n".join("> " + line if line else ">" for line in text.strip().splitlines())


def quiz_line(data):
    """First-attempt score for a single-level quiz, e.g. '11/15 (passed)'."""
    levels = (data.get("summary") or {}).get("levels") or {}
    if not levels:
        return "not taken"
    level = levels[sorted(levels)[0]]
    if not level.get("answered"):
        return "not taken"
    score = level.get("firstAttempt", "?")
    correct, _, total = score.partition("/")
    if total.isdigit() and level["answered"] < int(total):
        return f"in progress ({level['answered']}/{total} answered, {correct} right)"
    state = "passed" if level.get("passed") else "below 70%"
    retakes = level.get("retakes") or 0
    extra = f", {retakes} retake{'s' if retakes != 1 else ''}" if retakes else ""
    return f"{score} ({state}{extra})"


def review_lines(summary, limit=None):
    items = summary.get("review") or []
    order = {"Misconception": 0, "Gap": 1, "Lucky guess": 2}
    items = sorted(items, key=lambda i: (order.get(i.get("status"), 3), i.get("level", 0)))
    if limit:
        items = items[:limit]
    return [f"- [{i['status']}] {i.get('topic', '')}: {i.get('concept', '')}" for i in items]


def syllabus_section(syl, quizzes, title="Syllabus"):
    summary = syl.get("summary") or {}
    weeks = summary.get("weeks") or []
    out = [f"## {title}", ""]
    if not weeks:
        return out + [f"No {title.lower()} progress yet.", ""]

    out += [
        "| Week | Lessons | Checkpoints | Project | Quiz (first attempt) | Avg self-rating |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for w in weeks:
        n = w["week"]
        cp = w.get("checkpoints") or {}
        quiz = quiz_line(quizzes[n]) if n in quizzes else "not taken"
        ratings = [r["rating"] for r in w.get("objectives", []) if r.get("rating")]
        avg = f"{sum(ratings) / len(ratings):.1f} / 5" if ratings else "not rated"
        out.append(
            f"| {n}. {w['title']} | {w.get('lessonsDone', 0)}/{w.get('lessonsTotal', 0)} "
            f"| {cp.get('correct', 0)}/{cp.get('answered', 0)} right, {cp.get('total', 0)} total "
            f"| {PROJECT_STATUS.get(w.get('project', {}).get('status'), 'Not started')} "
            f"| {quiz} | {avg} |"
        )
    out.append("")

    for w in weeks:
        n = w["week"]
        touched = w.get("lessonsDone") or (w.get("checkpoints") or {}).get("answered") or w.get("reflection") \
            or n in quizzes or (w.get("project") or {}).get("status", "not-started") != "not-started"
        if not touched:
            continue
        out += [f"### Week {n}: {w['title']}", "", f"Last activity: {when(w.get('lastActivity'))}", ""]

        missing = w.get("lessonsMissing") or []
        if missing:
            out += ["**Lessons not marked complete:** " + "; ".join(missing), ""]

        objectives = w.get("objectives") or []
        if any(o.get("rating") for o in objectives):
            out += ["**Self-ratings** (1 = can't do this yet, 5 = could teach it)", ""]
            out += [f"- {o['rating'] or '–'}/5 {o['text']}" for o in objectives]
            out.append("")

        missed = (w.get("checkpoints") or {}).get("missed") or []
        if missed:
            out += ["**Checkpoint questions missed**", ""] + [f"- {m}" for m in missed] + [""]

        project = w.get("project") or {}
        out += [f"**Project:** {project.get('title', '')} ({PROJECT_STATUS.get(project.get('status'), 'Not started')})"]
        if project.get("path"):
            out.append(f"Code: `{project['path']}`")
        if project.get("notes"):
            out += ["", quote(project["notes"])]
        out.append("")

        if n in quizzes:
            lines = review_lines(quizzes[n].get("summary") or {})
            if lines:
                out += ["**Quiz questions to revisit**", ""] + lines + [""]
            cal = (quizzes[n].get("summary") or {}).get("calibration") or {}
            if any(v != "0/0" for v in cal.values()):
                out += ["**Quiz calibration (right/answered):** " + ", ".join(f"{k} {v}" for k, v in cal.items()), ""]

        if w.get("reflection"):
            out += ["**Reflection**", "", quote(w["reflection"]), ""]
    return out


def audit_section(data):
    summary = data.get("summary") or {}
    title = data.get("title") or data.get("audit")
    out = [f"### {title}", "", f"Last activity: {when(data.get('updatedAt'))}", ""]
    levels = summary.get("levels") or {}
    for key in sorted(levels):
        lv = levels[key]
        state = "passed" if lv.get("passed") else ("in progress" if lv.get("answered") else "not started")
        latest = lv.get("latest")
        retake = f", latest {latest} after {lv['retakes']} retake{'s' if lv['retakes'] != 1 else ''}" if lv.get("retakes") and latest else ""
        out.append(f"- Level {key} {lv.get('name', '')}: {lv.get('firstAttempt', '?')} first attempt{retake} ({state})")
    topics = summary.get("topics") or {}
    taken = {k: v for k, v in topics.items() if v.get("answered")}
    if taken:
        out += ["", "By area (right/answered): " + "; ".join(f"{k} {v['correct']}/{v['answered']}" for k, v in taken.items())]
    cal = summary.get("calibration") or {}
    if any(v != "0/0" for v in cal.values()):
        out += ["", "Calibration (right/answered): " + ", ".join(f"{k} {v}" for k, v in cal.items())]
    lines = review_lines(summary, limit=25)
    if lines:
        out += ["", "To review (misconceptions first):", ""] + lines
    return out + [""]


def build_report():
    files = load_results()
    syl = files.pop("syllabus", None)
    extra = []
    for cid, pattern, title in EXTRA_COURSES:
        cq = {int(m.group(1)): files.pop(k) for k in list(files) for m in [pattern.match(k)] if m}
        extra.append((files.pop(cid, None), cq, title))
    quizzes = {}
    for key in list(files):
        m = WEEK_QUIZ.match(key)
        if m:
            quizzes[int(m.group(1))] = files.pop(key)

    stamps = [d.get("updatedAt") or 0 for d in [*files.values(), *quizzes.values(), syl or {}] + [d for c, cq, _ in extra for d in [c or {}, *cq.values()]]]

    out = [
        "# Progress report",
        "",
        "Generated from the files in `results/` by `report.py`. Don't edit by hand; it's rebuilt on every save.",
        "",
        f"Last activity: {when(max(stamps) if stamps else 0)}",
        "",
    ]
    out += syllabus_section(syl or {}, quizzes)
    for course, cq, title in extra:
        if course or cq:
            out += syllabus_section(course or {}, cq, title)
    out += ["## Audits", ""]
    if files:
        for data in files.values():
            out += audit_section(data)
    else:
        out += ["No audit results yet.", ""]
    return "\n".join(out).rstrip() + "\n"


def write_report():
    RESULTS.mkdir(exist_ok=True)
    REPORT.write_text(build_report(), encoding="utf-8")
    return REPORT


if __name__ == "__main__":
    print(f"Wrote {write_report().relative_to(ROOT)}")
