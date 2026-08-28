# Portal Investor Notes — Claude plugin

Logs investor meetings for the whole team: pulls the Otter.ai transcript, distills a short investor-focused summary (highlights, companies shared, investor updates, relationship details — nothing about Portal itself), and logs it as a new note record linked to the firm in the Airtable VC CRM after the user confirms.

## What's inside

```
portal-investor-notes/
├── .claude-plugin/plugin.json        # plugin metadata shown in the catalog
├── skills/log-investor-meeting/
│   └── SKILL.md                      # the workflow — triggers on "I just met with [firm]..."
├── .mcp.json                         # bundles the Otter.ai + Airtable connectors
└── README.md
```

## 1. Configure before distributing

Nothing left to configure. Every table, field, and select option in
`skills/log-investor-meeting/SKILL.md` was pulled from the live "Venture"
base schema (27 Aug 2026), including table/field IDs, so the workflow is
robust to cosmetic renames of the interface. If the base schema ever
changes (fields renamed or removed), update the Configuration section and
re-upload the plugin.

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
└── plugins/portal-investor-notes/    # this folder
```

with `marketplace.json`:

```json
{
  "name": "portal-plugins",
  "owner": { "name": "Portal" },
  "plugins": [
    {
      "name": "portal-investor-notes",
      "source": "./plugins/portal-investor-notes",
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
