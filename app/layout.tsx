import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "INSIDE INSEAD",
  description: "INSIDE INSEAD - INSEAD 日本人向け非公式コミュニティサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} flex min-h-screen flex-col antialiased overflow-x-hidden`}
      >
        <Header />
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
