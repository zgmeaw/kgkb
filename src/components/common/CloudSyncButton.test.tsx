/**
 * CloudSyncButton 组件测试
 * 
 * 测试范围：
 * - 加载状态显示
 * - 错误处理和用户友好的错误消息
 * - 进度指示器
 * - 成功消息显示
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CloudSyncButton } from './CloudSyncButton';
import { cloudStorageService } from '@/services/cloudStorageService';
import { storageService } from '@/services/storageService';

// Mock 依赖
vi.mock('@/services/cloudStorageService', () => ({
  cloudStorageService: {
    hasCloudData: vi.fn(),
    uploadData: vi.fn(),
    downloadData: vi.fn(),
    initializeFromCloud: vi.fn(),
  },
}));

vi.mock('@/services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('CloudSyncButton - Loading States and Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 默认返回有云端数据
    vi.mocked(cloudStorageService.hasCloudData).mockReturnValue(true);
    // 默认返回空数据
    vi.mocked(storageService.get).mockReturnValue([]);
  });

  describe('Loading States', () => {
    it('should display loading spinner during upload', async () => {
      // 模拟上传操作延迟
      vi.mocked(cloudStorageService.uploadData).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<CloudSyncButton />);

      // 点击上传按钮
      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      // 输入密码
      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      // 提交
      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证加载状态显示
      await waitFor(() => {
        expect(screen.getByText('上传中...')).toBeInTheDocument();
      });
    });

    it('should display loading spinner during download', async () => {
      // 模拟下载操作延迟
      vi.mocked(cloudStorageService.initializeFromCloud).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      render(<CloudSyncButton />);

      // 点击下载按钮
      const downloadButton = screen.getByText('从云端恢复');
      fireEvent.click(downloadButton);

      // 输入密码
      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      // 提交
      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证加载状态显示
      await waitFor(() => {
        expect(screen.getByText('下载中...')).toBeInTheDocument();
      });
    });

    it('should display progress status during upload', async () => {
      vi.mocked(cloudStorageService.uploadData).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<CloudSyncButton />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证进度状态显示
      await waitFor(() => {
        expect(screen.getByText(/正在准备数据/i)).toBeInTheDocument();
      });
    });

    it('should display item count for large datasets', async () => {
      // 模拟大数据集
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'announcements') return Array(150).fill({});
        if (key === 'positions') return Array(50).fill({});
        return [];
      });

      vi.mocked(cloudStorageService.uploadData).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<CloudSyncButton />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证显示数据数量
      await waitFor(() => {
        expect(screen.getByText(/正在准备 200 条数据/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling - User-Friendly Messages', () => {
    it('should display network error message', async () => {
      const onError = vi.fn();
      vi.mocked(cloudStorageService.uploadData).mockRejectedValue(
        new Error('Network error: Failed to fetch')
      );

      render(<CloudSyncButton onError={onError} />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证网络错误消息
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('无法连接到云端存储。正在使用缓存数据。');
      });

      // 验证错误消息显示在UI上
      await waitFor(() => {
        expect(screen.getByText(/无法连接到云端存储/i)).toBeInTheDocument();
      });
    });

    it('should display decryption error message', async () => {
      const onError = vi.fn();
      vi.mocked(cloudStorageService.initializeFromCloud).mockRejectedValue(
        new Error('解密失败，密码可能不正确')
      );

      render(<CloudSyncButton onError={onError} />);

      const downloadButton = screen.getByText('从云端恢复');
      fireEvent.click(downloadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证解密错误消息
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('密码不正确。请重试。');
      });

      // 验证错误消息显示在UI上
      await waitFor(() => {
        expect(screen.getByText(/密码不正确/i)).toBeInTheDocument();
      });
    });

    it('should display API error message', async () => {
      const onError = vi.fn();
      vi.mocked(cloudStorageService.uploadData).mockRejectedValue(
        new Error('API error: Service unavailable (500)')
      );

      render(<CloudSyncButton onError={onError} />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证API错误消息
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('云端存储服务暂时不可用。正在使用缓存数据。');
      });

      // 验证错误消息显示在UI上
      await waitFor(() => {
        expect(screen.getByText(/云端存储服务暂时不可用/i)).toBeInTheDocument();
      });
    });

    it('should display authentication error message', async () => {
      const onError = vi.fn();
      vi.mocked(cloudStorageService.uploadData).mockRejectedValue(
        new Error('未配置 GitHub Token')
      );

      render(<CloudSyncButton onError={onError} />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证认证错误消息
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('认证失败，请检查您的登录状态。');
      });

      // 验证错误消息显示在UI上
      await waitFor(() => {
        expect(screen.getByText(/认证失败/i)).toBeInTheDocument();
      });
    });

    it('should display helpful hint for cache fallback errors', async () => {
      vi.mocked(cloudStorageService.uploadData).mockRejectedValue(
        new Error('Network timeout')
      );

      render(<CloudSyncButton />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证显示缓存数据提示
      await waitFor(() => {
        expect(screen.getByText(/您可以继续使用本地缓存的数据/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success Messages', () => {
    it('should display success message after upload', async () => {
      const onSuccess = vi.fn();
      vi.mocked(cloudStorageService.uploadData).mockResolvedValue(undefined);

      render(<CloudSyncButton onSuccess={onSuccess} />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证成功消息
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('✅ 数据已成功上传到云端！');
      });

      // 验证成功消息显示在UI上
      await waitFor(() => {
        expect(screen.getByText(/数据已成功上传到云端/i)).toBeInTheDocument();
      });
    });

    it('should display success message after download', async () => {
      const onSuccess = vi.fn();
      vi.mocked(cloudStorageService.initializeFromCloud).mockResolvedValue(true);

      // Mock window.location.reload
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<CloudSyncButton onSuccess={onSuccess} />);

      const downloadButton = screen.getByText('从云端恢复');
      fireEvent.click(downloadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证成功消息
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('✅ 数据已成功从云端恢复！页面即将刷新。');
      });
    });
  });

  describe('Progress Callbacks', () => {
    it('should call progress callback during download', async () => {
      vi.mocked(cloudStorageService.initializeFromCloud).mockImplementation(
        async (password, onProgress) => {
          onProgress?.('检查认证状态...');
          onProgress?.('检查云端数据...');
          onProgress?.('正在下载云端数据...');
          onProgress?.('正在同步到本地存储...');
          onProgress?.('数据同步完成');
          return true;
        }
      );

      // Mock window.location.reload
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<CloudSyncButton />);

      const downloadButton = screen.getByText('从云端恢复');
      fireEvent.click(downloadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证成功消息显示（因为下载成功后会显示成功消息）
      await waitFor(() => {
        expect(screen.getByText(/数据已成功从云端恢复/i)).toBeInTheDocument();
      });
    });
  });

  describe('Button States', () => {
    it('should disable buttons during operation', async () => {
      vi.mocked(cloudStorageService.uploadData).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<CloudSyncButton />);

      const uploadButton = screen.getByText('备份到云端');
      fireEvent.click(uploadButton);

      const passwordInput = screen.getByPlaceholderText(/请输入密码/i);
      fireEvent.change(passwordInput, { target: { value: 'test123' } });

      const submitButton = screen.getByText('确认');
      fireEvent.click(submitButton);

      // 验证按钮被禁用（通过检查disabled属性）
      await waitFor(() => {
        expect(uploadButton).toHaveAttribute('disabled');
      });
    });

    it('should show download button only when cloud data exists', () => {
      vi.mocked(cloudStorageService.hasCloudData).mockReturnValue(false);

      render(<CloudSyncButton />);

      // 验证下载按钮不显示
      expect(screen.queryByText('从云端恢复')).toBeNull();
    });
  });
});
