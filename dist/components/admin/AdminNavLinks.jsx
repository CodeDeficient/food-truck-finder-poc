import Link from 'next/link';
import { Home, Truck, Settings, Activity, Users, CalendarDays, BarChart3 } from 'lucide-react';
import * as React from 'react';
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
export function AdminNavLinks({ isMobile = false }) {
    const linkClassName = isMobile
        ? 'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
        : 'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';
    const iconClassName = isMobile ? 'h-5 w-5' : 'h-4 w-4';
    const navItems = [
        { href: '/admin', icon: Home, label: 'Dashboard' },
        { href: '/admin/food-trucks', icon: Truck, label: 'Food Truck Management' },
        { href: '/admin/pipeline', icon: Activity, label: 'Pipeline Monitoring' },
        { href: '/admin/auto-scraping', icon: Settings, label: 'Auto-Scraping' },
        { href: '/admin/data-quality', icon: Settings, label: 'Data Quality' },
        { href: '/admin/users', icon: Users, label: 'User Management' },
        { href: '/admin/events', icon: CalendarDays, label: 'Event Management' },
        { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ];
    return (<>
      {navItems.map((item) => (<Link href={item.href} className={linkClassName} key={item.href}>
          <item.icon className={iconClassName}/>
          {item.label}
        </Link>))}
    </>);
}
