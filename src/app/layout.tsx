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
        <script src="/suppress-hydration-error.js"></script>
        <script src="/disable-hydration-warnings.js"></script>
        <script src="/earliest-class-fix.js"></script>
        <script src="/earliest-loyalty-fix.js"></script>
        <script src="/pre-hydration-fix.js"></script>
        <script src="/pre-react-hydration-fix.js"></script>
        <script src="/class-name-hydration-fix.js"></script>
        <script src="/null-class-fix.js"></script>
        <script src="/force-correct-classes.js"></script>
        <script src="/fix-hydration-mismatch.js"></script>
        <script src="/fix-loyalty-hydration-mismatch.js"></script>
        <script src="/aggressive-loyalty-hydration-fix.js"></script>
        <script src="/force-restore-loyalty.js"></script>
        <script src="/immediate-loyalty-fix.js"></script>
        <script src="/enhanced-hydration-fix.js"></script>
        <script src="/disable-dark-mode.js" defer></script>
        <script src="/clear-mock-data.js" defer></script>
        <script src="/quality-control-api-fix.js" defer></script>
        <script src="/quality-control-patch.js" defer></script>
        <script src="/quality-control-form-fix.js" defer></script>
        <script src="/hide-loyalty-button.js" defer></script>
        <script src="/restore-loyalty-button.js" defer></script>
        <script src="/hide-loyalty-program-line.js" defer></script>
        <script src="/hydration-fix-v2.js" defer></script>
        <script src="/nextauth-fix.js"></script>
        <script src="/nextauth-session-fix.js" defer></script>
        <script src="/post-hydration-loyalty-fix.js" defer></script>
        <script src="/post-hydration-loyalty-restore.js" defer></script>
        <script src="/sidebar-component-fix.js" defer></script>
        <script src="/post-hydration-class-fix.js" defer></script>
        <script src="/ensure-loyalty-visible.js" defer></script>
        <link rel="stylesheet" href="/hydration-mismatch-fix.css" />
        <link rel="stylesheet" href="/hide-loyalty-button.css" />
        <link rel="stylesheet" href="/hydration-fix.css" />
        <link rel="stylesheet" href="/hide-loyalty-program.css" />
        <link rel="stylesheet" href="/loyalty-hydration-fix.css" />
        <link rel="stylesheet" href="/aggressive-loyalty-fix.css" />
        <link rel="stylesheet" href="/class-name-fix.css" />
        <link rel="stylesheet" href="/restore-loyalty-button.css" />
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
