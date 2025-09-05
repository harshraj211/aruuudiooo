
'use client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [managementType, setManagementType] = useState<'crops' | 'fruits' | 'default'>('default');

  useEffect(() => {
    if (pathname.startsWith('/dashboard/crops')) {
      setManagementType('crops');
    } else if (pathname.startsWith('/dashboard/fruits')) {
      setManagementType('fruits');
    } else if (pathname === '/dashboard') {
      setManagementType('default');
    } else {
      // For generic pages that are not crops/fruits specific but are not the main dashboard page
      // e.g. /community, /market-prices. We can check localStorage or keep it default.
      // For now, let's have SidebarNav handle this.
      setManagementType('default');
    }
  }, [pathname]);


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
