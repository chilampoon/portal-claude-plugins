import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          Portal Claude plugins
        </span>
      )
    },
    githubUrl: "https://github.com/chilampoon/portal-claude-plugins",
    themeSwitch: { enabled: true }
  };
}
