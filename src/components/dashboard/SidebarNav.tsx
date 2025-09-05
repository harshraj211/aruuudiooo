
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
import { BotMessageSquare, LayoutDashboard, Leaf, TrendingUp, Wallet, Bell, CalendarDays, Newspaper, Home, Calculator, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';

type MenuItem = {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  isGeneric?: boolean; // Flag for pages that are not type-specific
}

const baseMenuItems: Omit<MenuItem, 'href'>[] = [
  { labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { labelKey: 'sidebar.communityForum', icon: Users, isGeneric: true },
  { labelKey: 'sidebar.marketPrices', icon: TrendingUp, isGeneric: true },
  { labelKey: 'sidebar.khetiSamachar', icon: Newspaper, isGeneric: true },
  { labelKey: 'sidebar.expenseTracker', icon: Wallet },
  { labelKey: 'sidebar.diseaseDetection', icon: Leaf },
  { labelKey: 'sidebar.chatbot', icon: BotMessageSquare },
  { labelKey: 'sidebar.cropCalendar', icon: CalendarDays },
  { labelKey: 'sidebar.calculators', icon: Calculator },
  { labelKey: 'sidebar.notifications', icon: Bell },
];

export function SidebarNav({ managementType: initialManagementType }: { managementType: 'crops' | 'fruits' | 'default' }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [managementType, setManagementType] = useState(initialManagementType);

  useEffect(() => {
    let currentType = initialManagementType;
    if (initialManagementType === 'default') {
        if (pathname.includes('/crops')) {
            currentType = 'crops';
        } else if (pathname.includes('/fruits')) {
            currentType = 'fruits';
        }
    }
    setManagementType(currentType);
  }, [pathname, initialManagementType]);


  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const filteredMenuItems = baseMenuItems.filter(item => {
    // On the default selection screen, only show generic items
    if (managementType === 'default') {
        return item.isGeneric;
    }
    // Hide market prices for fruits as it's not applicable
    if (managementType === 'fruits' && item.labelKey === 'sidebar.marketPrices') {
        return false;
    }
    return true;
  });

  const menuItems: MenuItem[] = filteredMenuItems.map(item => {
    let page = item.labelKey.split('.')[1]; // e.g., 'dashboard' from 'sidebar.dashboard'
    let pageSlug = page.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    let href = '';
    let resolvedManagementType = managementType;

    // If managementType is default, but we are on a generic page, we need a context.
    // Let's default to 'crops' for building the URL, but the item will only show if it's generic.
    if (resolvedManagementType === 'default' && item.isGeneric) {
        // Since marketPrices is now crop-specific, handle its generic URL differently.
        if (item.labelKey === 'sidebar.marketPrices') {
            resolvedManagementType = 'crops';
        } else {
            // For other generic items, it doesn't matter as much.
            resolvedManagementType = 'crops'; 
        }
    }


    if (item.isGeneric) {
         href = `/dashboard/${pageSlug}`;
    } else {
        if (page === 'dashboard') {
            href = `/dashboard/${resolvedManagementType}`;
        } else if (page === 'cropCalendar') { // Special handling for calendar
            const calendarSlug = resolvedManagementType === 'fruits' ? 'fruit-calendar' : 'crop-calendar';
            href = `/dashboard/${resolvedManagementType}/${calendarSlug}`;
        } else {
            href = `/dashboard/${resolvedManagementType}/${pageSlug}`;
        }
    }

    // Adjust label for calendar
    let labelKey = item.labelKey;
    if (item.labelKey === 'sidebar.cropCalendar') {
        labelKey = resolvedManagementType === 'fruits' ? 'sidebar.fruitCalendar' : 'sidebar.cropCalendar';
    }


    return {
      ...item,
      href,
      labelKey,
    };
  }).filter(item => item.href);


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
