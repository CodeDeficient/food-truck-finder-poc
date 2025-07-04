import React from 'react';
import Link from 'next/link';
import { Home, Truck, Settings, Activity, Users, CalendarDays, BarChart3 } from 'lucide-react';

interface AdminNavLinksProps {
  readonly isMobile?: boolean;
}

/**
 * Renders a set of navigation links for the admin panel.
 * @example
 * AdminNavLinks({ isMobile: true })
 * <Some JSX structure with customized class names>
 * @param {boolean} isMobile - Determines the styling of the links for mobile or desktop view.
 * @returns {JSX.Element} A group of navigation links with appropriate icons for the admin section.
 * @description
 *   - Utilizes a ternary operation to dynamically assign different class names based on the isMobile flag.
 *   - Each link contains an icon specific to the administration section it represents.
 */
export function AdminNavLinks({ isMobile = false }: Readonly<AdminNavLinksProps>) {
  const linkClassName = isMobile
    ? 'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
    : 'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

  const iconClassName = isMobile ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <>
      <Link href="/admin" className={linkClassName}>
        <Home className={iconClassName} />
        Dashboard
      </Link>
      <Link href="/admin/food-trucks" className={linkClassName}>
        <Truck className={iconClassName} />
        Food Truck Management
      </Link>
      <Link href="/admin/pipeline" className={linkClassName}>
        <Activity className={iconClassName} />
        Pipeline Monitoring
      </Link>
      <Link href="/admin/auto-scraping" className={linkClassName}>
        <Settings className={iconClassName} />
        Auto-Scraping
      </Link>
      <Link href="/admin/data-quality" className={linkClassName}>
        <Settings className={iconClassName} />
        Data Quality
      </Link>
      <Link href="/admin/users" className={linkClassName}>
        <Users className={iconClassName} />
        User Management
      </Link>
      <Link href="/admin/events" className={linkClassName}>
        <CalendarDays className={iconClassName} />
        Event Management
      </Link>
      <Link href="/admin/analytics" className={linkClassName}>
        <BarChart3 className={iconClassName} />
        Analytics
      </Link>
    </>
  );
}
