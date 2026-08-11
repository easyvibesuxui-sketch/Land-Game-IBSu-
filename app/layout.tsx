import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Filters from "@/components/Filters";
import Nav from "@/components/nav/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "syniotec · devices",
  description:
    "Seven telematics units for construction machinery — wired CAN bus boxes, self-powered trackers and passive tags.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Filters />
        <SmoothScroll />
        <Nav />
        <main>{children}</main>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
