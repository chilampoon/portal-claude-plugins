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

## How the Group Overview fits in

Each investor record carries **Group Overview** (`fldzKsGxC32svNmYK`), a short
summary written by an Airtable field agent from the firm's notes. That feature,
its setup sheet, the helper fields and the read-only skills around it live in
the **investor-group-overview** plugin (`../investor-group-overview/`). This
plugin touches it in two flag-gated places: step 4 reads the overview before
drafting, only to spot what changed for "Since last time", and step 6 checks
after the submission that the overview refreshed. Nothing is ever copied from
it into a note, and nothing here writes it. Until the agent is converted,
`GROUP_OVERVIEW_LIVE` in `SKILL.md` stays `false` and the skill behaves exactly
as in 2.0.0.

Two rules carry over: never write Group Overview, even to fix a stale one, and
never create, convert or reconfigure an AI field through the API.

## What's inside

```
investor-meeting-summary/
├── .claude-plugin/plugin.json        # plugin metadata shown in the catalog
├── skills/log-investor-meeting/
│   └── SKILL.md                      # the workflow — triggers on "I just met with [firm]..."
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

- **2.1.2** (2026-10-28). Step 6 reads the agent cell's `value` and `isStale`.
- **2.1.1** (2026-10-15). The Group Overview setup sheet, field reference and
  rules move to the new **investor-group-overview** plugin; this README keeps a
  cross-reference. No behaviour change.
- **2.1.0** (2026-10-15). Two flag-gated steps in `log-investor-meeting` for
  the Group Overview field agent: read the overview for context before drafting
  (step 4) and check that it refreshed after the submission (step 6, before the
  promised-sends offer). `GROUP_OVERVIEW_LIVE` ships as `false`, so nothing
  changes for users until the agent is converted and piloted. New rules: never
  write Group Overview, never touch an AI field through the API.
- **2.0.0.** Files through the form, widened the note, hardened firm matching.

## Not yet run end to end

The Group Overview agent has not been set up, so `GROUP_OVERVIEW_LIVE` is
`false` and steps 4 and 6 have never run against a live overview. When the
pilot in the investor-group-overview plugin passes, flip the flag, bump the
patch version, and watch the first real submission: the refresh check should
find today's date in the overview's closing line within a few minutes, and
should say so plainly if it does not.
