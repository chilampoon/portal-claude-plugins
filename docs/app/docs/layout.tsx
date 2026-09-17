import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { docsPageTree } from "@/lib/docs";
import { baseOptions } from "@/lib/layout.shared";

/*
 * Fumadocs sets a five-column grid on #nd-docs-layout as an inline style.
 * Passing `style` here replaces it. Column sizes are CSS variables defined in
 * app/global.css so they can change per breakpoint:
 *
 *   sidebar | gutter | main | gutter (TOC left-aligned inside) | pad
 *
 * From xl up the two gutters are equal `minmax(0, 1fr)` tracks and the pad
 * equals the sidebar column, so the article is centered in the viewport and
 * stays put when the sidebar collapses (both outer columns go to 0 together).
 */
const gridTemplate = `"sidebar header header header header"
"sidebar toc-popover toc-popover toc-popover toc-popover"
"sidebar . main toc ." 1fr / var(--fd-sidebar-col) var(--docs-gutter) minmax(0, var(--docs-main)) var(--docs-gutter) var(--docs-pad)`;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...baseOptions()} tree={docsPageTree} containerProps={{ style: { gridTemplate } }}>
      {children}
    </DocsLayout>
  );
}
