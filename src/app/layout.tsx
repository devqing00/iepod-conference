import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif-custom",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-custom",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "IESA Process Day 2026 — Forge the Future | Industrial Engineering Annual Conference",
  description:
    "The 6th Annual Conference of the Industrial Engineering Students Association (IESA), University of Ibadan. Featuring Keynote Speaker Prof. Kayode Oyebode Adebowale (VC UI) & Tech/AI Facilitator Emmanuel Tavershima.",
  keywords: [
    "IESA Process Day 2026",
    "Forge the Future",
    "Industrial Engineering Students Association",
    "University of Ibadan",
    "UI VC Prof Kayode Adebowale",
    "Emmanuel Tavershima CYVANT",
    "Engineering Conference Nigeria",
  ],
  authors: [{ name: "IESA UI" }],
  openGraph: {
    title: "IESA Process Day 2026 — Forge the Future",
    description:
      "Join us on 10th Sep 2026 at KAAF Auditorium, UI for a premier gathering of engineering leaders, AI facilitators, and visionary builders.",
    siteName: "IESA Process Day 2026",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} scroll-smooth antialiased overflow-x-hidden`}
    >
      <body className="min-h-screen bg-[#faf8f2] text-[#0a3825] font-sans selection:bg-[#c6f552] selection:text-[#052e16] overflow-x-hidden w-full relative">
        {children}
      </body>
    </html>
  );
}
