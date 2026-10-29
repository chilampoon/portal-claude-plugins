---
name: audit-group-overviews
description: Maintainer check of the Group Overview field agent in Portal's Airtable Venture base. Use this when someone asks which investor overviews are stale, empty, frozen or missing, whether the overview agent is keeping up, or to audit, check or review the group overviews — e.g. "audit the group overviews", "are the investor overviews up to date", "how many VCs still have an empty overview". Read-only: it reports and never writes.
---

# Audit the Group Overviews

Classify every VC/PE firm's Group Overview as current, stale, without a closing
line, or empty, and report what needs attention and why. This skill never
writes anything. Fixes happen in Airtable, by re-running the agent on a cell or
a view, or by clearing a hand-edited cell.

## Configuration (live IDs, 2026-10-15)

- AIRTABLE_BASE: "Venture" — baseId `appAX3sMfPtCKv4nB`
- INVESTORS_TABLE: "Organizations from Hubspot CRM" — tableId `tbl5bYS4WIAr3BFWK`. VCs view `viw2uiqBRhcjHucXY`.
  - Name `fldXgesU5mz8YB1kq` · Org Type (from HubSpot CRM) `fldS2yWqOfPmkOLwE` (lookup; "Venture Capital/Private Equity" marks the scope)
  - Group Overview `fldzKsGxC32svNmYK` — the API returns an object `{state, value, isStale}`; classify on `value`, and report `isStale` as Airtable's own staleness flag. **Never write it.**
  - Overview note count `fldmtCayz9xI8Q9CR` · Newest note date `fldIDWMUq53JKX4Rn` (YYYY-MM-DD)
- Scope: VC/PE firms with Overview note count > 0 (about 365). Firms without a real note are out of scope and are only counted.
- The agent's closing line reads `Based on N Portal notes through YYYY-MM-DD.`

## Pipeline

0. **Preflight.** Check the Airtable tools are present and make one cheap call (`ping` or `list_bases`). Stop on a missing connector or an auth error.

1. **Pull the records.** `list_records_for_table` on INVESTORS_TABLE with fields Name, Org Type, Group Overview, Overview note count and Newest note date, filtered on Overview note count > 0, `pageSize` 8000. Expect roughly 390 records and a large result; if the result is saved to a file rather than returned inline, process it with a script rather than reading it. Keep only records whose Org Type lookup contains "Venture Capital/Private Equity".

2. **Classify each record.**
   - **Empty**: no Group Overview object, or an empty `value`.
   - **No closing line**: text present, but no `Based on N Portal notes through YYYY-MM-DD.` line. Usually a hand edit, which freezes the cell, or an agent error.
   - **Stale**: closing line present, but N is not the record's Overview note count, or the date is earlier than Newest note date.
   - **Current**: N and the date match. Note separately any current overview whose `isStale` is true: an input changed and the agent has not re-run yet.

3. **Report.** Counts for the four classes, the scope size, and the number of VC/PE firms with no real note (out of scope). Then a table of everything not current: Name, record ID, class, "N vs count", "through-date vs newest". Sort empties last, since they are usually one bulk run. Keep the table to what fits; say how many more there are.

4. **Say what to do, by class.** In Airtable, by hand:
   - Empty: the agent has not run on these cells. Run it on the cell, or on "All cells in the view" for a view of VC/PE firms with Overview note count > 0. If the workspace is out of AI credits, nothing runs until it is topped up.
   - No closing line: open the cell; if a person edited it, clear it and re-run the agent on that cell. If the text is an error message, re-run; if it fails again, the input may exceed the model's cap (the largest input in the base is about 3,000 words).
   - Stale: usually lag. Re-check after five minutes; if still stale, re-run the agent on that cell.
   Offer to re-run the audit after the user has done any of these.

## Rules

- Read-only. Never write Group Overview or any other field, never create, edit or delete records, never submit a form, and never touch an AI field through the API.
- Report the facts as found. If the connector returns fewer records than expected, say so rather than extrapolating.
- Never skip step 0.
