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
    "features/dependencies/relic-planner-registry.css",
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
    "features/dependencies/relic-extra-data.js",
    "features/dependencies/relic-planner-registry.js",
    "features/dependencies/relic-extra-register.js",
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
        "\n", html, flags=re.IGNORECASE,
    )
for path in removed_scripts:
    html = re.sub(
        rf'\s*<script\b[^>]*src=["\']{re.escape(path)}["\'][^>]*>\s*</script>\s*',
        "\n", html, flags=re.IGNORECASE,
    )

# Remove any earlier attempts so every managed asset has one predictable load.
for path in [*styles, *scripts, *relic_scripts]:
    html = re.sub(
        rf'\s*<link\b[^>]*href=["\']{re.escape(path)}["\'][^>]*>\s*',
        "\n", html, flags=re.IGNORECASE,
    )
    html = re.sub(
        rf'\s*<script\b[^>]*src=["\']{re.escape(path)}["\'][^>]*>\s*</script>\s*',
        "\n", html, flags=re.IGNORECASE,
    )

for path in styles:
    html = html.replace("</head>", f'  <link rel="stylesheet" href="{path}">\n</head>', 1)

# The legacy planner initializes first. The old V20.2 files are retained for
# their detailed reference text. A normalized data file then feeds the generic
# registry directly, so the five additional relics no longer depend on hidden
# globals or the embedded fixed 10-relic array.
for path in [*scripts, *relic_scripts]:
    html = html.replace("</body>", f'  <script src="{path}"></script>\n</body>', 1)

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
        raise SystemExit(f"Removed Route Planner or obsolete relic asset leaked into production: {path}")
for path in relic_scripts[:6]:
    output = DIST / path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Relic expansion asset is missing from build output: {path}")
for path in (
    "features/dependencies/relic-extra-data.js",
    "features/dependencies/relic-planner-registry.js",
    "features/dependencies/relic-extra-register.js",
    "features/dependencies/relic-planner-registry.css",
):
    output = DIST / path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Extensible relic registry asset is missing from build output: {path}")

INDEX.write_text(html, encoding="utf-8")
print("Applied current Task Tracker layout, loaded 15-relic registry data, and kept Route Planner removed")
