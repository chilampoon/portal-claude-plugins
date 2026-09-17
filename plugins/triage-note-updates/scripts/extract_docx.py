#!/usr/bin/env python3
"""Extract plain text from a triage note.

Handles the two formats triage notes actually arrive in — .docx and .pdf — with
nothing but the standard library, so it runs wherever Claude has a shell.

    python3 extract_docx.py "Ensemble Biosystems Triage Notes.docx"
    python3 extract_docx.py "Triage Overview Template + Example.pdf"

Text goes to stdout. Only use this when the file's text is not already in the
conversation; uploads in a Claude chat are usually extracted for you.
"""

import html
import re
import sys
import zipfile
import zlib


def from_docx(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8", "replace")

    # Keep the structure Word encodes as markup before dropping the tags:
    # paragraph and row ends become newlines, tabs and breaks stay visible.
    xml = re.sub(r"</w:(?:p|tr)>", "\n", xml)
    xml = re.sub(r"<w:(?:tab|br)\s*/>", "\t", xml)
    xml = re.sub(r"</w:tc>", "\t", xml)
    text = html.unescape(re.sub(r"<[^>]+>", "", xml))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def from_pdf(path):
    with open(path, "rb") as fh:
        data = fh.read()

    chunks = []
    for match in re.finditer(rb"stream\r?\n", data):
        start = match.end()
        end = data.find(b"endstream", start)
        if end == -1:
            continue
        try:
            body = zlib.decompress(data[start:end])
        except zlib.error:
            continue  # image or already-uncompressed stream
        if b"Tj" not in body and b"TJ" not in body:
            continue

        parts = []
        for token in re.finditer(rb"\((?:\\.|[^\\()])*\)|T\*|Td|TD", body):
            raw = token.group(0)
            if raw in (b"T*", b"Td", b"TD"):
                parts.append(b"\n")
            else:
                parts.append(re.sub(rb"\\([()\\])", rb"\1", raw[1:-1]))
        chunks.append(b"".join(parts).decode("latin-1"))

    text = "\n".join(chunks)
    # Word-exported PDFs tag every run with its language; it is noise here.
    text = text.replace("en-US", "")
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: extract_docx.py <file.docx|file.pdf>")

    path = sys.argv[1]
    lower = path.lower()
    if lower.endswith(".docx"):
        print(from_docx(path))
    elif lower.endswith(".pdf"):
        print(from_pdf(path))
    else:
        sys.exit(f"unsupported file type: {path} (expected .docx or .pdf)")


if __name__ == "__main__":
    main()
