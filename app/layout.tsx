import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { TabBar } from "@/components/tab-bar";
import { UserProvider } from "@/components/user-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beacon",
  description: "Anonymous safety reporting for the UC Berkeley community.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Beacon",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6d4fc2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <div className="mx-auto flex min-h-dvh max-w-phone flex-col bg-background">
            <AppHeader />
            <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
          </div>
          <TabBar />
        </UserProvider>
      </body>
    </html>
  );
}
