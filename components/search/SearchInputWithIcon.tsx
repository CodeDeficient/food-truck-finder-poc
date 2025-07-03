import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputWithIconProps {
  readonly value: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly placeholder: string;
}

export function SearchInputWithIcon({
  value,
  onChange,
  onKeyDown,
  placeholder,
}: SearchInputWithIconProps) {
  return (
    <div className="relative flex-grow min-w-[200px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
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
