import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from '@/components/atoms/Input';
import { Icon } from '@/components/atoms/Icon';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onSearchChange?: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onSearchChange,
      debounceMs = 300,
      loading = false,
      onClear,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState('');
    const [debouncedValue] = useDebounce(value, debounceMs);

    React.useEffect(() => {
      onSearchChange?.(debouncedValue);
    }, [debouncedValue, onSearchChange]);

    const handleClear = () => {
      setValue('');
      onClear?.();
    };

    return (
      <div className={cn('relative', className)}>
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          leftIcon={<Icon icon={Search} size="sm" />}
          rightIcon={
            value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <Icon icon={X} size="sm" />
              </button>
            )
          }
          className="pr-10"
          aria-label="Search"
          {...props}
        />
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
