import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import QueryProvider from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toast";

/**
 * Three typographic roles, two families.
 *
 * Geist Mono is the display face — headings read as identifiers, because the
 * thing the product operates on is a repository, and a repository's name is a
 * path, not a slogan. It also serves the utility role (paths, branches, chunk
 * counts, timestamps) at 11–12px with wider tracking.
 *
 * Geist Sans carries body prose. Assistant answers are read at length, and
 * monospace prose is hostile to that.
 */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "devPilot — chat with your repository",
    template: "%s · devPilot",
  },
  description:
    "Index a GitHub repository into a vector store and ask questions about its code, with every answer cited back to exact files and line ranges.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
