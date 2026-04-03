'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Contact } from 'lucide-react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Branding',
      href: '/admin/settings',
      icon: LayoutGrid,
      active: pathname === '/admin/settings',
    },
    {
      name: 'Contact',
      href: '/admin/settings/contact',
      icon: Contact,
      active: pathname === '/admin/settings/contact',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              tab.active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className={`h-4 w-4 mr-2 ${tab.active ? 'text-blue-600' : 'text-gray-400'}`} />
            {tab.name}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
