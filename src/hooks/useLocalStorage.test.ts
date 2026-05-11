/**
 * useLocalStorage Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { storageService, STORAGE_SIZE_THRESHOLD } from '@/services';

// Mock storageService
vi.mock('@/services', async () => {
  const actual = await vi.importActual('@/services');
  return {
    ...actual,
    storageService: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      estimateDataSize: vi.fn(),
    },
  };
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should initialize with value from localStorage', () => {
      const mockValue = { test: 'data' };
      vi.mocked(storageService.get).mockReturnValue(mockValue);

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      expect(result.current[0]).toEqual(mockValue);
      expect(storageService.get).toHaveBeenCalledWith('test-key');
    });

    it('should initialize with initialValue when localStorage is empty', () => {
      vi.mocked(storageService.get).mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      expect(result.current[0]).toEqual({ test: 'initial' });
    });

    it('should save value to localStorage', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.set).mockReturnValue(true);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(1000); // Small data

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      act(() => {
        result.current[1]({ test: 'updated' });
      });

      expect(storageService.set).toHaveBeenCalledWith('test-key', { test: 'updated' });
      expect(result.current[0]).toEqual({ test: 'updated' });
    });
  });

  describe('skipLocalStorage option', () => {
    it('should skip localStorage when skipLocalStorage is true', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { test: 'initial' }, { skipLocalStorage: true })
      );

      expect(storageService.get).not.toHaveBeenCalled();
      expect(result.current[0]).toEqual({ test: 'initial' });

      act(() => {
        result.current[1]({ test: 'updated' });
      });

      expect(storageService.set).not.toHaveBeenCalled();
      expect(result.current[0]).toEqual({ test: 'updated' });
    });

    it('should use localStorage when skipLocalStorage is false', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.set).mockReturnValue(true);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(1000);

      const { result } = renderHook(() =>
        useLocalStorage('test-key', { test: 'initial' }, { skipLocalStorage: false })
      );

      expect(storageService.get).toHaveBeenCalled();

      act(() => {
        result.current[1]({ test: 'updated' });
      });

      expect(storageService.set).toHaveBeenCalled();
    });
  });

  describe('Large dataset handling', () => {
    it('should automatically skip localStorage for large datasets', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(STORAGE_SIZE_THRESHOLD + 1000);

      const onLargeDataset = vi.fn();
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { test: 'initial' }, { onLargeDataset })
      );

      act(() => {
        result.current[1]({ test: 'large data' });
      });

      expect(storageService.set).not.toHaveBeenCalled();
      expect(onLargeDataset).toHaveBeenCalledWith('数据量较大，已保存到云端存储');
      expect(result.current[3]).toEqual({
        type: 'size_threshold_exceeded',
        message: '数据量较大，已保存到云端存储',
        dataSize: STORAGE_SIZE_THRESHOLD + 1000,
      });
    });

    it('should call onLargeDataset callback when data exceeds threshold', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(STORAGE_SIZE_THRESHOLD + 1);

      const onLargeDataset = vi.fn();
      const { result } = renderHook(() =>
        useLocalStorage('test-key', [], { onLargeDataset })
      );

      act(() => {
        result.current[1]([1, 2, 3]);
      });

      expect(onLargeDataset).toHaveBeenCalledWith('数据量较大，已保存到云端存储');
    });
  });

  describe('Quota exceeded handling', () => {
    it('should handle quota exceeded error', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(1000);
      vi.mocked(storageService.set).mockReturnValue({
        success: false,
        reason: 'quota_exceeded',
        dataSize: 1000,
      });

      const onQuotaExceeded = vi.fn();
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { test: 'initial' }, { onQuotaExceeded })
      );

      act(() => {
        result.current[1]({ test: 'data' });
      });

      expect(onQuotaExceeded).toHaveBeenCalledWith('存储空间不足，已自动切换到云端存储');
      expect(result.current[3]).toEqual({
        type: 'quota_exceeded',
        message: '存储空间不足，已自动切换到云端存储',
        dataSize: 1000,
      });
    });

    it('should automatically switch to skipLocalStorage mode after quota exceeded', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(1000);
      vi.mocked(storageService.set).mockReturnValue({
        success: false,
        reason: 'quota_exceeded_error',
      });

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      // First call triggers quota exceeded
      act(() => {
        result.current[1]({ test: 'data1' });
      });

      expect(storageService.set).toHaveBeenCalledTimes(1);

      // Second call should skip localStorage
      act(() => {
        result.current[1]({ test: 'data2' });
      });

      // storageService.set should not be called again
      expect(storageService.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', () => {
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      expect(result.current[0]).toEqual({ test: 'initial' });
    });

    it('should clear error when setValue succeeds', () => {
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(storageService.estimateDataSize).mockReturnValue(1000);
      
      // First call fails
      vi.mocked(storageService.set).mockReturnValueOnce({
        success: false,
        reason: 'quota_exceeded',
        dataSize: 1000,
      });

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      act(() => {
        result.current[1]({ test: 'data1' });
      });

      expect(result.current[3]).toBeTruthy();

      // Second call succeeds (but will skip localStorage due to auto-switch)
      act(() => {
        result.current[1]({ test: 'data2' });
      });

      // Error should be cleared
      expect(result.current[3]).toBeNull();
    });
  });

  describe('removeValue', () => {
    it('should remove value from localStorage', () => {
      vi.mocked(storageService.get).mockReturnValue({ test: 'data' });
      vi.mocked(storageService.remove).mockReturnValue(true);

      const { result } = renderHook(() => useLocalStorage('test-key', { test: 'initial' }));

      act(() => {
        result.current[2]();
      });

      expect(storageService.remove).toHaveBeenCalledWith('test-key');
      expect(result.current[0]).toEqual({ test: 'initial' });
    });

    it('should not call localStorage.remove when skipLocalStorage is true', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { test: 'initial' }, { skipLocalStorage: true })
      );

      act(() => {
        result.current[2]();
      });

      expect(storageService.remove).not.toHaveBeenCalled();
      expect(result.current[0]).toEqual({ test: 'initial' });
    });
  });
});
