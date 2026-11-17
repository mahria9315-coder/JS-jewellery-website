import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteBackground } from "@/components/layout/SiteBackground";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";

import "./globals.css";

/**
 * Applies the persisted theme before the first paint so a light-theme visitor
 * never sees the dark default flash. Runs inline, before body content is
 * parsed. Dark remains the default when storage is empty or unavailable.
 */
const themeBootScript = `(function(){try{var t=window.localStorage.getItem("js-theme");if(t!=="light"&&t!=="dark"){t="dark";}var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;}catch(e){var r=document.documentElement;r.dataset.theme="dark";r.style.colorScheme="dark";}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Jewellery Store`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: "/Luxury Gold Jewelry Monogram Logo.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en",
    url: absoluteUrl("/"),
    title: `${SITE_NAME} | Jewellery Store`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | Jewellery Store`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
