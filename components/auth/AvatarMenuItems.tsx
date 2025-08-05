'use client';

import React from 'react';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { User, Settings, LogOut, Loader2 } from 'lucide-react';

interface AvatarMenuItemsProps {
  readonly isSigningOut: boolean;
  readonly handleProfileClick: () => void;
  readonly handleSettingsClick: () => void;
  readonly handleSignOut: () => Promise<void>;
}

export const AvatarMenuItems: React.FC<AvatarMenuItemsProps> = ({ 
  isSigningOut, 
  handleProfileClick, 
  handleSettingsClick, 
  handleSignOut 
}) => (
  <>
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
  </>
);
