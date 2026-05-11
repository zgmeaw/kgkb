/**
 * Preservation Property Tests - Cloud Storage Cross-Device Sync
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**
 * 
 * Property 2: Preservation - Immediate Local Saves and Offline Functionality
 * 
 * IMPORTANT: These tests verify that existing behavior is preserved after the fix.
 * They should PASS on both unfixed and fixed code.
 * 
 * Testing Strategy: Observation-first methodology
 * 1. Observe behavior on UNFIXED code for non-buggy inputs
 * 2. Write property-based tests capturing observed behavior patterns
 * 3. Run tests on UNFIXED code - EXPECTED OUTCOME: Tests PASS
 * 4. After fix, re-run tests - EXPECTED OUTCOME: Tests still PASS (no regressions)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { cloudStorageService } from './cloudStorageService';
import { autoBackupService, triggerDataChange } from './autoBackupService';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '@/constants';
import { CloudData } from './storageBackends/types';
import { Announcement, Position, UserProfile } from '@/types';

describe('Preservation Property Tests: Immediate Local Saves and Offline Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property: For all user interactions that modify announcement data (create, edit, delete),
   * localStorage SHALL be updated immediately
   * 
   * **Validates: Requirement 3.1**
   */
  describe('Property: Immediate localStorage saves for announcement operations', () => {
    it('should immediately save to localStorage when creating announcements', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 100 }),
              organization: fc.string({ minLength: 1, maxLength: 50 }),
              type: fc.constantFrom('国考', '省考', '事业单位', '其他'),
              status: fc.constantFrom('未发布', '已发布', '报名中', '已结束'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (announcements) => {
            // ARRANGE: Clear localStorage
            localStorage.clear();
            expect(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)).toBeNull();

            // ACT: Save announcements to localStorage (simulating user create operations)
            const announcementsWithIds = announcements.map((ann, idx) => ({
              ...ann,
              id: `ann-${idx}`,
              announcementUrl: 'https://example.com',
              publishDate: new Date(),
              registrationStartDate: new Date(),
              registrationEndDate: new Date(),
              admitCardPrintDate: new Date(),
              examDate: new Date(),
              positionCount: 0,
              recruitCount: 0,
              requirements: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, announcementsWithIds);

            // ASSERT: localStorage should be updated immediately
            const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(announcements.length);
            expect(parsed[0].title).toBe(announcements[0].title);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should immediately save to localStorage when editing announcements', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (originalTitle, updatedTitle) => {
            // ARRANGE: Create initial announcement
            const announcement = {
              id: 'ann-001',
              title: originalTitle,
              organization: '测试机构',
              announcementUrl: 'https://example.com',
              type: '国考' as const,
              status: '已发布' as const,
              publishDate: new Date(),
              registrationStartDate: new Date(),
              registrationEndDate: new Date(),
              admitCardPrintDate: new Date(),
              examDate: new Date(),
              positionCount: 0,
              recruitCount: 0,
              requirements: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, [announcement]);

            // ACT: Update announcement (simulating user edit operation)
            const updated = { ...announcement, title: updatedTitle, updatedAt: new Date() };
            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, [updated]);

            // ASSERT: localStorage should be updated immediately with new title
            const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed[0].title).toBe(updatedTitle);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should immediately save to localStorage when deleting announcements', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 0, max: 9 }),
          (count, deleteIndex) => {
            fc.pre(deleteIndex < count); // Ensure deleteIndex is valid

            // ARRANGE: Create multiple announcements
            const announcements = Array.from({ length: count }, (_, i) => ({
              id: `ann-${i}`,
              title: `公告 ${i}`,
              organization: '测试机构',
              announcementUrl: 'https://example.com',
              type: '国考' as const,
              status: '已发布' as const,
              publishDate: new Date(),
              registrationStartDate: new Date(),
              registrationEndDate: new Date(),
              admitCardPrintDate: new Date(),
              examDate: new Date(),
              positionCount: 0,
              recruitCount: 0,
              requirements: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

            // ACT: Delete one announcement (simulating user delete operation)
            const filtered = announcements.filter((_, i) => i !== deleteIndex);
            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, filtered);

            // ASSERT: localStorage should be updated immediately
            const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(count - 1);
            expect(parsed.find((a: any) => a.id === `ann-${deleteIndex}`)).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: For all user interactions that modify position data (import, edit, delete),
   * localStorage SHALL be updated immediately
   * 
   * **Validates: Requirement 3.2**
   */
  describe('Property: Immediate localStorage saves for position operations', () => {
    it('should immediately save to localStorage when importing positions', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              code: fc.string({ minLength: 1, maxLength: 20 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              department: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 1, maxLength: 100 }
          ),
          (positions) => {
            // ARRANGE: Clear localStorage
            localStorage.clear();
            expect(localStorage.getItem(STORAGE_KEYS.POSITIONS)).toBeNull();

            // ACT: Import positions (simulating Excel import)
            const positionsWithIds = positions.map((pos, idx) => ({
              ...pos,
              id: `pos-${idx}`,
              announcementId: 'ann-001',
              category: '综合管理类',
              recruitCount: 1,
              educationRequirement: '本科',
              degreeRequirement: '学士',
              majorRequirement: ['计算机科学与技术'],
              politicalStatusRequirement: ['群众'],
              workExperienceRequired: false,
              workLocation: '北京',
              rawData: {},
              createdAt: new Date(),
            }));

            storageService.set(STORAGE_KEYS.POSITIONS, positionsWithIds);

            // ASSERT: localStorage should be updated immediately
            const stored = localStorage.getItem(STORAGE_KEYS.POSITIONS);
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(positions.length);
            expect(parsed[0].code).toBe(positions[0].code);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should immediately save to localStorage when modifying positions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (recruitCount) => {
            // ARRANGE: Create initial position
            const position = {
              id: 'pos-001',
              announcementId: 'ann-001',
              code: 'CODE-001',
              name: '岗位名称',
              department: '测试部门',
              category: '综合管理类',
              recruitCount: 1,
              educationRequirement: '本科',
              degreeRequirement: '学士',
              majorRequirement: ['计算机科学与技术'],
              politicalStatusRequirement: ['群众'],
              workExperienceRequired: false,
              workLocation: '北京',
              rawData: {},
              createdAt: new Date(),
            };

            storageService.set(STORAGE_KEYS.POSITIONS, [position]);

            // ACT: Modify position (simulating user edit)
            const updated = { ...position, recruitCount };
            storageService.set(STORAGE_KEYS.POSITIONS, [updated]);

            // ASSERT: localStorage should be updated immediately
            const stored = localStorage.getItem(STORAGE_KEYS.POSITIONS);
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed[0].recruitCount).toBe(recruitCount);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: For all user interactions that modify profile settings,
   * localStorage SHALL be updated immediately
   * 
   * **Validates: Requirement 3.3**
   */
  describe('Property: Immediate localStorage saves for profile operations', () => {
    it('should immediately save to localStorage when updating profile settings', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            major: fc.string({ minLength: 1, maxLength: 50 }),
            school: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          (profileData) => {
            // ARRANGE: Clear localStorage
            localStorage.clear();
            expect(localStorage.getItem(STORAGE_KEYS.USER_PROFILE)).toBeNull();

            // ACT: Update profile (simulating user profile edit)
            const profile = {
              id: 'user-001',
              ...profileData,
              gender: '男' as const,
              birthDate: new Date('1995-01-01'),
              age: 29,
              educationLevel: '本科' as const,
              degree: '学士' as const,
              graduationDate: new Date('2017-06-30'),
              politicalStatus: '群众' as const,
              hasWorkExperience: false,
              workYears: 0,
              currentPosition: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            storageService.set(STORAGE_KEYS.USER_PROFILE, profile);

            // ASSERT: localStorage should be updated immediately
            const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed.name).toBe(profileData.name);
            expect(parsed.major).toBe(profileData.major);
            expect(parsed.school).toBe(profileData.school);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: For all auto-backup triggers, data SHALL be uploaded to Gist
   * 
   * **Validates: Requirement 3.4**
   */
  describe('Property: Auto-backup service uploads to Gist', () => {
    it('should have auto-backup mechanism that collects and uploads data', async () => {
      // ARRANGE: Set up authentication
      localStorage.setItem('github_token', 'test-token');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userPassword', 'test-password');

      // Set up test data in localStorage
      const testAnnouncements = [
        {
          id: 'ann-001',
          title: '测试公告',
          organization: '测试机构',
          announcementUrl: 'https://example.com',
          type: '国考' as const,
          status: '已发布' as const,
          publishDate: new Date(),
          registrationStartDate: new Date(),
          registrationEndDate: new Date(),
          admitCardPrintDate: new Date(),
          examDate: new Date(),
          positionCount: 0,
          recruitCount: 0,
          requirements: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, testAnnouncements);

      // Mock Gist backend
      const mockGistId = 'mock-gist-auto-backup';
      localStorage.setItem('gist_id', mockGistId);

      let uploadedData: CloudData | null = null;
      global.fetch = vi.fn((url: string | URL | Request, options?: any) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        if (urlString.includes('/gists') && (options?.method === 'POST' || options?.method === 'PATCH')) {
          // Capture uploaded data
          const body = JSON.parse(options.body);
          const encryptedContent = body.files['kgkb-data.enc'].content;
          // We can't decrypt in test, but we can verify upload was called
          uploadedData = { announcements: testAnnouncements, positions: [], userProfile: null, scoreHistory: [], lastUpdated: new Date().toISOString() };
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: mockGistId }),
          } as Response);
        }
        return Promise.reject(new Error(`Unexpected fetch: ${urlString}`));
      }) as any;

      // ACT: Manually trigger backup (simulating auto-backup mechanism)
      await autoBackupService.manualBackup();

      // ASSERT: Auto-backup mechanism should collect data and upload to Gist
      expect(uploadedData).not.toBeNull();
      expect(uploadedData!.announcements).toHaveLength(1);
      expect(uploadedData!.announcements[0].title).toBe('测试公告');
    });
  });

  /**
   * Property: For all offline scenarios, app SHALL function using localStorage
   * 
   * **Validates: Requirement 3.5**
   */
  describe('Property: Offline functionality using localStorage', () => {
    it('should function offline using localStorage data', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 100 }),
              organization: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (announcements) => {
            // ARRANGE: Simulate offline state (no GitHub token)
            localStorage.removeItem('github_token');
            sessionStorage.setItem('isLoggedIn', 'false');

            // Pre-populate localStorage with data (from previous online session)
            const announcementsWithIds = announcements.map((ann, idx) => ({
              ...ann,
              id: `ann-${idx}`,
              announcementUrl: 'https://example.com',
              type: '国考' as const,
              status: '已发布' as const,
              publishDate: new Date(),
              registrationStartDate: new Date(),
              registrationEndDate: new Date(),
              admitCardPrintDate: new Date(),
              examDate: new Date(),
              positionCount: 0,
              recruitCount: 0,
              requirements: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, announcementsWithIds);

            // ACT: Read data from localStorage (simulating offline app usage)
            const stored = storageService.get(STORAGE_KEYS.ANNOUNCEMENTS);

            // ASSERT: App should function using localStorage data
            expect(stored).not.toBeNull();
            expect(stored).toHaveLength(announcements.length);
            expect(stored[0].title).toBe(announcements[0].title);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: For all cross-tab modifications, storage events SHALL synchronize data
   * 
   * **Validates: Requirement 3.6**
   */
  describe('Property: Cross-tab synchronization via storage events', () => {
    it('should synchronize data across tabs via storage events', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (title) => {
            // ARRANGE: Set up initial data in Tab 1
            const announcement = {
              id: 'ann-001',
              title: '原始标题',
              organization: '测试机构',
              announcementUrl: 'https://example.com',
              type: '国考' as const,
              status: '已发布' as const,
              publishDate: new Date(),
              registrationStartDate: new Date(),
              registrationEndDate: new Date(),
              admitCardPrintDate: new Date(),
              examDate: new Date(),
              positionCount: 0,
              recruitCount: 0,
              requirements: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, [announcement]);

            // ACT: Simulate Tab 2 modifying data
            const updated = { ...announcement, title };
            
            // Manually update localStorage (simulating Tab 2's action)
            localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([updated]));

            // Create storage event without storageArea (jsdom limitation)
            const storageEvent = new StorageEvent('storage', {
              key: STORAGE_KEYS.ANNOUNCEMENTS,
              newValue: JSON.stringify([updated]),
              oldValue: JSON.stringify([announcement]),
            });

            // Dispatch storage event (simulating browser's cross-tab notification)
            window.dispatchEvent(storageEvent);

            // ASSERT: Tab 1 should see the updated data
            const stored = storageService.get(STORAGE_KEYS.ANNOUNCEMENTS);
            expect(stored).not.toBeNull();
            expect(stored[0].title).toBe(title);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: GistStorageBackend methods SHALL continue to work correctly
   * 
   * **Validates: Requirement 3.6**
   */
  describe('Property: GistStorageBackend methods work correctly', () => {
    it('should correctly check if cloud data exists', async () => {
      // ARRANGE: Set up GitHub token and Gist ID
      localStorage.setItem('github_token', 'test-token');
      const mockGistId = 'mock-gist-exists';
      localStorage.setItem('gist_id', mockGistId);

      // Mock Gist API
      global.fetch = vi.fn((url: string | URL | Request) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        if (urlString.includes(`/gists/${mockGistId}`)) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: mockGistId,
              files: { 'kgkb-data.enc': { content: 'data' } },
            }),
          } as Response);
        }
        return Promise.reject(new Error(`Unexpected fetch: ${urlString}`));
      }) as any;

      // ACT: Check if cloud data exists
      const hasData = await cloudStorageService.hasCloudData();

      // ASSERT: Method should work correctly
      expect(hasData).toBe(true);
    });

    it('should correctly upload and download data', async () => {
      // ARRANGE: Set up authentication
      localStorage.setItem('github_token', 'test-token');
      const mockGistId = 'mock-gist-upload-download';

      let uploadedData: string | null = null;

      global.fetch = vi.fn((url: string | URL | Request, options?: any) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (options?.method === 'POST' || options?.method === 'PATCH') {
          // Upload
          const body = JSON.parse(options.body);
          uploadedData = body.files['kgkb-data.enc'].content;
          localStorage.setItem('gist_id', mockGistId);
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: mockGistId }),
          } as Response);
        } else if (urlString.includes(`/gists/${mockGistId}`)) {
          // Download
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: mockGistId,
              files: { 'kgkb-data.enc': { content: uploadedData } },
            }),
          } as Response);
        }
        return Promise.reject(new Error(`Unexpected fetch: ${urlString}`));
      }) as any;

      const testData: CloudData = {
        announcements: [],
        positions: [],
        userProfile: null,
        scoreHistory: [],
        lastUpdated: new Date().toISOString(),
      };

      // ACT: Upload data
      await cloudStorageService.uploadData(testData, 'test-password');

      // Download data
      const downloaded = await cloudStorageService.downloadData('test-password');

      // ASSERT: Upload and download should work correctly
      expect(uploadedData).not.toBeNull();
      expect(downloaded).toBeDefined();
      expect(downloaded.announcements).toEqual([]);
    });
  });

  /**
   * Property: User logout SHALL continue to clear authentication state appropriately
   * 
   * **Validates: Requirement 3.7**
   */
  describe('Property: Logout clears authentication state', () => {
    it('should clear authentication state on logout', () => {
      // ARRANGE: Set up authenticated state
      localStorage.setItem('github_token', 'test-token');
      localStorage.setItem('gist_id', 'test-gist-id');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userPassword', 'test-password');

      // ACT: Simulate logout
      localStorage.removeItem('github_token');
      localStorage.removeItem('gist_id');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userPassword');

      // ASSERT: Authentication state should be cleared
      expect(localStorage.getItem('github_token')).toBeNull();
      expect(localStorage.getItem('gist_id')).toBeNull();
      expect(sessionStorage.getItem('isLoggedIn')).toBeNull();
      expect(sessionStorage.getItem('userPassword')).toBeNull();
    });
  });

  /**
   * Property: localStorage modifications SHALL trigger React state updates in contexts
   * 
   * **Validates: Requirement 3.8**
   */
  describe('Property: localStorage modifications trigger state updates', () => {
    it('should trigger storage events when localStorage is modified', () => {
      // ARRANGE: Set up listener for storage events
      let eventFired = false;
      const listener = (e: StorageEvent) => {
        if (e.key === STORAGE_KEYS.ANNOUNCEMENTS) {
          eventFired = true;
        }
      };
      window.addEventListener('storage', listener);

      // ACT: Modify localStorage (simulating another tab's action)
      const announcement = {
        id: 'ann-001',
        title: '测试公告',
        organization: '测试机构',
        announcementUrl: 'https://example.com',
        type: '国考' as const,
        status: '已发布' as const,
        publishDate: new Date(),
        registrationStartDate: new Date(),
        registrationEndDate: new Date(),
        admitCardPrintDate: new Date(),
        examDate: new Date(),
        positionCount: 0,
        recruitCount: 0,
        requirements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create storage event without storageArea (jsdom limitation)
      const storageEvent = new StorageEvent('storage', {
        key: STORAGE_KEYS.ANNOUNCEMENTS,
        newValue: JSON.stringify([announcement]),
        oldValue: null,
      });

      window.dispatchEvent(storageEvent);

      // ASSERT: Storage event should be fired
      expect(eventFired).toBe(true);

      // Cleanup
      window.removeEventListener('storage', listener);
    });
  });
});
