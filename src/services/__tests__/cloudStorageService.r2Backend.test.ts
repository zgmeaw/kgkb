/**
 * Tests for R2 Storage Backend Configuration and Fallback Logic
 * Task 3.3: Verify R2 backend is default and fallback logic works
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cloudStorageService } from '../cloudStorageService';
import { StorageBackendType } from '../storageBackends/types';

describe('CloudStorageService - R2 Backend Configuration', () => {
  // Store original values
  const originalEnv = { ...import.meta.env };
  const originalLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    // Clear localStorage and save original values
    const keys = ['r2_worker_url', 'r2_api_key', 'github_token', 'r2_latest_file'];
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) originalLocalStorage[key] = value;
      localStorage.removeItem(key);
    });

    // Reset the backend instance
    (cloudStorageService as any).backend = null;
  });

  afterEach(() => {
    // Restore original localStorage values
    Object.keys(originalLocalStorage).forEach(key => {
      localStorage.setItem(key, originalLocalStorage[key]);
    });

    // Restore environment
    Object.assign(import.meta.env, originalEnv);
  });

  describe('Default Backend Selection', () => {
    it('should default to R2 backend when no VITE_STORAGE_BACKEND is set', () => {
      // Setup: R2 configuration is available
      localStorage.setItem('r2_worker_url', 'https://test-worker.workers.dev');
      localStorage.setItem('r2_api_key', 'test-api-key');

      // When: initBackend is called without explicit backend type
      const backend = (cloudStorageService as any).initBackend();

      // Then: R2 backend should be initialized
      expect(backend).toBeDefined();
      expect(backend.constructor.name).toBe('R2StorageBackend');
    });

    it('should use R2 backend when VITE_STORAGE_BACKEND is explicitly set to r2', () => {
      // Setup: Set environment variable and R2 config
      import.meta.env.VITE_STORAGE_BACKEND = StorageBackendType.CLOUDFLARE_R2;
      localStorage.setItem('r2_worker_url', 'https://test-worker.workers.dev');
      localStorage.setItem('r2_api_key', 'test-api-key');

      // When: initBackend is called
      const backend = (cloudStorageService as any).initBackend();

      // Then: R2 backend should be initialized
      expect(backend).toBeDefined();
      expect(backend.constructor.name).toBe('R2StorageBackend');
    });
  });

  describe('R2 Configuration Fallback Logic', () => {
    it('should fallback to Gist backend when R2 config is incomplete (missing worker URL)', () => {
      // Setup: R2 config incomplete, Gist token available
      localStorage.setItem('r2_api_key', 'test-api-key');
      // r2_worker_url is missing
      localStorage.setItem('github_token', 'test-github-token');

      // Spy on console.warn to verify warning message
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When: initBackend is called
      const backend = (cloudStorageService as any).initBackend();

      // Then: Should fallback to Gist backend
      expect(backend).toBeDefined();
      expect(backend.constructor.name).toBe('GistStorageBackend');
      
      // Verify warning was logged
      expect(warnSpy).toHaveBeenCalledWith('R2 配置不完整，回退到 Gist 后端');

      warnSpy.mockRestore();
    });

    it('should fallback to Gist backend when R2 config is incomplete (missing API key)', () => {
      // Setup: R2 config incomplete, Gist token available
      localStorage.setItem('r2_worker_url', 'https://test-worker.workers.dev');
      // r2_api_key is missing
      localStorage.setItem('github_token', 'test-github-token');

      // Spy on console.warn
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When: initBackend is called
      const backend = (cloudStorageService as any).initBackend();

      // Then: Should fallback to Gist backend
      expect(backend).toBeDefined();
      expect(backend.constructor.name).toBe('GistStorageBackend');
      
      // Verify warning was logged
      expect(warnSpy).toHaveBeenCalledWith('R2 配置不完整，回退到 Gist 后端');

      warnSpy.mockRestore();
    });

    it('should throw error when both R2 and Gist configs are incomplete', () => {
      // Setup: No R2 config, no Gist token
      // localStorage is empty

      // When/Then: Should throw error
      expect(() => {
        (cloudStorageService as any).initBackend();
      }).toThrow('未配置 GitHub Token，且 R2 配置不完整');
    });

    it('should use R2 backend when both R2 and Gist configs are available', () => {
      // Setup: Both configs available
      localStorage.setItem('r2_worker_url', 'https://test-worker.workers.dev');
      localStorage.setItem('r2_api_key', 'test-api-key');
      localStorage.setItem('github_token', 'test-github-token');

      // When: initBackend is called
      const backend = (cloudStorageService as any).initBackend();

      // Then: Should prefer R2 backend (default)
      expect(backend).toBeDefined();
      expect(backend.constructor.name).toBe('R2StorageBackend');
    });
  });

  describe('Explicit Gist Backend Selection', () => {
    it('should use Gist backend when explicitly configured via VITE_STORAGE_BACKEND', () => {
      // Setup: Explicitly set to Gist
      import.meta.env.VITE_STORAGE_BACKEND = StorageBackendType.GITHUB_GIST;
      localStorage.setItem('github_token', 'test-github-token');

      // When: initBackend is called
      const backend = (cloudStorageService as any).initBackend();

      // Then: Gist backend should be used
      expect(backend).toBeDefined();
      expect(backend.constructor.name).toBe('GistStorageBackend');
    });
  });

  describe('R2 Backend Large Dataset Capability', () => {
    it('should handle large encrypted data payloads (>4MB)', async () => {
      // Setup: R2 backend with mock fetch
      import.meta.env.VITE_STORAGE_BACKEND = StorageBackendType.CLOUDFLARE_R2;
      localStorage.setItem('r2_worker_url', 'https://test-worker.workers.dev');
      localStorage.setItem('r2_api_key', 'test-api-key');

      // Create large dataset (>4MB)
      const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB of data
      
      // Mock fetch to verify large payload is sent
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
        text: async () => 'success',
      });
      global.fetch = mockFetch;

      const backend = (cloudStorageService as any).initBackend();

      // When: Upload large data
      await backend.upload(
        {
          announcements: [],
          positions: [],
          userProfile: {},
          scoreHistory: [],
          lastUpdated: new Date().toISOString(),
        },
        largeData
      );

      // Then: Fetch should be called with large payload
      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.data.length).toBeGreaterThan(4 * 1024 * 1024);
    });

    it('should handle large dataset downloads (>4MB)', async () => {
      // Setup: R2 backend with mock fetch
      import.meta.env.VITE_STORAGE_BACKEND = StorageBackendType.CLOUDFLARE_R2;
      localStorage.setItem('r2_worker_url', 'https://test-worker.workers.dev');
      localStorage.setItem('r2_api_key', 'test-api-key');
      localStorage.setItem('r2_latest_file', 'test-file.enc');

      // Create large dataset response (>4MB)
      const largeData = 'y'.repeat(5 * 1024 * 1024); // 5MB of data
      
      // Mock fetch to return large payload
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: largeData }),
      });
      global.fetch = mockFetch;

      const backend = (cloudStorageService as any).initBackend();

      // When: Download large data
      const result = await backend.download();

      // Then: Should successfully retrieve large dataset
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(4 * 1024 * 1024);
      expect(result).toBe(largeData);
    });
  });
});
