import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { FloatingHeartsBg } from "@/components/relationship/FloatingHeartsBg";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HeartSync | Relationship Tracker & Memory Journal",
  description: "Track your shared relationship journey. Count days together, get countdowns for upcoming milestones, keep a private journal of memories, and schedule custom notifications.",
  keywords: ["relationship tracker", "anniversary countdown", "memory journal", "relationship reminders", "milestones tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-rose-100 dark:selection:bg-rose-950">
        <AppProvider>
          <div className="romantic-mesh" />
          <FloatingHeartsBg />
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
