import type { Metadata } from "next";
import ClientWrapper from "@/components/ClientWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "V-PRIME | Elite Terminal",
  description: "A premium, blazing-fast institutional trading dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
