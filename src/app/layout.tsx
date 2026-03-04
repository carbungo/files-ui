import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-brand" });

export const metadata: Metadata = {
  title: { template: "%s — clawd-files", default: "clawd-files" },
  description: "File sharing powered by CarbonFiles",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("cf-theme")?.value ?? "dark";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${spaceGrotesk.variable}${theme === "light" ? " light" : ""}`}
    >
      <body className="font-body bg-bg text-text antialiased">
        <ViewTransition
          default={{
            "navigation-forward": "vt-forward",
            "navigation-back": "vt-back",
            default: "vt-fade",
          }}
        >
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
