import type { ReactNode } from "react";

/** The one line the reader says to Claude, highlighted like a marker pen. */
export function Say({ children }: { children: ReactNode }) {
  return (
    <p className="not-prose my-4 font-display text-[clamp(1.1rem,2.4vw,1.35rem)] font-bold leading-[1.45] tracking-[-0.015em]">
      <span className="mark">{children}</span>
    </p>
  );
}
