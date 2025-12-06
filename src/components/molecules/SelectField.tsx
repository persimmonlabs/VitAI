import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Label } from '@/components/atoms/Label';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      error,
      placeholder = 'Select an option',
      className,
      id,
      ...props
    }
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery]);

    const selectedOption = options.find((opt) => opt.value === value);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    return (
      <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
        {label && <Label htmlFor={id}>{label}</Label>}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-base transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
              error && 'border-red-500 focus-visible:ring-red-500'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            {...props}
          >
            <span className="flex items-center gap-2">
              {selectedOption?.icon}
              <span className={!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <Icon icon={ChevronDown} size="sm" className={cn('transition-transform', isOpen && 'rotate-180')} />
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <ul className="max-h-60 overflow-auto" role="listbox">
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      option.value === value && 'bg-blue-50 dark:bg-blue-950'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                    {option.value === value && <Icon icon={Check} size="sm" className="text-blue-600" />}
                  </li>
                ))}
                {filteredOptions.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No options found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <Text variant="caption" color="error" role="alert" aria-live="polite">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
