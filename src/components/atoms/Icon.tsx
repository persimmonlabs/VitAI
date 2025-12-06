import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, icon: IconComponent, size = 'md', color, ...props }, ref) => {
    const sizeStyles = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    };

    return (
      <IconComponent
        ref={ref}
        className={cn(sizeStyles[size], color, className)}
        data-testid="icon"
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
