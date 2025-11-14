import { Navbar } from "@/components/navbar";

export default function UnauthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}