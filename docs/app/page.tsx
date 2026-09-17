import type { Metadata } from "next";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { landingPage } from "@/lib/docs";
import { baseOptions } from "@/lib/layout.shared";
import { getMDXComponents } from "@/mdx-components";

export const metadata: Metadata = {
  title: { absolute: "Portal Claude plugins" },
  description: landingPage.description
};

/** Front page: the getting-started content without the docs sidebar. */
export default function HomePage() {
  const MDX = landingPage.component;

  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto w-full max-w-[820px] px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <div className="prose">
          <MDX components={getMDXComponents()} />
        </div>
      </div>
    </HomeLayout>
  );
}
