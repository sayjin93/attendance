import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Attendance Manager",
  description: "Crafted by JK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 text-gray-900">
        <Providers>
          <main className="container mx-auto p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
