/**
 * 岗位 Context
 */

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Position, PositionFilter, PositionStatistics } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { useLocalStorage } from '@/hooks';
import { generateId } from '@/utils';

interface PositionContextType {
  positions: Position[];
  addPosition: (position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => Position;
  addPositions: (positions: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>[]) => Position[];
  updatePosition: (id: string, updates: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  deletePositionsByAnnouncement: (announcementId: string) => void;
  getPositionById: (id: string) => Position | undefined;
  getPositionsByAnnouncement: (announcementId: string) => Position[];
  filterPositions: (filter: PositionFilter) => Position[];
  getStatistics: (announcementId?: string) => PositionStatistics;
  clearPositions: () => void;
}

const PositionContext = createContext<PositionContextType | undefined>(undefined);

export function PositionProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions, clearPositions] = useLocalStorage<Position[]>(
    STORAGE_KEYS.POSITIONS,
    []
  );

  const addPosition = useCallback((
    position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>
  ): Position => {
    const newPosition: Position = {
      ...position,
      id: generateId('pos'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPositions(prev => [...prev, newPosition]);
    return newPosition;
  }, [setPositions]);

  const addPositions = useCallback((
    newPositions: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Position[] => {
    const positionsWithIds = newPositions.map(pos => ({
      ...pos,
      id: generateId('pos'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    setPositions(prev => [...prev, ...positionsWithIds]);
    return positionsWithIds;
  }, [setPositions]);

  const updatePosition = useCallback((id: string, updates: Partial<Position>) => {
    setPositions(prev =>
      prev.map(pos =>
        pos.id === id
          ? { ...pos, ...updates, updatedAt: Date.now() }
          : pos
      )
    );
  }, [setPositions]);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== id));
  }, [setPositions]);

  const deletePositionsByAnnouncement = useCallback((announcementId: string) => {
    setPositions(prev => prev.filter(pos => pos.announcementId !== announcementId));
  }, [setPositions]);

  const getPositionById = useCallback((id: string) => {
    return positions.find(pos => pos.id === id);
  }, [positions]);

  const getPositionsByAnnouncement = useCallback((announcementId: string) => {
    return positions.filter(pos => pos.announcementId === announcementId);
  }, [positions]);

  const filterPositions = useCallback((filter: PositionFilter): Position[] => {
    return positions.filter(pos => {
      if (filter.announcementId && pos.announcementId !== filter.announcementId) return false;
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        const matchName = pos.name.toLowerCase().includes(keyword);
        const matchDept = pos.department.toLowerCase().includes(keyword);
        const matchCode = pos.code.toLowerCase().includes(keyword);
        if (!matchName && !matchDept && !matchCode) return false;
      }
      if (filter.department && pos.department !== filter.department) return false;
      if (filter.category && pos.category !== filter.category) return false;
      if (filter.educationLevel && pos.educationRequirement !== filter.educationLevel) return false;
      if (filter.degree && pos.degreeRequirement !== filter.degree) return false;
      if (filter.major) {
        const hasMajor = pos.majorRequirement.some(m => 
          m.includes(filter.major!) || filter.major!.includes(m)
        );
        if (!hasMajor) return false;
      }
      if (filter.politicalStatus) {
        const hasStatus = pos.politicalStatusRequirement.includes(filter.politicalStatus);
        if (!hasStatus) return false;
      }
      if (filter.workExperienceRequired !== undefined && 
          pos.workExperienceRequired !== filter.workExperienceRequired) {
        return false;
      }
      if (filter.minMatchingScore !== undefined && 
          (pos.matchingScore || 0) < filter.minMatchingScore) {
        return false;
      }
      if (filter.workLocation && !pos.workLocation.includes(filter.workLocation)) {
        return false;
      }
      return true;
    });
  }, [positions]);

  const getStatistics = useCallback((announcementId?: string): PositionStatistics => {
    const filteredPositions = announcementId
      ? positions.filter(pos => pos.announcementId === announcementId)
      : positions;

    const stats: PositionStatistics = {
      total: filteredPositions.length,
      matched: filteredPositions.filter(pos => pos.isMatched).length,
      unmatched: filteredPositions.filter(pos => !pos.isMatched).length,
      averageMatchingScore: 0,
      byEducation: {} as any,
      byDepartment: {} as any,
      topDepartments: [],
      competitionRatioRange: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    if (filteredPositions.length === 0) return stats;

    // 平均匹配分数
    const totalScore = filteredPositions.reduce((sum, pos) => sum + (pos.matchingScore || 0), 0);
    stats.averageMatchingScore = totalScore / filteredPositions.length;

    // 按学历统计
    filteredPositions.forEach(pos => {
      stats.byEducation[pos.educationRequirement] = 
        (stats.byEducation[pos.educationRequirement] || 0) + 1;
    });

    // 按部门统计
    filteredPositions.forEach(pos => {
      stats.byDepartment[pos.department] = 
        (stats.byDepartment[pos.department] || 0) + 1;
    });

    // 热门部门
    stats.topDepartments = Object.entries(stats.byDepartment)
      .map(([department, count]) => ({ department, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 竞争比例范围
    filteredPositions.forEach(pos => {
      const ratio = pos.competitionRatio || 0;
      if (ratio < 10) {
        stats.competitionRatioRange.low++;
      } else if (ratio <= 50) {
        stats.competitionRatioRange.medium++;
      } else {
        stats.competitionRatioRange.high++;
      }
    });

    return stats;
  }, [positions]);

  const value: PositionContextType = {
    positions,
    addPosition,
    addPositions,
    updatePosition,
    deletePosition,
    deletePositionsByAnnouncement,
    getPositionById,
    getPositionsByAnnouncement,
    filterPositions,
    getStatistics,
    clearPositions,
  };

  return <PositionContext.Provider value={value}>{children}</PositionContext.Provider>;
}

export function usePositions() {
  const context = useContext(PositionContext);
  if (context === undefined) {
    throw new Error('usePositions must be used within a PositionProvider');
  }
  return context;
}
