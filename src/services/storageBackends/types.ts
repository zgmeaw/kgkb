/**
 * 存储后端接口定义
 */

export interface CloudData {
  announcements: any[];
  positions: any[];
  userProfile: any;
  scoreHistory: any[];
  lastUpdated: string;
}

export interface StorageBackend {
  /**
   * 上传数据到云端
   */
  upload(data: CloudData, encryptedData: string): Promise<void>;

  /**
   * 从云端下载数据
   */
  download(): Promise<string>;

  /**
   * 检查是否有云端数据
   */
  hasCloudData(): Promise<boolean>;

  /**
   * 清除云端数据引用
   */
  clearCloudReference(): void;
}

export enum StorageBackendType {
  GITHUB_GIST = 'github_gist',
  CLOUDFLARE_R2 = 'cloudflare_r2',
  AWS_S3 = 'aws_s3',
}
