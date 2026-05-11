/**
 * 用户档案 Context
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { useLocalStorage } from '@/hooks';
import { calculateAge } from '@/utils';
import { triggerDataChange, githubDataService } from '@/services';

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

  const setUserProfile = async (profile: UserProfile | null) => {
    setUserProfileInternal(profile);
    triggerDataChange(); // 触发自动备份
    
    // 保存到 GitHub 文件系统
    if (profile) {
      try {
        await githubDataService.saveUserProfile(profile);
        console.log('✅ 用户档案已保存到文件系统');
      } catch (error) {
        console.error('❌ 文件系统保存失败:', error);
        // 不影响主要功能，只记录错误
      }
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
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

    await setUserProfile(updatedProfile);
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
