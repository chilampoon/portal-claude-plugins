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
- **Pass or soft pass** — deliberately less. Your weaknesses or risks section as
  written into Key Risks, the decision posted as a Narrative updates comment, plus
  the stage and date. Nobody reads a teardown on a dead company.
- **Ambiguous or missing** — Claude asks. It never guesses a stage.

**The copy step does not interpret.** Claude decides *where* your content goes
and makes sure none of it is lost; it does not change the words. Nothing is
tightened, reordered, ranked, reframed or summarised on the way into a field —
layout only. If you want a field to open with the conclusion, write it that way
in your note. Interpretation belongs in the triage, not in the copy.

**There is no fixed field map, but there is a checklist.** Portal's triage docs
don't follow one template, so Claude proposes where each piece goes rather than
following a fixed map. It does, however, check both directions before showing
you anything: every section of your note reaches a field, and every field on the
pre-meeting triage checklist is either filled or named as "nothing in the note
for this". The checklist in `SKILL.md` is a first draft from the current landing
spots — Strengths, Key Risks, Questions for Company, Tech: Summary, Team
Analysis, Company: Next Steps, Value Proposition, Past Sources of Funding,
Secret Sauce, the stage and date, and the comment. Confirm it with the team and
edit it there.

**Existing content is shown beside what's proposed.** The proposal table has an
Existing column with what is on the record now, in full, so an earlier
colleague's triage is read next to yours rather than buried under it. For an
empty field, appending is the default. For a field that already has content
there is no default: you choose append, replace or leave for that row, and a
replace still takes its own yes. Appends go under a dated
`**Triage — <Author>, <date>**` header.

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

**Layout, not wording.** Questions for Company come back grouped under their
subheadings — Scientific, Regulatory, IP & Business, Market, Team — and numbered
within each group, one question per line, because someone is going to work down
that list in front of the company. Every other field keeps your order and your
words: prose stays prose, bullets stay bullets. The `**Triage — <name>, <date>**`
header is a boundary marker, not a byline: it appears only where your text is
going underneath someone else's, never stamped down every field on the record.

**Secret Sauce is offered as a draft, before the copy.** If your note has a
differentiation section, it goes in as written like everything else. If it has
strengths and a technology description but no Secret Sauce section, Claude offers
a draft — *Their claim* / *Assessment*, every fact from your note — clearly
labelled as a draft and separate from the proposal table. You edit it, file it
as your own, or decline. Only text you have made yours reaches the field, marked
*copied by Claude* like any other block, because you are its author and the
plugin only placed it. Declined means empty.

**Two markers, and the verb matters.** Every block the plugin places — field
content and the Narrative updates comment — ends with
`_(copied by Claude <model>, <date>)_`: your words, placed word for word as you
approved them. The two things Claude actually writes, the stage-change reply and
the Diligence support changelog, end with `_(drafted by Claude <model>, <date>)_`.
Nothing says "summarized", because nothing is.

**It reads a field before it writes to one.** A field's name is not its
definition, and the Deal Flow page relabels things: **Origin** is called "Notes"
in the schema and records where the deal came from, **Strengths** is called
"Venture: Investment Rationale". Claude maps page labels through that list, reads
what is actually in any unlisted field before proposing it, and puts no workflow
metadata (filenames, field lists, run summaries) on the record at all. Origin is
never written to.

**Your recommendation is posted as a comment.** Narrative updates is the record's
comment thread rather than a field, so it goes up through a separate call after
the fields are written: what was decided, what that changes from where the
company stood before triage, and briefly whose note it came from — "Source:
Chi-Lam's pre-triage notes (2026-09-10)" — ending with a route to the full note,
so anyone reading the record can get to the reasoning behind the decision. Claude
asks you which you prefer: paste a SharePoint link, which goes on the comment's
last line, or attach the file to the Narrative updates thread yourself, in which
case the comment says it is attached there. Comments cannot be edited or deleted
once posted, so Claude shows you the exact text first and posts only on your yes.

## Limitations

**Claude cannot upload images or attachments.** The Airtable MCP has no
attachment-upload tool — attachments can only be set from a URL Airtable fetches
for itself, and we have nowhere to host one. So Claude flags every figure, chart
or pasted slide it finds in your note and asks you to drop them into the
attachment field yourself.

**Claude cannot attach the full note.** Airtable's comment API takes text only,
and the official Airtable MCP has no file-upload tool at all, so the Word doc
cannot be put on the record through this plugin. That is why it asks you for a
SharePoint link or to attach the file to the thread yourself — the Airtable UI
allows what the API does not.

**The Microsoft 365 connector is optional.** The plugin bundles it for the two
emails, but nothing in the Airtable half depends on it. Skip it and Claude prints
the emails for you to send by hand.

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
