# Triage Note Updates — Claude plugin

Files startup triage notes into Airtable and finishes the triage. Someone hands
Claude their triage note (Word doc, PDF, or pasted from an email), and Claude
works out where each piece of it belongs on the company's Deal Flow record in
the Venture base, moves the Pipeline Stage to match the decision, and replies to
the notification Airtable sends the fellows — all of it after they have said yes.

> **Not yet run end to end.** The workflow has been reasoned through against a
> real triage doc, but never executed against a live record, and the email path in
> particular is completely unexercised. On the first real run, check two things:
> that the 20-second wait is long enough for the notification to arrive, and
> whether it attributes the move to you or comes back unattributed — the Startups
> table has a formula field called "Modified by Anonymous?", which suggests API
> writes have shown up without a name before. If that happens the email still
> sends, just without yours on it.

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
├── .mcp.json                           # bundles Airtable, plus Microsoft 365 for the reply
└── README.md
```

## How a run goes

**The decision routes everything.** The note usually ends with a recommendation,
and Claude reads it before planning any write:

- **Meet or advance** — the full treatment. Claude reads the live table schema
  and proposes which fields fit the content actually in the note.
- **Pass or soft pass** — deliberately less. The reason for the stage change, the
  risks framed as what would have to change for us to re-engage, the full note
  archived in **Notes**, and the stage and date. Nobody reads a teardown on a
  dead company.
- **Ambiguous or missing** — Claude asks. It never guesses a stage.

**There is no fixed field map.** Portal's triage docs don't follow one template,
so the plugin doesn't pretend they do. Claude proposes a mapping as a table —
field, append or replace, and the exact content — and writes nothing until you
confirm or edit it. Appending is the default, under a dated
`**Triage — <Author>, <date>**` header; replacing takes its own yes.

**Pipeline Stage is writable now**, because moving the stage is what finishing
triage means. It gets its own confirmation showing the old value and the new one,
with a reminder that the write fires Airtable automations: "Pipeline Stage Change"
emails the venture fellows, and "Pipeline History - Record Updated" writes a Stage
History row. Airtable treats an API write like a manual edit, so the plugin can
neither send that email itself nor suppress it. Moving a company to `0.0 - Outside
of Core Geographies` is called out separately, because it can email outside the
team.

**The stage-change note is written once and used twice**: appended to the record,
and used as the body of a reply-all on the notification Airtable just sent. Not on
the intake thread the note came from — that one stays untouched. Claude waits for
the notification to land, checks the stages in it match what it just wrote, shows
you the draft and the full recipient list, and sends only when you say so. It
reaches the whole fellows list, so it gets its own yes on top of every other gate.
Without a mail tool, or if the notification hasn't shown up, Claude prints the text
for you to send and says which it is.

**Diligence support gets a changelog.** Any run that writes emails the people
named on the record's Diligence support field — company, record link, the stage
move if there was one, and a line per field touched. Recipients are resolved out
of Airtable all the way to email addresses, never guessed from a name, and shown
to you as name and address; nothing sends until you say so. Anyone who will not
resolve stops the send rather than getting left off it.

**What it writes has a shape.** Questions for Company come back grouped under
their subheadings — Scientific, Regulatory, IP & Business, Market, Team — and
numbered within each group, one question per line, because someone is going to
work down that list in front of the company. Every other field leads with the
point, bullets the evidence under it, and closes with the takeaway. The
`**Triage — <name>, <date>**` header is a boundary marker, not a byline: it
appears only where your text is going underneath someone else's, never stamped
down every field on the record.

**Secret Sauce is reasoned, not copied.** Your Strengths section goes to the
Strengths field as you wrote it. Secret Sauce is a separate question — what this
company has that others do not, usually the strongest strengths fused with
something specific about the technology — so Claude composes it from your note
and signs it. If the note does not support a real claim of differentiation, it
stays empty and Claude says so.

**Claude signs what Claude wrote.** Anything it composed — content condensed from
your note, the stage-change note, the reply — ends with
`_(summarized by Claude <model>, <date>)_`. Your own words, including the
full note archived into Notes, are never signed that way.

**It reads a field before it writes to one.** A field's name is not its
definition — "Origin" records where the deal came from, not where your note came
from — so Claude checks what is actually in a field before proposing it, and puts
no workflow metadata (filenames, field lists, run summaries) on the record at all.

## Limitations

**Claude cannot upload images or attachments.** The Airtable MCP has no
attachment-upload tool — attachments can only be set from a URL Airtable fetches
for itself, and we have nowhere to host one. So Claude flags every figure, chart
or pasted slide it finds in your note and asks you to drop them into the
attachment field yourself.

**The mail connector is optional.** The plugin bundles Microsoft 365 for the
reply, but nothing in the Airtable half depends on it. Skip it and Claude prints
the reply for you to send by hand.

## Using it

Each person authenticates Airtable — and Microsoft 365, if they want the reply
sent for them — with their own account on first use, so Claude only sees what they
can see, and writes and sends as them. Then they just say:

> Here are my triage notes on Veil Therapeutics — add them to Airtable.

...with the Word doc attached, or the email pasted in.

## Distributing

Same as the other plugin — see the repo root `README.md`. Either upload a zip of
this folder under Organization settings > Plugins, or let the GitHub-synced
marketplace pick it up from `.claude-plugin/marketplace.json`.
