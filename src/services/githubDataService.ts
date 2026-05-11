/**
 * GitHub 数据管理服务
 * 直接使用 GitHub Contents API 管理用户数据文件
 */

import { UserProfile, Announcement, Position } from '@/types';

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
   * 使用 GitHub Contents API 创建或更新文件
   */
  private async createOrUpdateFile(path: string, content: string, message: string): Promise<void> {
    const config = this.getConfig();
    
    if (!config.token) {
      console.warn('GitHub Token 未配置，跳过文件保存');
      return;
    }

    try {
      // 先尝试获取文件，看是否已存在
      let sha: string | undefined;
      try {
        const getResponse = await fetch(
          `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
          {
            headers: {
              'Authorization': `token ${config.token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );
        
        if (getResponse.ok) {
          const fileData = await getResponse.json();
          sha = fileData.sha;
        }
      } catch (error) {
        // 文件不存在，继续创建
      }

      // 创建或更新文件
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))), // Base64 编码
            sha, // 如果文件已存在，需要提供 sha
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API 错误: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log(`✅ 文件已保存: ${path}`);
    } catch (error) {
      console.error('❌ 文件保存失败:', error);
      throw error;
    }
  }

  /**
   * 保存用户档案到文件
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profile_${profile.id}_${timestamp}.json`;
    const path = `user-data/profiles/${filename}`;
    
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

    const content = JSON.stringify(data, null, 2);
    const message = `保存用户档案: ${profile.name} - ${timestamp}`;
    
    await this.createOrUpdateFile(path, content, message);
  }

  /**
   * 保存公告数据到文件
   */
  async saveAnnouncement(announcement: Announcement): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `announcement_${announcement.id}_${timestamp}.json`;
    const path = `user-data/announcements/${filename}`;
    
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

    const content = JSON.stringify(data, null, 2);
    const message = `保存公告: ${announcement.title} - ${timestamp}`;
    
    await this.createOrUpdateFile(path, content, message);
  }

  /**
   * 保存岗位数据到文件（分批处理大数据，添加延迟避免并发）
   */
  async savePositions(positions: Position[], announcementId: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 如果岗位数量很大，分批保存
    const BATCH_SIZE = 1000; // 每批1000个岗位
    const totalBatches = Math.ceil(positions.length / BATCH_SIZE);
    
    if (totalBatches > 1) {
      console.log(`📦 岗位数据较大，分 ${totalBatches} 批保存...`);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, positions.length);
        const batch = positions.slice(start, end);
        
        const filename = `positions_${announcementId}_batch${i + 1}_${timestamp}.json`;
        const path = `user-data/positions/${filename}`;
        
        const data = {
          type: 'positions',
          version: '1.0',
          timestamp: new Date().toISOString(),
          batchInfo: {
            batchNumber: i + 1,
            totalBatches,
            batchSize: batch.length,
            totalPositions: positions.length,
          },
          data: batch,
          metadata: {
            announcementId,
            positionCount: batch.length,
            importDate: new Date().toISOString(),
          }
        };

        const content = JSON.stringify(data, null, 2);
        const message = `保存岗位数据 (批次 ${i + 1}/${totalBatches}): ${announcementId} - ${timestamp}`;
        
        await this.createOrUpdateFile(path, content, message);
        console.log(`✅ 批次 ${i + 1}/${totalBatches} 已保存 (${batch.length} 个岗位)`);
        
        // 添加延迟，避免触发太多 GitHub Actions
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 每批之间延迟2秒
        }
      }
      
      console.log(`🎉 所有岗位数据已保存完成！共 ${positions.length} 个岗位，分 ${totalBatches} 个文件`);
    } else {
      // 数据量小，直接保存
      const filename = `positions_${announcementId}_${timestamp}.json`;
      const path = `user-data/positions/${filename}`;
      
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

      const content = JSON.stringify(data, null, 2);
      const message = `保存岗位数据: ${announcementId} - ${timestamp}`;
      
      await this.createOrUpdateFile(path, content, message);
    }
  }

  /**
   * 创建数据备份
   */
  async createBackup(type: 'full' | 'profiles' | 'announcements' | 'positions', data: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${type}_${timestamp}.json`;
    const path = `user-data/backups/${filename}`;
    
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

    const content = JSON.stringify(backupData, null, 2);
    const message = `创建备份: ${type} - ${timestamp}`;
    
    await this.createOrUpdateFile(path, content, message);
  }

  /**
   * 删除数据文件
   */
  async deleteDataFile(filepath: string): Promise<void> {
    const config = this.getConfig();
    
    if (!config.token) {
      console.warn('GitHub Token 未配置，跳过文件删除');
      return;
    }

    try {
      // 先获取文件的 SHA
      const getResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filepath}`,
        {
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!getResponse.ok) {
        throw new Error('文件不存在或无法访问');
      }

      const fileData = await getResponse.json();
      
      // 删除文件
      const deleteResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filepath}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `删除文件: ${filepath}`,
            sha: fileData.sha,
          }),
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(`删除失败: ${deleteResponse.status}`);
      }

      console.log(`✅ 文件已删除: ${filepath}`);
    } catch (error) {
      console.error('❌ 文件删除失败:', error);
      throw error;
    }
  }

  /**
   * 检查 GitHub 配置是否可用
   */
  isConfigured(): boolean {
    const config = this.getConfig();
    return !!config.token;
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