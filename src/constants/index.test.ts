/**
 * 常量定义测试
 */

import { describe, it, expect } from 'vitest';
import {
  APP_NAME,
  APP_VERSION,
  STORAGE_KEYS,
  FILE_LIMITS,
  MATCHING_WEIGHTS,
  MAJOR_MATCH_SCORES,
  ANNOUNCEMENT_STATUS_MAP,
} from './index';

describe('Constants', () => {
  describe('Application Info', () => {
    it('should have APP_NAME defined', () => {
      expect(APP_NAME).toBe('公考岗位智能分析系统');
    });

    it('should have APP_VERSION defined', () => {
      expect(APP_VERSION).toBe('1.0.0');
    });
  });

  describe('Storage Keys', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS.ANNOUNCEMENTS).toBe('civil_service_announcements');
      expect(STORAGE_KEYS.POSITIONS).toBe('civil_service_positions');
      expect(STORAGE_KEYS.USER_PROFILE).toBe('civil_service_user_profile');
      expect(STORAGE_KEYS.SCORE_HISTORY).toBe('civil_service_score_history');
      expect(STORAGE_KEYS.APP_VERSION).toBe('civil_service_app_version');
    });
  });

  describe('File Limits', () => {
    it('should have MAX_SIZE set to 10MB', () => {
      expect(FILE_LIMITS.MAX_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should have allowed file types', () => {
      expect(FILE_LIMITS.ALLOWED_TYPES).toContain('.xlsx');
      expect(FILE_LIMITS.ALLOWED_TYPES).toContain('.xls');
    });
  });

  describe('Matching Weights', () => {
    it('should have correct weight values based on design', () => {
      expect(MATCHING_WEIGHTS.MAJOR).toBe(60);
      expect(MATCHING_WEIGHTS.EDUCATION).toBe(20);
      expect(MATCHING_WEIGHTS.POLITICAL_STATUS).toBe(10);
      expect(MATCHING_WEIGHTS.WORK_EXPERIENCE).toBe(10);
    });

    it('should sum to 100 points', () => {
      const total = MATCHING_WEIGHTS.MAJOR + 
                    MATCHING_WEIGHTS.EDUCATION + 
                    MATCHING_WEIGHTS.POLITICAL_STATUS + 
                    MATCHING_WEIGHTS.WORK_EXPERIENCE;
      expect(total).toBe(100);
    });
  });

  describe('Major Match Scores', () => {
    it('should have correct score values', () => {
      expect(MAJOR_MATCH_SCORES.EXACT).toBe(60);
      expect(MAJOR_MATCH_SCORES.PARTIAL).toBe(30);
      expect(MAJOR_MATCH_SCORES.NONE).toBe(0);
    });
  });

  describe('Announcement Status Map', () => {
    it('should have all 6 status types', () => {
      expect(ANNOUNCEMENT_STATUS_MAP.NOT_STARTED).toBeDefined();
      expect(ANNOUNCEMENT_STATUS_MAP.REGISTRATION_OPEN).toBeDefined();
      expect(ANNOUNCEMENT_STATUS_MAP.REGISTRATION_CLOSED).toBeDefined();
      expect(ANNOUNCEMENT_STATUS_MAP.ADMIT_CARD_AVAILABLE).toBeDefined();
      expect(ANNOUNCEMENT_STATUS_MAP.EXAM_IN_PROGRESS).toBeDefined();
      expect(ANNOUNCEMENT_STATUS_MAP.COMPLETED).toBeDefined();
    });

    it('should have correct labels in Chinese', () => {
      expect(ANNOUNCEMENT_STATUS_MAP.NOT_STARTED.label).toBe('未开始');
      expect(ANNOUNCEMENT_STATUS_MAP.REGISTRATION_OPEN.label).toBe('报名中');
      expect(ANNOUNCEMENT_STATUS_MAP.REGISTRATION_CLOSED.label).toBe('报名结束');
      expect(ANNOUNCEMENT_STATUS_MAP.ADMIT_CARD_AVAILABLE.label).toBe('准考证打印中');
      expect(ANNOUNCEMENT_STATUS_MAP.EXAM_IN_PROGRESS.label).toBe('考试进行中');
      expect(ANNOUNCEMENT_STATUS_MAP.COMPLETED.label).toBe('已结束');
    });

    it('should have color properties for each status', () => {
      Object.values(ANNOUNCEMENT_STATUS_MAP).forEach(status => {
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('color');
        expect(status).toHaveProperty('bgColor');
        expect(status).toHaveProperty('textColor');
        expect(status).toHaveProperty('borderColor');
      });
    });
  });
});
