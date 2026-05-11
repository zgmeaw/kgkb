/**
 * GitHub 数据管理服务
 * 通过 GitHub Actions 管理用户数据文件
 */

import { UserProfile, Announcement, Position } from '@/types';

interface GitHubDispatchPayload {
  event_type: string;
  client_payload: {
    filename: string;
    data: string;
    filepath?: string;
  };
}

class GitHubDataService {
  private readonly repoOwner: string;
  private readonly repoName: string;
  private readonly token: string;

  constructor() {
    // 从环境变量或配置中获取仓库信息
    this.repoOwner = import.meta.env.VITE_GITHUB_OWNER || '';
    this.repoName = import.meta.env.VITE_GITHUB_REPO || '';
    this.token = import.meta.env.VITE_GITHUB_TOKEN || '';
  }

  /**
   * 触发 GitHub Actions 工作流
   */
  private async dispatchAction(payload: GitHubDispatchPayload): Promise<void> {
    if (!this.token || !this.repoOwner || !this.repoName) {
      console.warn('GitHub 配置不完整，跳过文件保存');
      return;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ GitHub Actions 已触发: ${payload.event_type}`);
    } catch (error) {
      console.error('❌ GitHub Actions 触发失败:', error);
      throw error;
    }
  }

  /**
   * 保存用户档案到文件
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profile_${profile.id}_${timestamp}.json`;
    
    const data = {
      type: 'user_profile',
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: profile,
      metadata: {
        userId: profile.id,
        userName: profile.name,
        lastUpdated: profile.updatedAt,
      }
    };

    await this.dispatchAction({
      event_type: 'save-user-data',
      client_payload: {
        filename,
        data: JSON.stringify(data, null, 2),
      },
    });
  }

  /**
   * 保存公告数据到文件
   */
  async saveAnnouncement(announcement: Announcement): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `announcement_${announcement.id}_${timestamp}.json`;
    
    const data = {
      type: 'announcement',
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: announcement,
      metadata: {
        announcementId: announcement.id,
        title: announcement.title,
        organization: announcement.organization,
        publishDate: announcement.publishDate,
      }
    };

    await this.dispatchAction({
      event_type: 'save-announcement',
      client_payload: {
        filename,
        data: JSON.stringify(data, null, 2),
      },
    });
  }

  /**
   * 保存岗位数据到文件
   */
  async savePositions(positions: Position[], announcementId: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `positions_${announcementId}_${timestamp}.json`;
    
    const data = {
      type: 'positions',
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: positions,
      metadata: {
        announcementId,
        positionCount: positions.length,
        importDate: new Date().toISOString(),
      }
    };

    await this.dispatchAction({
      event_type: 'save-positions',
      client_payload: {
        filename,
        data: JSON.stringify(data, null, 2),
      },
    });
  }

  /**
   * 创建数据备份
   */
  async createBackup(type: 'full' | 'profiles' | 'announcements' | 'positions', data: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${type}_${timestamp}.json`;
    
    const backupData = {
      type: 'backup',
      backupType: type,
      version: '1.0',
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        itemCount: Array.isArray(data) ? data.length : Object.keys(data).length,
        createdAt: new Date().toISOString(),
      }
    };

    await this.dispatchAction({
      event_type: 'save-user-data',
      client_payload: {
        filename: `backups/${filename}`,
        data: JSON.stringify(backupData, null, 2),
      },
    });
  }

  /**
   * 删除数据文件
   */
  async deleteDataFile(filepath: string): Promise<void> {
    await this.dispatchAction({
      event_type: 'delete-data',
      client_payload: {
        filename: '',
        data: '',
        filepath,
      },
    });
  }

  /**
   * 检查 GitHub 配置是否可用
   */
  isConfigured(): boolean {
    return !!(this.token && this.repoOwner && this.repoName);
  }

  /**
   * 获取配置状态
   */
  getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!this.repoOwner) missing.push('VITE_GITHUB_OWNER');
    if (!this.repoName) missing.push('VITE_GITHUB_REPO');
    if (!this.token) missing.push('VITE_GITHUB_TOKEN');

    return {
      configured: missing.length === 0,
      missing,
    };
  }
}

// 导出单例
export const githubDataService = new GitHubDataService();