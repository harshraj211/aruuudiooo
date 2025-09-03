
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
import { BotMessageSquare, LayoutDashboard, Leaf, TrendingUp, Wallet, Bell, CalendarDays, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

type MenuItem = {
  href: string;
  labelKey: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { href: '/dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { href: '/dashboard/market-prices', labelKey: 'sidebar.marketPrices', icon: TrendingUp },
  { href: '/dashboard/expense-tracker', labelKey: 'sidebar.expenseTracker', icon: Wallet },
  { href: '/dashboard/disease-detection', labelKey: 'sidebar.diseaseDetection', icon: Leaf },
  { href: '/dashboard/chatbot', labelKey: 'sidebar.chatbot', icon: BotMessageSquare },
  { href: '/dashboard/crop-calendar', labelKey: 'sidebar.cropCalendar', icon: CalendarDays },
  { href: '/dashboard/notifications', labelKey: 'sidebar.notifications', icon: Bell },
  { href: '/dashboard/kheti-samachar', labelKey: 'sidebar.khetiSamachar', icon: Newspaper },
];

export function SidebarNav() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.labelKey}>
              <SidebarMenuButton
                asChild
                onClick={handleLinkClick}
                tooltip={t(item.labelKey)}
                isActive={pathname === item.href}
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
