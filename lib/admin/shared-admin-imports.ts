// Shared admin imports to eliminate duplication across admin pages
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
export { Badge } from '@/components/ui/badge';
export { Button } from '@/components/ui/button';
export { PlusCircle, Edit, BarChart3 } from 'lucide-react';
export { default as Link } from 'next/link';

// Common dynamic export setting
export const dynamic = 'force-dynamic';
