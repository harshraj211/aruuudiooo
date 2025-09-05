
'use client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const managementType = pathname.includes('/dashboard/crops') ? 'crops' : pathname.includes('/dashboard/fruits') ? 'fruits' : 'default';

  return (
      <SidebarProvider>
        <SidebarNav managementType={managementType} />
        <SidebarInset>
          <Header />
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}
