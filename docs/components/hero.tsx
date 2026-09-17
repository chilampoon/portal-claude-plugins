import type { CSSProperties, ReactNode } from "react";

function rise(i: number): CSSProperties {
  return { "--rise-i": i } as CSSProperties;
}

/** Front-page opening: eyebrow, display headline, one-paragraph pitch. */
export function Hero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header className="not-prose pb-2 pt-4 md:pt-10">
      <p className="rise font-mono text-[11.5px] uppercase tracking-[0.14em] text-fd-muted-foreground" style={rise(0)}>
        {eyebrow}
      </p>
      <h1
        className="rise mt-5 max-w-[14ch] font-display text-[clamp(2.4rem,6.4vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
        style={rise(1)}
      >
        {title}
      </h1>
      <div
        className="rise mt-6 max-w-[56ch] text-[1.08rem] leading-[1.55] text-fd-muted-foreground [&_strong]:font-medium [&_strong]:text-fd-foreground"
        style={rise(2)}
      >
        {children}
      </div>
    </header>
  );
}
