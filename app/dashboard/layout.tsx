import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Attendance",
  description: "Crafted by JK",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}
