'use client';

import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Loader2, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AvatarMenuProps {
  readonly mounted: boolean;
  readonly resolvedTheme?: string;
  readonly user: SupabaseUser | null;
  readonly onSignOut?: () => void;
  readonly onProfileClick?: () => void;
}

// Helper function to generate user initials from Supabase User
const getUserInitials = (user: SupabaseUser | null): string => {
  if (!user) return '?';
  
  // Try full name from user metadata
  if (user.user_metadata?.full_name) {
    const names = user.user_metadata.full_name.split(' ');
    return names.map((name: string) => name[0]).join('').substring(0, 2).toUpperCase();
  }
  
  // Try first and last name from user metadata
  if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
    return (user.user_metadata.first_name[0] + user.user_metadata.last_name[0]).toUpperCase();
  }
  
  // Fallback to email
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  
  return '?';
};

// Get user display name
const getUserDisplayName = (user: SupabaseUser | null): string => {
  if (!user) return 'Anonymous';
  
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
    return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
  }
  
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

export const AvatarMenu: React.FC<AvatarMenuProps> = ({ 
  mounted, 
  resolvedTheme, 
  user, 
  onSignOut,
  onProfileClick 
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  // Use the imported supabase client directly

  // Support theme-aware styling in the future
  void resolvedTheme;

  const handleSignOut = async () => {
    if (!mounted) return;
    
    setIsSigningOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return;
      }

      // Call optional callback
      onSignOut?.();
      
      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      router.push('/profile');
    }
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  // Return null if not mounted or no user
  if (!mounted || !user) {
    return null;
  }

  const userInitials = getUserInitials(user);
  const displayName = getUserDisplayName(user);
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full hover:bg-accent"
          disabled={isSigningOut}
        >
          <Avatar className="h-8 w-8">
            {avatarUrl && (
              <AvatarImage 
                src={avatarUrl} 
                alt={displayName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{displayName}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 size-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 size-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => { void handleSignOut(); }}
          disabled={isSigningOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 size-4" />
          )}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
