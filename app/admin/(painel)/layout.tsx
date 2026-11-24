import { AdminSidebar } from "@/components/admin/sidebar";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AdminSidebar />
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10 print:p-0">{children}</main>
    </div>
  );
}
