/**
 * 云端存储服务 - 使用GitHub Gist
 */

interface CloudData {
  announcements: any[];
  positions: any[];
  userProfile: any;
  scoreHistory: any[];
  lastUpdated: string;
}

class CloudStorageService {
  private githubToken: string;
  private gistId: string | null;

  constructor() {
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.gistId = localStorage.getItem('gist_id') || null;
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
    if (!this.githubToken) {
      throw new Error('未配置GitHub Token');
    }

    try {
      const jsonData = JSON.stringify(data);
      const encryptedData = await this.encryptData(jsonData, password);

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
        throw new Error(`上传失败: ${response.statusText}`);
      }

      const result = await response.json();
      this.gistId = result.id;
      localStorage.setItem('gist_id', result.id);
    } catch (error) {
      console.error('上传数据失败:', error);
      throw error;
    }
  }

  /**
   * 从云端下载数据
   */
  async downloadData(password: string): Promise<CloudData> {
    if (!this.githubToken) {
      throw new Error('未配置GitHub Token');
    }

    if (!this.gistId) {
      throw new Error('未找到云端数据');
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        headers: {
          Authorization: `token ${this.githubToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.statusText}`);
      }

      const gist = await response.json();
      const encryptedData = gist.files['kgkb-data.enc'].content;

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
  hasCloudData(): boolean {
    return !!this.gistId;
  }

  /**
   * 清除云端数据引用
   */
  clearCloudReference(): void {
    this.gistId = null;
    localStorage.removeItem('gist_id');
  }
}

export const cloudStorageService = new CloudStorageService();
