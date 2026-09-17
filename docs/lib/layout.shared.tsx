import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="font-display text-[0.95rem] font-bold tracking-[-0.01em] text-fd-foreground">
          Portal Claude plugins
        </span>
      )
    },
    githubUrl: "https://github.com/chilampoon/portal-claude-plugins",
    themeSwitch: { enabled: true }
  };
}
