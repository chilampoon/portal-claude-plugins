---
name: brief-investor
description: Brief a Portal team member on a VC firm before a meeting or email, from the firm's Group Overview in the Airtable Venture base plus its newest notes. Use this whenever someone asks to be briefed or prepped on an investor, what we know about a firm, where we stand with them, or to pull up a firm's overview — e.g. "brief me on SOSV before my call", "where do we stand with DCVC Bio", "prep me for Redpine tomorrow", "what's the latest on MBX Capital". Read-only: it never writes to Airtable.
---

# Brief me on an investor

Read the firm's Group Overview, say whether it is current, and add the newest
notes. Everything here is a read. Group Overview is written by an Airtable
field agent; this skill never writes it, and never writes anything else.

## Configuration (live IDs, 2026-10-15)

- AIRTABLE_BASE: "Venture" — baseId `appAX3sMfPtCKv4nB`
- INVESTORS_TABLE: "Organizations from Hubspot CRM" — tableId `tbl5bYS4WIAr3BFWK`
  - Name `fldXgesU5mz8YB1kq` (primary) · Org Type (from HubSpot CRM) `fldS2yWqOfPmkOLwE` (lookup; VCs read "Venture Capital/Private Equity")
  - Group Overview `fldzKsGxC32svNmYK` — rich text, written by the field agent; the API returns markdown. **Never write it.**
  - Overview note count `fldmtCayz9xI8Q9CR` · Newest note date `fldIDWMUq53JKX4Rn` (YYYY-MM-DD) · Stats modified `fldnHlQcpompozXS8`
  - Investor stats (text) `fldRWCg1ST2nttz6Q` · Our companies with them `fldsT1ke8p6JXNnm0` · Portal contacts (text) `fld4WoLgxQlbzlAD2`
  - Email Address (from HubSpot CRM) `fldckjoCBQTJKf3js`, for matching a firm by domain
- NOTES_TABLE: "Investor Viewer Updater" — tableId `tblQbKYkiNx3rckpj`
  - Firm link `fldykXuyEBmt5x3JI` · Created `fldGt0NEloZyFgjZM` · Overview input `fldxGxioudTxEvZ9q` (the note already dated, with its status links, blank for filler)
- The overview's closing line reads `Based on N Portal notes through YYYY-MM-DD.`

## Pipeline

0. **Preflight.** Check the Airtable tools are present and make one cheap call (`ping` or `list_bases`). If the connector is missing or the call fails on auth, stop and tell the user to enable or re-authenticate Airtable; do not continue on a dead connection.

1. **Resolve the firm.** `search_records` on INVESTORS_TABLE over Name with the name given. If the user gave an email or domain, search "Email Address (from HubSpot CRM)" as well; the domain is the surer match. Ignore suffixes (Inc, LLC, Capital, Ventures, Partners) when comparing. If more than one record is plausible, show them with their Org Type and note count and ask. Never guess between near-identical names, and never create a record.

2. **Read the record.** `list_records_for_table` with `recordIds` for that one record and the fields above.

3. **Check the overview is current.** Parse the closing line. Then:
   - **Empty cell.** Say "No Group Overview yet for this firm" and whether the firm has real notes (Overview note count). The agent may not be live, or may not have run on this cell.
   - **No closing line, or text that does not follow the agent's shape.** Say the overview looks hand-edited or stuck, so it will not refresh on its own, and that the fix is in Airtable (a maintainer clears the cell or re-runs the agent). Still show the text, marked as unverified.
   - **N differs from Overview note count, or the date is before Newest note date.** Say the overview is behind by that much (for example "written from 19 notes, the record now has 20; a note on 2026-10-14 is not in it yet"). The agent normally catches up within minutes; the newest notes below cover the gap.
   - **Matches.** Say "Current as of YYYY-MM-DD, N notes."

4. **Newest notes.** `list_records_for_table` on NOTES_TABLE filtered on the firm link equal to the record ID, sorted by Created descending, `pageSize` 5, field Overview input only. Keep the first three non-empty values. Each starts with its date, type and author, then any status lines, then the text.

5. **Present it.** In this order, and short:
   - One line on currency (step 3).
   - The Group Overview as written. It is markdown; keep its bullets and bold labels.
   - "Newest notes", three lines: the date and author, then the gist in a dozen words, including any status change the note carried. Leave out personal details about individuals (family, health, where they live); professional background is fine.
   - Only if asked, or if the overview is empty: the stats block, Our companies with them, and Portal contacts.

   If the overview is empty, brief from the notes instead: the five newest, same style, with a line saying the agent has not written this firm yet.

## Rules

- Read-only. Never write Group Overview, any other field, or any record, and never submit a form. A stale or frozen overview is reported, not repaired; the repair happens in Airtable or by logging a new note through **investor-meeting-summary**.
- Never paste a draft overview into the cell, however good it is. A hand edit freezes the cell for the agent.
- Use only what is in the base. Add nothing from your own knowledge about the firm.
- When unsure which firm, ask rather than guess. Near-identical names are separate records on purpose.
- Never skip step 0. If the connector drops mid-run, stop and say so.
