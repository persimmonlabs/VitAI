import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, Toggle } from '@/components/atoms';

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'navigation';
  value?: boolean | string;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  onChange?: (value: boolean | string) => void;
  onClick?: () => void;
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  items: SettingItem[];
  icon?: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  items,
  icon,
}) => {
  const renderSettingControl = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <Toggle
            checked={item.value as boolean}
            onChange={(checked) => item.onChange?.(checked)}
            aria-label={item.label}
          />
        );

      case 'select':
        return (
          <select
            value={item.value as string}
            onChange={(e) => item.onChange?.(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {item.options?.map((option, index) => (
              <option key={option.value || index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'navigation':
        return (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-gray-600 ml-11">{description}</p>
        )}
      </div>

      {/* Settings Items */}
      <Card className="divide-y">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 ${
              item.type === 'navigation'
                ? 'hover:bg-gray-50 cursor-pointer transition-colors'
                : ''
            }`}
            onClick={item.type === 'navigation' ? item.onClick : undefined}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.icon && (
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.label}</p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              {renderSettingControl(item)}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
