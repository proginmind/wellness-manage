import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { SWRConfig } from "swr";

import { getUserData } from "@/lib/get-user-data";
import { SentryUserContext } from "@/components/sentry-user-context";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "Manage - %s",
    default: "Manage - Wellness Center",
  },
  description: "Modern wellness management application for booking and managing wellness services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Start the fetch without awaiting – the promise is passed to SWRConfig so
  // useUser() throughout the app resolves immediately on hydration with no
  // client-side loading flash.
  const userDataPromise = getUserData();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SWRConfig value={{ fallback: { "/api/auth/me": userDataPromise } }}>
          <SentryUserContext />
          {children}
          <Toaster />
        </SWRConfig>
      </body>
    </html>
  );
}
