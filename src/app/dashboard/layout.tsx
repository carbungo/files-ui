import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateAuth } from "@/lib/auth/validate";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await validateAuth();
  if (!auth.authenticated) redirect("/?error=session_expired");

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
