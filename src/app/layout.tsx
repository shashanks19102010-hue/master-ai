import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Master.ai",
  description: "Responsive n8n-powered AI chat for mobile, laptop, and desktop.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
