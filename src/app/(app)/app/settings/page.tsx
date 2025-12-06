'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/atoms/Button';
import { ChevronRight, User, Target, Globe, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      router.push('/login');
    }
  };

  const settingsSections = [
    {
      title: 'Profile',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          subtitle: user?.user_metadata?.name || 'Set your name',
          onClick: () => router.push('/app/settings/profile'),
        },
      ],
    },
    {
      title: 'Goals & Preferences',
      items: [
        {
          icon: Target,
          label: 'Goals',
          subtitle: 'Manage your calorie and macro goals',
          onClick: () => router.push('/app/settings/goals'),
        },
        {
          icon: Globe,
          label: 'Units',
          subtitle: 'Metric (kg, cm)',
          onClick: () => {
            // TODO: Implement unit preferences
            alert('Unit preferences coming soon!');
          },
        },
      ],
    },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-4 py-8 text-white">
        <h2 className="mb-2 text-2xl font-bold">Settings</h2>
        <p className="text-sm opacity-90">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 p-4">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 px-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              {section.title}
            </h3>
            <div className="space-y-2 rounded-lg bg-white shadow-sm">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${
                      index === section.items.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        {item.subtitle && (
                          <div className="text-sm text-gray-500">{item.subtitle}</div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div>
          <h3 className="mb-3 px-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
            About
          </h3>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-primary">VitAI</div>
              <div className="text-sm text-gray-600">Version 1.0.0</div>
              <div className="mt-2 text-xs text-gray-500">
                AI-Powered Calorie Tracking
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
