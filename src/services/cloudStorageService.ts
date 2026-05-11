/**
 * 云端存储服务 - 支持多种存储后端
 */

import { GistStorageBackend } from './storageBackends/gistStorageBackend';
import { R2StorageBackend } from './storageBackends/r2StorageBackend';
import { StorageBackend, CloudData, StorageBackendType } from './storageBackends/types';
import { STORAGE_KEYS } from '@/constants';

class CloudStorageService {
  private backend: StorageBackend | null = null;

  /**
   * 初始化存储后端
   */
  private initBackend(): StorageBackend {
    if (this.backend) {
      return this.backend;
    }

    // 从环境变量或 localStorage 获取配置
    // 默认使用 R2 后端以支持大数据集
    const backendType = (import.meta.env.VITE_STORAGE_BACKEND as StorageBackendType) || StorageBackendType.CLOUDFLARE_R2;

    switch (backendType) {
      case StorageBackendType.CLOUDFLARE_R2:
        const r2Config = {
          workerUrl: import.meta.env.VITE_R2_WORKER_URL || localStorage.getItem('r2_worker_url') || '',
          apiKey: import.meta.env.VITE_R2_API_KEY || localStorage.getItem('r2_api_key') || '',
        };
        
        // 如果 R2 配置不完整，回退到 Gist 后端
        if (!r2Config.workerUrl || !r2Config.apiKey) {
          console.warn('R2 配置不完整，回退到 Gist 后端');
          const githubToken = localStorage.getItem('github_token') || '';
          if (!githubToken) {
            throw new Error('未配置 GitHub Token，且 R2 配置不完整');
          }
          this.backend = new GistStorageBackend(githubToken);
          break;
        }
        
        this.backend = new R2StorageBackend(r2Config);
        break;

      case StorageBackendType.GITHUB_GIST:
      default:
        const githubToken = localStorage.getItem('github_token') || '';
        if (!githubToken) {
          throw new Error('未配置 GitHub Token');
        }
        this.backend = new GistStorageBackend(githubToken);
        break;
    }

    return this.backend;
  }

  /**
   * 加密数据
   */
  private async encryptData(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const passwordBuffer = encoder.encode(password);

    // 使用密码生成密钥
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );

    // 组合 salt + iv + 加密数据
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // 转换为Base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * 解密数据
   */
  private async decryptData(encryptedBase64: string, password: string): Promise<string> {
    try {
      // 从Base64解码
      const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

      // 提取 salt, iv, 加密数据
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encryptedData = combined.slice(28);

      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // 使用密码生成密钥
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      throw new Error('解密失败，密码可能不正确');
    }
  }

  /**
   * 上传数据到云端
   */
  async uploadData(data: CloudData, password: string): Promise<void> {
    try {
      const backend = this.initBackend();
      const jsonData = JSON.stringify(data);
      const encryptedData = await this.encryptData(jsonData, password);
      await backend.upload(data, encryptedData);
    } catch (error) {
      console.error('上传数据失败:', error);
      throw error;
    }
  }

  /**
   * 从云端下载数据
   */
  async downloadData(password: string): Promise<CloudData> {
    try {
      const backend = this.initBackend();
      const encryptedData = await backend.download();
      const decryptedData = await this.decryptData(encryptedData, password);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('下载数据失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否有云端数据
   */
  async hasCloudData(): Promise<boolean> {
    try {
      const backend = this.initBackend();
      return await backend.hasCloudData();
    } catch {
      return false;
    }
  }

  /**
   * 清除云端数据引用
   */
  clearCloudReference(): void {
    try {
      const backend = this.initBackend();
      backend.clearCloudReference();
    } catch (error) {
      console.error('清除云端引用失败:', error);
    }
  }

  /**
   * 从云端初始化数据到本地存储
   * 用于在新设备或清除缓存后恢复用户数据
   * 
   * @param password - 用于解密云端数据的密码
   * @param onProgress - 可选的进度回调函数，用于显示加载状态
   * @returns Promise<boolean> - 成功返回 true，失败返回 false
   */
  async initializeFromCloud(
    password: string,
    onProgress?: (status: string) => void
  ): Promise<boolean> {
    try {
      // 1. 检查用户是否已认证
      onProgress?.('检查认证状态...');
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        console.warn('用户未认证，无法从云端初始化数据');
        return false;
      }

      // 2. 检查是否有云端数据
      onProgress?.('检查云端数据...');
      const hasData = await this.hasCloudData();
      if (!hasData) {
        console.info('云端没有数据，跳过初始化');
        return false;
      }

      // 3. 从云端下载数据
      onProgress?.('正在下载云端数据...');
      const cloudData = await this.downloadData(password);

      // 4. 验证下载的数据结构
      if (!cloudData || typeof cloudData !== 'object') {
        throw new Error('云端数据格式无效');
      }

      // 5. 将数据写入 localStorage
      onProgress?.('正在同步到本地存储...');
      
      // 写入公告数据
      if (cloudData.announcements) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(cloudData.announcements));
      }

      // 写入职位数据
      if (cloudData.positions) {
        localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(cloudData.positions));
      }

      // 写入用户配置数据
      if (cloudData.userProfile) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(cloudData.userProfile));
      }

      // 写入评分历史数据（如果存在）
      if (cloudData.scoreHistory) {
        localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(cloudData.scoreHistory));
      }

      // 记录最后更新时间
      if (cloudData.lastUpdated) {
        localStorage.setItem('lastCloudSync', cloudData.lastUpdated);
      }

      onProgress?.('数据同步完成');
      console.info('成功从云端初始化数据到本地存储');
      return true;

    } catch (error) {
      // 详细的错误处理
      if (error instanceof Error) {
        if (error.message.includes('解密失败')) {
          console.error('解密失败，密码可能不正确:', error);
          onProgress?.('解密失败：密码不正确');
        } else if (error.message.includes('网络') || error.message.includes('fetch')) {
          console.error('网络错误，无法连接到云端存储:', error);
          onProgress?.('网络错误：无法连接到云端存储');
        } else if (error.message.includes('未配置')) {
          console.error('存储后端配置错误:', error);
          onProgress?.('配置错误：存储后端未正确配置');
        } else {
          console.error('从云端初始化数据失败:', error);
          onProgress?.(`初始化失败：${error.message}`);
        }
      } else {
        console.error('从云端初始化数据失败（未知错误）:', error);
        onProgress?.('初始化失败：未知错误');
      }
      return false;
    }
  }
}

export const cloudStorageService = new CloudStorageService();
