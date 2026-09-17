# Triage Note Updates — Claude plugin

Files startup triage notes into Airtable. Someone uploads their triage note (Word
doc, PDF) or pastes it from an email, and Claude organizes it into Portal's triage
template and appends it to that company's Deal Flow record in the Venture base,
after they confirm.

Companion to **investor-meeting-summary**, which does the same job for investor
meetings. That one reads Otter and writes to the VC CRM; this one reads a
document and writes to the startup record.

## What's inside

```
triage-note-updates/
├── .claude-plugin/plugin.json          # plugin metadata shown in the catalog
├── skills/update-triage-notes/
│   └── SKILL.md                        # the workflow — triggers on "here are my triage notes on [company]"
├── scripts/extract_docx.py             # stdlib-only .docx/.pdf text extraction, for when Claude has a shell
├── .mcp.json                           # bundles the Airtable connector
└── README.md
```

## Where the notes land

The "Deals" interface shows each company through a record page backed by the
**Startups** table. Each triage section is appended to one rich-text field on
that record:

| Triage section | Airtable field |
| --- | --- |
| Startup Overview | Value Proposition |
| Strengths | Secret Sauce |
| Weaknesses | Key Risks |
| Obstacles | Outstanding Key Issues |
| Questions | Questions for Company |
| Recommendation | Rationale for Venture Evaluation |

Existing content is never overwritten — a new triage note is appended under a
`**Triage — <Author>, <date>**` header, matching how the base already reads.

Deliberately out of scope: **Pipeline Stage** is never touched (it fires
automations that email the venture team), and neither is **Investment Chain of
Logic**, which is a diligence-stage artifact rather than a triage one.

Table, field and page IDs in `SKILL.md` were pulled from the live "Venture" base
schema on 17 Sep 2026, so the workflow survives cosmetic renames. If the schema
changes, update the Configuration section and re-upload.

## Using it

Each person authenticates Airtable with their own account on first use, so Claude
only sees what they can see. Then they just say:

> Here are my triage notes on Veil Therapeutics — add them to Airtable.

...with the Word doc attached, or the email pasted in.

## Distributing

Same as the other plugin — see the repo root `README.md`. Either upload a zip of
this folder under Organization settings > Plugins, or let the GitHub-synced
marketplace pick it up from `.claude-plugin/marketplace.json`.
