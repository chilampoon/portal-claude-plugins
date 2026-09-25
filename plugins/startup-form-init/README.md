# Startup Form Init — Claude plugin

Enters a new startup into the Venture base from its pitch deck and the email
thread it arrived on. Claude checks the company is not already there, drafts
every field of the "Enter a new startup into Airtable" form with a source beside
each value, creates whatever the form's link fields need that does not exist yet
— founders in HubSpot, a parent org in Airtable — and hands the user a
**pre-filled form link**. The user attaches the deck and clicks Submit. Then
Claude finds the new record and checks every field landed.

It replaces a Chrome-extension workflow where Claude clicked through the form.
This version uses the Airtable and HubSpot connectors, with no browser
automation.

> **Not yet run end to end.** The workflow has been built against the live form
> schema and Airtable's documented prefill rules, but never driven through a real
> submission — deliberately, since every new Startups record emails the whole
> venture team. The first live run should watch the four items under
> **Unverified** below, and should stop before Submit if the pre-filled form looks
> wrong.

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
startup-form-init/
├── .claude-plugin/plugin.json          # plugin metadata shown in the catalog
├── skills/enter-new-startup/
│   └── SKILL.md                        # the workflow — triggers on "add this startup to Airtable"
├── scripts/build_prefill_url.py        # stdlib-only: {field: value} JSON → pre-filled form URL
├── .mcp.json                           # bundles the Airtable + HubSpot connectors
└── README.md
```

## How a run goes

**Duplicate check first.** Before drafting anything, Claude searches Startups
by name with suffixes stripped, by website domain and by founder name, and shows
candidates with their stage and created date. A match stops the run with a link
to the existing record.

**Every value has a source.** Each field is drafted from the deck, the thread or
a web search and tagged `Deck p.4`, `Email`, `Web: <url>` or `Inferred`. Nothing
comes from Claude's own memory of the company. A founder's email has to appear in
the thread, the deck or a verifiable source, or it is left blank — Claude never
invents an address.

**One proposal table, then confirm.** Every row of the form, including the ones
left blank and why, with field 3 — the record's Origin — shown in full. Under it:
the two stage questions, which always need an explicit answer because they
trigger email; the list of founders and orgs that do not exist yet; and the
emails that will fire on creation and to whom, worked out from the Geography and
the CC list. Nothing is written anywhere until the user confirms.

**Missing people go into HubSpot, not the web form.** The form's Team and
Scientific Founder fields link to the "HubSpot CRM" table, which is synced *from*
HubSpot, so a founder who is not there has to be created in HubSpot and then
synced. Claude creates the contact through the HubSpot connector, on its own
yes, matching the properties the Portal contact-input form sets, then polls
Airtable for up to five minutes until the sync lands. A missing parent org goes
through the "New orgnization entry" form. A missing investor org stops the run —
out of scope for this version.

**The link, then the click.** `scripts/build_prefill_url.py` turns the approved
values into a pre-filled URL — linked records by record ID, multi-selects
comma-joined, everything percent-encoded, with warnings when a list value
contains a comma or the link nears Airtable's 8,000-character cap. The user
attaches the deck, checks the two stage fields took, and submits. Claude then
finds the record created today under that name, reads back every field, and
reports anything that did not land.

**Field 3 is drafted, and says so.** How the deal came in, why we are looking,
plus whatever context the user adds, with sender lines and signatures stripped.
It ends with `_(drafted by Claude <model>, <date>)_`, the same convention the
triage plugin uses for text Claude composes. Nothing else on the form is
composed, so nothing else is marked.

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
3. **HubSpot property names.** Which properties the hs-sites
   "portal-contact-input-form" sets, and their internal names, could not be read
   without HubSpot access. The skill has Claude inspect a recently form-created
   contact before its first create. Airtable's sync relies on Org Type =
   "Startup" and Portal Contact (text), so those two matter most. Also confirm
   the HubSpot → Airtable sync has no filter that an API-created contact would
   miss.
4. **Rich text with line breaks** in field 3 (`%0A`), and a comma inside a
   single-select value such as the parent-org type "VC, PE, family office" — the
   script warns on both; the first live run tells us whether Airtable matches
   them.

## Limitations

- **Claude cannot attach the deck.** Same root cause as the triage plugin: no
  attachment-upload tool in the Airtable connector. The user attaches it in the
  form; that is the whole reason the human submits.
- **Investor orgs are not created.** If the introducing VC (field 4.1) is not in
  the Organizations table, Claude stops and asks.
- **The HubSpot connector is required only when a founder is missing.** Without
  it Claude still drafts and hands over the link, with the founder fields listed
  as "fill by hand".

## Using it

Each person authenticates Airtable — and HubSpot, when a contact needs creating
— with their own account on first use, so Claude only sees what they can see and
writes as them. Then they just say:

> Add this startup to Airtable.

...with the deck attached and the email thread pasted in or attached.

## Distributing

Same as the other plugins — see the repo root `README.md`. Either upload a zip of
this folder under Organization settings > Plugins, or let the GitHub-synced
marketplace pick it up from `.claude-plugin/marketplace.json`.
