/**
 * LocalStorage 封装服务
 */

import { STORAGE_KEYS } from '@/constants';

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

  // 保存数据
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
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
  importAll(data: Record<string, any>): boolean {
    try {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          this.set(key, data[key]);
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
}

// 导出单例
export const storageService = new StorageService();
