from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "dist" / "index.html"
html = INDEX.read_text(encoding="utf-8")

styles = [
    "features/dependencies/task-tracker-enhancements.css",
]
scripts = [
    "features/dependencies/route-planner-removal.js",
    "features/dependencies/task-tracker-enhancements.js",
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

for path in [*styles, *scripts]:
    if html.count(path) != 1:
        raise SystemExit(f"Current UI asset must appear exactly once: {path}")
for path in [*removed_styles, *removed_scripts]:
    if path in html:
        raise SystemExit(f"Removed Route Planner asset leaked into production: {path}")

INDEX.write_text(html, encoding="utf-8")
print("Applied current Task Tracker layout and kept Route Planner removed")
