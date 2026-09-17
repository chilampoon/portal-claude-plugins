import type { ReactNode } from "react";

/** Numbered steps in the style of the printed guide. Children must be <Step>. */
export function Steps({ children }: { children: ReactNode }) {
  return <div className="steps my-4">{children}</div>;
}

export function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-x-5 gap-y-1.5 border-t border-fd-border py-6 first:border-t-0 first:pt-1 sm:grid-cols-[44px_minmax(0,1fr)]">
      <div className="not-prose pt-1 font-mono text-[13px] tracking-[0.04em] text-fd-primary">{n}</div>
      <div className="min-w-0">
        <h3 className="not-prose mb-2 font-display text-[1.12rem] font-bold leading-[1.3] tracking-[-0.01em]">
          {title}
        </h3>
        <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
      </div>
    </section>
  );
}
