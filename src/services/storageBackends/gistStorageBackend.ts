/**
 * GitHub Gist 存储后端
 */

import { StorageBackend, CloudData } from './types';

export class GistStorageBackend implements StorageBackend {
  private gistId: string | null;
  private githubToken: string;

  constructor(githubToken: string) {
    this.githubToken = githubToken;
    this.gistId = localStorage.getItem('gist_id') || null;
  }

  /**
   * 查找用户的 KGKB Gist
   */
  async findKgkbGist(): Promise<string | null> {
    try {
      const response = await fetch('https://api.github.com/gists', {
        headers: {
          Authorization: `token ${this.githubToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取 Gist 列表失败: ${response.statusText}`);
      }

      const gists = await response.json();
      
      // 查找描述包含 "公考岗位分析系统" 的 Gist
      const kgkbGist = gists.find((gist: any) => 
        gist.description && gist.description.includes('公考岗位分析系统')
      );

      if (kgkbGist) {
        this.gistId = kgkbGist.id;
        localStorage.setItem('gist_id', kgkbGist.id);
        return kgkbGist.id;
      }

      return null;
    } catch (error) {
      console.error('查找 Gist 失败:', error);
      return null;
    }
  }

  async upload(data: CloudData, encryptedData: string): Promise<void> {
    // 如果没有 gistId，先尝试查找
    if (!this.gistId) {
      await this.findKgkbGist();
    }

    const gistData = {
      description: '公考岗位分析系统 - 云端数据备份',
      public: false,
      files: {
        'kgkb-data.enc': {
          content: encryptedData,
        },
      },
    };

    let response;
    if (this.gistId) {
      // 更新现有Gist
      response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${this.githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gistData),
      });
    } else {
      // 创建新Gist
      response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `token ${this.githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gistData),
      });
    }

    if (!response.ok) {
      throw new Error(`GitHub Gist 上传失败: ${response.statusText}`);
    }

    const result = await response.json();
    this.gistId = result.id;
    localStorage.setItem('gist_id', result.id);
  }

  async download(): Promise<string> {
    // 如果没有 gistId，先尝试查找
    if (!this.gistId) {
      await this.findKgkbGist();
    }

    if (!this.gistId) {
      throw new Error('未找到云端数据');
    }

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      headers: {
        Authorization: `token ${this.githubToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub Gist 下载失败: ${response.statusText}`);
    }

    const gist = await response.json();
    return gist.files['kgkb-data.enc'].content;
  }

  async hasCloudData(): Promise<boolean> {
    // 如果本地有 gistId，直接返回 true
    if (this.gistId) {
      return true;
    }

    // 否则尝试查找
    const foundId = await this.findKgkbGist();
    return !!foundId;
  }

  clearCloudReference(): void {
    this.gistId = null;
    localStorage.removeItem('gist_id');
  }
}
