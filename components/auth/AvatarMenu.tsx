'use client';

import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getSupabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AvatarMenuItems } from './AvatarMenuItems';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AvatarMenuProps {
  readonly mounted: boolean;
  readonly resolvedTheme?: string;
  readonly user: SupabaseUser | null;
  readonly onSignOut?: () => void;
  readonly onProfileClick?: () => void;
}

interface UserMetadata {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
}

// Helper function to generate user initials from Supabase User
const getUserInitials = (user: SupabaseUser | null): string => {
  if (!user) return '?';
  
  const metadata = user.user_metadata as UserMetadata | undefined;
  
  // Try full name from user metadata
  if (metadata?.full_name !== undefined && metadata.full_name.trim() !== '' && typeof metadata.full_name === 'string') {
    const names = metadata.full_name.split(' ');
    return names.map((name: string) => name[0]).join('').slice(0, 2).toUpperCase();
  }
  
  // Try first and last name from user metadata
  if (metadata?.first_name !== undefined && metadata.first_name.trim() !== '' && 
      metadata?.last_name !== undefined && metadata.last_name.trim() !== '' && 
      typeof metadata.first_name === 'string' && typeof metadata.last_name === 'string') {
    return (metadata.first_name[0] + metadata.last_name[0]).toUpperCase();
  }
  
  // Fallback to email
  if (user.email !== undefined && user.email.trim() !== '' && typeof user.email === 'string') {
    return user.email.slice(0, 2).toUpperCase();
  }
  
  return '?';
};

// Get user display name
const getUserDisplayName = (user: SupabaseUser | null): string => {
  if (!user) return 'Anonymous';
  
  const metadata = user.user_metadata as UserMetadata | undefined;
  
  if (metadata?.full_name !== undefined && metadata.full_name.trim() !== '' && typeof metadata.full_name === 'string') {
    return metadata.full_name;
  }
  
  if (metadata?.first_name !== undefined && metadata.first_name.trim() !== '' && 
      metadata?.last_name !== undefined && metadata.last_name.trim() !== '' && 
      typeof metadata.first_name === 'string' && typeof metadata.last_name === 'string') {
    return `${metadata.first_name} ${metadata.last_name}`;
  }
  
  if (metadata?.name !== undefined && metadata.name.trim() !== '' && typeof metadata.name === 'string') {
    return metadata.name;
  }
  
  if (user.email !== undefined && user.email.trim() !== '' && typeof user.email === 'string') {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

export const AvatarMenu: React.FC<AvatarMenuProps> = ({ 
  mounted, 
  resolvedTheme: _resolvedTheme, 
  user, 
  onSignOut,
  onProfileClick 
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  // Support theme-aware styling in the future
  // void resolvedTheme; // Removed for linting compliance

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

  // Return undefined if not mounted or no user
  if (!mounted || !user) {
    return;
  }

  const userInitials = getUserInitials(user);
  const displayName = getUserDisplayName(user);
  const metadata = user.user_metadata as UserMetadata | undefined;
  const avatarUrl = metadata?.avatar_url ?? metadata?.picture;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full hover:bg-accent"
          disabled={isSigningOut}
        >
          <Avatar className="h-8 w-8">
            {Boolean(avatarUrl) && (
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
            {Boolean(user.email) && (
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <AvatarMenuItems
          isSigningOut={isSigningOut}
          handleProfileClick={handleProfileClick}
          handleSettingsClick={handleSettingsClick}
          handleSignOut={handleSignOut}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
