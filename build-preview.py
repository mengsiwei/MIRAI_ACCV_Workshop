#!/usr/bin/env python3
"""
Build a single self-contained HTML file from the site, for sharing a preview
before the site is pushed to GitHub Pages.

The preview is generated from index.html / style.css / sakura.js so it never
drifts from the real site. Everything external is inlined or removed, because
the Artifact host blocks requests to other hosts (fonts, CDNs, images).

    python3 build-preview.py        # -> mirai-preview.html

The published site itself is unaffected; this file is only a viewer.
"""

import base64
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO_PX = 700           # displayed at most ~300px, so this covers 2x retina
LOGO_QUALITY = 86
OUT = os.path.join(HERE, "mirai-preview.html")


def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as fh:
        return fh.read()


def logo_data_uri():
    """Downscale the logo and return it as a data: URI."""
    path = os.path.join(HERE, "assets", "mirai-logo.jpg")
    try:
        from PIL import Image
        im = Image.open(path).convert("RGB").resize((LOGO_PX, LOGO_PX), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=LOGO_QUALITY, optimize=True, progressive=True)
        raw = buf.getvalue()
    except ImportError:
        sys.stderr.write("Pillow not found - inlining the logo at full size.\n")
        with open(path, "rb") as fh:
            raw = fh.read()
    return "data:image/jpeg;base64," + base64.b64encode(raw).decode("ascii")


def main():
    html = read("index.html")
    css = read(os.path.join("assets", "style.css"))
    js = read(os.path.join("assets", "sakura.js"))
    logo = logo_data_uri()

    # The host wraps the file in its own <!doctype>/<head>/<body>, so keep only
    # what lives inside <body> - plus the <title>, which names the page.
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    title = title.group(1).strip() if title else "MIRAI Driving @ ACCV 2026"
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if not body:
        sys.exit("Could not find <body> in index.html")
    body = body.group(1).strip()

    # External stylesheets and scripts would be blocked; inline them instead.
    body = body.replace(
        '<script src="assets/sakura.js"></script>',
        "<script>\n" + js + "\n</script>",
    )
    body = body.replace('src="assets/mirai-logo.jpg"', 'src="%s"' % logo)

    if "assets/" in body:
        leftover = sorted(set(re.findall(r'["\'](assets/[^"\']+)', body)))
        sys.exit("Unresolved external asset(s), would be blocked: %s" % leftover)

    out = "\n".join([
        "<title>%s</title>" % title,
        "<style>",
        # No webfont CDN is reachable, so fall back to a system stack. The
        # deployed site still loads Inter / Zen Maru Gothic normally.
        css.replace(
            '--font: "Inter", -apple-system',
            '--font: system-ui, -apple-system',
        ),
        "</style>",
        body,
    ])

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(out)

    print("wrote %s (%d KB)" % (os.path.basename(OUT), os.path.getsize(OUT) // 1024))


if __name__ == "__main__":
    main()
