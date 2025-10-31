import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Attendance",
  description: "Crafted by JK",
};

export default function LoginLayout({
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
