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
    "features/dependencies/boss-planner.css",
]
SCRIPT_PATHS = [
    "features/dependencies/dependency-engine.js",
    "features/dependencies/achievement-set-engine.js",
    "features/dependencies/region-registry.js",
    "features/dependencies/fort-forinthry-data.js",
    "features/dependencies/city-of-um-data.js",
    "features/dependencies/register-regions.js",
    "features/dependencies/region-explorer-enhancement.js",
    "features/dependencies/region-planner-dom-guard.js",
    "features/dependencies/region-planner-visibility-guard.js",
    "features/dependencies/region-unlocked-strip-sync.js",
    "features/dependencies/task-tracker-scroll-guard.js",
    "features/dependencies/boss-planner.js",
]

subprocess.run([sys.executable, str(ROOT / "tools" / "validate_project.py")], check=True)

html = SOURCE.read_text(encoding="utf-8")

# Remove stale overlay tags that may already exist in the standalone source.
html = re.sub(
    r'\s*<link\b[^>]*href=["\']features/dependencies/region-planner\.css["\'][^>]*>\s*',
    "\n",
    html,
    flags=re.IGNORECASE,
)
html = re.sub(
    r'\s*<script\b[^>]*src=["\']features/dependencies/region-planner\.js["\'][^>]*>\s*</script>\s*',
    "\n",
    html,
    flags=re.IGNORECASE,
)

# Add each asset individually. Never append the full bundle just because one new
# feature file is absent; doing that initializes existing guards more than once.
for style_path in STYLE_PATHS:
    if style_path not in html:
        html = html.replace("</head>", f'  <link rel="stylesheet" href="{style_path}">\n</head>', 1)

for script_path in SCRIPT_PATHS:
    if script_path not in html:
        html = html.replace("</body>", f'  <script src="{script_path}"></script>\n</body>', 1)

# Fail early if any managed asset was accidentally included more than once.
for managed_path in [*STYLE_PATHS, *SCRIPT_PATHS]:
    if html.count(managed_path) != 1:
        raise SystemExit(
            f"Managed asset must appear exactly once in built HTML: {managed_path} "
            f"(found {html.count(managed_path)})"
        )

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
for forbidden in (
    "features/dependencies/region-planner.css",
    "features/dependencies/region-planner.js",
    "rs3-region-planner",
):
    if forbidden in built_html:
        raise SystemExit(f"Floating Region Planner leaked into build: {forbidden}")

print(f"Built {DIST / 'index.html'}")
print("Included each feature asset exactly once, including the in-page Boss Planner")
