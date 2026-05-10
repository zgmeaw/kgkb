/**
 * Cloudflare R2 存储后端
 * 使用 Cloudflare Workers 作为中间层
 */

import { StorageBackend, CloudData } from './types';

export class R2StorageBackend implements StorageBackend {
  private workerUrl: string;
  private apiKey: string;

  constructor(config: {
    workerUrl: string;
    apiKey: string;
  }) {
    this.workerUrl = config.workerUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * 上传数据
   */
  async upload(data: CloudData, encryptedData: string): Promise<void> {
    const fileName = `kgkb-data-${Date.now()}.enc`;

    const response = await fetch(`${this.workerUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        fileName,
        data: encryptedData,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`R2 上传失败: ${error}`);
    }

    // 保存文件名到 localStorage
    localStorage.setItem('r2_latest_file', fileName);
  }

  /**
   * 下载数据
   */
  async download(): Promise<string> {
    const fileName = localStorage.getItem('r2_latest_file');
    if (!fileName) {
      throw new Error('未找到云端数据');
    }

    const response = await fetch(`${this.workerUrl}/download/${fileName}`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`R2 下载失败: ${error}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 检查是否有云端数据
   */
  hasCloudData(): boolean {
    return !!localStorage.getItem('r2_latest_file');
  }

  /**
   * 清除云端数据引用
   */
  clearCloudReference(): void {
    localStorage.removeItem('r2_latest_file');
  }
}
