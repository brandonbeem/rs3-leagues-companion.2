from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    ROOT / "index.html",
    ROOT / "netlify.toml",
    ROOT / "features/dependencies/dependency-engine.js",
    ROOT / "features/dependencies/achievement-set-engine.js",
    ROOT / "features/dependencies/region-registry.js",
    ROOT / "features/dependencies/fort-forinthry-data.js",
    ROOT / "features/dependencies/city-of-um-data.js",
    ROOT / "features/dependencies/register-regions.js",
    ROOT / "features/dependencies/region-explorer-enhancement.js",
    ROOT / "features/dependencies/region-explorer-enhancement.css",
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

registry = (ROOT / "features/dependencies/region-registry.js").read_text(encoding="utf-8")
if "parentRegion" not in registry:
    errors.append("Progression-area registry must require parentRegion")

registration = (ROOT / "features/dependencies/register-regions.js").read_text(encoding="utf-8")
for expected in (
    "id: 'misthalin-fort-forinthry'",
    "id: 'misthalin-city-of-um'",
    "dashboardRegionId: 'misthalin'",
):
    if expected not in registration:
        errors.append(f"Progression-area registration is missing: {expected}")

city_data = (ROOT / "features/dependencies/city-of-um-data.js").read_text(encoding="utf-8")
for expected in (
    "locality: 'City of Um'",
    "region: 'Misthalin'",
    "um-quest-necromancy",
    "achievementSets",
    "underworld-achievement-tiers",
):
    if expected not in city_data:
        errors.append(f"City of Um model is missing: {expected}")

achievement_engine = (ROOT / "features/dependencies/achievement-set-engine.js").read_text(encoding="utf-8")
for expected in ("class AchievementSetEngine", "completedCount", "readyCount", "percent"):
    if expected not in achievement_engine:
        errors.append(f"Achievement checklist engine is missing: {expected}")

region_explorer = (ROOT / "features/dependencies/region-explorer-enhancement.js").read_text(encoding="utf-8")
for expected in ("Region Explorer", "Search regions", "rs3:league-region-selected", "Plan with this region"):
    if expected not in region_explorer:
        errors.append(f"Region Explorer enhancement is missing: {expected}")

if errors:
    print("Project validation failed:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Project validation passed")
