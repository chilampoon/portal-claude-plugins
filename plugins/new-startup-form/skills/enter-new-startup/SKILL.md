---
name: enter-new-startup
description: Enter a new startup into Portal's Airtable "Venture" base from its pitch deck and the email thread it arrived on. Use this whenever someone wants a company added to Airtable, Deals or the pipeline — "add this startup to Airtable", "enter Marrowlight into the pipeline", "new company, deck attached", "put this one on deck" — or asks to fill out the new-startup form, or asks whether a company is already in the base before adding it. When the Microsoft 365 connector is available, find the thread and the deck in Outlook yourself and ask for files only if that fails. Ask your questions one step at a time and wait for the answer before moving on.
---

# Enter a new startup

Take a pitch deck and the thread it came in on, draft every field of the "Enter a new startup into Airtable" form with a source beside each value, create whatever the form's link fields need that does not exist yet — a parent org in Airtable, and for a missing founder a second pre-filled link to the Portal contact form on HubSpot, which the user submits — and hand the user a **pre-filled form link**. The user types the description, attaches the deck, takes a last look, and clicks Submit. Then confirm what landed.

Three constraints shape everything here.

**The human submits.** Every new Startups record fires "New Company Form", which waits five seconds and then emails the whole venture team with the deck attached from field 8. The deck has to be on the record at the moment it is created, and the Airtable connector cannot upload attachments — so the only path is the user attaching the deck in the form and pressing Submit themselves. Never `create_records_for_table` on Startups. Never `submit_form` on this form. Not to test, not to save a step, not when asked to "just do it". And never through a browser: the Chrome extension is disabled for Portal accounts, so this workflow runs on connectors and pre-filled links only, and never suggests clicking through a form for the user.

**Ask as you go.** This is a conversation, not a prompt the user edits. Each step ends with a question or a confirmation; wait for the answer, then take the next step. Collect what you need to know from the user in step 3, in one short numbered message, before you draft anything. Never pre-fill an answer the user has not given.

**Propose, then confirm.** Every value is drafted; the user approves the whole table before anything is written anywhere — HubSpot, Airtable, anywhere. Two fields, Pipeline Stage and Membership Pipeline Stage, always need an explicit answer because they trigger email.

**Two fields are not yours to compose.** Field 3, the record's **Origin**, records only how the deal reached Portal, as fact taken from the thread — never why we are looking; the venture team writes that later, elsewhere on the record. Field 7, Description, is left blank for the user to type in the form.

## Configuration (live IDs, pulled 2026-09-25)

`get_form_schema` on the form is the source of truth for field names, select choices and visibility conditions. Pull it at step 3 and use its choice strings verbatim — never a choice string from memory, and never one of the trailing-space duplicates noted below.

- AIRTABLE_BASE: "Venture" — `appAX3sMfPtCKv4nB`
- FORM: "Enter a new startup into Airtable" — pageId `pagpvNaXGr4eSOJF4`, standalone (interfaceId null). URL `https://airtable.com/appAX3sMfPtCKv4nB/pagpvNaXGr4eSOJF4/form`
- STARTUPS: `tblkuk4Fpb1pYp4Ux` (~1,125 records). Primary "Name" `fld3itRTH4JpDjbMz` · Created time `fld378wRwRzo6Z1hb`
- Record page, to link at the end: `https://airtable.com/appAX3sMfPtCKv4nB/pagEE4hR4JW5uv0qc/<recId>?home=pag56exCQcCiTSB6z`
- PEOPLE: "HubSpot CRM" `tbllMLUVkBlg2lUzI`, synced *from* HubSpot. Name `fldGovuogiSuT6qxa` · Email Address `fldhEDQv17zK4g23p` · Org Type `fld7cKi9C7OKA9c3U` · Organization `fldym29JU69WBB3er` · Portal Contact (text) `fldU7gCsdMFzYgHc1` · Created `fldgYoLMfPcYrNmaC`
- INVESTORS: "Organizations from Hubspot CRM" `tbl5bYS4WIAr3BFWK`, VC selection view `viw2uiqBRhcjHucXY`
- PARENT_ORGS: "CRM: Non-startups organizations" `tblXxhrDzbKwt9WyZ`. New-org form "New orgnization entry" `pagpLJQCohSwNQ1gu` — Name `fldkarUxP0P9feLZv`, Type `fldhQgdiXs4y9xffc` (University / Biopharma (non-startup) / Non-profit / Real Estate / VC, PE, family office / Vendor)
- CONTACT_FORM: the Portal contact-input form on HubSpot — `https://hs.portalinnovations.com/portal-contact-input-form` (portal `23230704`, form `c210f0e0-ae42-455a-a28b-f1a8ff7cb8bc`). A founder who is not yet in PEOPLE goes into HubSpot through this form, by pre-filled link, and reaches Airtable by the sync. No connector is involved. Its fields, by internal name, pulled from the live form definition on 2026-10-08 — every one prefills from the URL as `?name=value&…`, and none is dependent:

| Internal name | Label | Required | Value |
|---|---|---|---|
| `firstname`, `lastname` | First Name, Last Name | yes | From the thread or deck. |
| `email` | Email | yes | **Only an address you can source.** No email means no link — the form requires one, and inventing it is the one thing this plugin never does. List that founder under *fill by hand*. |
| `company` | Company/Organization | yes | The startup's name, as in field 1. |
| `jobtitle` | Job Title | yes | From the deck or thread — CEO, CSO, co-founder. |
| `contact_or_company_type` | Contact or Company Type | yes | **`Startup`.** This is the Org Type the Airtable sync keys on ("HubSpot CRM - Startup Linking"). Other options exist (Biopharma, University, Venture Capital/Private Equity, Family Office, Angel Investor, Real Estate, Non-profit, Vendor, Other) but a founder here is always Startup. |
| `nearest_portal_region` | Nearest Portal Region | yes | Map from Geography (field 10): Atlanta · Boston · Chicago · Houston · Providence · Salt Lake City · New Jersey for a Portal city; International for Ex-US; Midwest · East Coast · South · West Coast for a non-target US city. |
| `contact_connection` | Contact connection | no | The Portal person who owns the relationship — this becomes Portal Contact in Airtable ("Portal Contact Connection"). A fixed list: Gianina Varea · Karol Sokolowski · Michael Faulman · Michael Schultz · Nancy Tyrrell · Ignacio Gajer. If the user is on it, propose them; if not, ask who it should be, and leave it blank if they say nobody. |

### Form fields

"Schema name" is the key the pre-filled URL takes. The label is what the form shows the user.

| # | Label | Field ID | Schema name | Type | Rule |
|---|---|---|---|---|---|
| 0 | Startups Lookup | `fldKEjyW1jej9BJ0g` | Startups Looksup | link → Startups | **Never fill.** The duplicate check is step 2, with `search_records`. |
| 1 | Startup Name | `fld3itRTH4JpDjbMz` | Name | text, required | From the deck or thread. |
| 2 | Form filled out by | `fldt8UpvfGtJkCcMu` | Created By | collaborator, required | The person running the plugin. Confirm on first run. |
| 3 | How did this deal come to Portal | `fldlbxnXwd42pqXSf` | Notes | rich text, required | This is the record's **Origin**. **Route only, as fact, from the thread**: who sent or introduced the company, to whom at Portal, when, and through which channel (founder outreach, VC intro, event, portfolio or university referral), plus anything the user adds about the route. One or two plain sentences, not a paste of the email: no subject lines, header blocks or signatures. **Never why we are looking** — the venture team writes that later. Show the full text at the gate. Ends with the *drafted by* marker. |
| 4 | Deal source | `fldLGE7wioicUq23h` | Deal source | multi-select, required | Infer from the thread; confirm. |
| 4.1 | Investor who introduced | `flddDDi6xG7csoSjh` | Investor Tracker Updater - VC | link → INVESTORS, required if visible | Only when 4 includes "VC network". |
| 4.2 | Investor's diligence stage | `fldP4bLZev7cTewPy` | Investor Tracker Updater - Stage | single select, required if visible | Only when VC network. An automation turns 4.1–4.3 into an Investor Viewer Updater note and then blanks them on the startup. |
| 4.3 | Investor notes | `fldsQeFWw5XUdon8v` | Investor Tracker Updater - Notes | rich text | Only when VC network. Written as a note about the investor's view. *Drafted by* marker. |
| 4a | Portal program | `fldaUkMZqkSm1WAtk` | Portal Programming | multi-select | Only when 4 includes "Portal Programming". |
| 5 | Cc others | `fld9VdWG5MhnCbMQO` | VO: Cc others on referral email | collaborators | Skip unless the user names people. |
| 6 | Pipeline stage | `fldX6aVYsZ0CdBaVR` | Pipeline Stage | single select, required | Propose; **needs an explicit yes**. |
| 6.1 | Diligence Lead | `fldEEoPaP0Xc0ln6l` | Diligence Lead for Company Form | collaborator | Only when 6 = "1.1 - On Deck". Setting it fires "Assigned notification email". |
| 6.2 | Pitch scheduled? | `fldvZUVovf8sE74FH` | Diligence status | multi-select | Only when 6 = "1.1 - On Deck". |
| 6.3 | Pitch date | `fldOP9qgHCwRivnJ8` | Next Meeting | date | Only when 6.2 includes "Pitch scheduled". |
| 6.1′ | Outreach email to company? | `fld1ABq8xdAZOgHz2` | Send BD Outreach? | Yes / No | Only when 6 = "0.0 - Outside of Core Geographies". **Yes emails the company** ("Cold Outreach Response"). Default No; Yes needs its own yes. |
| 7 | Description | `fldNj1z8nwCx0Sh6H` | Description | text, required | **Left blank for the user.** Never drafted and never prefilled; the form requires it, so the user types it in before Submit. List it under *fill by hand* at the hand-off. |
| 8 | Deck(s) | `fldx3ZeEAyF80HBHU` | Deck(s) | attachment, required | **The user attaches it in the form.** PDF under 25 MB. Never prefilled. |
| 9 | Website | `fldQVb3jC8mkzNqSc` | Website | url | Company site, else LinkedIn, else blank. Verify it resolves. |
| 10 | Geography | `fldPT5iAkwxzwmEdH` | Geography | multi-select, required | Map HQ to a Portal city; otherwise "Non-target city: US Northeast/Midwest/South/West" or "Ex-US". **Also picks the regional email list.** |
| 11 | Management Team | `fld7IwjcuWBJlfGfl` | Team | link → PEOPLE, required | Management founders. Match by email first. |
| 12 | Scientific Founder | `fldY6zdDabqtQ2RzY` | Scientific Founder | link → PEOPLE | Academic or scientific founders. |
| 13 | Parent Org | `fldfFbHHig9EVBLkE` | Parent Org. | link → PARENT_ORGS | Universities, incubators, VCs. Blank if unknown. |
| 14 | Tech Type | `fldGCPKHv7IEJ3gpL` | Tech Type | multi-select, required | From the deck. |
| 15 | Tech Subtype | `fldLW8tfK7e1oxNQq` | Tech Subtype | multi-select | Avoid the trailing-space duplicates "Vaccine  ", "AI/Machine Learning ", "Software  ". |
| 16 | Disease Category | `fldQ2V6ckc0vrwzDY` | Disease Category | multi-select | Never the empty "" option. |
| 17 | Tech Scope/Focus | `fldkhEyMaeAqcVh2x` | Tech Scope/Focus | single select | Single hypothesis / Platform tech. |
| 18 | Target | `fldiGm7EJrrlUw6Db` | Target | text | From the deck. |
| 19 | Indications | `fldnzXu2aDMQdJyty` | Indications | text | From the deck. |
| 20 | Portal Perspective Theme | `fldLS2xIuOiNPEsPV` | Portal Perscpective Theme | link | **Skip.** |
| 21 | TRL | `fldHSdXmdl5F1H8wq` | TRL | single select | Tx scale for Drug, Dev for Device, Dx for Diagnostic. |
| 22 | Membership Pipeline Stage | `fldyi5QCqqeDjrI1u` | Membership Pipeline Stage | single select | **The user decides.** Usually blank unless BD is involved. |
| 23 | Fundraising Target (USD MM) | `fldYqMTzwd9KZlteO` | Fundraising Target (USD MM) | text | A number in USD millions, e.g. "3". |
| 24 | Fundraising Round | `fldAF7kHb8k0UVECq` | Fundraising Round | single select | Pre-seed / Seed / Series A / Series B. |

### What fires when the record is created

Show this at the gate, filled in for the values proposed. None of it depends on *how* the record is created — every automation on Startups listens for *record created*, not form submission — so what matters is what is in the record at that moment.

- **"New Company Form"** (`wflMQoMwGynnA3S8o`): emails core_venture_airtable_updates@ and vf@, plus a **regional list chosen from Geography** (the formula field "Email Updates" `fldynEn47z2wHhvBU` shows which). CCs field 5 and the submitter. Attaches the deck. Does not fire when the stage is "0.1 - Member Applicant Form".
- **"Pipeline History - Record Created"** and **"Stage Modified by when Record Created"**: housekeeping.
- **"Update Investor Tracker Kanban 1 for new startup form"**: when 4.2 is set, creates an investor note and blanks 4.1–4.3.
- **"Cold Outreach Response"**: stage 0.0 plus "Send BD Outreach?" = Yes **emails the company**.
- **"Member Applicant Automation"**: stage 0.1.
- **"Assigned notification email"**: when 6.1 Diligence Lead is set.

## Pipeline

Each numbered step ends with a question or a confirmation. Wait for the user's reply before starting the next one. If a reply raises a follow-up (On Deck → who is the Diligence Lead?), ask that next, then move on.

0. **Preflight.** Run Airtable `ping`. If it fails or the tools are missing, STOP — run no other step — and tell the user to enable or re-authenticate the Airtable connector (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt). Then note, in one line, whether the optional **Microsoft 365** (Outlook) connector is present — step 1 uses it to find the thread and the deck, and without it the user hands them over. Nothing else is needed: a founder missing from PEOPLE goes in through CONTACT_FORM by pre-filled link, which takes no connector and no account. Outlook is read-only in this workflow: search and read, never send, move or change a message.

1. **Find the inputs.** The deck, as a PDF, is always needed. The thread usually is. If the user has not named the company, ask for the name and anything they know about how it arrived (who sent it, roughly when).

   - **With Microsoft 365:** search the user's mailbox for the company name, the founders' names or the sender over the last few weeks. Pick the thread, read it, and get the deck from it — read the PDF attachment if the connector hands it to you; if it only tells you the attachment's name, or the deck is behind a link, ask the user to attach that file. Then show what you found — subject, who was on it, date range, the deck's filename — and ask: **"Is this the right thread and deck?"** Several candidates: list them and ask which. Nothing found: say so and fall back to asking.
   - **Without Microsoft 365, or when the search comes up empty:** ask the user to attach the deck and to attach or paste the thread (PDF, .eml or pasted text). If there genuinely is no thread (they met the founder at an event, a colleague walked over), take pasted context instead.

   Do not go on until the user has confirmed the deck and the thread (or said there is none).

2. **Duplicate check — before drafting anything.** Search STARTUPS three ways: by name, with suffixes stripped before comparing (Inc, LLC, Ltd, Therapeutics, Bio, Biosciences, Pharma, Labs); by the website's domain; and by each founder's name. If one matches, **stop**: say so, show it with its Pipeline Stage and created date, link its record page, and offer the triage plugin if what the user actually wants is to update it. If there is a near-match, show it and ask whether it is the same company; a "different" answer gets noted in field 3 ("not the Marrowlight Bio already in the base — different company"). If nothing matches, say so in one line and go straight on to step 3 in the same message.

3. **Ask your questions — before drafting.** One short numbered message, each question with the default you would propose from the thread where you have one, so the user can answer "yes to all but 4" in a line. Ask only what the form needs from the user:

   1. Who is filling out the form (field 2) — the first time in a session.
   2. Deal source (field 4) — propose from the thread.
   3. If that includes "VC network": which investor introduced it (4.1), their diligence stage (4.2), and whether there is anything to record about the investor's view (4.3). If it includes "Portal Programming": which program (4a).
   4. Pipeline stage (field 6) — propose one; this needs an explicit answer. If the answer is "1.1 - On Deck": Diligence Lead (6.1)? Pitch scheduled, and when (6.2, 6.3)? If it is "0.0 - Outside of Core Geographies": send the BD outreach email (6.1′)? Default No.
   5. Membership Pipeline Stage (field 22) — the user decides; default blank.
   6. Anything to add to field 3 about *how the deal reached Portal* — a forward, an event, a colleague's intro the thread does not show.
   7. Anyone to Cc on the referral email (field 5)? Default no one.

   Wait for the answers. Draft nothing until they are in.

4. **Draft.** Pull `get_form_schema` for `pagpvNaXGr4eSOJF4`. Read the deck and the thread, then web-search the website, HQ, founders and funding. Draft every field in the table above except 0, 7, 8 and 20, and tag each value with where it came from — `Deck p.4`, `Email`, `Web: <url>`, or `Inferred` when it is a judgement from those (a TRL, a tech type). Field 3 is one or two sentences of fact about the route, from the thread and the user's step-3 answer: who sent or introduced the company, to whom, when, through which channel. Nothing about why we are looking, and nothing from the pitch itself. **Never invent an email address.** A founder's email has to appear in the thread, the deck or a verifiable web source, or it is blank and the founder is matched by name only.

5. **Resolve link fields.** For 4.1, 11, 12 and 13, call `search_candidate_linked_records` with the form's pageId, the field ID, and the other planned values passed in `fields`, so visibility conditions evaluate correctly. For people, match by email first (PEOPLE `fldhEDQv17zK4g23p`), then by name. Duplicates: list them all, default to the earliest-created (`fldgYoLMfPcYrNmaC`), and say so at the gate. Collect everything that does not exist yet — founders, a parent org, an investor org — into a "missing" list. Link fields prefill by **record ID**, so keep the IDs.

6. **Proposal gate.** One table — **# · Field · Proposed value · Source · Needs you** — every row of the form, including the ones you are leaving blank and why; Description's row reads *left for you to type in the form*. Field 3 shown in full. Underneath: the "missing" list from step 5 with what you propose to create, and the **emails that will fire, and to whom**, worked out from the Geography, field 5 and the submitter. Conditional fields appear only when their condition is met by the proposed values. **Write nothing — not in Airtable, and no contact-form link handed over — until the user confirms.** They may edit any row; re-show the table if they do. Ask: **"Shall I go ahead with this?"**

7. **Create what is missing.** A parent org or an investor org needs its own yes first, because those are writes Claude makes. A founder does not: a link writes nothing, so the user's submit *is* the yes.
   - **Founders** not in PEOPLE: say it plainly and hand over the form in the same message — *"Dana Whitfield is not in HubSpot, so I have pre-filled the Portal contact form for her. Check the values, submit it, and tell me when it is done."* — one pre-filled link to CONTACT_FORM per founder, which **the user opens and submits**. Never the HubSpot API, never a browser. Build it with `scripts/build_prefill_url.py --hubspot` from this plugin, or by hand: `?firstname=…&lastname=…&email=…&company=…&jobtitle=…&contact_or_company_type=Startup&nearest_portal_region=…&contact_connection=…`, percent-encoded, every select value matching the option string exactly. Show the values going into each link beside the link, including who you put in `contact_connection` and why. A founder with no sourced email gets no link — the form requires one — and is listed under *fill by hand* instead. Once the user says a contact is submitted, poll `search_candidate_linked_records` for it roughly every 30 seconds for up to 5 minutes until the sync brings it into PEOPLE. If you cannot wait in this environment, tell the user to say "check again". If it never appears, say so and stop — do not guess a record.
   - **Parent org** not in PARENT_ORGS: `submit_form` on `pagpLJQCohSwNQ1gu` with Name `fldkarUxP0P9feLZv` and Type `fldhQgdiXs4y9xffc`, then re-run step 5 for field 13.
   - **Investor org** (4.1) not in INVESTORS: **stop and ask.** Creating investors is out of scope for this version.

8. **Hand-off.** Build the pre-filled URL: with a shell, `scripts/build_prefill_url.py` from this plugin takes `{schemaName: value}` JSON and prints it, warning about commas in list values and about length; without a shell, apply the same rules by hand — `prefill_<schema name>=<percent-encoded value>`, lists comma-joined, link fields by record ID, collaborators by the user's Airtable name, the whole link under 8,000 characters. Give the user the link and tell them four things: type the Description (field 7), attach the deck to field 8, check the two stage fields took, and fill in by hand anything else you list as not prefilled. Field 3 near the limit? Leave it out of the link and hand it over as text to paste. Then ask them to say when it is submitted.

9. **Confirm.** When the user says it is submitted, find the record — Name from step 6, created today by `fld378wRwRzo6Z1hb` — read back every field the table proposed, and compare. Report each mismatch plainly (prefill dropped a select, a link did not take, the user changed something). Link the record page. If no record turns up, say so; do not assume the submit happened.

## Rules

- Ask one step at a time and wait. Never hand the user a prompt to edit, and never assume an answer they have not given.
- Nothing is written — Airtable, HubSpot, anywhere — before the confirmation that covers it. Every submit, the Airtable form's and the contact form's, is the user's click.
- Never `create_records_for_table` on STARTUPS and never `submit_form` on `pagpvNaXGr4eSOJF4`, including to test. Every new Startups record emails the whole team within five seconds.
- Never drive a browser and never suggest the Chrome extension; it is disabled for Portal accounts. Connectors only.
- Outlook is read-only here: search and read mail, never send, reply, move or modify.
- Never fill field 0, field 7, field 8 or field 20. Field 5 only when the user names people.
- Field 3 holds the route only — how the deal reached Portal, as fact from the thread. Never why we are looking, never a summary of the pitch.
- Conditional fields only when their visibility condition is met by the proposed values.
- Select values match the live form schema's choice names exactly. Never the trailing-space duplicates, never the empty option.
- Pipeline Stage (6) and Membership Pipeline Stage (22) each need an explicit answer. "Send BD Outreach?" = Yes and Diligence Lead (6.1) each need their own yes, because each sends mail.
- Field 3 — and 4.3 when it is used — ends with `_(drafted by Claude <model name>, <YYYY-MM-DD>)_`, the same convention as the triage plugin: the model actually running this session, the date only. Nothing else on the form is composed, so nothing else is marked.
- No facts from your own memory of the company. Every value comes from the deck, the thread or a cited web source, or it is left blank with the reason in the table.
- Never invent an email address, and never build a contact-form link for a founder whose email you cannot source.
- Duplicates in PEOPLE: default to the earliest-created and say so; never create a second contact for someone who already exists.
- One startup per run.
- When unsure about anything — which thread, which company, which contact, which stage — ask instead of guessing.
