# Investor Meeting Summary — Claude plugin

Logs investor meetings for the whole team: pulls the Otter.ai transcript, distills a structured investor-focused note (fund and thesis, dealflow in each direction, passes, co-investors, people, follow-ups — nothing about Portal itself), and files it in the Airtable VC CRM after the user confirms.

**It files by submitting the "New meeting or firm updates" form, not by creating
the record.** Two automations on the notes table trigger on `formSubmitted`
rather than `recordCreated` — one of them tags the submitter as the **Portal
Contact** on everyone they met with, which is how the base records who owns a
relationship. An API-created record skips both, silently: the note lands looking
perfect and nobody is tagged. Submitting the form fires the `recordCreated`
automations too, so it is strictly a superset.

## The note

Twelve possible sections, of which a typical note uses four or five — a section
exists only if the conversation actually produced it. Bullets only, no word cap,
and `SKILL.md` carries a worked example. Splitting dealflow into three
directions (companies they are working on / sharing with us / we are sharing
with them) is deliberate: they are different obligations, and collapsing them
loses which one you owe.

Firm matching prefers the attendee's **email domain** over the name heard in the
transcript. Otter renders proper nouns unreliably, and this base holds WuXi
Biologics, WuXi AppTec and WuXi STA as three separate records whose CDAs do not
cover each other.

## How the Group Overview field agent fits in

Each investor record carries **Group Overview** (`fldzKsGxC32svNmYK`), a short
summary of who the firm is, how it invests, where we stand, which of our
companies it has seen and what is open. It is written by an **Airtable field
agent**, not by this plugin: helper fields turn the firm's notes, stats and
shared companies into text, the agent reads them and rewrites the overview
whenever a note is logged. Meeting notes outrank the stats, and newer notes
outrank older ones. No web research.

The loop, once the agent is live:

1. A teammate logs a meeting through this plugin (or the form directly).
2. The note lands in "Investor Viewer Updater"; the helper rollups on the firm
   record change; the agent re-runs and rewrites Group Overview.
3. Next time, the skill reads the overview before drafting, but only to spot
   what changed for "Since last time". Nothing is copied from it into the
   note, so a mistake in the overview cannot loop back into the notes.
4. After the submission the skill checks that the overview's closing line
   ("Based on N Portal notes through YYYY-MM-DD.") carries today's date, and
   says so if it does not.

**Group Overview is read-only for the team.** A field agent never overwrites a
cell a person edited, so one hand edit silently freezes that investor's
overview. Corrections go in as a new note.

Setting the agent up is a by-hand job in the Airtable UI:
[`docs/group-overview-field-agent.md`](docs/group-overview-field-agent.md)
has the steps, the prompt, the pilot checklist and the switch-on step. Until
that is done, `GROUP_OVERVIEW_LIVE` in `SKILL.md` stays `false` and the skill
behaves exactly as in 2.0.0.

### Configuration: helper fields (live IDs, 2026-10-15)

Base "Venture" `appAX3sMfPtCKv4nB`. The agent's inputs; the skill never
reads or writes them.

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

Two build leftovers named `zz delete me - …` (`fldtT5CxQbu8YnK1R`,
`fldKfeGFG2zgXvcDM`) are unused and wait for a by-hand delete.

### Rules

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

## What's inside

```
investor-meeting-summary/
├── .claude-plugin/plugin.json        # plugin metadata shown in the catalog
├── skills/log-investor-meeting/
│   └── SKILL.md                      # the workflow — triggers on "I just met with [firm]..."
├── docs/group-overview-field-agent.md # by-hand setup of the Group Overview field agent
├── .mcp.json                         # bundles the Otter.ai + Airtable connectors
└── README.md
```

## 1. Configure before distributing

Nothing left to configure. Every table, field, form element and select option
in `skills/log-investor-meeting/SKILL.md` was pulled from the live "Venture"
base and from `get_form_schema` on form `pagSKVK0ORMV9iKWR` (17 Sep 2026),
including IDs, so the workflow is robust to cosmetic renames of the
interface. If the base or the form changes, update the Configuration section
and re-upload the plugin.

Two form fields send real email — "Send reminder email?" (with a 1–4 week
follow-up) and "Notification email". The skill offers them deliberately rather
than setting them silently or pretending they do not exist.

Known base issue, not a plugin issue: the "Automatic Email Alerts" formula
hardcodes two colleagues who have left Portal and fires on any submission for
firms still carrying their names. It matters here because filing through the
form makes the notification automation start running again.

## 2. Distribute to your organization

Org plugin distribution is managed by Owners / Primary Owners of Team and
Enterprise plans, and requires Cowork and Skills to be enabled for the org.

**Option A — manual upload (fastest):**
1. Zip this folder's contents (the zip must contain `.claude-plugin/plugin.json` — keep it under 50 MB).
2. Go to Organization settings > Plugins (claude.ai/admin-settings/plugins).
3. Click "Add plugins" > "Upload a file" > "Upload to a new marketplace", name the marketplace (e.g. "Portal"), and upload the zip.
4. Set the plugin's installation preference: "Installed by default" (recommended), "Available for install", or "Required". Enterprise plans can scope this per group.

To ship an update later, re-upload a zip with the same plugin name — it overwrites the old version automatically.

**Option B — GitHub-synced marketplace (for version control later):**
Create a **private** GitHub repo laid out as:

```
portal-claude-plugins/
├── .claude-plugin/marketplace.json
└── plugins/investor-meeting-summary/    # this folder
```

with `marketplace.json`:

```json
{
  "name": "portal-plugins",
  "owner": { "name": "Portal" },
  "plugins": [
    {
      "name": "investor-meeting-summary",
      "source": "./plugins/investor-meeting-summary",
      "description": "Log investor meetings from Otter.ai into the Airtable CRM"
    }
  ]
}
```

Then Organization settings > Plugins > "Add plugins" > "GitHub", enter
`owner/repo`, and make sure the Claude GitHub App is installed on the repo.
Trigger a sync from the marketplace's "Update" button after each change (or
enable "Sync automatically").

## 3. What teammates do

- The plugin appears in their plugin catalog (or is auto-installed, depending on the preference you set).
- On first use, each person authenticates Otter.ai and Airtable with their own accounts — access is per-user, so Claude only sees what they can see.
- Then they just say: "I just met with [firm] — check Otter and update Airtable."

Note: Otter searches run against each user's own Otter account, so this works
best when everyone's meetings are recorded to their own (or a shared) Otter
workspace.

## Changes

- **2.1.0** (2026-10-15). Group Overview becomes an Airtable field agent fed
  by helper fields; this release adds the helper fields in the base, the setup
  sheet in `docs/`, and two flag-gated steps in `log-investor-meeting`: read
  the overview for context before drafting (step 4) and check that it
  refreshed after the submission (step 6, before the promised-sends offer).
  `GROUP_OVERVIEW_LIVE` ships as `false`, so nothing changes for users until
  the agent is converted and piloted. New rules: never write Group Overview,
  never touch an AI field through the API.
- **2.0.0.** Files through the form, widened the note, hardened firm matching.

## Not yet run end to end

The helper fields are live and checked on SOSV, DCVC Bio and MBX Capital, but
the agent itself has not been set up, so Group Overview is still empty
everywhere and `GROUP_OVERVIEW_LIVE` is `false`. The first live run should
watch:

1. Whether the agent's output renders as bold-labelled bullets in the
   rich-text cell, or as raw asterisks (then switch the prompt to plain lines).
2. The closing line "Based on N Portal notes through YYYY-MM-DD." matching
   Overview note count and Newest note date on the record.
3. Personal details staying out: SOSV's notes mention a contact's
   neighbourhood, DCVC Bio's a contact's family.
4. Credits per run, and whether a hand-edited cell stops refreshing.
5. Step 6 of the skill, the refresh check, which has never run against a
   live agent.
