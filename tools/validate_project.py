from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    ROOT / "index.html",
    ROOT / "netlify.toml",
    ROOT / "features/dependencies/dependency-engine.js",
    ROOT / "features/dependencies/region-registry.js",
    ROOT / "features/dependencies/fort-forinthry-data.js",
    ROOT / "features/dependencies/register-regions.js",
    ROOT / "features/dependencies/region-planner.js",
    ROOT / "features/dependencies/region-planner.css",
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

# Validate stable HTML structure instead of a brittle version-specific title.
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
if "parentRegion: 'Misthalin'" not in registration:
    errors.append("Fort Forinthry must be registered beneath Misthalin")

if errors:
    print("Project validation failed:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Project validation passed")
