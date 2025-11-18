export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002BE7] via-[#0020B2] to-[#000E4C]">
      <main>{children}</main>
    </div>
  );
}