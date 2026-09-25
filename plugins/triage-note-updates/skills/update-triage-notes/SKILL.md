---
name: update-triage-notes
description: File a startup's triage notes into Portal's Airtable record and finish the triage — propose where each piece of the note lands, move the Pipeline Stage, and reply to the notification that tells the fellows. Use this whenever someone shares triage notes — an uploaded Word doc or PDF, a forwarded email, or pasted text — about a company they screened, e.g. "here are my triage notes on Veil Therapeutics, update Airtable", "add these triage notes to the Deal Flow record", "I triaged Ensemble Biosystems, put this in Deals". Also use it when someone states a triage decision and wants the record to reflect it — "we're passing on Veil", "move Ensemble to deep diligence", "finish triage on this one".
---

# Update a startup's triage notes

Take triage notes that already exist — a Word doc, a PDF, an email, or text pasted into chat — file them onto that company's record in the "Startups" table, and move the record to the stage the triage decision calls for.

Three things shape every run. **Triage notes are written by different people at different times**, so this workflow *adds* to what is on the record; it never replaces another person's notes unless the user says so. **The decision decides how much gets written** — a pass and an advance are not the same amount of writing, so read the recommendation before planning the write. And **the copy step does not interpret.** Your job here is to decide *where* the author's content goes and to make sure none of it is lost — not to tighten it, rank it, reframe it or summarise it. Interpretation belongs in the triage itself, before this workflow runs; done here, it leaves an opinion on the record that the author never wrote.

## Configuration

IDs below were pulled from the live base schema. `get_table_schema` on the table is the source of truth — run it if anything here looks wrong, and especially before trusting a PIPELINE_STAGE option string.

- AIRTABLE_BASE: "Venture" — `appAX3sMfPtCKv4nB`, the only base on the account.
- STARTUPS_TABLE: "Startups" — `tblkuk4Fpb1pYp4Ux`, primary field "Name" `fld3itRTH4JpDjbMz`. This is the table behind the "Deals" interface and the Deal Flow record pages. **There is no "Deal Flow" table.**
- Record page, to link once you have written: `https://airtable.com/appAX3sMfPtCKv4nB/pagEE4hR4JW5uv0qc/<recId>?home=pag56exCQcCiTSB6z`
- PIPELINE_STAGE: `fldX6aVYsZ0CdBaVR`, single select. The options this workflow uses, exact strings — submit them character for character: `0.0 - Outside of Core Geographies` (see step 5) · `1.1 - On Deck` · `1.2 - Monitoring by BD & Venture (Venture has met, awaiting...)` · `2.1 - Triage` · `2.2 - Triaged & Waiting` · `3.1 - Deep Diligence` · `5.1 - Soft Pass` · `5.2 - Passed / Not a Fit`
- Stage dates: Triage Start `fldAxUNpcVHRTCxnH` · Deep Diligence Start `fldIIBBNAo31aFGVx` · Passed Date `fldseeAXS1MrR4tQ4` · Prioritization Date `fldpCkddwW1dshyLH`
- NARRATIVE UPDATES = record comments (`create_record_comment`), no field ID. See below.
- ORIGIN: `fldlbxnXwd42pqXSf`. The schema calls it "Notes", which is what made it look like a catch-all; the Deal Flow record page shows it as **Origin**, read-only. On every record it holds where the deal came from — the intake email, "founder reached out", "met Ignacio at ASCO". **This workflow never writes to it**: not triage content, not an archive, not a stage-change note, not anything.

**Common landing spots — settled, but not exhaustive.** Every pairing below has been checked, so content of that kind goes there unless the note itself gives you a reason otherwise. The table has far more fields, and the list says nothing about them — read the schema and choose what fits the rest of the note:

strengths → Strengths `fldboP8VPnLxfVRM3` · what the company does → Value Proposition `fldUTvTnK0AKNPxjr` · weaknesses / risks → Key Risks `fldHCnh6cw5aLPtH9` · questions → Questions for Company `fldlw3iPk5DeVXz63` · tech description → Tech: Summary `fld4cGrEjrBnyNs5f` · team → Team Analysis `fld0RouGgSh7gCi2v` · next steps / obstacles → Company: Next Steps `fld0Bjr8Mg0HmDj8M` · funding history → Past Sources of Funding `fld5HxGmZLsJpZRaf`

**What a pre-meeting triage fills.** The fields a triage is expected to populate, so that the coverage check in step 4 runs from Airtable's side as well as the note's. Each of these is either filled from the note or named at the gate as "nothing in the note for this":

Strengths `fldboP8VPnLxfVRM3` · Key Risks `fldHCnh6cw5aLPtH9` · Questions for Company `fldlw3iPk5DeVXz63` · Tech: Summary `fld4cGrEjrBnyNs5f` · Team Analysis `fld0RouGgSh7gCi2v` · Company: Next Steps `fld0Bjr8Mg0HmDj8M` · Value Proposition `fldUTvTnK0AKNPxjr` · Past Sources of Funding `fld5HxGmZLsJpZRaf` · Secret Sauce `flda5JIPbWF8bzqWh` · PIPELINE_STAGE and its date · the Narrative updates comment

**Record-page labels are not schema names.** The Deal Flow page relabels fields, so what a colleague calls a field and what `get_table_schema` returns are not always the same string:

- **Origin** = "Notes" `fldlbxnXwd42pqXSf`
- **Strengths** = "Venture: Investment Rationale" `fldboP8VPnLxfVRM3`

When the user names a field by its page label, map it through this list first. For any field not on it, read the field's content across several records before writing — the schema name may describe something else entirely, as both of these did.

**Secret Sauce `flda5JIPbWF8bzqWh` and Value Proposition `fldUTvTnK0AKNPxjr` are filled from the note, like everything else.** If the note has a section on differentiation, or on what the company does, that text goes in as written. Neither field is a place for you to summarise the rest of the note.

Secret Sauce is the one field the team often has not written a section for, because it is a judgement — what does this company have that the others do not, usually the strongest strengths fused with something specific about the technology. When the note has strengths or a technology description but no Secret Sauce section, **offer a draft, before the copy step and clearly labelled as a draft**, in the two parts the base already uses (see XPAND, Strigosus):

> **Their claim:** what the company says sets it apart.
> **Assessment:** whether the note supports it.

Every fact in it comes from the note; when the differentiation is unproven, the Assessment says so. Then the user edits it, or says to file it as theirs, or declines. Only text the user has made their own reaches the field; it carries the same *copied by* line as any other block, because the plugin placed it, and no *drafted by* line, because the user is its author of record. Declined means the field stays empty and the gate says so. Never slip the draft into the proposal table as though it were content from the note.

**Narrative updates is the record's comment thread, not a field.** It is written with `create_record_comment`, never through `update_records_for_table`, and it never appears in the field payload.

The recommendation is the thing a reader wants first and the one thing no field captures. The comment is the note's recommendation **as the author wrote it** — not your précis of it, and not your account of what changed. Quote the recommendation section whole; if it runs long, the user chooses the excerpt, not you. Then a last line pointing at the full note — `Source: Chi-Lam's pre-triage notes (2026-09-10) — <SharePoint link>`, or `Source: Chi-Lam's pre-triage notes (2026-09-10), attached in this thread` when the user is uploading it themselves — so anyone reading the record can get to the reasoning behind the decision. Name the source the way a person would, never by filename.

**A posted comment cannot be taken back.** The connector creates comments but cannot edit or delete them, so there is no fixing a bad one afterwards. Show the exact text you intend to post at the confirm gate, word for word, and post only on an explicit yes.

**First name only** when naming a colleague in prose — "Chi-Lam", not "Chi-Lam Poon" — in the comment and in the emails at steps 8 and 9. Two exceptions: the `**Triage — <Author>, <date>**` header stays a full-name byline, and recipient lists are never abbreviated — always full name plus address.

**For any field NOT on that list, a field's name is not its definition.** Before you propose one, read what is already in it — on this record and on a couple of others. The existing content is what defines the field; the name is a label someone chose years ago. If it is empty and its purpose is not obvious, leave it alone and say why.

This guard does not apply to the landing spots above. They are already checked, and an empty one is an empty one because nobody has filled it yet — not a signal to stay away. A field like Secret Sauce reads as cryptic precisely because its name does not describe its contents; that is what the list is for.

**Origin** `fldlbxnXwd42pqXSf` is the standing example: it records **where the deal came from** — who sent us the company or the deck. It is not the origin of your note, its schema name "Notes" is not an invitation, and nothing this workflow produces belongs in it.

**Workflow metadata never goes on the record.** The source filename, which fields you wrote, how many sections you mapped — that is the report you give the user and the notice in step 8, not field content. Nothing on the record should describe the run that produced it. Naming the note a decision came from — whose it was and when — is content and belongs in Narrative updates; the filename and the list of fields you wrote are not and do not.

**Nothing goes in a field unless the notes support it.** No importing facts from your own knowledge of the company, and no filling a gap with something plausible. A field left empty is the correct output for content the author did not write.

Distilling what the note *does* say happens in one place only: the Secret Sauce draft you offer before the copy step, which the user then owns or declines. Nothing distilled, tightened or reframed reaches the record on your say-so.

**Never write** formula, lookup, rollup, count or lastModified fields.

## Pipeline

0. **Preflight — verify the Airtable connector before doing anything else.** Confirm Airtable's tools are in your toolkit, then make one cheap call (`ping`, or `list_bases`). If the tools are missing or the call fails with an auth error, STOP — run no other step — and tell the user to enable or re-authenticate the Airtable connector (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt). Resume only after they confirm.

   Then check for the Microsoft 365 connector (Outlook), which steps 8 and 9 use to notify Diligence support and reply to the stage-change notification. This one is **optional**: if it is missing, say so once and carry on — a missing mail tool falls back to printing the reply text and must never block the Airtable work.

1. **Get the note.** Use whatever the user provided: an uploaded Word doc or PDF (if the text is already extracted into the conversation, use it; if you have a shell and only the raw file, run `scripts/extract_docx.py <file>` from this plugin), a pasted or forwarded email (strip greetings, signatures and scheduling chatter), or pasted notes as-is. Several sources at once is fine — merge them and keep each author attributable.

   Keep the author's own structure **and their own words**. Do not tighten, reorder, rank, merge or rephrase; do not reorganize the note into a template; do not add analysis they did not write. What changes between the note and the record is layout — see **Layout, not wording** below — and nothing else. If no note content was provided, ask for it — never draft a triage note from your own knowledge of the company.

   **Where the full note lives.** Colleagues reading the record later want the whole note, not the summary. You cannot put the file on the record yourself — the Airtable connector has no file-upload tool and the comment API takes text only — so ask the user, once, which they prefer:

   - **A SharePoint link.** They paste it; it goes on the last line of the Narrative updates comment.
   - **Upload it themselves.** They attach the file to the Narrative updates thread in Airtable, which the UI allows and the API does not. The comment then says the full notes are attached in this thread, and the hand-off reminds them to do it.

   Do not go looking for the file in OneDrive or SharePoint on their behalf, and do not proceed with neither — a decision comment with no route to the reasoning behind it is only half a record.

   **Images.** If the source contains figures, charts or pasted slides, list them for the user now and say plainly that you cannot upload them: the Airtable MCP has no attachment-upload tool, and attachments can only be set from a URL Airtable fetches for itself. Ask them to drop the images into the relevant attachment field themselves, and carry this to the hand-off in step 10 — never let an image go silently missing.

2. **Read the decision.** The note usually ends with a recommendation. Classify it:
   - **Meet / advance** → the full proposed mapping, step 4a.
   - **Pass / soft pass** → the reduced write, step 4b.
   - **Uncertain, ambiguous or absent** → **ask the user.** Never guess a stage, and never infer a decision from how harsh the risks section sounds.

3. **Find the record.** Search "Name" `fld3itRTH4JpDjbMz` and keep the record ID. The table holds thousands of companies and near-duplicates exist, so show the user which record you matched — name plus current PIPELINE_STAGE — and confirm before writing. If several plausibly match, list them and ask. If nothing matches, stop and ask; **never create a startup record** here, new companies go through the "Enter a new startup into Airtable" form.

4. **Build the proposal.** Call `get_table_schema` on `tblkuk4Fpb1pYp4Ux`, then read the current value of every field you intend to touch, so an append is a real append.

   - **4a — meet / advance.** Decide which field each part of the note belongs in, starting from the landing spots rather than being bound by them, and place the author's text there as written.
   - **4b — pass / soft pass. Write less on purpose** — nobody reads a teardown on a dead company. Only: the stage and its date; the note's weaknesses or risks section, as written, into Key Risks `fldHCnh6cw5aLPtH9`; and the decision as a Narrative updates comment — a pass is still a decision and still gets its comment. **No full-note archive** — there is nowhere on the record for one, and the note stays where the author keeps it. Skip the full mapping.

   **Account for the whole note, and the whole checklist, before you show anything.** Two passes. Note → fields: walk the note section by section and check each one reaches the table; anything you are not writing appears in the table too, as **leave**, with the reason — "no field fits it" is a legitimate answer, dropping it in silence is not. Checklist → note: for every field in **What a pre-meeting triage fills**, either the table has content for it or the gate says "nothing in the note for this" by name. Nothing missed in either direction is the whole point of the plugin.

   A section that has a landing spot listed in Configuration may **not** be left because the field is empty or its name is cryptic. That is not a reason, it is the failure this check exists to catch. Strengths is the one that keeps going missing.

   Say in prose, above the table, which sections of the note you are not writing and why. A **leave** row is easy to approve without reading; a sentence saying "I am not filing your strengths" is not.

   Present it as one table — **Field | Existing | Action (append / replace / leave) | Content** — using field names the user will recognise. **Existing** holds what is on the record now, in full, so the user reads the old beside the new; that is how an earlier colleague's triage stays visible instead of being buried. For an empty field, append is the default and the table confirm covers it. **For a field that already has content there is no default**: the user chooses append, replace or leave for that row, and a *replace* still needs its own explicit yes on top. The dated attribution header is a **boundary marker, not a byline**. It goes in only when you are appending underneath content that is already there, to separate your text from someone else's:

   ```
   <existing content>

   **Triage — <Author>, <YYYY-MM-DD>**
   <new content>
   ```

   **A field that is empty gets no header.** There is nothing above it to separate from, and the same name and date stamped down every field on the record is noise. The *copied by* line at the end of the block already records when it was placed.

   Ask once for the author and the triage date if they are not obvious from the document or the conversation; default to the person running the workflow and today's date. Lay the content out as **Layout, not wording** below sets out — the proposal table shows the real text, so get the layout right before the user reads it, not after.

   The Narrative updates comment is not a field, so it gets no row. Show it in full underneath the table, labelled as the comment, at this same gate — it is the one thing here that cannot be undone. **Write nothing until the user confirms or edits both the table and the comment.**

5. **Propose the stage change.** Show **old → new** verbatim and get explicit confirmation for *that specific change*, separately from the field table. Warn every time: the write fires Airtable automations — "Pipeline Stage Change" emails the venture fellows, and "Pipeline History - Record Updated" writes a Stage History record. Airtable treats an API write exactly like a manual edit, so the plugin can neither send that email itself nor suppress it.

   **One stage is higher-consequence than the rest.** Moving to `0.0 - Outside of Core Geographies` can fire "Cold Outreach Response", which emails *outside* the team when "Send BD Outreach?" is set. Say so at the confirm gate, before the user approves that particular move.

   Then the date, written directly as part of the same write — Triage Start `fldAxUNpcVHRTCxnH` for `2.1`, Deep Diligence Start `fldIIBBNAo31aFGVx` for `3.1`, Passed Date `fldseeAXS1MrR4tQ4` for `5.1`/`5.2`, Prioritization Date `fldpCkddwW1dshyLH` only if the user asks. No automation stamps these; you write them.

6. **Compose the stage-change note.** A couple of sentences on why the stage changed, in the author's words wherever the note supplies them. This is the body of the reply in step 9 and nothing else — it is not written to the record. The record's account of the decision is the Narrative updates comment from step 7; keep the two consistent and do not duplicate one into the other.

7. **Confirm, then write.** With the field table, the stage, the date and the comment all confirmed, make ONE `update_records_for_table` call setting every field at once.

   Then post the Narrative updates comment as a separate `create_record_comment` call, after the field write has succeeded — the comment describes a decision the record should already reflect. Post the approved text unchanged; if the field write failed, do not post. Report what was written and link the record page.

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

10. **Hand off what you could not do.** The images and which attachment field they belong in, the reply text if it did not go out, and, if they chose to upload the note themselves, the reminder to attach it to the Narrative updates thread now, since the comment already says it is there.

## Layout, not wording

These fields are rich text and render markdown. Use it for layout — bullets, numbering, headings — and for nothing else. A wall of clauses strung together with `·` is unreadable on the record and worse in a meeting, but the fix is line breaks, not rewriting.

**Allowed:** turning the author's list into bullets or numbers; putting their subheadings in bold on their own lines; splitting one section across two fields when the note's own headings map to two fields; removing greetings and signatures from an email. **Not allowed:** tightening, rephrasing, reordering, ranking, merging two of their points into one, splitting one point into two, adding an opening or closing sentence, dropping a qualifier. If a sentence on the record is not a sentence in the note, something has gone wrong.

**Questions for Company `fldlw3iPk5DeVXz63` — grouped, numbered, one question per line.** Group under the subheadings the note uses, typically Scientific / Regulatory / IP & Business / Market / Team, and number within each group, restarting at 1:

```
**Scientific**

1. Is there real data showing replicated CHO/mAb production from the current system, and evidence for the 16× yield increase? What is the metric?
2. Is the modular reactor a new technique — what is the technical differentiation?

**Regulatory**

1. What is the GMP status of the Rhode Island installation? Has it produced material intended for an IND or clinical study?
```

Never run questions together on one line. Someone is working down this list in front of the company, so each numbered item has to be askable as it stands. A question and its immediate follow-up stay in one item; a genuinely separate question gets its own number.

**Every other field — the author's order, the author's words.** If they wrote prose, it stays prose; if they wrote bullets, it stays bullets in the same order. Do not lead with a summary sentence or close with a takeaway — those would be yours, not theirs. If the user wants a field to open with the conclusion, they write it that way in the note and you preserve it.

## Marking what Claude placed

Two markers, and the verb is the whole point — a reader should be able to tell at a glance whether the plugin *placed* someone's words or *wrote* its own. Never say "summarized": nothing here is summarised any more.

- `_(copied by Claude <model name>, <YYYY-MM-DD>)_` ends every field block you write and the Narrative updates comment. It means: placed on the record by the plugin, word for word as the user approved it at the gate. It does not claim authorship — the words are the author's, and the `**Triage — <Author>, <YYYY-MM-DD>**` header at the top names them. An adopted Secret Sauce draft carries it too, since the plugin placed it.
- `_(drafted by Claude <model name>, <YYYY-MM-DD>)_` ends the two things you actually compose: the stage-change reply body and the Diligence support changelog.

Use the model actually running this session — do not hard-code a version string — and the date only, no clock time. The marker is the last line of the block.

## Rules

- Append, never overwrite, unless the user explicitly approved a *replace* on that field. If you cannot read a field's current value, stop and say so rather than writing over it.
- Nothing is written before the user confirms the proposal table.
- The copy step is verbatim. Never tighten, reorder, rank, merge, reframe or summarise the author's text on its way into a field. Layout only.
- A field that already has content is shown existing-beside-proposed and gets its own append / replace / leave decision. There is no default on a non-empty field.
- A draft you offered is filed only after the user edits it or explicitly says to file it as their own. Declined means empty.
- Never write PIPELINE_STAGE without its own explicit old → new confirmation, and never guess a stage from an absent or ambiguous recommendation — ask.
- One record per run. Never batch-update several startups from one note.
- Never invent triage content, and never fill a field from your own knowledge of the company. If the note is thin, file it thin.
- Never create a startup record. If the company is not in the base, stop and tell the user to add it through the new-startup form first.
- The reply-all goes out only on its own explicit confirmation — it reaches the whole fellows list. Reply to the Airtable notification, never to the intake thread, and never report an email as sent unless the send actually succeeded.
- Never claim to have uploaded an attachment. You cannot.
- If a write fails on field validation, re-check with `get_table_schema`, adjust, and confirm with the user before retrying.
- Never skip step 0. If the connector drops mid-run, stop, tell the user, and re-run the preflight before continuing.
- Never write ORIGIN `fldlbxnXwd42pqXSf`, whatever the schema calls it.
- The Narrative updates comment goes through `create_record_comment` after the field write, on its own explicit yes. It cannot be edited or deleted once posted.
- Never replace or clear a field on a blanket instruction such as "change anything you need". Each replace or clear needs its own yes, with the current value shown first.
- Read a field before you write to it for the first time. A field's name is not its definition, and no workflow metadata — filenames, field lists, run summaries — ever goes on the record.
- Every recipient is an address read out of Airtable or off an existing thread. Never invent an address, and never treat a name as one. If the Diligence support field is empty or missing, or anyone on it will not resolve, skip the send and say so.
- Mark what you place as *copied by* and what you compose as *drafted by*. Never write "summarized by" — the plugin does not summarise.
- When unsure about anything — which company, which field, which stage — ask instead of guessing.
