from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
DIST = ROOT / "dist"
DEPENDENCY_DIR = ROOT / "features" / "dependencies"

STYLE_PATH = "features/dependencies/fort-integration.css"
SCRIPT_PATHS = [
    "features/dependencies/fort-forinthry-data.js",
    "features/dependencies/dependency-engine.js",
    "features/dependencies/fort-integration.js",
]

html = SOURCE.read_text(encoding="utf-8")

if not html.strip():
    raise SystemExit("index.html is empty")
if "RS3 Leagues Companion v21" not in html:
    raise SystemExit("Expected the v21 standalone app in index.html")
if "</head>" not in html or "</body>" not in html:
    raise SystemExit("Could not find required HTML closing tags")

if STYLE_PATH not in html:
    html = html.replace("</head>", f'  <link rel="stylesheet" href="{STYLE_PATH}">\n</head>', 1)

script_tags = "\n".join(f'  <script src="{path}"></script>' for path in SCRIPT_PATHS)
if SCRIPT_PATHS[-1] not in html:
    html = html.replace("</body>", f"{script_tags}\n</body>", 1)

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir(parents=True)
(DIST / "index.html").write_text(html, encoding="utf-8")
shutil.copytree(DEPENDENCY_DIR, DIST / "features" / "dependencies")

print("Built RS3 Leagues Companion v21 with interactive Fort Forinthry test planner")
