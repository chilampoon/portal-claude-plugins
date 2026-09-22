---
name: update-triage-notes
description: File a startup's triage notes into Portal's Airtable record and finish the triage — propose where each piece of the note lands, move the Pipeline Stage, and reply to the notification that tells the fellows. Use this whenever someone shares triage notes — an uploaded Word doc or PDF, a forwarded email, or pasted text — about a company they screened, e.g. "here are my triage notes on Veil Therapeutics, update Airtable", "add these triage notes to the Deal Flow record", "I triaged Ensemble Biosystems, put this in Deals". Also use it when someone states a triage decision and wants the record to reflect it — "we're passing on Veil", "move Ensemble to deep diligence", "finish triage on this one".
---

# Update a startup's triage notes

Take triage notes that already exist — a Word doc, a PDF, an email, or text pasted into chat — file them onto that company's record in the "Startups" table, and move the record to the stage the triage decision calls for.

Two things shape every run. **Triage notes are written by different people at different times**, so this workflow *adds* to what is on the record; it never replaces another person's notes unless the user says so. And **the decision decides how much gets written** — a pass and an advance are not the same amount of writing, so read the recommendation before planning the write.

## Configuration

IDs below were pulled from the live base schema. `get_table_schema` on the table is the source of truth — run it if anything here looks wrong, and especially before trusting a PIPELINE_STAGE option string.

- AIRTABLE_BASE: "Venture" — `appAX3sMfPtCKv4nB`, the only base on the account.
- STARTUPS_TABLE: "Startups" — `tblkuk4Fpb1pYp4Ux`, primary field "Name" `fld3itRTH4JpDjbMz`. This is the table behind the "Deals" interface and the Deal Flow record pages. **There is no "Deal Flow" table.**
- Record page, to link once you have written: `https://airtable.com/appAX3sMfPtCKv4nB/pagEE4hR4JW5uv0qc/<recId>?home=pag56exCQcCiTSB6z`
- PIPELINE_STAGE: `fldX6aVYsZ0CdBaVR`, single select. The options this workflow uses, exact strings — submit them character for character: `0.0 - Outside of Core Geographies` (see step 5) · `1.1 - On Deck` · `1.2 - Monitoring by BD & Venture (Venture has met, awaiting...)` · `2.1 - Triage` · `2.2 - Triaged & Waiting` · `3.1 - Deep Diligence` · `5.1 - Soft Pass` · `5.2 - Passed / Not a Fit`
- Stage dates: Triage Start `fldAxUNpcVHRTCxnH` · Deep Diligence Start `fldIIBBNAo31aFGVx` · Passed Date `fldseeAXS1MrR4tQ4` · Prioritization Date `fldpCkddwW1dshyLH`
- NOTES: `fldlbxnXwd42pqXSf`, rich text — the catch-all and the archive.

**Common landing spots — settled, but not exhaustive.** Every pairing below has been checked, so content of that kind goes there unless the note itself gives you a reason otherwise. The table has far more fields, and the list says nothing about them — read the schema and choose what fits the rest of the note:

strengths → Strengths (resolve by name from the schema — ID not yet recorded) · what the company does → Value Proposition `fldUTvTnK0AKNPxjr` · weaknesses / risks → Key Risks `fldHCnh6cw5aLPtH9` · questions → Questions for Company `fldlw3iPk5DeVXz63` · tech description → Tech: Summary `fld4cGrEjrBnyNs5f` · team → Team Analysis `fld0RouGgSh7gCi2v` · next steps / obstacles → Company: Next Steps `fld0Bjr8Mg0HmDj8M` · funding history → Past Sources of Funding `fld5HxGmZLsJpZRaf`

**Secret Sauce `flda5JIPbWF8bzqWh` is reasoned, not filed.** It is the one field you compose rather than place, and it is *not* a second copy of the strengths. It answers a single question: what does this company have that the others do not? Usually that is the strongest of their strengths fused with something specific about the technology — the combination is the point, which is why neither section alone answers it. Two or three sentences, drawn only from what the note establishes, signed. If the note does not support a claim of real differentiation, leave the field empty and say so at the gate; a restated strengths list here is worse than nothing.

**For any field NOT on that list, a field's name is not its definition.** Before you propose one, read what is already in it — on this record and on a couple of others. The existing content is what defines the field; the name is a label someone chose years ago. If it is empty and its purpose is not obvious, leave it alone and say why.

This guard does not apply to the landing spots above. They are already checked, and an empty one is an empty one because nobody has filled it yet — not a signal to stay away. A field like Secret Sauce reads as cryptic precisely because its name does not describe its contents; that is what the list is for.

"Origin" is the standing example: it records **where the deal came from** — who sent us the company or the deck. It is not the origin of your note, and triage content does not belong there.

**Workflow metadata never goes on the record.** The source filename, which fields you wrote, how many sections you mapped — that is the report you give the user and the notice in step 8, not field content. Nothing on the record should describe the run that produced it.

**Nothing goes in a field unless the notes support it.** No importing facts from your own knowledge of the company, and no filling a gap with something plausible. A field left empty is the correct output for content the author did not write.

Distilling what the note *does* say is a different thing, and Secret Sauce asks for exactly that: the judgement is yours, every fact underneath it is theirs. The line is between reading the note closely and going outside it.

**Never write** formula, lookup, rollup, count or lastModified fields.

## Pipeline

0. **Preflight — verify the Airtable connector before doing anything else.** Confirm Airtable's tools are in your toolkit, then make one cheap call (`ping`, or `list_bases`). If the tools are missing or the call fails with an auth error, STOP — run no other step — and tell the user to enable or re-authenticate the Airtable connector (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt). Resume only after they confirm.

   Then check for a mail tool (Microsoft 365 / Outlook), which steps 8 and 9 use to notify Diligence support and reply to the stage-change notification. This one is **optional**: if it is missing, say so once and carry on — a missing mail tool falls back to printing the reply text and must never block the Airtable work.

1. **Get the note.** Use whatever the user provided: an uploaded Word doc or PDF (if the text is already extracted into the conversation, use it; if you have a shell and only the raw file, run `scripts/extract_docx.py <file>` from this plugin), a pasted or forwarded email (strip greetings, signatures and scheduling chatter), or pasted notes as-is. Several sources at once is fine — merge them and keep each author attributable.

   Keep the author's own structure. Tighten wording; do not reorganize their note into a template, and do not add analysis they did not write. If no note content was provided, ask for it — never draft a triage note from your own knowledge of the company.

   **Images.** If the source contains figures, charts or pasted slides, list them for the user now and say plainly that you cannot upload them: the Airtable MCP has no attachment-upload tool, and attachments can only be set from a URL Airtable fetches for itself. Ask them to drop the images into the relevant attachment field themselves, and carry this to the hand-off in step 10 — never let an image go silently missing.

2. **Read the decision.** The note usually ends with a recommendation. Classify it:
   - **Meet / advance** → the full proposed mapping, step 4a.
   - **Pass / soft pass** → the reduced write, step 4b.
   - **Uncertain, ambiguous or absent** → **ask the user.** Never guess a stage, and never infer a decision from how harsh the risks section sounds.

3. **Find the record.** Search "Name" `fld3itRTH4JpDjbMz` and keep the record ID. The table holds thousands of companies and near-duplicates exist, so show the user which record you matched — name plus current PIPELINE_STAGE — and confirm before writing. If several plausibly match, list them and ask. If nothing matches, stop and ask; **never create a startup record** here, new companies go through the "Enter a new startup into Airtable" form.

4. **Build the proposal.** Call `get_table_schema` on `tblkuk4Fpb1pYp4Ux`, then read the current value of every field you intend to touch, so an append is a real append.

   - **4a — meet / advance.** Decide for yourself which fields fit the content in front of you, starting from the landing-spot hints rather than being bound by them.
   - **4b — pass / soft pass. Write less on purpose** — nobody reads a teardown on a dead company. Only: the stage-change note; the risks, framed as *what would have to change for us to re-engage*, into Key Risks `fldHCnh6cw5aLPtH9`; the full note into NOTES `fldlbxnXwd42pqXSf` as the archive; plus the stage and its date. Skip the full mapping.

   **Account for the whole note before you show anything.** Walk it section by section and check each one reaches the table. Anything you are not writing appears in the table too, as **leave**, with the reason — "no field fits it" is a legitimate answer; dropping it in silence is not.

   A section that has a landing spot listed in Configuration may **not** be left because the field is empty or its name is cryptic. That is not a reason, it is the failure this check exists to catch. Strengths is the one that keeps going missing — and filing it is not the same as having answered Secret Sauce, which is a separate judgement about the same material.

   Say in prose, above the table, which sections of the note you are not writing and why. A **leave** row is easy to approve without reading; a sentence saying "I am not filing your strengths" is not.

   Present it as one table — **Field | Action (append / replace / leave) | Content** — using field names the user will recognise. Append is the default; *replace* needs its own explicit yes. The dated attribution header is a **boundary marker, not a byline**. It goes in only when you are appending underneath content that is already there, to separate your text from someone else's:

   ```
   <existing content>

   **Triage — <Author>, <YYYY-MM-DD>**
   <new content>
   ```

   **A field that is empty gets no header.** There is nothing above it to separate from, and the same name and date stamped down every field on the record is noise. The signature line at the end of the block already records when it was written.

   Ask once for the author and the triage date if they are not obvious from the document or the conversation; default to the person running the workflow and today's date. Format the content as **Formatting what you write** below sets out — the proposal table shows the real text, so get the shape right before the user reads it, not after. **Write nothing until the user confirms or edits this table.**

5. **Propose the stage change.** Show **old → new** verbatim and get explicit confirmation for *that specific change*, separately from the field table. Warn every time: the write fires Airtable automations — "Pipeline Stage Change" emails the venture fellows, and "Pipeline History - Record Updated" writes a Stage History record. Airtable treats an API write exactly like a manual edit, so the plugin can neither send that email itself nor suppress it.

   **One stage is higher-consequence than the rest.** Moving to `0.0 - Outside of Core Geographies` can fire "Cold Outreach Response", which emails *outside* the team when "Send BD Outreach?" is set. Say so at the confirm gate, before the user approves that particular move.

   Then the date, written directly as part of the same write — Triage Start `fldAxUNpcVHRTCxnH` for `2.1`, Deep Diligence Start `fldIIBBNAo31aFGVx` for `3.1`, Passed Date `fldseeAXS1MrR4tQ4` for `5.1`/`5.2`, Prioritization Date `fldpCkddwW1dshyLH` only if the user asks. No automation stamps these; you write them.

6. **Compose the stage-change note — once, used twice.** A couple of sentences on why the stage changed. The same text is appended to NOTES `fldlbxnXwd42pqXSf` *and* becomes the body of the reply in step 9. Generate it once so the two cannot drift; if the user edits it at a confirm gate, both uses take the edit.

7. **Confirm, then write.** With the field table, the stage, the date and the note all confirmed, make ONE `update_records_for_table` call setting everything at once. Report what was written and link the record page.

8. **Tell Diligence support what changed.** Every run that writes sends this, whether or not the stage moved.

   **Recipients come off the record, resolved all the way to email addresses in Airtable.** A name is not a recipient. Find the Diligence support field on this Startups record in the schema you already pulled at step 4, then resolve it by the field's type:

   - **Collaborator** — the cell value carries each person's address next to their name. Read the address out of the cell payload; the display name alone is not enough. Portal-internal people are usually collaborators, so this is the common case.
   - **Link to another table** — follow each linked record ID into that table and read its email field. People in this base live in "HubSpot CRM" `tbllMLUVkBlg2lUzI`, address in "Email Address" `fldhEDQv17zK4g23p` — though that table is the synced external contacts, so an internal colleague may not be in it.
   - **Text, or a name with no address attached** — search the people table above for the name and take the address from the match. One name, one unambiguous match; anything less certain, ask.

   **Never construct an address from a person's name**, and never send to a name you could not resolve. If the field is empty, if you cannot find it, or if even one person is left without an address, name who is unresolved and skip the send rather than mailing the rest.

   Keep it to a changelog, not a report:

   - The company, and a link to the record page.
   - Stage `old → new`, if it moved.
   - One line per field touched: the field, appended or replaced, and the gist in a few words.

   Show the recipients as name **and** address, and the draft, then send only on explicit confirmation. Without a mail tool, print the changelog and the resolved addresses for the user to send.

9. **Reply-all on the Airtable notification.** The stage write triggers "Pipeline Stage Change" (`wflKohvvhrsLTqud3`), whose steps are *wait 15 seconds → send email*. **That** email is what gets the reply — not the intake thread the notes came from. Subject `Pipeline Stage Change: {Company} moved to {New Stage}`, from `{Person} (via Airtable) <noreply+automations@airtable.com>`, to Venture Fellows and cc'ing whoever moved it; the body asks for a reply-all explaining why, to be copied onto the record.

   1. **Wait at least 20 seconds after the write before searching.** The automation sleeps 15, so an earlier search always misses. Step 8 has usually spent that time already.
   2. Search for a subject containing "Pipeline Stage Change" and the company name.
   3. **Check that the old → new stages in the body match what you just wrote.** If they do not, it is a stale thread from an earlier move — leave it alone and fall through to substep 5 below.
   4. Draft the reply-all using the step 6 sentences. Show the draft and the full recipient list, then send **only on explicit confirmation**. This reaches the whole fellows list, so it gets its own yes, separate from every gate before it.
   5. If the email has not arrived, or no mail tool is available, print the text for the user to send themselves and say which of the two it is. Never invent a thread, and never report an email as sent unless the send actually succeeded.

   **No stage change means no notification — skip this step entirely.** And nothing ever goes to the intake thread, where a senior associate forwarded the company and the fellows wrote the note up; that thread is not part of this workflow.

10. **Hand off what you could not do.** The images and which attachment field they belong in, and the reply text if it did not go out.

## Formatting what you write

These fields are rich text and render markdown. Use it — a wall of clauses strung together with `·` is unreadable on the record and worse in a meeting.

**Questions for Company `fldlw3iPk5DeVXz63` — grouped, numbered, one question per line.** Group under the subheadings the note uses, typically Scientific / Regulatory / IP & Business / Market / Team, and number within each group, restarting at 1:

```
**Scientific**

1. Is there real data showing replicated CHO/mAb production from the current system, and evidence for the 16× yield increase? What is the metric?
2. Is the modular reactor a new technique — what is the technical differentiation?

**Regulatory**

1. What is the GMP status of the Rhode Island installation? Has it produced material intended for an IND or clinical study?
```

Never run questions together on one line. Someone is working down this list in front of the company, so each numbered item has to be askable as it stands. A question and its immediate follow-up stay in one item; a genuinely separate question gets its own number.

**Every other field — lead, detail, close.** Open with the point in a sentence: the conclusion goes first, not last. Bullet the evidence or the detail underneath it. Close with the takeaway — the so-what, or what would have to change the answer. Keep the author's own ordering inside the bullets, most significant first if that is how they wrote it. Skip the frame when the content is a single item; one bullet does not need an introduction and a conclusion wrapped round it. The longer the field, the more it needs all three.

## Signing what Claude wrote

Text you composed ends with `_(summarized by Claude <model name>, <YYYY-MM-DD>)_`, so a reader can tell it from the author's own words and see when it landed. Use the model actually running this session — do not hard-code a version string — and the date only, no clock time.

- **Sign** field content you condensed from the note, the stage-change note, and the reply body.
- **Do not sign verbatim source.** The original note archived into NOTES `fldlbxnXwd42pqXSf` is the author's own words; labelling those as Claude's is worse than no signature at all.
- The signature goes at the end of the block. The `**Triage — <Author>, <YYYY-MM-DD>**` header stays at the top, naming the human.

## Rules

- Append, never overwrite, unless the user explicitly approved a *replace* on that field. If you cannot read a field's current value, stop and say so rather than writing over it.
- Nothing is written before the user confirms the proposal table.
- Never write PIPELINE_STAGE without its own explicit old → new confirmation, and never guess a stage from an absent or ambiguous recommendation — ask.
- One record per run. Never batch-update several startups from one note.
- Never invent triage content, and never fill a field from your own knowledge of the company. If the note is thin, file it thin.
- Never create a startup record. If the company is not in the base, stop and tell the user to add it through the new-startup form first.
- The reply-all goes out only on its own explicit confirmation — it reaches the whole fellows list. Reply to the Airtable notification, never to the intake thread, and never report an email as sent unless the send actually succeeded.
- Never claim to have uploaded an attachment. You cannot.
- If a write fails on field validation, re-check with `get_table_schema`, adjust, and confirm with the user before retrying.
- Never skip step 0. If the connector drops mid-run, stop, tell the user, and re-run the preflight before continuing.
- Read a field before you write to it for the first time. A field's name is not its definition, and no workflow metadata — filenames, field lists, run summaries — ever goes on the record.
- Every recipient is an address read out of Airtable or off an existing thread. Never invent an address, and never treat a name as one. If the Diligence support field is empty or missing, or anyone on it will not resolve, skip the send and say so.
- Sign what you composed; never sign the author's own words.
- When unsure about anything — which company, which field, which stage — ask instead of guessing.
