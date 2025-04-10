import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import type { Metadata } from 'next';
import { AppContextProvider } from './context/AppContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'TokenFolio | Cryptocurrency Tracker',
  description: 'Track and explore the top 50 cryptocurrencies by market cap',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </body>
    </html>
  );
} 