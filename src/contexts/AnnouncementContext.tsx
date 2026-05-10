/**
 * 公告 Context
 */

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Announcement, AnnouncementFilter, AnnouncementStatistics, AnnouncementStatus, AnnouncementType } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { useLocalStorage } from '@/hooks';
import { generateId } from '@/utils';
import { triggerDataChange } from '@/services';

interface AnnouncementContextType {
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'positionCount' | 'recruitCount'>) => Announcement;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  getAnnouncementById: (id: string) => Announcement | undefined;
  filterAnnouncements: (filter: AnnouncementFilter) => Announcement[];
  getStatistics: () => AnnouncementStatistics;
  clearAnnouncements: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements, clearAnnouncements] = useLocalStorage<Announcement[]>(
    STORAGE_KEYS.ANNOUNCEMENTS,
    []
  );

  const addAnnouncement = useCallback((
    announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'positionCount' | 'recruitCount'>
  ): Announcement => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: generateId('ann'),
      positionCount: 0,
      recruitCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAnnouncements(prev => [...prev, newAnnouncement]);
    triggerDataChange(); // 触发自动备份
    return newAnnouncement;
  }, [setAnnouncements]);

  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === id
          ? { ...ann, ...updates, updatedAt: new Date() }
          : ann
      )
    );
    triggerDataChange(); // 触发自动备份
  }, [setAnnouncements]);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    triggerDataChange(); // 触发自动备份
  }, [setAnnouncements]);

  const getAnnouncementById = useCallback((id: string) => {
    return announcements.find(ann => ann.id === id);
  }, [announcements]);

  const filterAnnouncements = useCallback((filter: AnnouncementFilter): Announcement[] => {
    return announcements.filter(ann => {
      if (filter.type && ann.type !== filter.type) return false;
      if (filter.status && ann.status !== filter.status) return false;
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        const matchTitle = ann.title.toLowerCase().includes(keyword);
        const matchOrg = ann.organization.toLowerCase().includes(keyword);
        if (!matchTitle && !matchOrg) return false;
      }
      if (filter.startDate && ann.publishDate < filter.startDate) return false;
      if (filter.endDate && ann.publishDate > filter.endDate) return false;
      return true;
    });
  }, [announcements]);

  const getStatistics = useCallback((): AnnouncementStatistics => {
    const stats: AnnouncementStatistics = {
      total: announcements.length,
      byType: {},
      byStatus: {},
      published: 0,
      ongoing: 0,
      completed: 0,
    };

    announcements.forEach(ann => {
      // 按类型统计
      stats.byType[ann.type] = (stats.byType[ann.type] || 0) + 1;
      
      // 按状态统计
      stats.byStatus[ann.status] = (stats.byStatus[ann.status] || 0) + 1;
      
      // 即将开始和进行中
      if (ann.status === AnnouncementStatus.PUBLISHED) {
        stats.published++;
      } else if (ann.status === AnnouncementStatus.ONGOING) {
        stats.ongoing++;
      } else if (ann.status === AnnouncementStatus.COMPLETED) {
        stats.completed++;
      }
    });

    return stats;
  }, [announcements]);

  const value: AnnouncementContextType = {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncementById,
    filterAnnouncements,
    getStatistics,
    clearAnnouncements,
  };

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
}
