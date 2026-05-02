import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";
import { LanguageProvider } from "./components/language-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D&E Property Pro",
  description: "Modern property services and AI-powered tools."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen">
            <Navbar />
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
