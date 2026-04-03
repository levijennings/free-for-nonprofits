import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Eye, Cookie, AlertCircle } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/legal/terms',
    label: 'Terms of Service',
    icon: <FileText size={20} />,
    description: 'Usage terms and conditions',
  },
  {
    href: '/legal/privacy',
    label: 'Privacy Policy',
    icon: <Eye size={20} />,
    description: 'How we handle your data',
  },
  {
    href: '/legal/cookies',
    label: 'Cookie Policy',
    icon: <Cookie size={20} />,
    description: 'Cookie and tracking info',
  },
  {
    href: '/legal/acceptable-use',
    label: 'Acceptable Use Policy',
    icon: <AlertCircle size={20} />,
    description: 'Community standards',
  },
];

export const LegalNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal Navigation - Desktop */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                isActive(item.href)
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              title={item.description}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation - Vertical */}
        <div className="sm:hidden">
          <div className="space-y-1 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LegalNav;
