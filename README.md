# Portal Claude plugins (marketplace repo)

This repository is a Claude plugin **marketplace**. Its manifest lives at
`.claude-plugin/marketplace.json` and lists the plugins under `plugins/`.

Currently ships:

- **investor-meeting-summary** — log investor meetings from Otter.ai into the
  Venture Airtable VC CRM.
- **triage-note-updates** — file startup triage notes from a Word doc, PDF or
  email into the company's Deal Flow record in the same base.


## Docs

https://chilampoon.github.io/portal-claude-plugins/ — install steps, how to use
each plugin, and what lands in Airtable.

Source lives in `docs/` (Next.js + Fumadocs, static export). Every push to `main`
rebuilds and publishes it via `.github/workflows/docs-pages.yml`. To work on it
locally: `cd docs && npm install && npm run dev`.

## Shipping a plugin update

Edit files under `plugins/<plugin>/`, bump `version` in its
`.claude-plugin/plugin.json`, and push to `main`.
