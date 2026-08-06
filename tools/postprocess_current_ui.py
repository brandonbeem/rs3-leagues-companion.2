from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
INDEX = DIST / "index.html"
RELIC_SOURCE = ROOT / "relics-v20-2"
RELIC_DESTINATION = DIST / "relics-v20-2"
html = INDEX.read_text(encoding="utf-8")

styles = [
    "features/dependencies/task-tracker-enhancements.css",
]
scripts = [
    "features/dependencies/route-planner-removal.js",
    "features/dependencies/task-tracker-enhancements.js",
]
relic_scripts = [
    "relics-v20-2/devout.js",
    "relics-v20-2/icyenic-faith.js",
    "relics-v20-2/rejuvenated.js",
    "relics-v20-2/perkfection.js",
    "relics-v20-2/animal-wrangler.js",
    "relics-v20-2/finalize.js",
]
removed_styles = [
    "features/dependencies/region-planner.css",
    "features/dependencies/route-list-view.css",
    "features/dependencies/task-lanes.css",
    "features/dependencies/route-action-controls.css",
    "features/dependencies/simple-route-planner.css",
]
removed_scripts = [
    "features/dependencies/route-action-controls.js",
    "features/dependencies/misthalin-progression-data.js",
    "features/dependencies/simple-route-planner.js",
    "relics-v20-2/refresh.js",
]

for path in removed_styles:
    html = re.sub(
        rf'\s*<link\b[^>]*href=["\']{re.escape(path)}["\'][^>]*>\s*',
        "\n",
        html,
        flags=re.IGNORECASE,
    )
for path in removed_scripts:
    html = re.sub(
        rf'\s*<script\b[^>]*src=["\']{re.escape(path)}["\'][^>]*>\s*</script>\s*',
        "\n",
        html,
        flags=re.IGNORECASE,
    )

for path in styles:
    if path not in html:
        html = html.replace("</head>", f'  <link rel="stylesheet" href="{path}">\n</head>', 1)
for path in scripts:
    if path not in html:
        html = html.replace("</body>", f'  <script src="{path}"></script>\n</body>', 1)

# The five relic patches must load before relics-regions-build.js renders the
# planner. Loading them at the end of the document is too late: the planner has
# already frozen its 10-card list by then.
for path in relic_scripts:
    html = re.sub(
        rf'\s*<script\b[^>]*src=["\']{re.escape(path)}["\'][^>]*>\s*</script>\s*',
        "\n",
        html,
        flags=re.IGNORECASE,
    )
relic_marker = '<script data-source="js/features/relics-regions-build.js">'
if relic_marker not in html:
    raise SystemExit("Could not find the relic planner build marker in generated index.html")
relic_tags = "\n".join(f'  <script src="{path}"></script>' for path in relic_scripts)
html = html.replace(relic_marker, relic_tags + "\n  " + relic_marker, 1)

if not RELIC_SOURCE.exists():
    raise SystemExit("V20.2 relic source directory is missing")
if RELIC_DESTINATION.exists():
    shutil.rmtree(RELIC_DESTINATION)
shutil.copytree(RELIC_SOURCE, RELIC_DESTINATION)

for path in [*styles, *scripts, *relic_scripts]:
    if html.count(path) != 1:
        raise SystemExit(f"Current UI asset must appear exactly once: {path}")
for path in [*removed_styles, *removed_scripts]:
    if path in html:
        raise SystemExit(f"Removed Route Planner or obsolete refresh asset leaked into production: {path}")
for path in relic_scripts:
    output = DIST / path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Relic expansion asset is missing from build output: {path}")

INDEX.write_text(html, encoding="utf-8")
print("Applied current Task Tracker layout, loaded five V20.2 relics before planner render, and kept Route Planner removed")
