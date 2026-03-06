import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "./AppShell";

export const metadata: Metadata = {
  title: "GoutCare — AI-Powered Gout Management",
  description:
    "Free gout management: purine tracking, uric acid monitoring, flare logging, and 3 daily AI food scans. Premium subscription unlocks unlimited AI scans and PDF health reports.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoutCare",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0a0e1a" />
        {/* apple-icon.tsx generates the apple-touch-icon automatically */}
      </head>
      <body>
        <AppShell>{children}</AppShell>
        {/* Inline theme init + Capacitor native detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('goutcare_user_profile')||'{}');var t=p.theme||'dark';if(t==='system'){t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()){document.body.classList.add('capacitor')}})()`,
          }}
        />
      </body>
    </html>
  );
}
