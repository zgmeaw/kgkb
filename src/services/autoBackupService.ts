/**
 * 自动备份服务 - 监听数据变化并自动备份到云端
 */

import { cloudStorageService } from './cloudStorageService';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '@/constants';

class AutoBackupService {
  private backupTimer: number | null = null;
  private pendingBackup = false;
  private isBackingUp = false;

  /**
   * 初始化自动备份服务
   */
  init() {
    // 监听 storage 事件（跨标签页同步）
    window.addEventListener('storage', this.handleStorageChange);
    
    // 监听自定义事件（同一标签页内的数据变化）
    window.addEventListener('dataChanged', this.scheduleBackup);
  }

  /**
   * 清理服务
   */
  cleanup() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('dataChanged', this.scheduleBackup);
    if (this.backupTimer) {
      clearTimeout(this.backupTimer);
    }
  }

  /**
   * 处理 storage 变化
   */
  private handleStorageChange = (e: StorageEvent) => {
    // 只处理我们关心的 key
    const relevantKeys: string[] = [
      STORAGE_KEYS.ANNOUNCEMENTS,
      STORAGE_KEYS.POSITIONS,
      STORAGE_KEYS.USER_PROFILE,
    ];

    if (e.key && relevantKeys.includes(e.key)) {
      this.scheduleBackup();
    }
  };

  /**
   * 安排备份（防抖）
   */
  private scheduleBackup = () => {
    // 如果已经在备份中，标记需要再次备份
    if (this.isBackingUp) {
      this.pendingBackup = true;
      return;
    }

    // 清除之前的定时器
    if (this.backupTimer) {
      window.clearTimeout(this.backupTimer);
    }

    // 3秒后执行备份（防抖）
    this.backupTimer = window.setTimeout(() => {
      this.performBackup();
    }, 3000);
  };

  /**
   * 执行备份
   */
  private async performBackup() {
    // 检查是否已登录
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      return;
    }

    // 检查是否有 GitHub Token
    const githubToken = localStorage.getItem('github_token');
    if (!githubToken) {
      console.log('未配置 GitHub Token，跳过自动备份');
      return;
    }

    // 获取用户密码（用于加密）
    const userPassword = sessionStorage.getItem('userPassword');
    if (!userPassword) {
      console.log('未找到用户密码，跳过自动备份');
      return;
    }

    this.isBackingUp = true;

    try {
      // 收集数据
      const data = {
        announcements: storageService.get<any[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [],
        positions: storageService.get<any[]>(STORAGE_KEYS.POSITIONS) || [],
        userProfile: storageService.get<any>(STORAGE_KEYS.USER_PROFILE) || null,
        scoreHistory: storageService.get<any[]>(STORAGE_KEYS.SCORE_HISTORY) || [],
        lastUpdated: new Date().toISOString(),
      };

      // 上传到云端
      await cloudStorageService.uploadData(data, userPassword);
      
      console.log('✅ 自动备份成功:', new Date().toLocaleString());

      // 显示通知（不打扰用户）
      this.showQuietNotification('数据已自动备份到云端');

    } catch (error) {
      console.error('自动备份失败:', error);
      // 不显示错误通知，避免打扰用户
    } finally {
      this.isBackingUp = false;

      // 如果在备份期间有新的变化，再次备份
      if (this.pendingBackup) {
        this.pendingBackup = false;
        this.scheduleBackup();
      }
    }
  }

  /**
   * 显示静默通知
   */
  private showQuietNotification(message: string) {
    // 创建一个小的通知元素
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in';
    notification.textContent = `☁️ ${message}`;
    document.body.appendChild(notification);

    // 3秒后移除
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * 手动触发备份
   */
  async manualBackup(): Promise<void> {
    const userPassword = sessionStorage.getItem('userPassword');
    if (!userPassword) {
      throw new Error('未找到用户密码');
    }

    const data = {
      announcements: storageService.get<any[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [],
      positions: storageService.get<any[]>(STORAGE_KEYS.POSITIONS) || [],
      userProfile: storageService.get<any>(STORAGE_KEYS.USER_PROFILE) || null,
      scoreHistory: storageService.get<any[]>(STORAGE_KEYS.SCORE_HISTORY) || [],
      lastUpdated: new Date().toISOString(),
    };

    await cloudStorageService.uploadData(data, userPassword);
  }
}

export const autoBackupService = new AutoBackupService();

// 触发数据变化事件的辅助函数
export function triggerDataChange() {
  window.dispatchEvent(new Event('dataChanged'));
}
