import type { ReactNode } from "react";

/** The "Good to know" list: a bold claim and one line of explanation each. */
export function Facts({ children }: { children: ReactNode }) {
  return <ul className="not-prose my-2 list-none p-0">{children}</ul>;
}

export function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="border-t border-fd-border py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-1 font-display text-[1rem] font-bold tracking-[-0.01em]">{title}</h3>
      <p className="text-[0.96rem] leading-[1.55] text-fd-muted-foreground">{children}</p>
    </li>
  );
}
