import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";

import "./global.css";

// Self-hosted at build time; the variables are mapped to Tailwind's
// --font-sans / --font-mono / --font-display in global.css.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap"
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Portal Claude plugins",
    template: "%s | Portal Claude plugins"
  },
  description:
    "How to install and use Portal's Claude plugins for logging investor meetings and filing startup triage notes into Airtable."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        {/* Search is off: the default dialog needs an /api/search route, which a
            static export on GitHub Pages cannot serve. Three pages do not need it. */}
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
