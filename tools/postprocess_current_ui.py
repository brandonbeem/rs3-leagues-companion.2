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
    "features/dependencies/relic-planner-stability.css",
    "features/dependencies/league-atlas-phase2.css",
]
scripts = [
    "features/dependencies/route-planner-removal.js",
    "features/dependencies/task-tracker-enhancements.js",
    "features/dependencies/relic-planner-stability.js",
    "features/dependencies/league-atlas-phase2.js",
]

# These are the five additional relic records plus the v20.2 finalizer. In the
# known-good v20.2 file, this data exists before relics-regions-build.js creates
# CONST.relics. Loading it at the end of <body> is too late because the planner
# has already frozen and rendered the original ten relics.
relic_scripts = [
    "relics-v20-2/devout.js",
    "relics-v20-2/icyenic-faith.js",
    "relics-v20-2/rejuvenated.js",
    "relics-v20-2/perkfection.js",
    "relics-v20-2/animal-wrangler.js",
    "relics-v20-2/finalize.js",
]

obsolete_relic_assets = [
    "features/dependencies/relic-planner-registry.css",
    "features/dependencies/relic-planner-registry.js",
    "features/dependencies/relic-extra-data.js",
    "features/dependencies/relic-extra-register.js",
    "relics-v20-2/refresh.js",
]
removed_styles = [
    "features/dependencies/region-planner.css",
    "features/dependencies/route-list-view.css",
    "features/dependencies/task-lanes.css",
    "features/dependencies/route-action-controls.css",
    "features/dependencies/simple-route-planner.css",
    *[path for path in obsolete_relic_assets if path.endswith(".css")],
]
removed_scripts = [
    "features/dependencies/route-action-controls.js",
    "features/dependencies/misthalin-progression-data.js",
    "features/dependencies/simple-route-planner.js",
    *[path for path in obsolete_relic_assets if path.endswith(".js")],
]


def remove_style(path: str) -> None:
    global html
    html = re.sub(
        rf'\s*<link\b[^>]*href=["\']{re.escape(path)}["\'][^>]*>\s*',
        "\n",
        html,
        flags=re.IGNORECASE,
    )


def remove_script(path: str) -> None:
    global html
    html = re.sub(
        rf'\s*<script\b[^>]*src=["\']{re.escape(path)}["\'][^>]*>\s*</script>\s*',
        "\n",
        html,
        flags=re.IGNORECASE,
    )


for path in [*removed_styles, *styles]:
    remove_style(path)
for path in [*removed_scripts, *scripts, *relic_scripts]:
    remove_script(path)

for path in styles:
    html = html.replace("</head>", f'  <link rel="stylesheet" href="{path}">\n</head>', 1)

# Match the working v20.2 architecture: inject the extra relic data immediately
# before the relic planner build script. Its syncRelicReferenceData() call then
# merges all fifteen records before CONST.relics is constructed.
relic_marker = '<script data-source="js/features/relics-regions-build.js">'
if relic_marker not in html:
    raise SystemExit("Could not find relics-regions-build.js marker in generated index.html")
relic_tags = "\n".join(f'  <script src="{path}"></script>' for path in relic_scripts)
html = html.replace(relic_marker, f'{relic_tags}\n  {relic_marker}', 1)

# Current Task Tracker, Route Planner-removal behavior, Relic Planner stability,
# and the Phase 2 League Atlas can load after the app.
for path in scripts:
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
for path in relic_scripts:
    output = DIST / path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Relic expansion asset is missing from build output: {path}")
for path in (
    "features/dependencies/relic-planner-stability.css",
    "features/dependencies/relic-planner-stability.js",
    "features/dependencies/league-atlas-phase2.css",
    "features/dependencies/league-atlas-phase2.js",
):
    output = DIST / path
    if not output.exists() or output.stat().st_size == 0:
        raise SystemExit(f"Current UI asset is missing from build output: {path}")

marker_position = html.index(relic_marker)
for path in relic_scripts:
    if html.index(path) > marker_position:
        raise SystemExit(f"Relic data loaded too late, after planner initialization: {path}")

INDEX.write_text(html, encoding="utf-8")
print("Applied Task Tracker layout, restored working 15-relic initialization order, stabilized Relic Planner scrolling, added the Phase 2 League Atlas, and kept Route Planner removed")
