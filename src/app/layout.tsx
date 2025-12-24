"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/components/WalletProvider";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";
import MetadataLayout from "./MetadataLayout"; // 导入服务器组件

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <LanguageProvider>
            <WalletProvider>
               <MetadataLayout> 
                {children}
              </MetadataLayout>
            </WalletProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}