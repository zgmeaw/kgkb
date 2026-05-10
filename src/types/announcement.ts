/**
 * 公告相关类型定义
 */

// 公告状态枚举
export enum AnnouncementStatus {
  DRAFT = 'draft',           // 草稿
  PUBLISHED = 'published',   // 已发布
  ONGOING = 'ongoing',       // 进行中
  ENDED = 'ended',          // 已结束
  ARCHIVED = 'archived',    // 已归档
}

// 公告类型
export enum AnnouncementType {
  NATIONAL = '国考',
  PROVINCIAL = '省考',
  MUNICIPAL = '市考',
  DISTRICT = '区县考',
  INSTITUTION = '事业单位',
}

// 公告接口
export interface Announcement {
  id: string;
  title: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  
  // 时间信息
  publishDate: string;      // 发布日期
  registrationStart: string; // 报名开始
  registrationEnd: string;   // 报名结束
  examDate?: string;         // 考试日期
  
  // 公告内容
  description: string;
  requirements: string[];
  attachments?: AttachmentFile[];
  
  // 岗位信息
  positionCount: number;     // 岗位数量
  recruitCount: number;      // 招录人数
  
  // 组织信息
  organization: string;      // 组织单位
  contactInfo?: ContactInfo;
  
  // 链接
  officialUrl?: string;      // 官方链接
  
  // 系统字段
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
}

// 附件文件
export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: number;
}

// 联系信息
export interface ContactInfo {
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// 公告表单数据
export type AnnouncementFormData = Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'positionCount' | 'recruitCount'>;

// 公告筛选条件
export interface AnnouncementFilter {
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

// 公告统计
export interface AnnouncementStatistics {
  total: number;
  byType: Record<AnnouncementType, number>;
  byStatus: Record<AnnouncementStatus, number>;
  upcoming: number;
  ongoing: number;
}
