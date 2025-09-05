
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';
import { BotMessageSquare, LayoutDashboard, Leaf, TrendingUp, Wallet, Bell, CalendarDays, Newspaper, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

type MenuItem = {
  href: string;
  labelKey: string;
  icon: React.ElementType;
}

const baseMenuItems: Omit<MenuItem, 'href'>[] = [
  { labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { labelKey: 'sidebar.marketPrices', icon: TrendingUp },
  { labelKey: 'sidebar.expenseTracker', icon: Wallet },
  { labelKey: 'sidebar.diseaseDetection', icon: Leaf },
  { labelKey: 'sidebar.chatbot', icon: BotMessageSquare },
  { labelKey: 'sidebar.cropCalendar', icon: CalendarDays },
  { labelKey: 'sidebar.notifications', icon: Bell },
  { labelKey: 'sidebar.khetiSamachar', icon: Newspaper },
];

export function SidebarNav({ managementType }: { managementType: 'crops' | 'fruits' | 'default' }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const menuItems: MenuItem[] = managementType === 'default' ? [] : baseMenuItems.map(item => {
    let page = item.labelKey.split('.')[1]; // e.g., 'dashboard'
    if (page === 'dashboard') page = managementType;
    else if (page === 'khetiSamachar') page = 'kheti-samachar';
    else if (page === 'marketPrices') page = 'market-prices';
    else if (page === 'expenseTracker') page = 'expense-tracker';
    else if (page === 'diseaseDetection') page = 'disease-detection';
    else if (page === 'cropCalendar') page = 'crop-calendar';

    const href = `/dashboard/${managementType}/${page.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    
    // A quick hack to ensure the main dashboard link is correct
    if (item.labelKey === 'sidebar.dashboard') {
        return {
            ...item,
            href: `/dashboard/${managementType}`
        }
    }

    if (['sidebar.chatbot', 'sidebar.khetiSamachar', 'sidebar.marketPrices', 'sidebar.diseaseDetection', 'sidebar.cropCalendar', 'sidebar.notifications'].includes(item.labelKey)) {
        return { ...item, href: `/dashboard/${page.replace(/([A-Z])/g, '-$1').toLowerCase()}`};
    }


    return {
      ...item,
      href,
    };
  });


  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                onClick={handleLinkClick}
                tooltip={t('sidebar.backToSelection')}
                isActive={pathname === '/dashboard'}
              >
                <Link href="/dashboard">
                  <Home />
                  <span>{t('sidebar.home')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                onClick={handleLinkClick}
                tooltip={t(item.labelKey)}
                isActive={pathname.startsWith(item.href)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
