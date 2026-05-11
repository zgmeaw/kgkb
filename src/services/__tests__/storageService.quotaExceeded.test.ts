/**
 * Bug Condition Exploration Test - localStorage QuotaExceededError
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **GOAL**: Surface counterexamples that demonstrate QuotaExceededError occurs with large datasets
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * Bug Condition:
 * isBugCondition(input) WHERE:
 *   input.dataSize + input.localStorageUsed > input.localStorageQuota
 *   AND input.attemptingLocalStorage === true
 * 
 * Expected Behavior (will validate after fix):
 * - System automatically detects large dataset (>4MB)
 * - System skips localStorage and saves directly to cloud storage (R2)
 * - System displays user-friendly message: "数据量较大,已保存到云端存储"
 * - Data is successfully persisted and recoverable after page refresh
 * - No QuotaExceededError is thrown
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '../storageService';
import type { Position } from '@/types/position';

// Mock the cloud storage service
vi.mock('../cloudStorageService', () => ({
  cloudStorageService: {
    uploadData: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('Bug Condition Exploration: localStorage QuotaExceededError', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock session storage for authentication
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'isLoggedIn') return 'true';
          if (key === 'userPassword') return 'test-password';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  /**
   * Helper function to generate large position dataset
   * Generates approximately 6KB per position record
   */
  function generatePositionRecords(count: number): Position[] {
    const positions: Position[] = [];
    
    for (let i = 0; i < count; i++) {
      // 增加更多数据以确保每条记录更大
      const longDescription = 'x'.repeat(2000); // 2KB 的长描述
      const longRequirements = 'y'.repeat(1500); // 1.5KB 的长要求
      const longResponsibilities = 'z'.repeat(1500); // 1.5KB 的长职责
      
      positions.push({
        id: `position-${i}-${Math.random().toString(36).substring(7)}`,
        announcementId: `announcement-${Math.floor(i / 100)}`,
        code: `CODE-2024-${String(i).padStart(6, '0')}`,
        name: `测试岗位名称-${i}-这是一个很长的岗位名称用于增加数据大小-${longDescription.substring(0, 100)}`,
        department: `测试部门-${i % 50}-这是一个很长的部门名称用于增加数据大小-${longDescription.substring(0, 100)}`,
        category: `岗位类别-${i % 10}`,
        recruitCount: Math.floor(Math.random() * 10) + 1,
        
        educationRequirement: '本科及以上',
        degreeRequirement: '学士学位',
        majorRequirement: [
          '计算机科学与技术',
          '软件工程',
          '信息安全',
          '网络工程',
          '数据科学与大数据技术'
        ],
        
        politicalStatusRequirement: ['中共党员', '共青团员'],
        workExperienceRequired: i % 3 === 0,
        minWorkYears: i % 3 === 0 ? 2 : undefined,
        minAge: 18,
        maxAge: 35,
        
        workLocation: `测试城市-${i % 20}-这是一个很长的工作地点描述用于增加数据大小-${longDescription.substring(0, 200)}`,
        responsibilities: `岗位职责描述-${i}-${longResponsibilities}`,
        
        matchingScore: Math.floor(Math.random() * 100),
        isMatched: Math.random() > 0.5,
        competitionRatio: Math.random() * 100,
        
        rawData: {
          '岗位代码': `CODE-2024-${String(i).padStart(6, '0')}`,
          '招聘人数': Math.floor(Math.random() * 10) + 1,
          '专业要求': longRequirements,
          '备注': `这是一些额外的备注信息用于增加数据大小-${i}-${longDescription}`,
          '其他信息': `更多信息字段用于增加数据大小-${i}-${longDescription}`
        },
        
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return positions;
  }

  /**
   * Helper function to estimate data size in bytes
   */
  function estimateDataSize(data: any): number {
    const jsonString = JSON.stringify(data);
    // UTF-16 encoding: 2 bytes per character
    return jsonString.length * 2;
  }

  /**
   * Test Scenario 1: Large Dataset (1500 records, ~6MB)
   * Expected: SUCCESS after fix - System uses cloud storage automatically
   */
  it('Large dataset (1500 records) should be stored in cloud storage', async () => {
    // Generate large dataset
    const largeDataset = generatePositionRecords(1500);
    const dataSize = estimateDataSize(largeDataset);
    
    console.log(`Generated dataset: ${largeDataset.length} records, ~${(dataSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Attempt to save large dataset
    const result = await storageService.set('positions', largeDataset);
    
    // EXPECTED BEHAVIOR (after fix):
    // - System should detect large dataset (>4MB) and skip localStorage
    // - System should save to cloud storage instead
    // - result should indicate success
    expect(result).toBe(true); // Should succeed by using cloud storage
    
    // 验证数据没有被存储到 localStorage（因为超过阈值，使用云端存储）
    const storedData = localStorage.getItem('positions');
    expect(storedData).toBeNull();
  });

  /**
   * Test Scenario 2: Boundary Case (1000 records, ~4.5MB)
   * Expected: FAILURE when localStorage has 1MB used
   */
  it('should expose QuotaExceededError at boundary (1000 records + 1MB used)', async () => {
    // Pre-fill localStorage with 1MB of data
    const fillerData = 'x'.repeat(500 * 1024); // 500KB string (1MB in UTF-16)
    localStorage.setItem('filler', fillerData);
    
    const usedSpace = estimateDataSize(fillerData);
    console.log(`Pre-filled localStorage: ~${(usedSpace / 1024 / 1024).toFixed(2)}MB`);
    
    // Generate boundary dataset
    const boundaryDataset = generatePositionRecords(1000);
    const dataSize = estimateDataSize(boundaryDataset);
    
    console.log(`Boundary dataset: ${boundaryDataset.length} records, ~${(dataSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total size: ~${((usedSpace + dataSize) / 1024 / 1024).toFixed(2)}MB`);
    
    // Mock localStorage.setItem to throw QuotaExceededError when total exceeds quota
    const originalSetItem = localStorage.setItem;
    let currentUsed = usedSpace;
    
    localStorage.setItem = vi.fn((key: string, value: string) => {
      const size = value.length * 2;
      const QUOTA_LIMIT = 5 * 1024 * 1024; // 5MB quota
      
      if (currentUsed + size > QUOTA_LIMIT) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      
      currentUsed += size;
      originalSetItem.call(localStorage, key, value);
    });
    
    // Attempt to save boundary dataset
    const result = await storageService.set('positions', boundaryDataset);
    
    // EXPECTED BEHAVIOR (after fix):
    // - System detects insufficient space
    // - System skips localStorage and uses cloud storage
    // - result indicates success
    
    // This will FAIL on unfixed code, PASS on fixed code
    expect(result).toBe(true);
    
    // Restore
    localStorage.setItem = originalSetItem;
  });

  /**
   * Test Scenario 3: Quota Full Scenario
   * Fill localStorage to 4.5MB, then try to add 1MB
   */
  it('should expose QuotaExceededError when quota is nearly full', async () => {
    // Fill localStorage to ~4.5MB
    const largeFillerData = 'x'.repeat(2.25 * 1024 * 1024); // 4.5MB in UTF-16
    localStorage.setItem('large-filler', largeFillerData);
    
    // Generate 250 records (~1MB)
    const additionalData = generatePositionRecords(250);
    const dataSize = estimateDataSize(additionalData);
    
    console.log(`Additional data: ${additionalData.length} records, ~${(dataSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Mock localStorage.setItem
    const originalSetItem = localStorage.setItem;
    const QUOTA_LIMIT = 5 * 1024 * 1024;
    let currentUsed = largeFillerData.length * 2;
    
    localStorage.setItem = vi.fn((key: string, value: string) => {
      const size = value.length * 2;
      
      if (currentUsed + size > QUOTA_LIMIT) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      
      currentUsed += size;
      originalSetItem.call(localStorage, key, value);
    });
    
    // Attempt to save additional data
    const result = await storageService.set('positions', additionalData);
    
    // EXPECTED BEHAVIOR (after fix):
    // - System catches QuotaExceededError
    // - System automatically falls back to cloud storage
    // - System displays user-friendly message
    // - result indicates success
    
    // This will FAIL on unfixed code, PASS on fixed code
    expect(result).toBe(true);
    
    // Restore
    localStorage.setItem = originalSetItem;
  });

  /**
   * Test Scenario 4: Current broken behavior: only console.error, no graceful handling
   * This test documents that the fix now provides graceful handling
   */
  it('Current broken behavior: only console.error, no graceful handling', async () => {
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Generate large dataset
    const largeDataset = generatePositionRecords(1500);
    
    // Mock localStorage.setItem to throw QuotaExceededError
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });
    
    // Attempt to save
    const result = await storageService.set('positions', largeDataset);
    
    // EXPECTED BEHAVIOR (after fix):
    // - Should return true (success via cloud storage)
    // - Should display user-friendly toast message
    // - Should automatically save to cloud storage
    // - Should NOT just return false
    expect(result).toBe(true); // Fixed: now succeeds via cloud storage
    
    // Restore
    localStorage.setItem = originalSetItem;
    consoleErrorSpy.mockRestore();
  });
});
