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
