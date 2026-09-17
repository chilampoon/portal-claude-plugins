import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Children, Fragment, cloneElement, isValidElement } from "react";

type FlowStepProps = {
  n: string;
  title: string;
  note?: string;
  /** Highlight the step where the reader acts. */
  emphasis?: boolean;
  /** Set by <Flow>; drives the stagger of the rise-in animation. */
  index?: number;
};

/**
 * Three-box workflow diagram: what goes in, what Claude does, what comes out.
 * Horizontal from `sm`, stacked below. Children must be <FlowStep>.
 */
export function Flow({ children, label }: { children: ReactNode; label?: string }) {
  const steps = Children.toArray(children).filter((child): child is ReactElement<FlowStepProps> =>
    isValidElement(child)
  );

  return (
    <div className="not-prose flow my-10">
      <ol className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch sm:gap-2.5" aria-label={label}>
        {steps.map((step, i) => (
          <Fragment key={i}>
            {i > 0 ? (
              <li
                aria-hidden="true"
                className="flex items-center justify-center py-0.5 text-fd-muted-foreground sm:pt-7 sm:pb-0"
              >
                <FlowArrow />
              </li>
            ) : null}
            {cloneElement(step, { index: i })}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

export function FlowStep({ n, title, note, emphasis = false, index = 0 }: FlowStepProps) {
  const card = emphasis
    ? "border-fd-primary shadow-[inset_0_0_0_0.5px_var(--color-fd-primary)]"
    : "border-fd-border";

  return (
    <li className="rise flex flex-1 flex-col gap-1.5" style={{ "--rise-i": index + 4 } as CSSProperties}>
      <span className="font-mono text-[11px] tracking-[0.12em] text-fd-muted-foreground">{n}</span>
      <div className={`flex h-full flex-col rounded-md border bg-fd-card px-4 py-3.5 ${card}`}>
        <p className="font-display text-[0.95rem] font-bold leading-[1.25] tracking-[-0.01em]">{title}</p>
        {note ? <p className="mt-1 text-[0.82rem] leading-[1.4] text-fd-muted-foreground">{note}</p> : null}
        {emphasis ? <span aria-hidden="true" className="mt-3 block h-1.5 w-24 bg-mark" /> : null}
      </div>
    </li>
  );
}

function FlowArrow() {
  return (
    <svg
      width="28"
      height="14"
      viewBox="0 0 28 14"
      fill="none"
      aria-hidden="true"
      className="rotate-90 sm:rotate-0"
    >
      <path
        d="M1 7h25M21 2l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
