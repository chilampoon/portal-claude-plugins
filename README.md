# Portal Claude plugins (marketplace repo)

This repository is a Claude plugin **marketplace**. Its manifest lives at
`.claude-plugin/marketplace.json` and lists the plugins under `plugins/`.

Currently ships:

- **investor-meeting-summary** — log investor meetings from Otter.ai into the
  Venture Airtable VC CRM.
- **triage-note-updates** — file startup triage notes from a Word doc, PDF or
  email into the company's Deal Flow record in the same base.

Both write to the "Venture" base (`appAX3sMfPtCKv4nB`); each carries the table
and field IDs it needs in its own `SKILL.md`, so renames in the Airtable UI do
not break them. See each plugin's README for details.

To ship an update: edit files under `plugins/<plugin>/`, bump `version` in its
`.claude-plugin/plugin.json`, and push.
