import React from 'react';
import { Camera, MessageSquare, Edit3 } from 'lucide-react';
import { Card } from '@/components/atoms';

interface QuickLogButtonsProps {
  onPhotoLog?: () => void;
  onTextLog?: () => void;
  onManualLog?: () => void;
}

export const QuickLogButtons: React.FC<QuickLogButtonsProps> = ({
  onPhotoLog,
  onTextLog,
  onManualLog,
}) => {
  const buttons = [
    {
      id: 'photo',
      label: 'Photo',
      description: 'Take a picture',
      icon: Camera,
      color: 'bg-primary-600 hover:bg-primary-700',
      iconColor: 'text-white',
      onClick: onPhotoLog,
    },
    {
      id: 'text',
      label: 'Text',
      description: 'Describe your meal',
      icon: MessageSquare,
      color: 'bg-green-600 hover:bg-green-700',
      iconColor: 'text-white',
      onClick: onTextLog,
    },
    {
      id: 'manual',
      label: 'Manual',
      description: 'Search database',
      icon: Edit3,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      iconColor: 'text-white',
      onClick: onManualLog,
    },
  ];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Log</h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose how you'd like to log your meal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.id}
              onClick={button.onClick}
              className={`${button.color} rounded-lg p-4 transition-all transform active:scale-95 shadow-sm hover:shadow-md group`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`h-6 w-6 ${button.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    {button.label}
                  </p>
                  <p className="text-sm text-white/90 mt-1">
                    {button.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
            🍳 Breakfast
          </button>
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
            🍔 Lunch
          </button>
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
            🍝 Dinner
          </button>
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
            🍎 Snack
          </button>
        </div>
      </div>
    </Card>
  );
};
