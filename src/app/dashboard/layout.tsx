import { Header } from "@/components/Header";
import { requireUser } from "@/lib/guards";

export const metadata = { robots: { index: false } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-100">{children}</main>
    </>
  );
}
