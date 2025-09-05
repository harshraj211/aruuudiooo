
'use client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MANAGEMENT_TYPE_KEY = 'agriVision-managementType';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [managementType, setManagementType] = useState<'crops' | 'fruits' | 'default'>('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let currentType: 'crops' | 'fruits' | 'default' = 'default';

    if (pathname.startsWith('/dashboard/crops')) {
      currentType = 'crops';
      localStorage.setItem(MANAGEMENT_TYPE_KEY, 'crops');
    } else if (pathname.startsWith('/dashboard/fruits')) {
      currentType = 'fruits';
      localStorage.setItem(MANAGEMENT_TYPE_KEY, 'fruits');
    } else if (pathname === '/dashboard') {
      currentType = 'default';
      // On the main dashboard, we don't need to read from localStorage, just show the default.
    } else {
      // For generic pages, try to use the last known management type from localStorage
      const storedType = localStorage.getItem(MANAGEMENT_TYPE_KEY);
      if (storedType === 'crops' || storedType === 'fruits') {
        currentType = storedType;
      }
    }
    setManagementType(currentType);
  }, [pathname, isClient]);


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
