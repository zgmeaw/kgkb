/**
 * LocalStorage 封装服务
 */

import { STORAGE_KEYS } from '@/constants';
import { cloudStorageService } from './cloudStorageService';

// 存储大小阈值：4MB
const STORAGE_SIZE_THRESHOLD = 4 * 1024 * 1024;

// localStorage 配额限制（保守估计 5MB）
const LOCALSTORAGE_QUOTA = 5 * 1024 * 1024;

class StorageService {
  // 获取数据
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  // 估算数据大小（字节）
  estimateDataSize(value: any): number {
    try {
      // UTF-16 编码，每个字符占 2 字节
      return JSON.stringify(value).length * 2;
    } catch (error) {
      console.error('Error estimating data size:', error);
      return 0;
    }
  }

  // 获取可用空间（字节）
  getAvailableSpace(): number {
    try {
      const usedSpace = this.getSize();
      return LOCALSTORAGE_QUOTA - usedSpace;
    } catch (error) {
      console.error('Error calculating available space:', error);
      return 0;
    }
  }

  // 保存数据
  async set<T>(key: string, value: T): Promise<boolean | { success: false; reason: string; dataSize?: number; error?: any }> {
    try {
      // 估算数据大小
      const dataSize = this.estimateDataSize(value);
      
      let savedToCloud = false;
      
      // 检查是否超过大小阈值 - 自动使用云端存储
      if (dataSize > STORAGE_SIZE_THRESHOLD) {
        console.log(`数据量较大 (${(dataSize / 1024 / 1024).toFixed(2)}MB)，使用云端存储`);
        
        try {
          // 尝试保存到云端存储
          await this.saveToCloudStorage(key, value);
          savedToCloud = true;
          console.log(`✅ 数据已保存到云端存储: ${key}`);
        } catch (cloudError) {
          console.error('云端存储失败，尝试 localStorage:', cloudError);
          // 云端存储失败，继续尝试 localStorage
        }
      }
      
      // 检查可用空间是否足够
      const availableSpace = this.getAvailableSpace();
      if (dataSize > availableSpace) {
        console.log(`localStorage 空间不足`);
        
        // 如果还没有保存到云端，尝试保存
        if (!savedToCloud) {
          try {
            await this.saveToCloudStorage(key, value);
            savedToCloud = true;
            console.log(`✅ 数据已保存到云端存储: ${key}`);
          } catch (cloudError) {
            console.error('云端存储失败:', cloudError);
            return {
              success: false,
              reason: 'quota_exceeded',
              dataSize
            };
          }
        }
        
        // 如果已经保存到云端，返回成功（即使 localStorage 失败）
        if (savedToCloud) {
          return {
            success: false,
            reason: 'size_threshold_exceeded',
            dataSize
          };
        }
      }
      
      // 尝试写入 localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`✅ 数据已保存到 localStorage: ${key} (${(dataSize / 1024 / 1024).toFixed(2)}MB)`);
        return true;
      } catch (localError: any) {
        // localStorage 写入失败
        if (localError.name === 'QuotaExceededError') {
          console.warn(`⚠️ localStorage 配额不足，但数据${savedToCloud ? '已' : '未'}保存到云端`);
          
          // 如果还没有保存到云端，尝试保存
          if (!savedToCloud) {
            try {
              await this.saveToCloudStorage(key, value);
              savedToCloud = true;
              console.log(`✅ 数据已保存到云端存储: ${key}`);
            } catch (cloudError) {
              console.error('云端存储失败:', cloudError);
              return {
                success: false,
                reason: 'quota_exceeded_error',
                error: localError
              };
            }
          }
          
          // 如果已经保存到云端，返回成功
          if (savedToCloud) {
            return {
              success: false,
              reason: 'size_threshold_exceeded',
              dataSize
            };
          }
        }
        
        throw localError;
      }
    } catch (error: any) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  // 删除数据
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  // 清空所有数据
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // 检查键是否存在
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  // 获取所有键
  keys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  // 获取存储大小（字节）
  getSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  }

  // 导出所有数据
  exportAll(): Record<string, any> {
    try {
      const data: Record<string, any> = {};
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          try {
            data[key] = JSON.parse(localStorage[key]);
          } catch {
            data[key] = localStorage[key];
          }
        }
      }
      return data;
    } catch (error) {
      console.error('Error exporting localStorage:', error);
      return {};
    }
  }

  // 导入数据
  async importAll(data: Record<string, any>): Promise<boolean> {
    try {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          await this.set(key, data[key]);
        }
      }
      return true;
    } catch (error) {
      console.error('Error importing to localStorage:', error);
      return false;
    }
  }

  // 清空应用数据（仅清空应用相关的键）
  clearAppData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        this.remove(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing app data:', error);
      return false;
    }
  }

  /**
   * 保存数据到云端存储
   * 这是一个简化的实现，实际应用中可能需要更复杂的逻辑
   */
  private async saveToCloudStorage<T>(key: string, value: T): Promise<void> {
    // 检查是否已登录和配置
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      throw new Error('未登录，无法使用云端存储');
    }

    // 获取用户密码（用于加密）
    const userPassword = sessionStorage.getItem('userPassword');
    if (!userPassword) {
      throw new Error('未找到用户密码，无法使用云端存储');
    }

    // 构造云端数据格式 - 符合 CloudData 接口
    const cloudData: any = {
      announcements: key === 'announcements' ? value : [],
      positions: key === 'positions' ? value : [],
      userProfile: key === 'userProfile' ? value : null,
      scoreHistory: key === 'scoreHistory' ? value : [],
      lastUpdated: new Date().toISOString(),
    };

    // 上传到云端存储
    await cloudStorageService.uploadData(cloudData, userPassword);
  }
}

// 导出单例
export const storageService = new StorageService();

// 导出常量供其他模块使用
export { STORAGE_SIZE_THRESHOLD };
