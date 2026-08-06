from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
DIST = ROOT / "dist"
DEPENDENCY_DIR = ROOT / "features" / "dependencies"

STYLE_PATHS = [
    "features/dependencies/region-explorer-enhancement.css",
    "features/dependencies/route-action-controls.css",
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
    "features/dependencies/route-action-controls.js",
]

REMOVED_SCRIPT_PATHS = [
    "features/dependencies/region-planner.js",
    "features/dependencies/region-explorer-enhancement.js",
    "features/dependencies/region-unlocked-strip-sync.js",
    "features/dependencies/region-planner-tab-lifecycle.js",
    "features/dependencies/region-planner-dom-guard.js",
    "features/dependencies/region-planner-visibility-guard.js",
]

subprocess.run([sys.executable, str(ROOT / "tools" / "validate_project.py")], check=True)
html = SOURCE.read_text(encoding="utf-8")

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

print(f"Built {DIST / 'index.html'}")
print("Region Planner mounts natively and Route Planner action controls are injected for production")
