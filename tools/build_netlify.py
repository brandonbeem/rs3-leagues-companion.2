from pathlib import Path
import base64
import gzip
import json
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
DIST = ROOT / "dist"
DEPENDENCY_DIR = ROOT / "features" / "dependencies"
TASK_BUNDLE = ROOT / "features" / "tasks" / "equilibrium" / "task-set.json.gz.b64"
TASK_BUNDLE_DIR = TASK_BUNDLE.parent
TASK_BUNDLE_PART_COUNT = 6
TASK_SET_VERSION = "equilibrium-league-2026-v1"
EXPECTED_TASKS = 533
EXPECTED_POINTS = 11110

STYLE_PATHS = [
    "features/dependencies/region-explorer-enhancement.css",
]
SCRIPT_PATHS = [
    "features/dependencies/dependency-engine.js",
    "features/dependencies/achievement-set-engine.js",
    "features/dependencies/region-registry.js",
    "features/dependencies/fort-forinthry-data.js",
    "features/dependencies/city-of-um-data.js",
    "features/dependencies/register-regions.js",
    "features/dependencies/region-planner-native.js",
    "features/dependencies/region-planner-native-layout.js",
    "features/dependencies/task-tracker-scroll-guard.js",
]

REMOVED_SCRIPT_PATHS = [
    "features/dependencies/region-planner.js",
    "features/dependencies/region-explorer-enhancement.js",
    "features/dependencies/region-unlocked-strip-sync.js",
    "features/dependencies/region-planner-tab-lifecycle.js",
    "features/dependencies/region-planner-dom-guard.js",
    "features/dependencies/region-planner-visibility-guard.js",
]


def read_task_bundle():
    parts = [TASK_BUNDLE_DIR / f"task-set.part{number}.b64" for number in range(1, TASK_BUNDLE_PART_COUNT + 1)]
    missing = [str(path.relative_to(ROOT)) for path in parts if not path.exists()]
    if missing:
        raise SystemExit(f"Equilibrium task bundle is missing parts: {', '.join(missing)}")

    encoded = "".join(path.read_text(encoding="ascii").strip() for path in parts)
    if len(encoded) % 4:
        raise SystemExit(
            f"Equilibrium task bundle has invalid base64 length: {len(encoded)}"
        )
    return encoded


def load_equilibrium_tasks():
    try:
        encoded = read_task_bundle()
        compressed = base64.b64decode(encoded, validate=True)
        payload = gzip.decompress(compressed).decode("utf-8")
        data = json.loads(payload)
    except Exception as exc:
        raise SystemExit(f"Unable to decode Equilibrium task bundle: {exc}") from exc

    task_set = data.get("taskSet", {})
    tasks = data.get("tasks", [])
    total_points = sum(int(task.get("points", 0)) for task in tasks)
    if len(tasks) != EXPECTED_TASKS or total_points != EXPECTED_POINTS:
        raise SystemExit(
            f"Equilibrium task validation failed: {len(tasks)} tasks / {total_points} points"
        )
    if task_set.get("id") != "equilibrium-league-2026":
        raise SystemExit("Unexpected Equilibrium task-set identifier")
    return tasks


def app_task(task):
    title = task["task"]
    information = task.get("information") or title
    requirements = task.get("requirements") or "N/A"
    area = task["area"]
    points = int(task["points"])
    difficulty = "Easy" if points == 10 else "Medium" if points == 30 else "Other"
    region_id = re.sub(r"[^a-z0-9]+", "-", area.lower()).strip("-")

    # Include the canonical fields plus compatibility aliases used by older
    # tracker views. This lets the current UI migrate without retaining any
    # object from the previous 1,117-task development set.
    return {
        "id": task["id"],
        "task": title,
        "name": title,
        "title": title,
        "information": information,
        "description": information,
        "requirements": requirements,
        "requirement": requirements,
        "points": points,
        "area": area,
        "region": area,
        "regionId": region_id,
        "location": area,
        "difficulty": difficulty,
        "tier": difficulty,
        "category": "General",
        "completed": False,
    }


def find_json_array_end(text, start):
    depth = 0
    in_string = False
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return index + 1
    raise SystemExit("Could not locate the end of the embedded task array")


def replace_embedded_tasks(html, tasks):
    candidates = []
    for match in re.finditer(r'"tasks"\s*:\s*\[', html):
        array_start = html.find("[", match.start())
        array_end = find_json_array_end(html, array_start)
        try:
            existing = json.loads(html[array_start:array_end])
        except json.JSONDecodeError:
            continue
        if isinstance(existing, list):
            candidates.append((len(existing), array_start, array_end))

    if not candidates:
        raise SystemExit("No JSON task array was found in index.html")

    old_count, start, end = max(candidates, key=lambda item: item[0])
    if old_count < 500:
        raise SystemExit(f"Refusing to replace suspiciously small task array ({old_count})")

    replacement = json.dumps([app_task(task) for task in tasks], ensure_ascii=False, separators=(",", ":"))
    return html[:start] + replacement + html[end:], old_count


subprocess.run([sys.executable, str(ROOT / "tools" / "validate_project.py")], check=True)
html = SOURCE.read_text(encoding="utf-8")
equilibrium_tasks = load_equilibrium_tasks()
html, removed_task_count = replace_embedded_tasks(html, equilibrium_tasks)

# Update integrity totals and remove old development-data wording.
html = re.sub(r'(["\']?tasks["\']?\s*:\s*)1117\b', rf'\g<1>{EXPECTED_TASKS}', html)
html = re.sub(r'(["\']?points["\']?\s*:\s*)106220\b', rf'\g<1>{EXPECTED_POINTS}', html)
html = html.replace("Development task set", "Equilibrium League task set")
html = html.replace("previous-League dummy data", "Equilibrium League task data")
html = html.replace("Dummy tasks", "Tasks").replace("DUMMY TASKS", "TASKS")

# A new League must not inherit completion, stats, regions, or task IDs from
# the previous data set. This runs once per browser for this task-set version.
reset_script = f'''  <script>
  (function () {{
    var version = {json.dumps(TASK_SET_VERSION)};
    var key = 'rs3-leagues-task-set-version';
    try {{
      if (localStorage.getItem(key) !== version) {{
        localStorage.clear();
        localStorage.setItem(key, version);
      }}
    }} catch (error) {{
      console.warn('Unable to reset previous League progress', error);
    }}
  }})();
  </script>\n'''
if TASK_SET_VERSION not in html:
    html = html.replace("</head>", reset_script + "</head>", 1)

html = re.sub(
    r'\s*<link\b[^>]*href=["\']features/dependencies/region-planner\.css["\'][^>]*>\s*',
    "\n", html, flags=re.IGNORECASE,
)
for removed_path in REMOVED_SCRIPT_PATHS:
    html = re.sub(
        rf'\s*<script\b[^>]*src=["\']{re.escape(removed_path)}["\'][^>]*>\s*</script>\s*',
        "\n", html, flags=re.IGNORECASE,
    )

for style_path in STYLE_PATHS:
    if style_path not in html:
        html = html.replace("</head>", f'  <link rel="stylesheet" href="{style_path}">\n</head>', 1)

for script_path in SCRIPT_PATHS:
    if script_path not in html:
        html = html.replace("</body>", f'  <script src="{script_path}"></script>\n</body>', 1)

for managed_path in [*STYLE_PATHS, *SCRIPT_PATHS]:
    if html.count(managed_path) != 1:
        raise SystemExit(f"Managed asset must appear exactly once: {managed_path} (found {html.count(managed_path)})")
for removed_path in REMOVED_SCRIPT_PATHS:
    if removed_path in html:
        raise SystemExit(f"Obsolete Region Planner script leaked into build: {removed_path}")

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir(parents=True, exist_ok=True)
(DIST / "index.html").write_text(html, encoding="utf-8")

feature_destination = DIST / "features" / "dependencies"
feature_destination.parent.mkdir(parents=True, exist_ok=True)
shutil.copytree(DEPENDENCY_DIR, feature_destination)

for relative_path in [*STYLE_PATHS, *SCRIPT_PATHS]:
    output = DIST / relative_path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Build output missing required asset: {relative_path}")

built_html = (DIST / "index.html").read_text(encoding="utf-8")
for forbidden in ("features/dependencies/region-planner.css", *REMOVED_SCRIPT_PATHS, "rs3-region-planner"):
    if forbidden in built_html:
        raise SystemExit(f"Floating or conflicting Region Planner code leaked into build: {forbidden}")

if '"tasks":1117' in built_html or '"points":106220' in built_html:
    raise SystemExit("Old League integrity totals leaked into the build")
if built_html.count('"completed":false') < EXPECTED_TASKS:
    raise SystemExit("The Equilibrium task set did not fully replace the old task array")
if "anachronia-set-sail-for-anachronia" not in built_html or "wilderness-complete-the-medium-wilderness-diary" not in built_html:
    raise SystemExit("Equilibrium first/last task validation failed")

print(f"Built {DIST / 'index.html'}")
print(f"Replaced {removed_task_count} old tasks with {EXPECTED_TASKS} Equilibrium League tasks ({EXPECTED_POINTS} points)")
