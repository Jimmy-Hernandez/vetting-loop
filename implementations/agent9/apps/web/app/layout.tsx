import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

// next/font self-hosts the font files at build time: no request to Google.
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Vetting Record: who was nominated, vetted and approved to public office in Kenya",
    template: "%s | Vetting Record",
  },
  description:
    "A linked, source-cited record of Cabinet, Principal Secretary and envoy nominations under Kenya's 13th Parliament, with pattern signals, a secure tip line and a censorship-resistant mirror.",
  // Prototype: keep it out of search indexes until records are Gazette-verified.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  openGraph: {
    title: "Vetting Record",
    description: "93 nominations. 1 rejection. The vetting gate, measured.",
    siteName: "Vetting Record · Civic Tech Tools",
    locale: "en_KE",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#bd1419", width: "device-width", initialScale: 1 };

function PrototypeBar() {
  return (
    <div className="bg-[#111] text-[12px] text-white/75">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-1.5">
        <p>
          <span className="mr-2 rounded-pill bg-mz-red px-2 py-px text-[9px] font-bold uppercase tracking-widest text-white">Prototype</span>
          Designed for Mzalendo&apos;s Civic Tech Tools by Agent9. Not an official Mzalendo service.
        </p>
        <p className="hidden sm:block">
          No cookies · No trackers · <Link href="/privacy/" className="underline decoration-white/30 hover:text-white transition-colors">Privacy</Link>
        </p>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-mz focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        <PrototypeBar />
        <NavBar />
        <div id="main">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
