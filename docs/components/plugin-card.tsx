import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

/** Grid of plugin cards on the front page. Children must be <PluginCard>. */
export function PluginCards({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose rise my-10 grid gap-3 sm:grid-cols-2" style={{ "--rise-i": 3 } as CSSProperties}>
      {children}
    </div>
  );
}

export function PluginCard({
  n,
  href,
  title,
  needs,
  children
}: {
  n: string;
  href: string;
  title: string;
  /** Connectors the plugin signs in to. */
  needs?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-fd-border bg-fd-card p-5 text-fd-card-foreground shadow-(--card-shadow) transition-colors hover:border-fd-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary"
    >
      <span className="font-mono text-[11px] tracking-[0.12em] text-fd-muted-foreground">{n}</span>
      <span className="mt-2 font-display text-[1.15rem] font-bold leading-[1.2] tracking-[-0.015em]">{title}</span>
      <span className="mt-2 text-[0.92rem] leading-[1.5] text-fd-muted-foreground">{children}</span>
      {needs ? (
        <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-fd-muted-foreground">Needs {needs}</span>
      ) : null}
      <span className="mt-4 inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-fd-primary">
        Open
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
          <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
