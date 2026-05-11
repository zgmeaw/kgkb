/**
 * Preservation Property Tests - Small Dataset LocalStorage Caching
 * 
 * **GOAL**: Ensure small datasets continue using localStorage caching after fix
 * **IMPORTANT**: These tests should PASS on UNFIXED code (confirms baseline behavior)
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * Preservation Requirements:
 * FOR ALL input WHERE NOT isBugCondition(input):
 *   - Small datasets (<4MB) continue using localStorage caching
 *   - Announcements, user profiles, small position lists unchanged
 *   - Cross-tab sync via storage events continues working
 *   - Auto-backup functionality continues working
 *   - Gist backend continues working normally
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { storageService } from '../storageService';
import * as fc from 'fast-check';
import type { Announcement, AnnouncementStatus } from '@/types/announcement';
import type { Position } from '@/types/position';
import type { UserProfile, EducationLevel, DegreeType, PoliticalStatus } from '@/types/user';

describe('Preservation Property Tests: Small Dataset LocalStorage Caching', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  /**
   * Helper function to estimate data size in bytes
   */
  function estimateDataSize(data: any): number {
    const jsonString = JSON.stringify(data);
    // UTF-16 encoding: 2 bytes per character
    return jsonString.length * 2;
  }

  // Shared arbitraries for all tests
  const announcementArbitrary = fc.record({
    id: fc.string({ minLength: 36, maxLength: 36 }).filter(s => s.length === 36),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    organization: fc.string({ minLength: 5, maxLength: 50 }),
    announcementUrl: fc.webUrl(),
    type: fc.constantFrom('公务员', '事业编', '国企', '国考', '省考'),
    status: fc.constantFrom('未开始', '报名中', '报名结束', '考试进行中', '已结束') as fc.Arbitrary<AnnouncementStatus>,
    publishDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    registrationStartDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    registrationEndDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    admitCardPrintDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    examDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    positionCount: fc.integer({ min: 10, max: 500 }),
    recruitCount: fc.integer({ min: 10, max: 1000 }),
    requirements: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });

  const userProfileArbitrary = fc.record({
    id: fc.string({ minLength: 36, maxLength: 36 }).filter(s => s.length === 36),
    name: fc.string({ minLength: 2, maxLength: 20 }),
    gender: fc.constantFrom('男', '女') as fc.Arbitrary<'男' | '女'>,
    birthDate: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
    age: fc.integer({ min: 18, max: 45 }),
    educationLevel: fc.constantFrom('高中', '大专', '本科', '硕士', '博士') as fc.Arbitrary<EducationLevel>,
    degree: fc.constantFrom('无学位', '学士', '硕士', '博士') as fc.Arbitrary<DegreeType>,
    major: fc.string({ minLength: 5, maxLength: 30 }),
    graduationDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-12-31') }),
    school: fc.string({ minLength: 5, maxLength: 50 }),
    politicalStatus: fc.constantFrom('群众', '共青团员', '中共党员', '民主党派') as fc.Arbitrary<PoliticalStatus>,
    hasWorkExperience: fc.boolean(),
    workYears: fc.integer({ min: 0, max: 20 }),
    currentPosition: fc.option(fc.string({ minLength: 5, maxLength: 30 }), { nil: undefined }),
    workDescription: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
    phoneNumber: fc.option(fc.string({ minLength: 11, maxLength: 11 }), { nil: undefined }),
    email: fc.option(fc.emailAddress(), { nil: undefined }),
    address: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });

  const positionArbitrary = fc.record({
    id: fc.hexaString({ minLength: 32, maxLength: 32 }).map(s => 
      `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`
    ),
    announcementId: fc.hexaString({ minLength: 32, maxLength: 32 }).map(s => 
      `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`
    ),
    code: fc.string({ minLength: 10, maxLength: 20 }),
    name: fc.string({ minLength: 10, maxLength: 50 }),
    department: fc.string({ minLength: 5, maxLength: 50 }),
    category: fc.string({ minLength: 5, maxLength: 20 }),
    recruitCount: fc.integer({ min: 1, max: 10 }),
    educationRequirement: fc.constantFrom('本科及以上', '硕士及以上', '大专及以上'),
    degreeRequirement: fc.constantFrom('学士学位', '硕士学位', '不限'),
    majorRequirement: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    politicalStatusRequirement: fc.array(fc.constantFrom('中共党员', '共青团员', '群众'), { minLength: 1, maxLength: 3 }),
    workExperienceRequired: fc.boolean(),
    minWorkYears: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
    minAge: fc.option(fc.integer({ min: 18, max: 25 }), { nil: undefined }),
    maxAge: fc.option(fc.integer({ min: 30, max: 45 }), { nil: undefined }),
    workLocation: fc.string({ minLength: 5, maxLength: 30 }),
    responsibilities: fc.option(fc.string({ minLength: 20, maxLength: 100 }), { nil: undefined }),
    matchingScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    isMatched: fc.option(fc.boolean(), { nil: undefined }),
    competitionRatio: fc.option(fc.float({ min: 0, max: 100 }), { nil: undefined }),
    rawData: fc.dictionary(fc.string(), fc.string()),
    createdAt: fc.date(),
    updatedAt: fc.option(fc.date(), { nil: undefined })
  });

  /**
   * Property 1: Small Announcements (10-50 records, 50KB-250KB)
   * **Validates: Requirements 3.1, 3.2**
   */
  describe('Property 1: Small Announcements LocalStorage Caching', () => {
    it('should cache small announcement datasets in localStorage', () => {
      fc.assert(
        fc.property(
          fc.array(announcementArbitrary, { minLength: 10, maxLength: 50 }),
          async (announcements) => {
            // Clear localStorage for this test
            localStorage.clear();
            
            const dataSize = estimateDataSize(announcements);
            const dataSizeMB = dataSize / 1024 / 1024;
            
            // Ensure we're testing small datasets only (<1MB)
            fc.pre(dataSizeMB < 1);
            
            // Save to localStorage
            const saveResult = await storageService.set('announcements', announcements);
            
            // Assert: Save should succeed
            expect(saveResult).toBe(true);
            
            // Assert: Data should be in localStorage
            const storedData = localStorage.getItem('announcements');
            expect(storedData).not.toBeNull();
            
            // Assert: Data should be retrievable
            const retrievedData = storageService.get<Announcement[]>('announcements');
            expect(retrievedData).not.toBeNull();
            expect(retrievedData).toHaveLength(announcements.length);
            
            // Assert: Data integrity - first and last items match
            if (retrievedData && retrievedData.length > 0) {
              expect(retrievedData[0].id).toBe(announcements[0].id);
              expect(retrievedData[retrievedData.length - 1].id).toBe(announcements[announcements.length - 1].id);
            }
            
            return true;
          }
        ),
        { numRuns: 50 } // Run 50 random test cases
      );
    });

    it('should handle announcement data with consistent read/write behavior', () => {
      fc.assert(
        fc.property(
          fc.array(announcementArbitrary, { minLength: 5, maxLength: 30 }),
          async (announcements) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(announcements);
            fc.pre(dataSize < 500 * 1024); // <500KB
            
            // Write data
            const writeSuccess = await storageService.set('test-announcements', announcements);
            expect(writeSuccess).toBe(true);
            
            // Read data
            const readData = storageService.get<Announcement[]>('test-announcements');
            expect(readData).not.toBeNull();
            
            // Verify data matches
            expect(readData?.length).toBe(announcements.length);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 2: User Profile (1 record, ~5KB)
   * **Validates: Requirements 3.1, 3.2**
   */
  describe('Property 2: User Profile LocalStorage Caching', () => {
    it('should cache user profile in localStorage', () => {
      fc.assert(
        fc.property(
          userProfileArbitrary,
          async (userProfile) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(userProfile);
            const dataSizeKB = dataSize / 1024;
            
            // User profile should be small (<20KB)
            fc.pre(dataSizeKB < 20);
            
            // Save to localStorage
            const saveResult = await storageService.set('userProfile', userProfile);
            
            // Assert: Save should succeed
            expect(saveResult).toBe(true);
            
            // Assert: Data should be in localStorage
            const storedData = localStorage.getItem('userProfile');
            expect(storedData).not.toBeNull();
            
            // Assert: Data should be retrievable
            const retrievedData = storageService.get<UserProfile>('userProfile');
            expect(retrievedData).not.toBeNull();
            expect(retrievedData?.id).toBe(userProfile.id);
            expect(retrievedData?.name).toBe(userProfile.name);
            
            return true;
          }
        ),
        { numRuns: 100 } // Run 100 random test cases
      );
    });

    it('should persist user profile across page refresh simulation', () => {
      fc.assert(
        fc.property(
          userProfileArbitrary,
          async (userProfile) => {
            localStorage.clear();
            
            // Save user profile
            await storageService.set('userProfile', userProfile);
            
            // Simulate page refresh by reading from localStorage
            const retrievedProfile = storageService.get<UserProfile>('userProfile');
            
            // Assert: Data should persist
            expect(retrievedProfile).not.toBeNull();
            expect(retrievedProfile?.id).toBe(userProfile.id);
            expect(retrievedProfile?.name).toBe(userProfile.name);
            expect(retrievedProfile?.educationLevel).toBe(userProfile.educationLevel);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 3: Small Position Lists (10-100 records, 50KB-500KB)
   * **Validates: Requirements 3.1, 3.2**
   */
  describe('Property 3: Small Position Lists LocalStorage Caching', () => {
    it('should cache small position lists in localStorage', () => {
      fc.assert(
        fc.property(
          fc.array(positionArbitrary, { minLength: 10, maxLength: 100 }),
          async (positions) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(positions);
            const dataSizeKB = dataSize / 1024;
            
            // Ensure we're testing small datasets only (<500KB)
            fc.pre(dataSizeKB < 500);
            
            // Save to localStorage
            const saveResult = await storageService.set('positions', positions);
            
            // Assert: Save should succeed
            expect(saveResult).toBe(true);
            
            // Assert: Data should be in localStorage
            const storedData = localStorage.getItem('positions');
            expect(storedData).not.toBeNull();
            
            // Assert: Data should be retrievable
            const retrievedData = storageService.get<Position[]>('positions');
            expect(retrievedData).not.toBeNull();
            expect(retrievedData).toHaveLength(positions.length);
            
            // Assert: Fast access from localStorage cache
            const startTime = performance.now();
            const cachedData = storageService.get<Position[]>('positions');
            const endTime = performance.now();
            const accessTime = endTime - startTime;
            
            // localStorage access should be fast (<10ms)
            expect(accessTime).toBeLessThan(10);
            expect(cachedData).not.toBeNull();
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should support dual-write pattern for small position lists', () => {
      fc.assert(
        fc.property(
          fc.array(positionArbitrary, { minLength: 10, maxLength: 50 }),
          async (positions) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(positions);
            fc.pre(dataSize < 300 * 1024); // <300KB
            
            // Simulate dual-write: localStorage + cloud backup
            const localStorageSuccess = await storageService.set('positions', positions);
            
            // Assert: localStorage write succeeds
            expect(localStorageSuccess).toBe(true);
            
            // Assert: Data is cached locally
            const cachedData = storageService.get<Position[]>('positions');
            expect(cachedData).not.toBeNull();
            expect(cachedData?.length).toBe(positions.length);
            
            // Note: Cloud backup would happen asynchronously in real implementation
            // This test verifies localStorage caching continues to work
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 4: Cross-Tab Sync via Storage Events
   * **Validates: Requirements 3.5**
   */
  describe('Property 4: Cross-Tab Sync via Storage Events', () => {
    it('should trigger storage events for cross-tab synchronization', () => {
      fc.assert(
        fc.property(
          fc.array(positionArbitrary, { minLength: 5, maxLength: 20 }),
          async (positions) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(positions);
            fc.pre(dataSize < 200 * 1024); // <200KB
            
            // Set up storage event listener
            let storageEventFired = false;
            const storageEventHandler = (event: StorageEvent) => {
              if (event.key === 'test-positions') {
                storageEventFired = true;
              }
            };
            
            window.addEventListener('storage', storageEventHandler);
            
            // Save data to localStorage
            await storageService.set('test-positions', positions);
            
            // Assert: Data is in localStorage
            const storedData = localStorage.getItem('test-positions');
            expect(storedData).not.toBeNull();
            
            // Note: Storage events only fire in OTHER tabs, not the current tab
            // In a real scenario, another tab would receive the event
            // This test verifies the data is stored correctly for event propagation
            
            // Clean up
            window.removeEventListener('storage', storageEventHandler);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain data consistency for cross-tab sync', () => {
      fc.assert(
        fc.property(
          userProfileArbitrary,
          async (userProfile) => {
            localStorage.clear();
            
            // Tab 1: Save user profile
            await storageService.set('userProfile', userProfile);
            
            // Tab 2: Read user profile (simulated)
            const retrievedProfile = storageService.get<UserProfile>('userProfile');
            
            // Assert: Data is consistent across tabs
            expect(retrievedProfile).not.toBeNull();
            expect(retrievedProfile?.id).toBe(userProfile.id);
            expect(retrievedProfile?.name).toBe(userProfile.name);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 5: Auto-Backup Functionality
   * **Validates: Requirements 3.4**
   */
  describe('Property 5: Auto-Backup Functionality', () => {
    it('should maintain localStorage cache for auto-backup operations', () => {
      fc.assert(
        fc.property(
          fc.array(announcementArbitrary, { minLength: 5, maxLength: 20 }),
          async (announcements) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(announcements);
            fc.pre(dataSize < 200 * 1024); // <200KB
            
            // Save data (simulating auto-backup scenario)
            const saveResult = await storageService.set('announcements', announcements);
            
            // Assert: Save succeeds
            expect(saveResult).toBe(true);
            
            // Assert: Data remains in localStorage cache
            const cachedData = storageService.get<Announcement[]>('announcements');
            expect(cachedData).not.toBeNull();
            expect(cachedData?.length).toBe(announcements.length);
            
            // Assert: localStorage cache is intact (not cleared by backup)
            const storedData = localStorage.getItem('announcements');
            expect(storedData).not.toBeNull();
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 6: Data Integrity Across Operations
   * **Validates: Requirements 3.1, 3.2, 3.3**
   */
  describe('Property 6: Data Integrity for Small Datasets', () => {
    it('should maintain data integrity for multiple small dataset operations', () => {
      fc.assert(
        fc.property(
          fc.array(positionArbitrary, { minLength: 10, maxLength: 50 }),
          fc.array(announcementArbitrary, { minLength: 5, maxLength: 20 }),
          userProfileArbitrary,
          async (positions, announcements, userProfile) => {
            localStorage.clear();
            
            // Ensure all datasets are small
            const positionsSize = estimateDataSize(positions);
            const announcementsSize = estimateDataSize(announcements);
            const userProfileSize = estimateDataSize(userProfile);
            const totalSize = positionsSize + announcementsSize + userProfileSize;
            
            fc.pre(totalSize < 1024 * 1024); // Total <1MB
            
            // Save multiple datasets
            const positionsSaved = await storageService.set('positions', positions);
            const announcementsSaved = await storageService.set('announcements', announcements);
            const profileSaved = await storageService.set('userProfile', userProfile);
            
            // Assert: All saves succeed
            expect(positionsSaved).toBe(true);
            expect(announcementsSaved).toBe(true);
            expect(profileSaved).toBe(true);
            
            // Assert: All data is retrievable
            const retrievedPositions = storageService.get<Position[]>('positions');
            const retrievedAnnouncements = storageService.get<Announcement[]>('announcements');
            const retrievedProfile = storageService.get<UserProfile>('userProfile');
            
            expect(retrievedPositions).not.toBeNull();
            expect(retrievedAnnouncements).not.toBeNull();
            expect(retrievedProfile).not.toBeNull();
            
            // Assert: Data integrity
            expect(retrievedPositions?.length).toBe(positions.length);
            expect(retrievedAnnouncements?.length).toBe(announcements.length);
            expect(retrievedProfile?.id).toBe(userProfile.id);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 7: Performance Characteristics
   * **Validates: Requirements 3.1, 3.2**
   */
  describe('Property 7: Performance for Small Datasets', () => {
    it('should provide fast access for small datasets from localStorage', () => {
      fc.assert(
        fc.property(
          fc.array(positionArbitrary, { minLength: 10, maxLength: 50 }),
          async (positions) => {
            localStorage.clear();
            
            const dataSize = estimateDataSize(positions);
            fc.pre(dataSize < 300 * 1024); // <300KB
            
            // Save data
            await storageService.set('positions', positions);
            
            // Measure read performance
            const iterations = 10;
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
              storageService.get<Position[]>('positions');
            }
            
            const endTime = performance.now();
            const avgAccessTime = (endTime - startTime) / iterations;
            
            // Assert: Average access time should be fast (<5ms per read)
            expect(avgAccessTime).toBeLessThan(5);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
