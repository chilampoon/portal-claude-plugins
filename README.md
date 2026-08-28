# Portal Claude plugins (marketplace repo)

This repository is a Claude plugin **marketplace**. Its manifest lives at
`.claude-plugin/marketplace.json` and lists the plugins under `plugins/`.

Currently ships: **portal-investor-notes** — log investor meetings from
Otter.ai into the Venture Airtable CRM. See its own README for details.

To ship an update: edit files under `plugins/portal-investor-notes/`,
bump `version` in its `.claude-plugin/plugin.json`, and push.
