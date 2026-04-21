import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
});

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "A-G-A | Asistente de Gestión Aduanal",
  description: "Asistente inteligente de comercio exterior y aduanas",
  manifest: "/manifest.json",
  themeColor: "#0F172A",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "A-G-A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${syne.variable} ${pjs.variable} antialiased h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
