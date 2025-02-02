import type { Metadata } from "next";

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
    <main className="container mx-auto p-6">
      {children}
    </main>
  );
}
