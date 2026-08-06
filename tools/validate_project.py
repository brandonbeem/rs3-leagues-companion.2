from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    ROOT / "index.html",
    ROOT / "netlify.toml",
    ROOT / "tools/build_netlify.py",
    ROOT / "features/dependencies/dependency-engine.js",
    ROOT / "features/dependencies/achievement-set-engine.js",
    ROOT / "features/dependencies/region-registry.js",
    ROOT / "features/dependencies/fort-forinthry-data.js",
    ROOT / "features/dependencies/city-of-um-data.js",
    ROOT / "features/dependencies/register-regions.js",
    ROOT / "features/dependencies/region-explorer-enhancement.css",
    ROOT / "features/dependencies/task-tracker-scroll-guard.js",
    ROOT / "features/dependencies/task-tracker-enhancements.js",
    ROOT / "features/dependencies/task-tracker-enhancements.css",
    ROOT / "features/dependencies/route-planner-removal.js",
    ROOT / "features/tasks/equilibrium/task-set.part1.b64",
    ROOT / "features/tasks/equilibrium/task-set.part2.b64",
    ROOT / "features/tasks/equilibrium/task-set.part3.b64",
    ROOT / "features/tasks/equilibrium/task-set.part4.b64",
    ROOT / "features/tasks/equilibrium/task-set.part5.b64",
    ROOT / "features/tasks/equilibrium/task-set.part6.b64",
]

errors = []
for path in REQUIRED:
    if not path.exists():
        errors.append(f"Missing required file: {path.relative_to(ROOT)}")
    elif path.stat().st_size == 0:
        errors.append(f"Required file is empty: {path.relative_to(ROOT)}")

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8", errors="replace") if index_path.exists() else ""
index_lower = index.lower()

if index_path.exists() and index_path.stat().st_size < 100_000:
    errors.append("index.html is unexpectedly small; expected the standalone companion app")
for marker in ("<!doctype html", "<head", "</head>", "<body", "</body>"):
    if marker not in index_lower:
        errors.append(f"index.html is missing structural marker: {marker}")
if "rs3 leagues companion" not in index_lower and "runescape 3" not in index_lower:
    errors.append("index.html does not appear to be the RS3 Leagues Companion")

registry_path = ROOT / "features/dependencies/region-registry.js"
if registry_path.exists():
    registry = registry_path.read_text(encoding="utf-8")
    if "parentRegion" not in registry:
        errors.append("Progression-area registry must require parentRegion")

registration_path = ROOT / "features/dependencies/register-regions.js"
if registration_path.exists():
    registration = registration_path.read_text(encoding="utf-8")
    for expected in (
        "id: 'misthalin-fort-forinthry'",
        "id: 'misthalin-city-of-um'",
        "dashboardRegionId: 'misthalin'",
    ):
        if expected not in registration:
            errors.append(f"Progression-area registration is missing: {expected}")

city_path = ROOT / "features/dependencies/city-of-um-data.js"
if city_path.exists():
    city_data = city_path.read_text(encoding="utf-8")
    for expected in (
        "locality: 'City of Um'",
        "region: 'Misthalin'",
        "um-quest-necromancy",
        "achievementSets",
        "underworld-achievement-tiers",
    ):
        if expected not in city_data:
            errors.append(f"City of Um model is missing: {expected}")

achievement_path = ROOT / "features/dependencies/achievement-set-engine.js"
if achievement_path.exists():
    achievement_engine = achievement_path.read_text(encoding="utf-8")
    for expected in ("class AchievementSetEngine", "completedCount", "readyCount", "percent"):
        if expected not in achievement_engine:
            errors.append(f"Achievement checklist engine is missing: {expected}")

tracker_js_path = ROOT / "features/dependencies/task-tracker-enhancements.js"
if tracker_js_path.exists():
    tracker_js = tracker_js_path.read_text(encoding="utf-8")
    for expected in (
        "taskFilterLayout",
        "taskRegionOptions",
        "taskRegionSelectAll",
        "taskRegionClear",
        "Havenhythe",
        "difficultyFor",
    ):
        if expected not in tracker_js:
            errors.append(f"Task Tracker enhancement is missing: {expected}")

tracker_css_path = ROOT / "features/dependencies/task-tracker-enhancements.css"
if tracker_css_path.exists():
    tracker_css = tracker_css_path.read_text(encoding="utf-8")
    for expected in (
        ".task-filter-layout",
        ".task-region-grid",
        ".task-type-easy",
        ".task-type-medium",
        ".task-type-hard",
        ".task-type-elite",
        ".task-type-master",
    ):
        if expected not in tracker_css:
            errors.append(f"Task Tracker style is missing: {expected}")

removal_path = ROOT / "features/dependencies/route-planner-removal.js"
if removal_path.exists():
    removal = removal_path.read_text(encoding="utf-8")
    if "Route Planner" not in removal:
        errors.append("Route Planner removal safeguard is incomplete")

build_path = ROOT / "tools/build_netlify.py"
if build_path.exists():
    build = build_path.read_text(encoding="utf-8")
    for expected in (
        "EXPECTED_TASKS = 533",
        "EXPECTED_POINTS = 11110",
        "load_equilibrium_tasks",
        "replace_embedded_tasks",
        "task-tracker-enhancements.css",
        "task-tracker-enhancements.js",
        "route-planner-removal.js",
    ):
        if expected not in build:
            errors.append(f"Equilibrium build migration is missing: {expected}")

# The Route Planner was intentionally removed. Old planner assets must not be
# required by validation or reintroduced into the production build.
for obsolete in (
    "features/dependencies/route-action-controls.js",
    "features/dependencies/simple-route-planner.js",
    "features/dependencies/route-list-view.css",
):
    if obsolete in build_path.read_text(encoding="utf-8", errors="replace"):
        errors.append(f"Removed Route Planner asset is still enabled by the build: {obsolete}")

if errors:
    print("Project validation failed:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Project validation passed")
