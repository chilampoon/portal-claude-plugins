#!/usr/bin/env python3
"""Build a pre-filled link for the "Enter a new startup into Airtable" form.

    python3 build_prefill_url.py values.json
    python3 build_prefill_url.py - < values.json

values.json maps a form field to the value to prefill. The key is whatever the
form accepts as a field identifier — Airtable documents the schema field name,
the form label, and the field ID as all valid; see the README for which one
this form has been confirmed to take:

    {
      "Name": "Marrowlight Bio",
      "Description": "Non-invasive liver fibrosis imaging",
      "Geography": ["Chicago"],
      "Team": ["recAAAAAAAAAAAAAA", "recBBBBBBBBBBBBBB"],
      "Notes": "Came in through Dana at Redpine.\\n\\nWhy we are looking: ..."
    }

A JSON array becomes a comma-separated list, which is how Airtable prefills
multiple-select and linked-record fields (linked records by record ID, never by
name). A JSON null skips the field. Everything is percent-encoded as UTF-8, so
line breaks in long text survive. The URL is printed to stdout; warnings go to
stderr, so the URL can be piped on its own.

Standard library only. Nothing here talks to Airtable.
"""

import argparse
import json
import sys
from urllib.parse import quote

BASE_ID = "appAX3sMfPtCKv4nB"
PAGE_ID = "pagpvNaXGr4eSOJF4"

# Airtable: "Prefilled form links have a maximum length of 8,000 characters."
HARD_LIMIT = 8000
# Leave headroom — some mail clients and chat tools truncate long links, and
# the user may still add hide_ parameters by hand.
SAFE_LIMIT = 7000


def warn(message):
    print(f"warning: {message}", file=sys.stderr)


def encode_value(name, value):
    """Return the encoded value for one field, or None to skip it."""
    if value is None:
        return None
    if isinstance(value, bool):
        # A Yes/No single select wants "Yes"/"No"; a checkbox wants "true".
        # Neither is obvious from a bare boolean, so refuse and make the caller say which.
        raise ValueError(f'{name}: use the option text ("Yes"/"No") or "true", not a JSON boolean')
    if isinstance(value, dict):
        raise ValueError(f"{name}: nested objects are not a form value")
    if isinstance(value, (int, float)):
        return quote(str(value), safe="")
    if isinstance(value, list):
        parts = []
        for item in value:
            item = "" if item is None else str(item)
            if "," in item:
                warn(
                    f'{name}: list item "{item}" contains a comma. Airtable reads the comma as the '
                    "separator between choices, so this value will split into two. Pick a choice "
                    "without a comma, or leave the field for the user to fill by hand."
                )
            parts.append(quote(item, safe=""))
        # Commas between items stay literal: they are the separator Airtable documents.
        return ",".join(parts)
    text = str(value)
    if "," in text:
        warn(
            f"{name}: value contains a comma, encoded as %2C. That is fine for text and long-text "
            "fields. If this is a single select or a link field, open the link and check the "
            "option actually matched."
        )
    return quote(text, safe="")


def build_url(values, base_id=BASE_ID, page_id=PAGE_ID):
    params = []
    for name, value in values.items():
        encoded = encode_value(name, value)
        if encoded is None:
            continue
        params.append(f"prefill_{quote(str(name), safe='')}={encoded}")
    url = f"https://airtable.com/{base_id}/{page_id}/form"
    if params:
        url += "?" + "&".join(params)
    return url


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("values", help="path to a JSON object of field → value, or - for stdin")
    parser.add_argument("--base", default=BASE_ID, help=f"base ID (default {BASE_ID})")
    parser.add_argument("--page", default=PAGE_ID, help=f"form page ID (default {PAGE_ID})")
    args = parser.parse_args(argv)

    raw = sys.stdin.read() if args.values == "-" else open(args.values, encoding="utf-8").read()
    try:
        values = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"error: input is not valid JSON ({e})", file=sys.stderr)
        return 2
    if not isinstance(values, dict):
        print("error: input must be a JSON object of field → value", file=sys.stderr)
        return 2

    try:
        url = build_url(values, args.base, args.page)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    length = len(url)
    status = 0
    if length > HARD_LIMIT:
        warn(
            f"URL is {length} characters, over Airtable's {HARD_LIMIT}-character maximum. "
            "It will not prefill. Shorten the long-text fields (field 3 is the usual culprit) "
            "or leave one for the user to paste in."
        )
        status = 1
    elif length > SAFE_LIMIT:
        warn(
            f"URL is {length} characters, within Airtable's {HARD_LIMIT} maximum but past the "
            f"{SAFE_LIMIT} safe length. Some mail and chat clients truncate links this long."
        )

    print(url)
    return status


if __name__ == "__main__":
    sys.exit(main())
