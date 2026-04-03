import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Start Action",
  description: "Overcome procrastination by starting instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} min-h-screen bg-brand-bg text-slate-50 flex flex-col antialiased selection:bg-brand-neon-green selection:text-brand-bg`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
