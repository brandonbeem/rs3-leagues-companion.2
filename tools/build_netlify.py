from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
DIST = ROOT / "dist"
PATCH_DIR = ROOT / "relics-v20-2"

MARKER = '</script>\n  <script data-source="js/features/relics-regions-build.js">'
SCRIPTS = [
    "devout.js",
    "icyenic-faith.js",
    "rejuvenated.js",
    "perkfection.js",
    "animal-wrangler.js",
    "finalize.js",
]

html = SOURCE.read_text(encoding="utf-8")
if MARKER not in html:
    raise SystemExit("Could not find the relic feature script marker in index.html")

tags = "\n".join(
    f'  <script src="relics-v20-2/{name}"></script>'
    for name in SCRIPTS
)
replacement = f'</script>\n{tags}\n  <script data-source="js/features/relics-regions-build.js">'
html = html.replace(MARKER, replacement, 1)
html = html.replace(
    "<title>RS3 Leagues Companion v20</title>",
    "<title>RS3 Leagues Companion v20.2</title>",
    1,
)
html = html.replace(
    '<meta name="application-version" content="20.0.0">',
    '<meta name="application-version" content="20.2.0">',
    1,
)

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir(parents=True)
(DIST / "index.html").write_text(html, encoding="utf-8")
shutil.copytree(PATCH_DIR, DIST / "relics-v20-2")
print("Built V20.2 Netlify output in dist/")
