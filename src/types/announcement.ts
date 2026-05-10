/**
 * 公告相关类型定义
 */

// 公告类型枚举
export enum AnnouncementType {
  CIVIL_SERVICE = '公务员',
  PUBLIC_INSTITUTION = '事业编',
  STATE_OWNED_ENTERPRISE = '国企',
  NATIONAL = '国考',
  PROVINCIAL = '省考',
  OTHER = '其他',
}

// 公告状态枚举
export enum AnnouncementStatus {
  NOT_STARTED = '未开始',
  REGISTRATION_OPEN = '报名中',
  REGISTRATION_CLOSED = '报名结束',
  ADMIT_CARD_AVAILABLE = '准考证打印中',
  EXAM_IN_PROGRESS = '考试进行中',
  COMPLETED = '已结束',
  PUBLISHED = '已发布',
  ONGOING = '进行中',
}

// 公告接口
export interface Announcement {
  id: string;                    // UUID
  title: string;                 // 公告标题
  organization: string;          // 发布机构
  announcementUrl: string;       // 公告链接
  type: string;                  // 考试类型（公务员/事业编）
  status: AnnouncementStatus;    // 进行状态
  publishDate: Date;             // 发布日期
  registrationStartDate: Date;   // 报名时间
  registrationEndDate: Date;     // 截至时间
  registrationStart?: Date;      // 报名开始（别名）
  registrationEnd?: Date;        // 报名结束（别名）
  admitCardPrintDate: Date;      // 打印准考证时间
  examDate: Date;                // 考试时间
  positionCount: number;         // 岗位数量
  recruitCount: number;          // 招聘人数
  requirements: string[];        // 报考要求
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

// 公告输入数据（用于创建公告）
export type AnnouncementInput = Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'positionCount' | 'recruitCount'>;

// 公告筛选条件
export interface AnnouncementFilter {
  keyword?: string;              // 关键词搜索
  type?: string;                 // 公告类型
  status?: AnnouncementStatus;   // 状态
  startDate?: Date;              // 开始日期
  endDate?: Date;                // 结束日期
}

// 公告统计数据
export interface AnnouncementStatistics {
  total: number;                 // 总数
  byType: Record<string, number>; // 按类型统计
  byStatus: Record<string, number>; // 按状态统计
  published: number;             // 已发布
  ongoing: number;               // 进行中
  completed: number;             // 已完成
}
