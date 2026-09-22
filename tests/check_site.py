"""Static regression checks; only Python's standard library is required."""

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "quienes-somos.html", "servicios.html", "proyectos.html", "contacto.html"]


class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.id_references = []
        self.h1_count = 0
        self.filename = filename
        self.feed((ROOT / filename).read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"{self.filename}: duplicate ID {attrs['id']}"
            self.ids.add(attrs["id"])
        for attribute in ("aria-controls", "aria-labelledby", "aria-describedby", "for"):
            self.id_references.extend(attrs.get(attribute, "").split())
        if tag == "h1":
            self.h1_count += 1
        if tag == "img":
            assert "alt" in attrs, f"{self.filename}: image without alt"
        if tag == "html":
            assert attrs.get("lang") == "es", f"{self.filename}: missing Spanish lang"
        if tag == "a":
            assert "XXX" not in attrs.get("href", ""), f"{self.filename}: placeholder phone link"
        for attribute in ("href", "src", "poster"):
            if attrs.get(attribute):
                self.references.append(attrs[attribute])


def check(base_url=None):
    pages = {filename: Page(filename) for filename in PAGES}
    resources = set(PAGES)
    for filename, page in pages.items():
        assert page.h1_count == 1, f"{filename}: expected exactly one H1"
        for identifier in page.id_references:
            assert identifier in page.ids, f"{filename}: missing label or control target {identifier}"
        for reference in page.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                continue
            target = unquote(url.path) or filename
            assert (ROOT / target).is_file(), f"{filename}: missing {target}"
            resources.add(target)
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, f"{filename}: missing anchor {reference}"

    # Include every image, even if a lazy-loaded section has not been scrolled into view.
    resources.update(str(path.relative_to(ROOT)) for path in (ROOT / "assets/images").glob("*.jpg"))
    if base_url:
        for resource in sorted(resources):
            request = Request(urljoin(base_url.rstrip("/") + "/", resource), method="HEAD")
            with urlopen(request, timeout=10) as response:
                assert response.status == 200, f"HTTP {response.status}: {resource}"
    print(f"OK: {len(pages)} pages, anchors, IDs, image descriptions, and {len(resources)} local resources.")
    if base_url:
        print("OK: all local resources returned HTTP 200.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", help="Optional local preview URL for HTTP checks")
    check(parser.parse_args().url)
