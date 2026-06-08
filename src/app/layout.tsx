import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { FloatingHeartsBg } from "@/components/relationship/FloatingHeartsBg";

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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
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
