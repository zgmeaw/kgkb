/**
 * 用户档案 Context
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { useLocalStorage } from '@/hooks';
import { calculateAge } from '@/utils';
import { triggerDataChange } from '@/services';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
  hasProfile: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileInternal, clearUserProfile] = useLocalStorage<UserProfile | null>(
    STORAGE_KEYS.USER_PROFILE,
    null
  );

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileInternal(profile);
    triggerDataChange(); // 触发自动备份
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date(),
    };

    // 如果更新了出生日期，重新计算年龄
    if (updates.birthDate) {
      updatedProfile.age = calculateAge(updates.birthDate);
    }

    setUserProfile(updatedProfile);
  };

  const value: UserProfileContextType = {
    userProfile,
    setUserProfile,
    updateUserProfile,
    clearUserProfile,
    hasProfile: userProfile !== null,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
