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
TASK_SET_VERSION = "equilibrium-league-2026-v2"
EXPECTED_TASKS = 533
EXPECTED_POINTS = 11110

STYLE_PATHS = [
    "features/dependencies/region-explorer-enhancement.css",
    "features/dependencies/route-list-view.css",
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
        raise SystemExit(f"Equilibrium task bundle has invalid base64 length: {len(encoded)}")
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
        raise SystemExit(f"Equilibrium task validation failed: {len(tasks)} tasks / {total_points} points")
    if task_set.get("id") != "equilibrium-league-2026":
        raise SystemExit("Unexpected Equilibrium task-set identifier")
    return tasks


LOCALITY_RULES = {
    "Misthalin": [
        (r"\bstronghold of player safety\b", "Edgeville"),
        (r"\bcity of um\b|\bnecromancy ritual site\b", "City of Um"),
        (r"\bfort forinthry\b", "Fort Forinthry"),
        (r"\blumbridge swamp\b", "Lumbridge Swamp"),
        (r"\bwizards?' tower\b", "Draynor Village"),
        (r"\bdraynor\b", "Draynor Village"),
        (r"\bedgeville\b", "Edgeville"),
        (r"\bvarrock\b|\bgrand exchange\b", "Varrock"),
        (r"\blumbridge\b", "Lumbridge"),
    ],
    "Asgarnia": [
        (r"\bport sarim\b", "Port Sarim"), (r"\bwhite wolf mountain\b", "White Wolf Mountain"),
        (r"\bfalador\b", "Falador"), (r"\bburthorpe\b", "Burthorpe"),
        (r"\btaverley\b", "Taverley"), (r"\brimmington\b", "Rimmington"),
    ],
    "Kandarin": [
        (r"\bseers?' village\b", "Seers' Village"), (r"\btree gnome stronghold\b", "Tree Gnome Stronghold"),
        (r"\b(?:east|west)?\s*ardougne\b", "Ardougne"), (r"\bcatherby\b", "Catherby"),
        (r"\byanille\b", "Yanille"),
    ],
    "Morytania": [
        (r"\bburgh de rott\b", "Burgh de Rott"), (r"\bport phasmatys\b", "Port Phasmatys"),
        (r"\bslayer tower\b", "Slayer Tower"), (r"\bdarkmeyer\b", "Darkmeyer"),
        (r"\bcanifis\b", "Canifis"),
    ],
    "Desert": [
        (r"\bal kharid\b", "Al Kharid"), (r"\bshantay pass\b", "Shantay Pass"),
        (r"\bmenaphos\b", "Menaphos"), (r"\bsophanem\b", "Sophanem"),
        (r"\bpollnivneach\b", "Pollnivneach"), (r"\bnardah\b", "Nardah"),
    ],
    "Karamja": [
        (r"\bshilo village\b", "Shilo Village"), (r"\bmusa point\b", "Musa Point"),
        (r"\bbrimhaven\b", "Brimhaven"), (r"\btzhaar\b|\btzhaar city\b", "TzHaar City"),
    ],
    "Fremennik": [
        (r"\blunar isle\b", "Lunar Isle"), (r"\bmiscellania\b", "Miscellania"),
        (r"\bneitiznot\b", "Neitiznot"), (r"\bjatizso\b", "Jatizso"),
        (r"\brellekka\b", "Rellekka"),
    ],
    "Tirannwn": [(r"\bprifddinas\b", "Prifddinas"), (r"\blletya\b", "Lletya")],
    "Anachronia": [(r"\banachronia\b", "Anachronia")],
    "Wilderness": [(r"\bwilderness\b", "Wilderness")],
    "Havenhythe": [(r"\bhavenhythe\b", "Havenhythe")],
}


def task_locality(task):
    area = str(task.get("area") or "Global").strip() or "Global"
    if area.lower() == "global":
        return "Global"
    text = f'{task.get("task", "")} {task.get("information", "")}'.lower()
    for pattern, place in LOCALITY_RULES.get(area, []):
        if re.search(pattern, text, flags=re.IGNORECASE):
            return f"{area}: {place}"
    return f"{area}: General"


def app_task(task, runtime_id):
    title = task["task"]
    information = task.get("information") or title
    requirements = task.get("requirements") or "N/A"
    area = task["area"]
    points = int(task["points"])
    difficulty = "Easy" if points == 10 else "Medium" if points == 30 else "Other"
    region_id = re.sub(r"[^a-z0-9]+", "-", area.lower()).strip("-")
    locality = task_locality(task)
    return {
        "id": runtime_id, "sourceId": task["id"], "task": title, "name": title, "title": title,
        "information": information, "description": information,
        "requirements": requirements, "requirement": requirements,
        "points": points, "area": area, "region": area, "locality": locality,
        "regionId": region_id, "location": locality,
        "difficulty": difficulty, "tier": difficulty,
        "category": "General", "completed": False,
    }


def find_javascript_array_end(text, start):
    depth = 0
    quote = None
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if quote is not None:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in ('"', "'", "`"):
            quote = char
        elif char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return index + 1
    raise SystemExit("Could not locate the end of the embedded task array")


def replace_embedded_tasks(html, tasks):
    task_array_pattern = re.compile(r'window\.RS3_TASKS\s*=\s*\[')
    key_pattern = re.compile(r'(?<![\w$])(?:"tasks"|\'tasks\'|tasks)\s*:\s*\[')
    task_marker = re.compile(r'(?<![\w$])(?:"task"|\'task\'|task)\s*:')
    candidates = []
    for match in task_array_pattern.finditer(html):
        array_start = html.find("[", match.start())
        array_end = find_javascript_array_end(html, array_start)
        array_text = html[array_start:array_end]
        marker_count = len(task_marker.findall(array_text))
        if marker_count:
            candidates.append((marker_count, array_start, array_end))
    app_data_start = html.find("window.RS3_APP_DATA")
    search_start = app_data_start if app_data_start >= 0 else 0
    for match in key_pattern.finditer(html, search_start):
        array_start = html.find("[", match.start())
        array_end = find_javascript_array_end(html, array_start)
        array_text = html[array_start:array_end]
        marker_count = len(task_marker.findall(array_text))
        if marker_count:
            candidates.append((marker_count, array_start, array_end))
    if not candidates:
        raise SystemExit("No JavaScript task array was found in index.html")
    old_count, start, end = max(candidates, key=lambda item: item[0])
    if old_count < 500:
        raise SystemExit(f"Refusing to replace suspiciously small task array ({old_count} task entries)")
    adapted = [app_task(task, runtime_id) for runtime_id, task in enumerate(tasks, start=1)]
    runtime_ids = [task["id"] for task in adapted]
    source_ids = [task["sourceId"] for task in adapted]
    if runtime_ids != list(range(1, EXPECTED_TASKS + 1)):
        raise SystemExit("Equilibrium runtime task IDs are not sequential numeric values")
    if len(source_ids) != len(set(source_ids)):
        raise SystemExit("Equilibrium source task IDs are not unique")
    if any(task["region"] != "Global" and task["locality"] == "Global" for task in adapted):
        raise SystemExit("A region task was incorrectly adapted as globally flexible")
    replacement = json.dumps(adapted, ensure_ascii=False, separators=(",", ":"))
    return html[:start] + replacement + html[end:], old_count


subprocess.run([sys.executable, str(ROOT / "tools" / "validate_project.py")], check=True)
html = SOURCE.read_text(encoding="utf-8")
equilibrium_tasks = load_equilibrium_tasks()
html, removed_task_count = replace_embedded_tasks(html, equilibrium_tasks)

html = re.sub(r'(["\']?tasks["\']?\s*:\s*)1117\b', rf'\g<1>{EXPECTED_TASKS}', html)
html = re.sub(r'(["\']?points["\']?\s*:\s*)106220\b', rf'\g<1>{EXPECTED_POINTS}', html)
html = html.replace("Development task set", "Equilibrium League task set")
html = html.replace("previous-League dummy data", "Equilibrium League task data")
html = html.replace("Dummy tasks", "Tasks").replace("DUMMY TASKS", "TASKS")

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
  </script>
'''
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
old_task_total = re.search(r'(?<![\w$])(?:"tasks"|\'tasks\'|tasks)\s*:\s*1117\b', built_html)
old_point_total = re.search(r'(?<![\w$])(?:"points"|\'points\'|points)\s*:\s*106220\b', built_html)
if old_task_total or old_point_total:
    raise SystemExit("Old League integrity totals leaked into the build")
if built_html.count('"completed":false') < EXPECTED_TASKS:
    raise SystemExit("The Equilibrium task set did not fully replace the old task array")
if "anachronia-set-sail-for-anachronia" not in built_html or "wilderness-complete-the-medium-wilderness-diary" not in built_html:
    raise SystemExit("Equilibrium first/last task validation failed")

print(f"Built {DIST / 'index.html'}")
print(f"Replaced {removed_task_count} old tasks with {EXPECTED_TASKS} Equilibrium League tasks ({EXPECTED_POINTS} points)")
