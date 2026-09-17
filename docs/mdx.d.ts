// Named exports that fumadocs-mdx adds to every compiled .mdx module, on top
// of the default export declared by @types/mdx. This file must stay a script
// (no top-level import/export) so the declaration merges instead of replacing.
declare module "*.mdx" {
  import type { TOCItemType } from "fumadocs-core/toc";

  export const toc: TOCItemType[];
  export const frontmatter: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}
