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
  /**
   * 从 localStorage 获取 GitHub 配置
   */
  private getConfig() {
    return {
      owner: 'zgmeaw', // 写死的 GitHub 用户名
      repo: 'kgkb',    // 写死的仓库名
      token: localStorage.getItem('github_token') || '',
    };
  }

  /**
   * 触发 GitHub Actions 工作流
   */
  private async dispatchAction(payload: GitHubDispatchPayload): Promise<void> {
    const config = this.getConfig();
    
    if (!config.token || !config.owner || !config.repo) {
      console.warn('GitHub 配置不完整，跳过文件保存');
      return;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API 错误: ${response.status} ${response.statusText} - ${errorText}`);
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
    const config = this.getConfig();
    return !!(config.token && config.owner && config.repo);
  }

  /**
   * 获取配置状态
   */
  getConfigStatus(): { configured: boolean; missing: string[] } {
    const config = this.getConfig();
    const missing: string[] = [];
    
    if (!config.token) missing.push('GitHub Token');

    return {
      configured: missing.length === 0,
      missing,
    };
  }

  /**
   * 保存 GitHub Token 到 localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('github_token', token);
  }

  /**
   * 清除 GitHub Token
   */
  clearToken(): void {
    localStorage.removeItem('github_token');
  }
}

// 导出单例
export const githubDataService = new GitHubDataService();