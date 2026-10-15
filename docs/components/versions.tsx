import fs from "node:fs";
import path from "node:path";

import Link from "next/link";

type MarketplaceEntry = { name: string; source: string };
type PluginManifest = { displayName?: string; version?: string };

type PluginVersion = {
  name: string;
  displayName: string;
  version: string;
  /** Set when a docs page exists for the plugin, e.g. "/docs/triage-note-updates". */
  href?: string;
};

/*
 * The docs site lives inside the marketplace repository, so the plugin
 * manifests are one directory up. Both `next build` locally and the Pages
 * workflow run from `docs/`.
 */
const repoRoot = path.resolve(process.cwd(), "..");

function readJson<T>(file: string): T | undefined {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function readPluginVersions(): PluginVersion[] {
  const marketplace = readJson<{ plugins?: MarketplaceEntry[] }>(
    path.join(repoRoot, ".claude-plugin", "marketplace.json")
  );

  return (marketplace?.plugins ?? []).map((entry) => {
    const manifest = readJson<PluginManifest>(
      path.join(repoRoot, entry.source, ".claude-plugin", "plugin.json")
    );
    const hasPage = fs.existsSync(path.join(process.cwd(), "content", "docs", entry.name, "index.mdx"));

    return {
      name: entry.name,
      displayName: manifest?.displayName ?? entry.name,
      version: manifest?.version ?? "—",
      href: hasPage ? `/docs/${entry.name}` : undefined
    };
  });
}

/**
 * Current version of every plugin in the marketplace, read from each
 * `plugin.json` at build time. Server component: it is always what is on the
 * branch the site was built from, with nothing to keep in step by hand.
 */
export function PluginVersions() {
  const plugins = readPluginVersions();

  return (
    <ul className="not-prose my-5 list-none p-0 text-[0.94rem] leading-[1.5]">
      {plugins.map((plugin) => (
        <li
          key={plugin.name}
          className="grid items-baseline gap-x-4 gap-y-0.5 border-t border-fd-border py-2.5 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_120px]"
        >
          <span className="font-display font-bold tracking-[-0.01em]">
            {plugin.href ? (
              <Link href={plugin.href} className="hover:underline">
                {plugin.displayName}
              </Link>
            ) : (
              plugin.displayName
            )}
          </span>
          <span className="font-mono text-[13px] tracking-[0.04em] text-fd-primary sm:text-right">{plugin.version}</span>
        </li>
      ))}
    </ul>
  );
}
