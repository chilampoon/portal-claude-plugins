import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";

import { getDocPage, docsPages } from "@/lib/docs";
import { getMDXComponents } from "@/mdx-components";

export function generateStaticParams() {
  return docsPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = getDocPage(params.slug);

  if (!page) return {};

  return {
    // The overview page's title equals the layout's template suffix, so use an
    // absolute title there to avoid "Portal Claude plugins | Portal Claude plugins".
    title: page.path === "" ? { absolute: page.title } : page.title,
    description: page.description
  };
}

function rise(index: number): CSSProperties {
  return { "--rise-i": index } as CSSProperties;
}

export default async function DocsSlugPage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = getDocPage(params.slug);

  if (!page) notFound();

  const MDX = page.component;

  return (
    <DocsPage toc={page.toc} breadcrumb={{ enabled: false }}>
      <p
        className="rise -mb-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-fd-muted-foreground"
        style={rise(0)}
      >
        {page.eyebrow}
      </p>
      <DocsTitle
        className="rise max-w-[16ch] font-display text-[clamp(2rem,4.6vw,2.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
        style={rise(1)}
      >
        {page.title}
      </DocsTitle>
      <DocsDescription className="rise mb-6 max-w-[58ch] text-[1.06rem] leading-[1.55]" style={rise(2)}>
        {page.description}
      </DocsDescription>
      <DocsBody className="rise" style={rise(3)}>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
