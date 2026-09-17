import type { ComponentType } from "react";
import type { Root } from "fumadocs-core/page-tree";
import type { MDXComponents } from "mdx/types";

import GettingStartedPage from "@/content/docs/index.mdx";
import InvestorUsePage from "@/content/docs/investor-meeting-summary/index.mdx";
import InvestorLandsPage from "@/content/docs/investor-meeting-summary/what-lands.mdx";
import TriageUsePage from "@/content/docs/triage-note-updates/index.mdx";
import TriageLandsPage from "@/content/docs/triage-note-updates/what-lands.mdx";

type MdxPageComponent = ComponentType<{ components?: MDXComponents }>;

export type DocPage = {
  description: string;
  group: "Getting started" | "Investor meeting summary" | "Triage note updates";
  path: string;
  slug: string[];
  title: string;
  component: MdxPageComponent;
};

function docPage(
  path: string,
  title: string,
  description: string,
  group: DocPage["group"],
  component: MdxPageComponent
): DocPage {
  return {
    path,
    title,
    description,
    group,
    component,
    slug: path === "" ? [] : path.split("/")
  };
}

export const docsPages: DocPage[] = [
  docPage("", "Getting started", "Install the plugins and connect your accounts.", "Getting started", GettingStartedPage),
  docPage("investor-meeting-summary", "Log an investor meeting", "After a VC meeting, say one sentence and Claude files the note from your Otter transcript.", "Investor meeting summary", InvestorUsePage),
  docPage("investor-meeting-summary/what-lands", "What lands in Airtable", "The note format, the twelve sections, and the fields the form sets.", "Investor meeting summary", InvestorLandsPage),
  docPage("triage-note-updates", "File a triage note", "Hand Claude your triage note as a Word doc, PDF or pasted email and it updates the Deal Flow record.", "Triage note updates", TriageUsePage),
  docPage("triage-note-updates/what-lands", "What lands in Airtable", "Which field each triage section is appended to, and what is deliberately never touched.", "Triage note updates", TriageLandsPage)
];

export const docsPageTree: Root = {
  name: "Portal Claude plugins",
  children: [
    { type: "page", name: "Getting started", url: "/docs" },
    {
      type: "folder",
      name: "Investor meeting summary",
      children: [
        { type: "page", name: "Log an investor meeting", url: "/docs/investor-meeting-summary" },
        { type: "page", name: "What lands in Airtable", url: "/docs/investor-meeting-summary/what-lands" }
      ]
    },
    {
      type: "folder",
      name: "Triage note updates",
      children: [
        { type: "page", name: "File a triage note", url: "/docs/triage-note-updates" },
        { type: "page", name: "What lands in Airtable", url: "/docs/triage-note-updates/what-lands" }
      ]
    }
  ]
};

export function getDocPage(slug?: string[]): DocPage | undefined {
  const path = slug?.length ? slug.join("/") : "";
  return docsPages.find((page) => page.path === path);
}
