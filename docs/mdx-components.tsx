import type { MDXComponents } from "mdx/types";
import defaultComponents from "fumadocs-ui/mdx";

import { Fact, Facts } from "@/components/facts";
import { Flow, FlowStep } from "@/components/flow";
import { Hero } from "@/components/hero";
import { PluginCard, PluginCards } from "@/components/plugin-card";
import { Appended, Chip, Field, Fields, Hint, Legend, LegendItem, Record } from "@/components/record";
import { Say } from "@/components/say";
import { Screenshot } from "@/components/screenshot";
import { Step, Steps } from "@/components/steps";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    Appended,
    Chip,
    Fact,
    Facts,
    Field,
    Fields,
    Flow,
    FlowStep,
    Hero,
    Hint,
    Legend,
    LegendItem,
    PluginCard,
    PluginCards,
    Record,
    Say,
    Screenshot,
    Step,
    Steps,
    ...components
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
