import type { ComponentType, ReactNode } from "react";
import type { Root } from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";
import type { MDXComponents } from "mdx/types";

// fumadocs-mdx compiles every imported .mdx file and exports the component,
// its table of contents and its frontmatter (see mdx.d.ts for the types).
import * as gettingStarted from "@/content/docs/index.mdx";
import * as investorMeetingSummary from "@/content/docs/investor-meeting-summary/index.mdx";
import * as triageNoteUpdates from "@/content/docs/triage-note-updates/index.mdx";

type MdxModule = {
  default: ComponentType<{ components?: MDXComponents }>;
  toc: TOCItemType[];
  frontmatter: { title?: string; description?: string };
};

export type DocPage = {
  path: string;
  slug: string[];
  title: string;
  description: string;
  /** Small mono label above the title. */
  eyebrow: string;
  toc: TOCItemType[];
  component: MdxModule["default"];
};

function docPage(path: string, mod: MdxModule, eyebrow: string): DocPage {
  const { title, description } = mod.frontmatter;

  if (!title || !description) {
    throw new Error(`content/docs/${path || "index"}: frontmatter needs both title and description.`);
  }

  return {
    path,
    slug: path === "" ? [] : path.split("/"),
    title,
    description,
    eyebrow,
    toc: mod.toc,
    component: mod.default
  };
}

export const docsPages: DocPage[] = [
  docPage("", gettingStarted, "Portal · Claude plugins"),
  docPage("investor-meeting-summary", investorMeetingSummary, "Portal · Claude plugin"),
  docPage("triage-note-updates", triageNoteUpdates, "Portal · Claude plugin")
];

function separator(name: string): ReactNode {
  return (
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-fd-muted-foreground">
      {name}
    </span>
  );
}

export const docsPageTree: Root = {
  name: "Portal Claude plugins",
  children: [
    { type: "page", name: docsPages[0].title, url: "/docs" },
    { type: "separator", name: separator("Plugins") },
    { type: "page", name: docsPages[1].title, url: "/docs/investor-meeting-summary" },
    { type: "page", name: docsPages[2].title, url: "/docs/triage-note-updates" }
  ]
};

export function getDocPage(slug?: string[]): DocPage | undefined {
  const path = slug?.length ? slug.join("/") : "";
  return docsPages.find((page) => page.path === path);
}
