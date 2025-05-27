import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { NotificationProvider } from "@/components/ui/notification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tawania Admin - Warehouse & Store Management",
  description: "Comprehensive warehouse and store management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light', backgroundColor: '#ffffff' }}>
      <head>
        {/* Suppress hydration warnings in development */}
        <script src="/suppress-hydration-warnings.js"></script>
        {/* Keep only essential scripts that exist and are needed */}
        <script src="/disable-dark-mode.js" defer></script>
        <script src="/clear-mock-data.js" defer></script>
        <script src="/quality-control-api-fix.js" defer></script>
        <script src="/quality-control-patch.js" defer></script>
        <script src="/quality-control-form-fix.js" defer></script>
        <script src="/nextauth-fix.js"></script>
        <script src="/nextauth-session-fix.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#ffffff', color: '#4f4f4f' }}
      >
        <SessionProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
