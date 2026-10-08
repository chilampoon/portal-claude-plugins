# New Startup Form — Claude plugin

Enters a new startup into the Venture base from its pitch deck and the email
thread it arrived on. With the Microsoft 365 connector on, Claude finds both in
Outlook itself and asks for files only when that fails. It asks its questions as
it goes — one step, one answer, next step — checks the company is not already
there, drafts every field of the "Enter a new startup into Airtable" form with a
source beside each value, creates whatever the form's link fields need that does
not exist yet — a parent org in Airtable, and a pre-filled Portal contact form
for any founder missing from HubSpot — and hands the user a **pre-filled form
link**. The user types the description, attaches the
deck and clicks Submit. Then Claude finds the new record and checks every field
landed.

Nothing here drives a browser. The Chrome extension is disabled for Portal
accounts, so the plugin works through the Airtable and Microsoft 365 connectors
plus pre-filled links the user submits. HubSpot needs no connector at all: the
Portal contact-input form is reached the same way the startup form is, by link.

> **Not yet run end to end.** The workflow has been built against the live form
> schema and Airtable's documented prefill rules, but never driven through a real
> submission — deliberately, since every new Startups record emails the whole
> venture team. The first live run should watch the items under **Unverified**
> below, and should stop before Submit if the pre-filled form looks wrong.

**The human submits — this is the design, not a limitation to engineer around.**
The "New Company Form" automation fires on *record created*, waits five seconds,
and emails the team with the deck attached from field 8. So the deck has to be
on the record at the moment it is created, and the Airtable connector cannot
upload attachments. The only path that gets the deck there is the user attaching
it in the form and pressing Submit. Claude never creates Startups records and
never submits this form, including to test.

Companion to **triage-note-updates**, which picks up once the company exists.
That one files the triage; this one gets the company into the base in the first
place.

## What's inside

```
new-startup-form/
├── .claude-plugin/plugin.json          # plugin metadata shown in the catalog
├── skills/enter-new-startup/
│   └── SKILL.md                        # the workflow — triggers on "add this startup to Airtable"
├── scripts/build_prefill_url.py        # stdlib-only: {field: value} JSON → pre-filled URL (Airtable form, or --hubspot)
├── .mcp.json                           # bundles the Airtable and Microsoft 365 connectors
└── README.md
```

## How a run goes

**Outlook first, files second.** Given the company name, Claude searches the
user's mailbox for the thread, reads it, pulls the deck from it, and shows what
it found — subject, people, dates, the deck's filename — for the user to confirm.
If the connector is off, nothing turns up, or the deck is only a link, Claude
asks for the files instead. Outlook is read-only here: Claude searches and reads,
and never sends, moves or changes a message.

**It asks as it goes.** Nothing is pre-loaded into a prompt. Each step ends with
a question or a confirmation and Claude waits for the answer. The questions the
form needs from a person — who is filling it out, deal source, the introducing
investor, pipeline stage, membership stage, anything to add about how the deal
arrived, anyone to Cc — come in one short numbered message before any drafting,
each with the default Claude would propose, so "yes to all but 4" is a complete
reply.

**Duplicate check before drafting.** Claude searches Startups by name with
suffixes stripped, by website domain and by founder name, and shows candidates
with their stage and created date. A match stops the run with a link to the
existing record.

**Every value has a source.** Each field is drafted from the deck, the thread or
a web search and tagged `Deck p.4`, `Email`, `Web: <url>` or `Inferred`. Nothing
comes from Claude's own memory of the company. A founder's email has to appear in
the thread, the deck or a verifiable source, or it is left blank — Claude never
invents an address.

**One proposal table, then confirm.** Every row of the form, including the ones
left blank and why, with field 3 — the record's Origin — shown in full. Under it:
the list of founders and orgs that do not exist yet, and the emails that will
fire on creation and to whom, worked out from the Geography and the CC list.
Nothing is written anywhere until the user says go.

**Origin is the route, not the rationale.** Field 3 says how the deal reached
Portal, as fact taken from the thread: who sent or introduced the company, to
whom, when, through which channel. One or two sentences, no pasted headers or
signatures, and nothing about why we are looking — the venture team writes that
later, elsewhere on the record. The triage plugin treats the same field as
read-only for the same reason. The text ends with
`_(drafted by Claude <model>, <date>)_`, the convention for anything Claude
composes; nothing else on the form is composed.

**Description is left to the user.** Field 7 is never drafted or prefilled. The
form requires it, so the user types it in before Submit.

**Missing people go in through the Portal contact form, by link.** The startup
form's Team and Scientific Founder fields link to the "HubSpot CRM" table, which
is synced *from* HubSpot, so a founder who is not there has to exist in HubSpot
first. Claude builds a pre-filled link to the Portal contact-input form
(`hs.portalinnovations.com/portal-contact-input-form`) for each one — name,
email, company, job title, type = Startup, nearest Portal region, and the Portal
contact — shows the values beside the link, and the user submits. That form is
the canonical path, so Org Type and Portal Contact land the way Airtable's sync
expects without Claude having to replicate anything. No HubSpot connector, no
account check. A founder with no sourced email gets no link, because the form
requires one and Claude never invents an address. After the user submits, Claude
polls Airtable for up to five minutes until the sync lands. A missing parent org
goes through the "New orgnization entry" form. A missing investor org stops the
run — out of scope for this version.

**The link, then the click.** `scripts/build_prefill_url.py` turns the approved
values into a pre-filled URL — linked records by record ID, multi-selects
comma-joined, everything percent-encoded, with warnings when a list value
contains a comma or the link nears Airtable's 8,000-character cap. The user
types the description, attaches the deck, checks the two stage fields took, and
submits. Claude then finds the record created today under that name, reads back
every field, and reports anything that did not land.

## Unverified — check on the first live run

Airtable's prefill documentation says field names, form labels and field IDs are
all accepted as keys, linked records prefill by record ID, multi-selects are
comma-separated, collaborators match by username, and interface forms
(`/pag…/form`) are covered. None of that has been exercised on *this* form yet.

1. **Prefill key.** The skill uses the schema field name. If a field does not
   prefill, retry it with the field ID before assuming prefill is broken.
2. **Collaborator format** for field 2 — the user's Airtable display name, per
   the docs. If it does not take, try their email; if neither, they pick
   themselves in the form (it is a required field, so it cannot be missed).
3. **The contact form's prefill.** Its eight fields and their internal names
   were read from HubSpot's live form definition on 2026-10-08, and HubSpot
   documents query-string prefill for exactly this. What has not been exercised:
   whether the `contact_connection` dropdown accepts the person Claude proposes,
   and how long the HubSpot → Airtable sync takes for a form-submitted contact.
   Note the dropdown is a fixed list of six Portal names; someone not on it
   cannot be the Portal Contact through this form.
4. **Rich text with line breaks** in field 3 (`%0A`), and a comma inside a
   single-select value such as the parent-org type "VC, PE, family office" — the
   script warns on both; the first live run tells us whether Airtable matches
   them.
5. **Outlook attachments.** Whether the Microsoft 365 connector hands back the
   deck PDF itself or only the attachment's name. The skill reads it when it can
   and asks for the file when it cannot.

## Limitations

- **Claude cannot attach the deck.** Same root cause as the triage plugin: no
  attachment-upload tool in the Airtable connector. The user attaches it in the
  form; that is the whole reason the human submits.
- **The description is not drafted.** By design: field 7 is the user's.
- **Investor orgs are not created.** If the introducing VC (field 4.1) is not in
  the Organizations table, Claude stops and asks.
- **Microsoft 365 is optional.** Without it, the user attaches the deck and
  pastes or attaches the thread, as before.
- **A founder without a sourced email cannot be created.** The contact form
  requires one, and Claude never invents an address. That founder is listed as
  "fill by hand" and the startup form's Team field goes in without them.

## Using it

Each person authenticates Airtable — and Microsoft 365 if they want Claude to
find the thread and deck — with their own account on first use, so Claude only sees what they can see and writes as them.
Then they just say:

> Add Marrowlight Bio to Airtable.

Claude finds the thread and deck or asks for them, asks its questions, and comes
back with the proposal.

## Distributing

Same as the other plugins — see the repo root `README.md`. Either upload a zip of
this folder under Organization settings > Plugins, or let the GitHub-synced
marketplace pick it up from `.claude-plugin/marketplace.json`.
