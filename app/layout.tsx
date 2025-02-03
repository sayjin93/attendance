import type { Metadata } from "next";
import "@/app/globals.css";

import TanstackProvider from "@/contexts/TanstackProvider";
import NotifyProvider from "@/contexts/NotifyContext";

export const metadata: Metadata = {
  title: "Attendance Manager",
  description: "Crafted by JK",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="antialiased h-full">
        <TanstackProvider>
          <NotifyProvider>
            {children}
          </NotifyProvider>
        </TanstackProvider>
      </body>
    </html >
  );
}
