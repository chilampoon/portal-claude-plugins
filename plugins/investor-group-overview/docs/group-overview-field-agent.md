# Group Overview field agent — setup sheet

Group Overview (`fldzKsGxC32svNmYK`) on "Organizations from Hubspot CRM" is an
**Airtable field agent**: an AI field that rewrites itself whenever one of its
inputs changes, with no one asking. Its inputs are helper fields that turn the
firm's meeting notes, stats and shared companies into text. This plugin's `brief-investor` and
`audit-group-overviews` skills read it; **investor-meeting-summary**'s
`log-investor-meeting` reads it for context when drafting a note and checks
that it refreshed after a note is filed.

The agent is configured **by hand in the Airtable UI**, by whoever maintains
the base. The Airtable connector can create an AI field but cannot edit its
prompt afterwards, pick the model or trigger a run, so nothing here goes
through the API. Converting the existing empty field in place keeps its ID.

**Status: pilot in progress.** The field was converted and the agent has run
on three records (2026-10-28). The companies input and the prompt changed on
2026-10-28 (see "Changes" at the end), so paste the prompt below again before
running more cells. `GROUP_OVERVIEW_LIVE` in
`plugins/investor-meeting-summary/skills/log-investor-meeting/SKILL.md` is
still `false`.

## Before you start

- **Read-only for the team.** A field agent never overwrites a cell a person
  edited, so one hand edit silently freezes that investor's overview.
  Corrections go in as a new note through "New meeting or firm updates".
- **No web research.** Internet search stays off; the overview uses only
  Portal's own data. Web research can be added later without changing the rest.
- **Meeting notes outrank everything.** Newer notes beat older ones, and the
  structured stats come second. The prompt below encodes this.
- **No input may depend on NOW() or TODAY()**, for example "Reach out"
  (`fldHZTD1kutpu32kE`). Those recalculate constantly and would keep re-running
  the agent and spending credits. None of the helper fields do.
- **Finalise the helper fields before converting.** Once the agent runs
  automatically, any change to a helper formula recomputes every investor's
  rollup and re-runs the agent on every cell, which costs credits. Formula
  fields can be changed through the connector (`update_field`); rollup
  aggregations cannot, so changing one means deleting it by hand and
  recreating it.
- **Personal details stay out:** family, health, where someone lives.
  Professional background is fine. The prompt says so; the pilot checks it.
- **First scope:** VC/PE orgs with at least one real note (about 385). The
  roughly 270 VC/PE orgs without notes come later.

UI labels below in quotation marks are taken from the brief and were not
checked against the live Airtable UI during the build. If a label differs,
the nearest option is the one meant.

## 1. Check the workspace

Check that Airtable AI is enabled for the workspace and that there are credits.
Field agents spend credits per run, and the full first run covers about 385
cells.

"Organizations from Hubspot CRM" is a normal table (an automation creates
its records from the People table), so adding an AI field to it needs no
special handling.

## 2. Convert Group Overview

1. Open the table, find **Group Overview**, and choose **Edit field**.
2. Turn on **rich text formatting** for the field first (the toggle on a long
   text field; it keeps the field ID). The agent writes bullets with bold
   labels as markdown, and only a rich-text cell renders them. Unverified:
   whether the agent's output renders formatting after the conversion. If the
   pilot shows raw asterisks, replace the formatting paragraph of the prompt
   with plain labelled lines and no markdown.
3. Choose **Convert** ("Automate this field with an agent").
4. **Model:** a higher-powered one (a Claude model if it is listed). The
   largest input is about 2,900 words of notes, so the lower tier's input cap
   is not a concern, but the higher tier reads 22 notes more faithfully.
5. **Internet search: off.**
6. **Run automatically: on.** This is what makes the overview refresh when a
   note is logged.
7. Paste the custom instructions from section 3. Insert each `{…}` as a field
   token, not as typed text.
8. Mark **Investor stats (text)**, **Our companies with them** and **Notes**
   as optional, so the agent still runs when they are empty. The other tokens
   are always filled for an investor in scope.
9. Before saving, note the **credits per run** shown in the preview:
   `________` credits. Multiply by about 385 for the first full run, and keep
   the number for the pilot.

## 3. Custom instructions

Paste exactly this. Every `{…}` is a field token; the table after the block
says which helper field each one is.

```
You write the Group Overview for one investor in Portal Innovations' CRM. Portal is a life-science venture firm and incubator. The reader is a Portal team member about to meet or email this investor.

Investor: {Name}

Sources, in order of authority:
1. Portal's notes below. Each starts "YYYY-MM-DD | update type | author", and notes are separated by =====. They may not be in date order, so read them newest first. When notes disagree on check size, thesis, team or fund status, the newer note wins. Mention an older figure only if the change itself matters, e.g. "first checks up from about $300K to $1M since Jan 2025".
2. Stats entered from earlier notes, last changed {Stats modified}:
{Investor stats (text)}
If a note dated after that says otherwise, use the note.
3. Portal companies shared with this investor, by their status with this firm. Each line is followed by Portal's own pipeline stage for those companies, in the same order: 4.x is a Portal portfolio company, 5.x means Portal passed or lost touch, anything else is still in Portal's pipeline.
{Our companies with them}

Portal notes ({Overview note count}, newest {Newest note date}):
{Notes for overview}

Portal contacts on this relationship (names may repeat): {Portal contacts (text)}
Older free-text notes on the firm (undated, lowest weight): {Notes}

Write under 250 words as a bulleted list (the companies bullet carries the detail; keep the others tight): one bullet per item below, in this order, and leave out any item you have nothing for. Begin each bullet with its label in bold, for example "- **Who they are:** ...". Use no other formatting: no headings, no nested bullets, no bold elsewhere.
- Who they are:
- How they invest: stage, check size, lead or follow, sectors, geography.
- Where we stand: date of the last real contact, who at Portal, how warm, any agreed cadence.
- Our companies with them: date each company from the notes; its latest mention or status line is its last update. Then, only the parts that apply: Co-invested (they invested and Portal's stage is 4.x), with the year. Invested without Portal. Active: status and last update for anything mentioned in the last 6 months. Earlier: anything older, as "Earlier, we discussed A, B and C, without a co-investment recorded", with the last-update dates. Passed, with their stated reason. Say when a company was referred to us by them.
- Open threads: follow-ups from the two most recent notes, with who owes what.
- Watch-outs: hard nos, mandates, sensitivities.
After the list, end with one plain line: "Based on N Portal notes through YYYY-MM-DD."

Rules:
- Use only the material above. Add nothing from your own knowledge.
- Skip pasted email signatures, phone numbers, addresses and scheduling chatter.
- Leave out personal details about individuals: family, health, where they live. Professional background is fine.
- Use people's names as they appear in the notes.
- "Non-con sent" and "Intro meeting" mean Portal brought the company to them, unless the notes say the firm sent or referred it to us; then say "referred to us by them" and never treat it as a Portal pitch or an open thread of ours.
- If there are no Portal notes, start with "No Portal meeting notes yet." and use the stats only.
```

| Token | Field | Table | Optional? |
| --- | --- | --- | --- |
| `{Name}` | Name `fldXgesU5mz8YB1kq` | Organizations | no |
| `{Stats modified}` | Stats modified | Organizations | no |
| `{Investor stats (text)}` | Investor stats (text) | Organizations | **yes** |
| `{Our companies with them}` | Our companies with them (each status line followed by Portal's own stage for those companies) | Organizations | **yes** |
| `{Overview note count}` | Overview note count | Organizations | no |
| `{Newest note date}` | Newest note date | Organizations | no |
| `{Notes for overview}` | Notes for overview | Organizations | no |
| `{Portal contacts (text)}` | Portal contacts (text) | Organizations | no |
| `{Notes}` | Notes `fldtwBiRBEwTlKXFR` (older free text on the firm) | Organizations | **yes** |

Field IDs for the helpers are in Appendix A.

Checked on 2026-10-15: inside a formula, a rich text note arrives as plain
text. Bold markers are stripped, bullet dashes and tab bullets survive, and a
markdown link becomes its visible text. No prompt change is needed for that.

## 4. Field description

Set the field's description to:

> Generated by a field agent from Portal's notes. Don't edit it. To correct it,
> log a note through 'New meeting or firm updates' and it refreshes.

## 5. Lock it

- If the plan has field editing permissions, restrict editing of Group
  Overview to base owners.
- On the investor record page `pagdCdlfOsgWS7GiJ`, show the field read-only.

## 6. Pilot on five records

Run the agent on these cells only (one cell at a time, or a filtered view with
"Run on all cells in the view"), and read each result against its pass
condition before going wider.

| Investor | Record | Passes if |
| --- | --- | --- |
| SOSV | `recP4354KvKNHQswV` | 20 real notes of 22 linked, terms changed three times. Leads with the July 2026 picture (about 20 companies a year, the pre-seed valuation mandate, no cell and gene therapy or CAR-T, women's health), not the 2024 $275K first check. No home location for the contact. |
| DCVC Bio | `recnufH2fELbsUa34` | 17 real notes of 19 linked. Pass reasons survive: Transcera (indication), pacDNA (DM1 and PEG), Vincere (round too small). No family background. |
| MBX Capital | `rec0A99jEMSi32lpH` | Two notes plus filled stats. Stats used, nothing invented. |
| Altitude Lab | `reccQgxQB9zqF0JUg` | Three real notes, all six stats empty. Says "not recorded" rather than guessing. |
| Arboretum Ventures | `rec1w114kaO14NyJm` | VC/PE with no notes and five stats filled. Starts "No Portal meeting notes yet." |

Also check on every pilot result:

- the last line reads "Based on N Portal notes through YYYY-MM-DD." and N and
  the date match the investor's Overview note count and Newest note date;
- one bullet per item with the label in bold, nothing else formatted, under 180 words;
- nothing personal about individuals;
- no phone numbers, addresses or email signatures copied from the notes.

The largest input in the base is Long Game VC (`reci5PZJZk5WE4XhV`, about
3,000 words); add it to the pilot if you pick the lower model tier. If it
errors or comes back truncated, the input is too large for the model chosen. Pick the higher tier, or cap the rollup at the newest fifteen notes:
change the Notes for overview aggregation to
`ARRAYJOIN(ARRAYSLICE(ARRAYCOMPACT(values), -15), "\n\n=====\n\n")` (a
delete-and-recreate, so do it before the full run, not after).

## 7. Full first run

Make a view of "Organizations from Hubspot CRM" filtered to
Org Type (from HubSpot CRM) = "Venture Capital/Private Equity" and
Overview note count > 0 (about 385 records), and run the agent on
"All cells in the view". Spot-check ten results against their notes.

The roughly 270 VC/PE orgs without notes are out of scope for now. The prompt
handles them ("No Portal meeting notes yet.") if they are ever run.

## 8. Switch the plugin on

Switch `GROUP_OVERVIEW_LIVE` to `true` in
`plugins/investor-meeting-summary/skills/log-investor-meeting/SKILL.md`, bump
that plugin's patch version, and push. From then on that skill reads the
overview before drafting a note and checks that it refreshed after the
submission. Then remove the "not yet live" notes from this plugin's README and
the docs site page.

## Appendix A: helper fields

All made through the Airtable connector on 2026-10-15, after approval. None
uses NOW() or TODAY(). Blanks are handled inside the formulas, so no rollup
needs a condition. Dates are stamped in America/Chicago; Airtable formats in
GMT otherwise, which would date an evening note tomorrow.

Two leftovers from the build are named `zz delete me - …` on Organizations
(`fldtT5CxQbu8YnK1R`, `fldKfeGFG2zgXvcDM`). Nothing uses them and the API
cannot delete fields, so delete them by hand.

| Field | ID | Type | Definition |
| --- | --- | --- | --- |
| Overview input | `fldxGxioudTxEvZ9q` | Formula on Investor Viewer Updater | Dated header, the note's own status links, then the text; blank for filler. See below. |
| Overview note date | `fld2Lm78Ae4AQEUNF` | Formula on Investor Viewer Updater | `IF({Overview input}, {Created})` |
| Notes for overview | `fldkMMvyyiBFJ9glD` | Rollup of Overview input via Investor Viewer Updater | `ARRAYJOIN(ARRAYCOMPACT(values), "\n\n=====\n\n")` |
| Overview note count | `fldmtCayz9xI8Q9CR` | Rollup of Overview input | `COUNTALL(ARRAYCOMPACT(values))` |
| Newest note (raw) | `fldjB8T9ttKIV4VgC` | Rollup of Overview note date | `MAX(values)`. A rollup that wrapped this in IF and SET_TIMEZONE returned blank, so the formatting lives in the next field. |
| Newest note date | `fldIDWMUq53JKX4Rn` | Formula | `IF({Newest note (raw)}, DATETIME_FORMAT(SET_TIMEZONE({Newest note (raw)}, 'America/Chicago'), 'YYYY-MM-DD'))` |
| Stats modified | `fldnHlQcpompozXS8` | Formula | `IF(LAST_MODIFIED_TIME(<six stat fields>), DATETIME_FORMAT(SET_TIMEZONE(LAST_MODIFIED_TIME(<six stat fields>), 'America/Chicago'), 'YYYY-MM-DD'), "never")` with AUM (M USD), Min check size (M USD), Max check size (M USD), Fund Stage, Lead deals?, Fund focus |
| Investor stats (text) | `fldRWCg1ST2nttz6Q` | Formula | Six labelled lines, "not recorded" where empty, as in the brief. |
| Our companies with them | `fldsT1ke8p6JXNnm0` | Formula | One labelled line per stage link, each followed by `  Portal stage, same order: …` from the six lookups below, plus "Deals they referred to Portal" from Startups. Changed 2026-10-28. |
| Portal stage · 1 - Non-con sent … 6 - Passed | `fldkEvqPTgv5tRKC9` `fldExibrlu4XQfBzJ` `fld10JXwGrJS8CcMS` `fldFKwP6iNxSbPERo` `fldbA6OwZb13BnCHa` `fldOdD2vb9rQtgkPf` | Lookups | Startups → Pipeline Stage (`fldX6aVYsZ0CdBaVR`) through each stage link. 4.x = Portal portfolio (a co-investment when the firm invested), 5.x = Portal passed or lost touch, else still in the pipeline. Added 2026-10-28. |
| Portal contacts (text) | `fld4WoLgxQlbzlAD2` | Formula | `ARRAYJOIN(ARRAYUNIQUE(ARRAYCOMPACT({Portal Contact (from People)})), ", ")`. Airtable's ARRAYUNIQUE does not dedupe collaborators, so names repeat (SOSV lists Gianina Varea four times). Harmless for the agent; the prompt says names may repeat. |

Overview input, in full:

```
IF(
  OR(
    AND(LEN(TRIM({Notes} & "")) > 2,
        NOT(REGEX_MATCH(LOWER(TRIM({Notes} & "")), "^(n/?a|none|test|[0-9/. -]+|startup diligence status updated on kanban view)$"))),
    {1 - Non-con sent}, {2 - Intro meeting}, {3 - In diligence}, {4 - Likely in syndicate}, {5 - Investment made}, {6 - Passed}
  ),
  DATETIME_FORMAT(SET_TIMEZONE({Created}, 'America/Chicago'), 'YYYY-MM-DD') & " | " & {Update type} & " | " & {Submitted by}
  & IF({1 - Non-con sent}, "\nNon-con sent: " & {1 - Non-con sent})
  & IF({2 - Intro meeting}, "\nIntro meeting: " & {2 - Intro meeting})
  & IF({3 - In diligence}, "\nIn diligence: " & {3 - In diligence})
  & IF({4 - Likely in syndicate}, "\nLikely in syndicate: " & {4 - Likely in syndicate})
  & IF({5 - Investment made}, "\nInvested: " & {5 - Investment made})
  & IF({6 - Passed}, "\nPassed: " & {6 - Passed})
  & IF(AND(LEN(TRIM({Notes} & "")) > 2,
           NOT(REGEX_MATCH(LOWER(TRIM({Notes} & "")), "^(n/?a|none|test|[0-9/. -]+|startup diligence status updated on kanban view)$"))),
       "\n" & TRIM({Notes} & ""))
)
```

A note counts as real when its text passes the filter or when it carries a
status link, so a blank note that only recorded "Passed: Syntis" still feeds
the agent as a dated status event. On 2026-10-15 this blanked 117 of 1,241
notes: 105 kanban-only, 51 empty and 45 bare dates before the status-link
rescue.

### If a field has to be made by hand

Settings for the equivalent fields in the Airtable UI, in case one of the
above is ever recreated:

| Field | Type | Settings |
| --- | --- | --- |
| Overview input, Overview note date | Formula on Investor Viewer Updater | The formulas above. |
| Notes for overview | Rollup | Link field: Investor Viewer Updater · Rolled-up field: Overview input · Aggregation: `ARRAYJOIN(ARRAYCOMPACT(values), "\n\n=====\n\n")`. The UI alternative is a condition "Overview input is not empty" with `ARRAYJOIN(values, "\n\n=====\n\n")`. |
| Overview note count | Rollup (not a Count field) | Same link and field · `COUNTALL(ARRAYCOMPACT(values))`. UI alternative: a Count field with the condition "Overview input is not empty". |
| Newest note (raw) | Rollup | Link field: Investor Viewer Updater · Rolled-up field: Overview note date · `MAX(values)`. Keep the date formatting in the Newest note date formula; a rollup that formats inline returned blank. |
| Newest note date, Stats modified, Investor stats (text), Our companies with them, Portal contacts (text) | Formula | The formulas above. Stats modified's UI alternative is a Last modified time field limited to the six stat fields, date only. |

## Appendix B: what was verified during the build, and what was not

Verified on 2026-10-15 against the live base:

- Every field ID in the brief matches the schema. Group Overview is long text and empty on all 4,161 records. The stat fields are ordinary local fields.
- No automation watches the helper fields. "Copy city from Hubspot" watches only the region lookup; "Update record order number…" fires on entering the VCs view; the only automation watching the per-company selects is undeployed.
- Stage links hold the current status. Where links and per-company selects disagree (Moonlight at SOSV, Vincere at DCVC Bio, March at Mission BioCapital, Iterion at Bain), the links show the later stage, and the per-select "Modified" fields all sit in January 2025.
- Rich text in a formula: plain text, bold stripped, bullet dashes kept, links flattened to their text.
- Filter: 117 of 1,241 notes blanked, matching the offline simulation exactly. Counts on the pilot firms: SOSV 20, DCVC Bio 17, MBX Capital 2.
- Rollup order follows the link cell, mostly oldest first but not always (SOSV's June 2024 note sits after an October 2024 one). The prompt reads by header date.
- Input size: largest Notes for overview is Long Game VC at 3,042 words; median 126 among the 367 VC/PE investors with a real note.
- Connector capabilities: creates formula, rollup, count and lastModifiedTime fields; rollups take no condition; formula fields can be edited afterwards, rollups cannot; nothing can delete a field.

Not verified, because they happen in the UI or need the agent running:

- The UI labels quoted in sections 2 and 5, and whether the agent's output renders bold and bullets in the rich-text cell.
- Credits per run, and the agent's behaviour on hand-edited cells.
- The refresh check in `log-investor-meeting` end to end.

## Changes

- **2026-10-28.** The companies input could not tell a co-investment from a
  deal the firm did alone, had no dates, and said nothing about who brought a
  deal. Fix: six lookups pull Portal's Pipeline Stage for every company on each
  stage link, "Our companies with them" pairs names with those stages, and the
  prompt now dates each company from the notes, splits Co-invested / Invested
  without Portal / Active / Earlier / Passed, and reads deal direction from the
  notes. Word limit raised to 250 so the companies bullet has room. The agent
  reads the same field token, so no token change in the UI; paste the new
  prompt and re-run the cells already generated.
- **2026-10-15.** First version.
