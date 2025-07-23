import { Skeleton } from '@/components/ui/skeleton';
/**
 * LoadingScreen component that renders a skeleton UI for loading state
 * @example
 * LoadingScreen()
 * <div className="min-h-screen ...">
 * @returns {JSX.Element} Returns JSX elements representing a loading screen with skeleton elements laid out.
 * @description
 *   - Provides a visually coherent loading state using skeleton components.
 *   - Utilizes Tailwind CSS for styling and layout.
 *   - Responsive layout adapting to different screen sizes using grid classes.
 */
export function LoadingScreen() {
    return (<div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-4xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-1/4"/>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-64"/>
            <Skeleton className="h-8 w-24"/>
            <Skeleton className="size-8"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-96"/>
          </div>
          <div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full"/>
              <Skeleton className="h-4 w-full"/>
              <Skeleton className="h-4 w-3/4"/>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
