from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
DIST = ROOT / "dist"
DEPENDENCY_DIR = ROOT / "features" / "dependencies"

STYLE_PATH = "features/dependencies/region-planner.css"
SCRIPT_PATHS = [
    "features/dependencies/dependency-engine.js",
    "features/dependencies/region-registry.js",
    "features/dependencies/fort-forinthry-data.js",
    "features/dependencies/register-regions.js",
    "features/dependencies/region-planner.js",
]

subprocess.run([sys.executable, str(ROOT / "tools" / "validate_project.py")], check=True)

html = SOURCE.read_text(encoding="utf-8")

if STYLE_PATH not in html:
    html = html.replace("</head>", f'  <link rel="stylesheet" href="{STYLE_PATH}">\n</head>', 1)

script_tags = "\n".join(f'  <script src="{path}"></script>' for path in SCRIPT_PATHS)
if SCRIPT_PATHS[-1] not in html:
    html = html.replace("</body>", f"{script_tags}\n</body>", 1)

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir(parents=True, exist_ok=True)
(DIST / "index.html").write_text(html, encoding="utf-8")

feature_destination = DIST / "features" / "dependencies"
feature_destination.parent.mkdir(parents=True, exist_ok=True)
shutil.copytree(DEPENDENCY_DIR, feature_destination)

for relative_path in [STYLE_PATH, *SCRIPT_PATHS]:
    output = DIST / relative_path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Build output missing required asset: {relative_path}")

print(f"Built {DIST / 'index.html'}")
print("Included progression-area hierarchy and generic Region Planner assets")
