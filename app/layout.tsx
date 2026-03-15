import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luxenai.org"),
  title: {
    default: "Luxen | Applied AI Lab",
    template: "%s | Luxen"
  },
  description:
    "Luxen is an applied AI lab building AgentIDE and agentic automation systems.",
  icons: {
    icon: "/branding/luxen-mark.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
