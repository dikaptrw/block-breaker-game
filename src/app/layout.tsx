import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { getGlobalMetadata } from "./utils/metadata";

const font = Orbitron({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...getGlobalMetadata(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>{children}</body>
    </html>
  );
}
