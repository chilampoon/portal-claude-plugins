---
name: log-investor-meeting
description: Log an investor meeting into Portal's Airtable VC CRM using the Otter.ai transcript. Use this whenever someone says they just met with, spoke to, or had a call with a VC firm or investor and wants it logged, summarized, or added to Airtable — e.g. "I just met with Accel, check Otter and update Airtable", "log my Benchmark call", "pull my Otter notes from the Sequoia meeting into the CRM". Also use it when someone asks to update an investor's Airtable record with meeting notes, even if they don't mention Otter by name.
---

# Log an investor meeting

Turn an Otter.ai meeting transcript into a short, investor-focused summary and log it as a NEW record in the "Investor Viewer Updater" table, linked to the firm. Notes in this base are individual records — never a text field appended on the firm record itself.

## Configuration (verified against the live base schema on 27 Aug 2026)

- AIRTABLE_BASE: "Venture" — baseId `appAX3sMfPtCKv4nB`
- INVESTORS_TABLE: "Organizations from Hubspot CRM" — tableId `tbl5bYS4WIAr3BFWK`, search the primary field "Name" (`fldXgesU5mz8YB1kq`). Holds ALL orgs synced from HubSpot; the "VCs" view filters to VC firms.
- NOTES_TABLE: "Investor Viewer Updater" — tableId `tblQbKYkiNx3rckpj`

Fields to write on NOTES_TABLE (use the field IDs):
- "Organizations from Hubspot CRM" (`fldykXuyEBmt5x3JI`, link → firm): array with the ONE firm record ID
- "Notes" (`fldOScuBxvOVfMrlJ`, rich text): the summary (simple markdown bullets are fine)
- "Update type" (`fldmYGIR7nhmYm6xV`, single select): "Meeting" (other option: "Non-meeting update (eg by email)")
- "Notes cateogry" (`fldgGaFP0AYf3y7l8`, MULTI-select — spelling is intentional): pick all that apply from exactly these options: "Fund thesis/updates", "Personnel bios and changes", "Other dealflow", "Portfolio company diligence status update"
- "Your contacts" (`fldTMbg0UURqCWThF`, link → "HubSpot CRM" people table `tbllMLUVkBlg2lUzI`): the investor-side attendees — search that table by name, prefer people already linked to this firm; leave empty if no match
- "Submitted by" (`fldDQHFvDkufQwQJ7`, collaborators): the person running this workflow, e.g. `[{"email": "<their Portal email>"}]` (set typecast: true if passing a plain email). Ask once if their email is unknown. REQUIRED — the record's title is a formula, `{Submitted by}, {Created as MM/DD/YY}`, so without this the note renders with a blank name.

Never write: the primary "Update" field (formula) or "Created" (automatic). Do not touch any other fields on either table.

## Pipeline

0. **Preflight — verify both connectors before doing anything else.** Check that Otter.ai's tools (search, fetch, get_user_info) and Airtable's tools are present in your toolkit, then make one cheap call to each: Otter `get_user_info` and Airtable `ping` (or `list_bases`). If either connector's tools are missing or a call fails with an auth error, STOP immediately — run no other step — and tell the user exactly which connector to enable or re-authenticate (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt when it appears). Resume only after they confirm. Keep the name/email returned by Otter's get_user_info: offer it as the default for "Submitted by" in step 5, confirming with the user the first time.

1. **Find the meeting in Otter.ai.** Search the user's Otter conversations for the firm name (and the date, if they gave one). Prefer the most recent match. If more than one is plausible, list the candidates and ask before continuing. Otter search runs against the signed-in user's own Otter account.

2. **Fetch the transcript** and extract ONLY information about the investor and the relationship, structured as:
   - **Key highlights** — 2–4 bullets with the takeaways that matter
   - **Companies shared** — companies discussed or introduced, one line of context each
   - **Investor updates** — fund status, stage or check-size changes, thesis shifts, team moves
   - **Personal / relationship** — rapport details (interests, life events) and follow-ups either side committed to

3. **Exclusions.** Include nothing about Portal itself (our fundraising, metrics, product) except commitments the investor made to us. Skip sections with nothing to report. Keep the whole summary under ~150 words — high-level and scannable, no play-by-play.

4. **Find the investor's record.** Search INVESTORS_TABLE's "Name" field for the firm and keep its record ID. CAUTION: the base contains near-duplicate firm records (e.g. "LifeLink Ventures" vs "Lifelink Ventures"). If several candidates match, prefer the record with linked HubSpot contacts and recent "Investor Viewer Updater" notes, show the user which record you chose, and confirm. If there is no clean match, list the closest candidates and ask — never guess, never create a firm record.

5. **Confirm, then log the note.** Show the user the draft summary, the chosen category tag(s), and the exact firm record. Only after they confirm, CREATE one new record in NOTES_TABLE with the fields listed in Configuration.

## Rules

- Do not modify records in INVESTORS_TABLE — this workflow only reads it; all writes go to NOTES_TABLE.
- Create exactly one new note record per meeting; never edit or overwrite existing note records.
- Select values must exactly match the options listed above — never invent or create new options.
- If a write fails on field validation, re-check the table schema with get_table_schema, adjust, and confirm with the user before retrying.
- Never skip step 0. If a connector drops mid-run (an auth error on any call), stop, tell the user, and re-run the preflight before continuing — don't improvise around a dead connection.
- When unsure about anything — which meeting, which firm, which category — ask instead of guessing.
