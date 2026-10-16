# Investor Group Overview — Claude plugin

Every VC record in the Venture base carries **Group Overview**
(`fldzKsGxC32svNmYK`): a short summary of who the firm is, how it invests,
where we stand, which of our companies it has seen, what is open and what to
watch out for. It is written by an **Airtable field agent**, inside Airtable,
and rewrites itself a couple of minutes after any note is logged on the firm.
Meeting notes outrank the stats, newer notes outrank older ones, and no web
research is involved.

This feature has two parts, and this plugin is the Claude half:

- **The Airtable field agent** does the writing. Helper fields in the base turn
  each firm's notes, stats and shared companies into text; the agent reads them
  and rewrites the overview whenever they change. It is set up by hand in the
  Airtable UI, following `docs/group-overview-field-agent.md`.
- **This plugin** reads. `brief-investor` gives anyone the firm's overview
  before a meeting, with a check that it is current, and the last few notes.
  `audit-group-overviews` tells the maintainer which overviews are stale,
  empty or frozen. Neither skill writes anything.

**Group Overview is read-only for the team.** A field agent never overwrites a
cell a person edited, so one hand edit silently freezes that firm's overview.
Corrections go in as a new note, through **investor-meeting-summary** or the
"New meeting or firm updates" form. That plugin also reads the overview for
context when drafting a note and checks it refreshed after the submission, once
its `GROUP_OVERVIEW_LIVE` flag is on.

> **Not yet live.** The helper fields exist and were checked on SOSV, DCVC Bio
> and MBX Capital on 2026-10-15, but the agent has not been converted, so every
> Group Overview is still empty. Until it is, `brief-investor` says so and
> briefs from the notes instead, and `audit-group-overviews` reports everything
> as empty. See **Unverified** below for what the pilot should watch.

## What's inside

```
investor-group-overview/
├── .claude-plugin/plugin.json             # plugin metadata shown in the catalog
├── skills/brief-investor/SKILL.md         # "brief me on SOSV before my call"
├── skills/audit-group-overviews/SKILL.md  # maintainer: which overviews are stale, empty or frozen
├── docs/group-overview-field-agent.md     # by-hand setup of the agent: steps, prompt, pilot, field reference
├── .mcp.json                              # bundles the Airtable connector
└── README.md
```

## How a run goes

**Brief.** "Brief me on SOSV before my call." Claude finds the firm record,
confirming it when names are close, and reads its Group Overview. It checks the
overview's closing line ("Based on N Portal notes through YYYY-MM-DD.") against
the record's Overview note count and Newest note date, and says in one line
whether the overview is current, behind, frozen by a hand edit, or empty. Then
it shows the overview as written, the three newest notes in one line each, and
the stats and shared companies on request. Nothing is written.

**Audit.** "Audit the group overviews." Claude pulls every VC/PE firm with at
least one real note, classifies each overview as current, stale, no closing
line, or empty, and reports the counts with a table of everything not current
and the likely cause: agent lag, out of credits, a hand edit, or an agent error.
It never fixes anything; the fixes are in Airtable, re-running the agent on a
cell or on a view.

## Configuration (live IDs, 2026-10-15)

Base "Venture" `appAX3sMfPtCKv4nB`. Investors are "Organizations from Hubspot
CRM" `tbl5bYS4WIAr3BFWK`; notes are "Investor Viewer Updater"
`tblQbKYkiNx3rckpj`. Each skill carries the IDs it reads. The helper fields the
agent reads, made through the Airtable connector:

| Field | Table | ID | Type |
| --- | --- | --- | --- |
| Overview input | Investor Viewer Updater | `fldxGxioudTxEvZ9q` | formula |
| Overview note date | Investor Viewer Updater | `fld2Lm78Ae4AQEUNF` | formula |
| Notes for overview | Organizations | `fldkMMvyyiBFJ9glD` | rollup |
| Overview note count | Organizations | `fldmtCayz9xI8Q9CR` | rollup |
| Newest note (raw) | Organizations | `fldjB8T9ttKIV4VgC` | rollup |
| Newest note date | Organizations | `fldIDWMUq53JKX4Rn` | formula |
| Stats modified | Organizations | `fldnHlQcpompozXS8` | formula |
| Investor stats (text) | Organizations | `fldRWCg1ST2nttz6Q` | formula |
| Our companies with them | Organizations | `fldsT1ke8p6JXNnm0` | formula |
| Portal contacts (text) | Organizations | `fld4WoLgxQlbzlAD2` | formula |

Formulas and the by-hand settings are in `docs/group-overview-field-agent.md`.
Two build leftovers named `zz delete me - …` (`fldtT5CxQbu8YnK1R`,
`fldKfeGFG2zgXvcDM`) are unused and wait for a by-hand delete.

## Unverified — check on the first live run

1. Whether the agent's output renders as bold-labelled bullets in the
   rich-text cell, or as raw asterisks. If raw, swap the prompt's formatting
   paragraph for plain labelled lines.
2. The closing line matching Overview note count and Newest note date on the
   record; `brief-investor` and `audit-group-overviews` both depend on it.
3. Personal details staying out. SOSV's notes mention a contact's
   neighbourhood; DCVC Bio's a contact's family.
4. Credits per run, and whether a hand-edited cell stops refreshing as the
   Airtable docs say.
5. The refresh check in `investor-meeting-summary`, which has never run
   against a live agent.

## Limitations

- The overview is only as good as the notes. A firm with filler notes ("sent",
  a bare date) gets a thin overview; that is correct, not a bug.
- Portal contacts repeat names in the agent's input, because Airtable's
  ARRAYUNIQUE does not dedupe collaborators. The prompt allows for it.
- The connector can read the field and its definition but cannot see the
  agent's configuration, model or run history, cannot trigger a run, and
  cannot delete a field.
- The brief reads the overview as markdown, which is how the API returns a
  rich-text cell.

## Rules

- Never write Group Overview (`fldzKsGxC32svNmYK`), even to fix a stale one.
- Never create, edit or delete records in Investor Viewer Updater directly.
  Notes reach it only through the notes form, as today.
- Never create, convert or reconfigure an AI field through the API.
- No helper field uses NOW() or TODAY(). They recalculate constantly and would
  re-run the agent and spend credits.
- Create or change helper fields only after the maintainer approves the list.
  Any change re-runs the agent on every cell once it is live, and a rollup
  change is a delete-and-recreate by hand.
- When unsure about anything (which firm, which field, what a note means),
  ask.

## Using it

Install from the Portal marketplace, connect Airtable on first use, and say
"brief me on [firm]". Maintainers say "audit the group overviews". In Claude
Code:

```
/plugin install investor-group-overview --marketplace chilampoon/portal-claude-plugins
```

## Changes

- **0.1.0** (2026-10-15). First release: the setup sheet, the field reference,
  `brief-investor` and `audit-group-overviews`. Split out of
  investor-meeting-summary 2.1.0, which keeps its flag-gated overview steps.
