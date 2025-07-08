'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth';

const navItems = [
  { path: '/dashboard', name: 'Overview', icon: '🏠' },
  { path: '/dashboard/projects', name: 'Projects', icon: '📂' },
  { path: '/dashboard/team', name: 'Team', icon: '👥' },
  { path: '/dashboard/settings', name: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center p-2 rounded-lg ${pathname === item.path ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t mt-auto">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <span className="mr-3">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}