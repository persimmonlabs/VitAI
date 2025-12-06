import React from 'react';
import { Home, Plus, BarChart3, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface BottomNavProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeSection = 'home',
  onNavigate,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-6 w-6" />,
      onClick: () => onNavigate?.('home'),
    },
    {
      id: 'log',
      label: 'Log',
      icon: <Plus className="h-6 w-6" />,
      onClick: () => onNavigate?.('log'),
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: <BarChart3 className="h-6 w-6" />,
      onClick: () => onNavigate?.('stats'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-6 w-6" />,
      onClick: () => onNavigate?.('settings'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="safe-area-inset-bottom">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'font-semibold' : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
};
