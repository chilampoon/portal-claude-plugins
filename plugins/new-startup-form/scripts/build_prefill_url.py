#!/usr/bin/env python3
"""Build a pre-filled link for one of the two forms this plugin hands the user.

Default — the Airtable "Enter a new startup into Airtable" form:

    python3 build_prefill_url.py values.json
    python3 build_prefill_url.py - < values.json

    {
      "Name": "Marrowlight Bio",
      "Geography": ["Chicago"],
      "Team": ["recAAAAAAAAAAAAAA", "recBBBBBBBBBBBBBB"],
      "Notes": "Introduced by Dana Whitfield at Redpine Ventures, who emailed the deck on 2026-09-20."
    }

Description (field 7) is deliberately absent: the user types it in the form.

The key is whatever the form accepts as a field identifier — Airtable documents
the schema field name, the form label, and the field ID as all valid; see the
README for which one this form has been confirmed to take. A JSON array becomes
a comma-separated list, which is how Airtable prefills multiple-select and
linked-record fields (linked records by record ID, never by name).

With --hubspot — the Portal contact-input form on HubSpot, for a founder who is
not yet in the HubSpot CRM table:

    python3 build_prefill_url.py --hubspot founder.json

    {
      "firstname": "Dana",
      "lastname": "Whitfield",
      "email": "dana@marrowlightbio.com",
      "company": "Marrowlight Bio",
      "jobtitle": "CEO",
      "contact_or_company_type": "Startup",
      "nearest_portal_region": "Chicago",
      "contact_connection": "Ignacio Gajer"
    }

Keys are HubSpot internal property names, passed as plain ?name=value query
parameters (no prefill_ prefix). A JSON array becomes a semicolon-separated list,
which is how HubSpot prefills multiple-checkbox fields. Select values must match
the form's option strings exactly.

In both modes a JSON null skips the field and everything is percent-encoded as
UTF-8, so line breaks in long text survive. The URL is printed to stdout;
warnings go to stderr, so the URL can be piped on its own.

Standard library only. Nothing here talks to Airtable or HubSpot.
"""

import argparse
import json
import sys
from urllib.parse import quote

AIRTABLE_BASE_ID = "appAX3sMfPtCKv4nB"
AIRTABLE_PAGE_ID = "pagpvNaXGr4eSOJF4"
HUBSPOT_CONTACT_FORM = "https://hs.portalinnovations.com/portal-contact-input-form"

# Airtable: "Prefilled form links have a maximum length of 8,000 characters."
# HubSpot documents no limit; the same ceiling is a sensible one to warn at.
HARD_LIMIT = 8000
# Leave headroom — some mail clients and chat tools truncate long links, and
# the user may still add hide_ parameters by hand.
SAFE_LIMIT = 7000

TARGETS = {
    "airtable": {"prefix": "prefill_", "list_sep": ","},
    "hubspot": {"prefix": "", "list_sep": ";"},
}


def warn(message):
    print(f"warning: {message}", file=sys.stderr)


def encode_value(name, value, list_sep):
    """Return the encoded value for one field, or None to skip it."""
    if value is None:
        return None
    if isinstance(value, bool):
        # Airtable: a Yes/No single select wants "Yes"/"No", a checkbox "true".
        # HubSpot: a single checkbox wants "true"/"false". Neither is obvious from
        # a bare boolean, so refuse and make the caller say which.
        raise ValueError(f'{name}: use the option text ("Yes"/"No") or "true", not a JSON boolean')
    if isinstance(value, dict):
        raise ValueError(f"{name}: nested objects are not a form value")
    if isinstance(value, (int, float)):
        return quote(str(value), safe="")
    if isinstance(value, list):
        parts = []
        for item in value:
            item = "" if item is None else str(item)
            if list_sep in item:
                warn(
                    f'{name}: list item "{item}" contains "{list_sep}", which the form reads as the '
                    "separator between choices, so this value will split in two. Pick a choice "
                    "without it, or leave the field for the user to fill by hand."
                )
            parts.append(quote(item, safe=""))
        # Separators between items stay literal: they are what the form documents.
        return list_sep.join(parts)
    text = str(value)
    if list_sep in text:
        warn(
            f'{name}: value contains "{list_sep}", encoded as %{ord(list_sep):02X}. That is fine for '
            "text fields. If this is a select or link field, open the link and check the option "
            "actually matched."
        )
    return quote(text, safe="")


def build_url(values, base_url, target):
    spec = TARGETS[target]
    params = []
    for name, value in values.items():
        encoded = encode_value(name, value, spec["list_sep"])
        if encoded is None:
            continue
        params.append(f"{spec['prefix']}{quote(str(name), safe='')}={encoded}")
    return base_url + ("?" + "&".join(params) if params else "")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("values", help="path to a JSON object of field → value, or - for stdin")
    parser.add_argument("--hubspot", action="store_true",
                        help="build a link to the Portal contact-input form on HubSpot instead of the Airtable form")
    parser.add_argument("--base", default=AIRTABLE_BASE_ID, help=f"Airtable base ID (default {AIRTABLE_BASE_ID})")
    parser.add_argument("--page", default=AIRTABLE_PAGE_ID, help=f"Airtable form page ID (default {AIRTABLE_PAGE_ID})")
    parser.add_argument("--form-url", default=HUBSPOT_CONTACT_FORM,
                        help=f"HubSpot form page URL, with --hubspot (default {HUBSPOT_CONTACT_FORM})")
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

    if args.hubspot:
        target, base_url = "hubspot", args.form_url
    else:
        target, base_url = "airtable", f"https://airtable.com/{args.base}/{args.page}/form"

    try:
        url = build_url(values, base_url, target)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    length = len(url)
    status = 0
    if length > HARD_LIMIT:
        warn(
            f"URL is {length} characters, over the {HARD_LIMIT}-character maximum Airtable documents "
            "(HubSpot documents none, but a link this long is unlikely to survive a mail client). "
            "Shorten the long-text fields (field 3 is the usual culprit) or leave one for the user to paste in."
        )
        status = 1
    elif length > SAFE_LIMIT:
        warn(
            f"URL is {length} characters, within the {HARD_LIMIT} maximum but past the "
            f"{SAFE_LIMIT} safe length. Some mail and chat clients truncate links this long."
        )

    print(url)
    return status


if __name__ == "__main__":
    sys.exit(main())
