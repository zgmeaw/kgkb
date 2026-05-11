/**
 * 云端存储服务 - 支持多种存储后端
 */

import { GistStorageBackend } from './storageBackends/gistStorageBackend';
import { R2StorageBackend } from './storageBackends/r2StorageBackend';
import { StorageBackend, CloudData, StorageBackendType } from './storageBackends/types';

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
    const backendType = (import.meta.env.VITE_STORAGE_BACKEND as StorageBackendType) || StorageBackendType.GITHUB_GIST;

    switch (backendType) {
      case StorageBackendType.CLOUDFLARE_R2:
        const r2Config = {
          workerUrl: import.meta.env.VITE_R2_WORKER_URL || localStorage.getItem('r2_worker_url') || '',
          apiKey: import.meta.env.VITE_R2_API_KEY || localStorage.getItem('r2_api_key') || '',
        };
        
        if (!r2Config.workerUrl || !r2Config.apiKey) {
          throw new Error('Cloudflare R2 配置不完整');
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
}

export const cloudStorageService = new CloudStorageService();
