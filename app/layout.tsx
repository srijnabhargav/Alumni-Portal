import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AuthNavigation from "@/components/AuthNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alumni Network",
  description: "Connect with our alumni community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthNavigation />
          {/* <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Alumni Network</h1>
            <div className="space-x-4">
              <a href="/" className="hover:text-blue-200">Home</a>
              <a href="/alumni" className="hover:text-blue-200">Alumni</a>
              <a href="/admin" className="hover:text-blue-200">Admin</a>
            </div>
          </div>
        </nav> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
