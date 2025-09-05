
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
import { BotMessageSquare, LayoutDashboard, Leaf, TrendingUp, Wallet, Bell, CalendarDays, Newspaper, Home, Calculator } from 'lucide-react';
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
    // On the default selection screen, only show home and generic items.
    if (managementType === 'default') {
        return false; // Hide all but home
    }
    // Hide market prices for fruits as it's not applicable
    if (managementType === 'fruits' && item.labelKey === 'sidebar.marketPrices') {
        return false;
    }
    return true;
  });

  const menuItems: MenuItem[] = filteredMenuItems.map(item => {
    const isCalendar = item.labelKey === 'sidebar.cropCalendar';

    // Adjust label for calendar
    let labelKey = item.labelKey;
    if (isCalendar) {
        labelKey = managementType === 'fruits' ? 'sidebar.fruitCalendar' : 'sidebar.cropCalendar';
    }

    // Get page from the (potentially updated) labelKey
    let pageSlug = labelKey.split('.')[1].replace(/([A-Z])/g, '-$1').toLowerCase();

    let href = '';
    
    if (item.isGeneric) {
        href = `/dashboard/${pageSlug}`;
    } else {
        if (pageSlug === 'dashboard') {
            href = `/dashboard/${managementType}`;
        } else {
            href = `/dashboard/${managementType}/${pageSlug}`;
        }
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
            
            {/* Show these only when NOT on the default dashboard */}
            {managementType !== 'default' && (
              <>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        onClick={handleLinkClick}
                        tooltip={t('sidebar.khetiSamachar')}
                        isActive={pathname.startsWith('/dashboard/kheti-samachar')}
                    >
                        <Link href="/dashboard/kheti-samachar">
                            <Newspaper />
                            <span>{t('sidebar.khetiSamachar')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Conditionally render market prices */}
                {managementType === 'crops' && (
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            onClick={handleLinkClick}
                            tooltip={t('sidebar.marketPrices')}
                            isActive={pathname.startsWith('/dashboard/market-prices')}
                        >
                            <Link href="/dashboard/market-prices">
                                <TrendingUp />
                                <span>{t('sidebar.marketPrices')}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
              </>
            )}

          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                onClick={handleLinkClick}
                tooltip={t(item.labelKey)}
                isActive={pathname.startsWith(item.href) && item.href !== `/dashboard/${managementType}`}
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

