import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AuthNavigation from "@/components/AuthNavigation";
import { AdminProvider } from "@/contexts/AdminContext";

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
          <AdminProvider>{children}</AdminProvider>
        </Providers>
      </body>
    </html>
  );
}
