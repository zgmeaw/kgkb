/**
 * Bug Condition Exploration Test - Cloud Storage Cross-Device Sync
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cloudStorageService } from './cloudStorageService';
import { CloudData } from './storageBackends/types';
import { STORAGE_KEYS } from '@/constants';

describe('Bug Condition Exploration: Gist Data Restoration on New Device Login', () => {
  beforeEach(() => {
    // Clear localStorage to simulate Device B (new device with empty localStorage)
    localStorage.clear();
    
    // Set up GitHub token for authentication (simulating logged-in user)
    localStorage.setItem('github_token', 'test-token-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Bug Condition - Gist Data Restoration on New Device Login
   * 
   * For any app initialization where:
   * - User is authenticated (has GitHub token)
   * - Gist contains user data (userGistData IS NOT NULL)
   * - localStorage is empty (localStorageData IS NULL)
   * 
   * The system SHALL:
   * - Fetch all data from Gist
   * - Populate localStorage with Gist data
   * - Initialize contexts with Gist data (not empty data)
   * 
   * Expected behavior:
   * - result.localStorageData = input.userGistData
   * - result.contextsInitialized = true
   * - result.dataDisplayed = input.userGistData
   * 
   * SCOPED PBT APPROACH: Testing with concrete failing cases to ensure reproducibility
   */
  it('should restore announcements from Gist when Device B logs in with empty localStorage', async () => {
    // ARRANGE: Simulate Device A saved data to Gist
    const gistData: CloudData = {
      announcements: [
        {
          id: 'ann-001',
          title: '2024年国家公务员考试公告',
          organization: '国家公务员局',
          announcementUrl: 'https://example.com/announcement',
          type: '国考',
          status: '已发布',
          publishDate: new Date('2024-01-01'),
          registrationStartDate: new Date('2024-01-10'),
          registrationEndDate: new Date('2024-01-20'),
          admitCardPrintDate: new Date('2024-02-01'),
          examDate: new Date('2024-02-15'),
          positionCount: 100,
          recruitCount: 500,
          requirements: ['本科及以上学历', '中共党员'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],
      positions: [],
      userProfile: null,
      scoreHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    // Mock Gist backend to return data
    const mockGistId = 'mock-gist-123';
    localStorage.setItem('gist_id', mockGistId);

    // Mock fetch to simulate Gist API responses
    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes(`/gists/${mockGistId}`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: mockGistId,
            files: {
              'kgkb-data.enc': {
                content: 'mock-encrypted-data',
              },
            },
          }),
        } as Response);
      }
      return Promise.reject(new Error(`Unexpected fetch call to: ${urlString}`));
    }) as any;

    // Mock decryption to return our test data
    const originalDecryptData = (cloudStorageService as any).decryptData;
    (cloudStorageService as any).decryptData = vi.fn(async () => JSON.stringify(gistData));

    // Verify localStorage is empty (Device B initial state)
    expect(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)).toBeNull();

    // ACT: Simulate app initialization on Device B
    // This should fetch data from Gist and populate localStorage
    const hasCloudData = await cloudStorageService.hasCloudData();
    expect(hasCloudData).toBe(true); // Gist has data

    // Initialize from cloud - this is the new method that populates localStorage
    const success = await cloudStorageService.initializeFromCloud('test-password');

    // ASSERT: Expected behavior after fix
    // 1. Initialization should succeed
    expect(success).toBe(true);

    // 2. localStorage should be populated with Gist data (THIS WILL FAIL ON UNFIXED CODE)
    // On unfixed code, localStorage remains empty because there's no mechanism to populate it
    // COUNTEREXAMPLE: User has 1 announcement in Gist, but Device B shows 0 announcements (localStorage is null)
    const localStorageAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    expect(localStorageAnnouncements).not.toBeNull();
    
    const parsedAnnouncements = JSON.parse(localStorageAnnouncements!);
    expect(parsedAnnouncements).toHaveLength(1);
    expect(parsedAnnouncements[0].title).toBe('2024年国家公务员考试公告');

    // 3. Contexts should initialize with Gist data (not empty)
    // This is verified by checking localStorage has the data
    expect(parsedAnnouncements[0].id).toBe('ann-001');

    // Restore original method
    (cloudStorageService as any).decryptData = originalDecryptData;
  });

  it('should restore 500 positions from Gist when Device B logs in with empty localStorage', async () => {
    // ARRANGE: Simulate Device A saved 500 positions to Gist
    const gistData: CloudData = {
      announcements: [],
      positions: Array.from({ length: 500 }, (_, i) => ({
        id: `pos-${i + 1}`,
        announcementId: 'ann-001',
        code: `CODE-${i + 1}`,
        name: `岗位名称 ${i + 1}`,
        department: '测试部门',
        category: '综合管理类',
        recruitCount: 1,
        educationRequirement: '本科',
        degreeRequirement: '学士',
        majorRequirement: ['计算机科学与技术'],
        politicalStatusRequirement: ['中共党员', '群众'],
        workExperienceRequired: false,
        workLocation: '北京',
        rawData: {},
        createdAt: new Date(),
      })),
      userProfile: null,
      scoreHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    // Mock Gist backend
    const mockGistId = 'mock-gist-456';
    localStorage.setItem('gist_id', mockGistId);

    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes(`/gists/${mockGistId}`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: mockGistId,
            files: {
              'kgkb-data.enc': {
                content: 'mock-encrypted-data',
              },
            },
          }),
        } as Response);
      }
      return Promise.reject(new Error(`Unexpected fetch call to: ${urlString}`));
    }) as any;

    const originalDecryptData = (cloudStorageService as any).decryptData;
    (cloudStorageService as any).decryptData = vi.fn(async () => JSON.stringify(gistData));

    // Verify localStorage is empty
    expect(localStorage.getItem(STORAGE_KEYS.POSITIONS)).toBeNull();

    // ACT: Initialize from cloud
    const hasCloudData = await cloudStorageService.hasCloudData();
    expect(hasCloudData).toBe(true);

    const success = await cloudStorageService.initializeFromCloud('test-password');

    // ASSERT: Expected behavior
    expect(success).toBe(true);

    // localStorage should be populated (THIS WILL FAIL ON UNFIXED CODE)
    // COUNTEREXAMPLE: User has 500 positions in Gist, but Device B shows 0 positions (localStorage is null)
    const localStoragePositions = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    expect(localStoragePositions).not.toBeNull();
    
    const parsedPositions = JSON.parse(localStoragePositions!);
    expect(parsedPositions).toHaveLength(500);
    expect(parsedPositions[0].name).toBe('岗位名称 1');

    // Restore
    (cloudStorageService as any).decryptData = originalDecryptData;
  });

  it('should restore user profile from Gist when Device B logs in with empty localStorage', async () => {
    // ARRANGE: Simulate Device A saved profile to Gist
    const gistData: CloudData = {
      announcements: [],
      positions: [],
      userProfile: {
        id: 'user-001',
        name: '张三',
        gender: '男',
        birthDate: new Date('1995-06-15'),
        age: 29,
        educationLevel: '本科',
        degree: '学士',
        major: '计算机科学与技术',
        graduationDate: new Date('2017-06-30'),
        school: '清华大学',
        politicalStatus: '中共党员',
        hasWorkExperience: true,
        workYears: 5,
        currentPosition: '软件工程师',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      scoreHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    // Mock Gist backend
    const mockGistId = 'mock-gist-789';
    localStorage.setItem('gist_id', mockGistId);

    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes(`/gists/${mockGistId}`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: mockGistId,
            files: {
              'kgkb-data.enc': {
                content: 'mock-encrypted-data',
              },
            },
          }),
        } as Response);
      }
      return Promise.reject(new Error(`Unexpected fetch call to: ${urlString}`));
    }) as any;

    const originalDecryptData = (cloudStorageService as any).decryptData;
    (cloudStorageService as any).decryptData = vi.fn(async () => JSON.stringify(gistData));

    // Verify localStorage is empty
    expect(localStorage.getItem(STORAGE_KEYS.USER_PROFILE)).toBeNull();

    // ACT: Download data from Gist
    const hasCloudData = await cloudStorageService.hasCloudData();
    expect(hasCloudData).toBe(true);

    const downloadedData = await cloudStorageService.downloadData('test-password');

    // ASSERT: Expected behavior
    expect(downloadedData.userProfile).not.toBeNull();
    expect(downloadedData.userProfile.name).toBe('张三');

    // localStorage should be populated (THIS WILL FAIL ON UNFIXED CODE)
    // COUNTEREXAMPLE: User has profile settings in Gist, but Device B shows default settings (localStorage is null)
    const localStorageProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    expect(localStorageProfile).not.toBeNull();
    
    const parsedProfile = JSON.parse(localStorageProfile!);
    expect(parsedProfile.name).toBe('张三');
    expect(parsedProfile.major).toBe('计算机科学与技术');
    expect(parsedProfile.school).toBe('清华大学');

    // Restore
    (cloudStorageService as any).decryptData = originalDecryptData;
  });
});
