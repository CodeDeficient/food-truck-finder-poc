'use client';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilterContent } from './search/SearchFilterContent'; // Import the new component
export function SearchFilters({ onSearch, loading }) {
    return (<Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-4">
        <SearchFilterContent onSearch={onSearch} loading={loading}/>
      </CardContent>
    </Card>);
}
