import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Avatar } from '@/components/atoms';

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'User',
  userAvatar,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Profile', onClick: () => console.log('Profile') },
    { label: 'Settings', onClick: () => console.log('Settings') },
    { label: 'Help', onClick: () => console.log('Help') },
    { label: 'Logout', onClick: () => console.log('Logout'), variant: 'danger' as const },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">VitAI</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm text-gray-600">Welcome, {userName}</span>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
            >
              <Avatar
                src={userAvatar}
                alt={userName}
                size="md"
                fallback={userName.charAt(0).toUpperCase()}
              />
            </button>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="py-1">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          item.variant === 'danger'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 md:hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-900" />
          ) : (
            <Menu className="h-6 w-6 text-gray-900" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white md:hidden">
          <div className="flex flex-col p-4">
            <div className="flex items-center gap-3 border-b pb-4 mb-4">
              <Avatar
                src={userAvatar}
                alt={userName}
                size="lg"
                fallback={userName.charAt(0).toUpperCase()}
              />
              <div>
                <p className="font-semibold text-gray-900">{userName}</p>
                <p className="text-sm text-gray-600">View Profile</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    item.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
