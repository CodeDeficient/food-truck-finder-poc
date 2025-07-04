import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputWithIconProps {
  readonly value: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly placeholder: string;
}

/**
 * Renders a search input field with an icon.
 * @example
 * SearchInputWithIcon({
 *   value: 'search query',
 *   onChange: handleInputChange,
 *   onKeyDown: handleKeyDown,
 *   placeholder: 'Search...',
 * })
 * <div>...</div>
 * @param {string} value - The current value of the input field.
 * @param {function} onChange - A callback function to handle input value changes.
 * @param {function} onKeyDown - A callback function to handle key down events.
 * @param {string} placeholder - The placeholder text for the input field.
 * @returns {JSX.Element} A JSX element representing the search input with an icon.
 * @description
 *   - Ensures the icon is centrally positioned vertically within the input.
 *   - Applies specific styling for dark mode UI components.
 */
export function SearchInputWithIcon({
  value,
  onChange,
  onKeyDown,
  placeholder,
}: SearchInputWithIconProps) {
  return (
    <div className="relative flex-grow min-w-[200px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 size-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 w-full dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400"
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
