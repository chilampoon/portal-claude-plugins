import fs from "node:fs";
import path from "node:path";

import { withBasePath } from "@/lib/base-path";

type ScreenshotProps = {
  /** Path under `public/`, e.g. "/screenshots/add-marketplace.png". */
  src: string;
  alt: string;
  caption?: string;
};

/**
 * Renders the image when the file exists in `public/`, otherwise a dashed
 * placeholder. Server component: the check runs at build time, so dropping the
 * file in and rebuilding is all it takes to replace the placeholder.
 *
 * A plain <img> is used on purpose. next/image with `unoptimized` does not
 * prepend basePath, and markdown images fail the build when the file is missing.
 */
export function Screenshot({ src, alt, caption }: ScreenshotProps) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));

  if (!exists) {
    return (
      <div className="not-prose my-4 rounded-md border-[1.5px] border-dashed border-fd-border bg-fd-card/60 px-4 py-4">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.1em] text-fd-muted-foreground">Screenshot</p>
        <p className="text-[0.92rem] leading-[1.5] text-fd-muted-foreground">{alt}</p>
        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-2 font-mono text-[11px] text-fd-muted-foreground/80">
            Add docs/public{src} and reload.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <figure className="not-prose my-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBasePath(src)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full rounded-md border border-fd-border bg-fd-card shadow-(--card-shadow)"
      />
      {caption ? <figcaption className="mt-2 text-[0.85rem] text-fd-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}
