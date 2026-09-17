---
name: update-triage-notes
description: File a startup's triage notes into Portal's Airtable Deal Flow record. Use this whenever someone shares triage notes — an uploaded Word doc or PDF, a forwarded email, or pasted text — about a company they screened and wants them organized, filed, or added to Airtable, e.g. "here are my triage notes on Veil Therapeutics, update Airtable", "add these triage notes to the Deal Flow record", "I triaged Ensemble Biosystems, put this in Deals". Also use when someone asks to update a startup's Deal Flow / Deals record with screening notes, strengths, weaknesses, obstacles, questions for the company, or a meet/pass recommendation.
---

# Update a startup's triage notes

Take triage notes that already exist — in a Word doc, a PDF, an email, or pasted into chat — organize them into Portal's triage template, and APPEND them to that company's record in the "Startups" table, which is what the Deals interface shows as the Deal Flow record.

Triage notes are written by different people at different times. This workflow **adds** to what is already on the record; it never replaces another person's notes.

## Configuration (verified against the live base schema on 17 Sep 2026)

- AIRTABLE_BASE: "Venture" — baseId `appAX3sMfPtCKv4nB`
- STARTUPS_TABLE: "Startups" — tableId `tblkuk4Fpb1pYp4Ux`, search the primary field "Name" (`fld3itRTH4JpDjbMz`)
- This table is what the "Deals" interface (`pbd32g4sVn4WnA3c6`) opens as a Deal Flow record page (`pagEE4hR4JW5uv0qc`). "Update the Veil form in Deal Flow" means update the Veil Therapeutics record in this table.

Triage template section → field to write (every one is rich text, so markdown bullets and bold are fine):

| Triage section | Airtable field | Field ID |
| --- | --- | --- |
| Startup Overview | "Value Proposition" | `fldUTvTnK0AKNPxjr` |
| Strengths | "Secret Sauce" | `flda5JIPbWF8bzqWh` |
| Weaknesses | "Key Risks" | `fldHCnh6cw5aLPtH9` |
| Obstacles | "Outstanding Key Issues" | `fldvJtDe9TjWEd9jt` |
| Questions | "Questions for Company" | `fldlw3iPk5DeVXz63` |
| Recommendation | "Rationale for Venture Evaluation" | `fldAj8tpqPnWoUgG1` |

Optional, only when the note clearly supports it and the user agrees:
- "Triage Start" (`fldAxUNpcVHRTCxnH`, date) — set only if it is currently empty.

**Never write these**, even if they look relevant:
- "Pipeline Stage" (`fldX6aVYsZ0CdBaVR`) — changing it fires Airtable automations that email the venture team and write Stage History rows. Stage changes are a human decision. If the note says "move to Triage" or "pass", tell the user to make that change themselves in Airtable.
- "Investment Chain of Logic" (`fldW6ux85s2zVfweH`) — a curated numbered argument with 🟢/🟡/🟠 confidence markers, built during diligence, not triage.
- Any formula, lookup, rollup or `Created`/`Last Modified` field.
- Any field not listed in this Configuration section.

## Pipeline

0. **Preflight — verify the Airtable connector before doing anything else.** Confirm Airtable's tools are in your toolkit, then make one cheap call (`ping`, or `list_bases`). If the tools are missing or the call fails with an auth error, STOP — run no other step — and tell the user to enable or re-authenticate the Airtable connector (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt when it appears). Resume only after they confirm.

1. **Get the triage note.** The note comes from whatever the user provided:
   - **Uploaded Word doc or PDF** — if the text is already extracted into the conversation, use it. If you have a shell and only the raw file, run `scripts/extract_docx.py <file.docx>` from this plugin to get the text.
   - **Email** — pasted text or a forwarded thread. Strip greetings, signatures, and scheduling chatter.
   - **Pasted notes** — use as-is.
   - **Several sources at once** (e.g. one person's doc plus another's email) — merge them, and keep each author's contribution attributable in step 2.

   If no note content was actually provided, ask for it. Never draft a triage note from your own knowledge of the company — this workflow files notes that a person wrote.

2. **Organize into Portal's triage template.** Rewrite the note into these sections, keeping the author's substance and judgement — tighten wording, do not add analysis they did not write:
   - **Startup Overview** — synopsis: stage, location, technology, and the deal (round and amount they are raising).
   - **Strengths** — ordered most to least significant.
   - **Weaknesses** — risks, ordered most to least significant.
   - **Obstacles** — what could keep them from hitting milestones.
   - **Questions** — remaining questions for the company, grouped under the subheadings the note uses, typically Scientific / Regulatory / IP & Business / Market / Team.
   - **Recommendation** — meet or pass, with the justification.

   Drop a section entirely if the note has nothing for it — never invent content to fill it. Keep the author's numbered lists and ordering.

3. **Find the startup's record.** Search STARTUPS_TABLE's "Name" field and keep the record ID. The table holds thousands of companies and near-duplicates exist, so show the user which record you matched (name plus current Pipeline Stage) and confirm before writing. If several plausibly match, list them and ask. If nothing matches, stop and ask — never create a startup record here; new companies are added through the "Enter a new startup into Airtable" form.

4. **Read the current values** of the six target fields on that record, so you can append instead of overwrite.

5. **Build each field's new value.**
   - Ask once for the note author's name and the triage date if they are not obvious from the document or the conversation; default to the person running the workflow and today's date.
   - If the field is **empty**, write the section content on its own.
   - If the field **already has content**, keep it verbatim and append below it:

     ```
     <existing content>

     **Triage — <Author>, <YYYY-MM-DD>**
     <new section content>
     ```

   This matches how the base already reads — existing notes carry headers like `Anna Slezak, 2023-07-24` and `### July 2024 – Questions regarding ...`.

6. **Confirm, then write.** Show the user, per field: the field name, whether it is a first write or an append, and the exact text going in. Only after they confirm, make ONE `update_records_for_table` call setting all the fields at once. Report back what was written, and mention any section you had to drop for lack of content.

## Rules

- Append, never overwrite. If you cannot read a field's current value, stop and say so rather than writing over it.
- One record per run. Never batch-update several startups from one note.
- Never change Pipeline Stage — it emails the team. Same for any field outside the Configuration table.
- Never invent triage content, and never fill a section from your own knowledge of the company. If the note is thin, file it thin.
- Never create a startup record. If the company is not in the base, stop and tell the user to add it through the new-startup form first.
- If a write fails on field validation, re-check the schema with `get_table_schema`, adjust, and confirm with the user before retrying.
- Never skip step 0. If the connector drops mid-run, stop, tell the user, and re-run the preflight before continuing.
- When unsure about anything — which company, which section, whose notes — ask instead of guessing.
