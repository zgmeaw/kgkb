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

  async upload(data: CloudData, encryptedData: string): Promise<void> {
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

  hasCloudData(): boolean {
    return !!this.gistId;
  }

  clearCloudReference(): void {
    this.gistId = null;
    localStorage.removeItem('gist_id');
  }
}
