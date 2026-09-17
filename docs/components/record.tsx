import type { ReactNode } from "react";

/* Compact prose inside record fields: tighter paragraphs and lists. */
const compact =
  "text-[0.95rem] leading-[1.55] [&_p]:my-1 [&_ul]:my-1.5 [&_ul]:ps-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_li]:ps-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_strong]:font-semibold";

/**
 * A facsimile of an Airtable record, drawn in CSS so the docs can show what a
 * plugin writes without a screenshot that goes stale.
 */
export function Record({ title, table, children }: { title: string; table?: string; children: ReactNode }) {
  return (
    <div className="record my-6 rounded-lg border border-fd-border bg-fd-card px-6 py-6 text-fd-card-foreground shadow-(--card-shadow) max-sm:px-4">
      <div className="not-prose mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-fd-border pb-3.5">
        <p className="font-display text-[1.25rem] font-bold tracking-[-0.015em]">{title}</p>
        {table ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-fd-muted-foreground">{table}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

/** Two-column grid of short fields (chips, dates). */
export function Fields({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="not-prose mb-1.5 font-mono text-[11px] uppercase tracking-[0.09em] text-fd-muted-foreground">
        {label}
      </p>
      <div className={compact}>{children}</div>
    </div>
  );
}

const tones = {
  default: "border-chip-border bg-chip text-fd-foreground",
  mark: "border-mark-border bg-mark-soft text-fd-foreground",
  muted: "border-fd-border bg-transparent text-fd-muted-foreground"
} as const;

/** A linked-record or select pill. */
export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return (
    <span
      className={`not-prose mb-1 me-1.5 inline-block rounded-full border px-2.5 py-px text-[0.82rem] leading-5 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** A short aside next to a chip. */
export function Hint({ children }: { children: ReactNode }) {
  return <span className="not-prose text-[0.8rem] leading-5 text-fd-muted-foreground">{children}</span>;
}

/** Text the plugin adds to a field, shown against whatever was already there. */
export function Appended({ label = "Added by the plugin", children }: { label?: string; children: ReactNode }) {
  return (
    <div className={`mt-3 rounded-md border border-mark-border bg-mark-soft px-3.5 py-3 ${compact}`}>
      <p className="not-prose mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fd-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

/** Key/value list under a record explaining each field. */
export function Legend({ children }: { children: ReactNode }) {
  return <ul className="not-prose my-5 list-none p-0 text-[0.94rem] leading-[1.5]">{children}</ul>;
}

export function LegendItem({ k, children }: { k: string; children: ReactNode }) {
  return (
    <li className="grid gap-x-4 gap-y-0.5 border-t border-fd-border py-2.5 first:border-t-0 first:pt-0 sm:grid-cols-[150px_minmax(0,1fr)]">
      <span className="pt-0.5 font-mono text-[12px] uppercase tracking-[0.05em] text-fd-muted-foreground">{k}</span>
      <span>{children}</span>
    </li>
  );
}
