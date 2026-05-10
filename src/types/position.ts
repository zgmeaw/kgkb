/**
 * 岗位相关类型定义
 */

import { EducationLevel, DegreeType, PoliticalStatus } from './user';

// 岗位接口
export interface Position {
  id: string;
  announcementId: string;    // 关联的公告ID
  
  // 基本信息
  code: string;              // 岗位代码
  name: string;              // 岗位名称
  department: string;        // 招录部门
  category: string;          // 岗位类别
  
  // 招录信息
  recruitCount: number;      // 招录人数
  registrationCount?: number; // 报名人数
  competitionRatio?: number;  // 竞争比例
  
  // 岗位要求
  educationRequirement: EducationLevel; // 学历要求
  degreeRequirement: DegreeType;        // 学位要求
  majorRequirement: string[];           // 专业要求
  politicalStatusRequirement: PoliticalStatus[]; // 政治面貌要求
  
  // 工作经验要求
  workExperienceRequired: boolean;
  minWorkYears?: number;
  maxWorkYears?: number;
  
  // 年龄要求
  minAge?: number;
  maxAge?: number;
  
  // 其他要求
  genderRequirement?: '男' | '女' | '不限';
  otherRequirements?: string[];
  
  // 岗位详情
  responsibilities: string;   // 岗位职责
  workLocation: string;       // 工作地点
  salary?: string;            // 薪资待遇
  benefits?: string[];        // 福利待遇
  
  // 联系方式
  contactPerson?: string;
  contactPhone?: string;
  
  // 匹配信息（计算字段）
  matchingScore?: number;     // 匹配分数
  isMatched?: boolean;        // 是否匹配
  
  // 系统字段
  createdAt: number;
  updatedAt: number;
  importedFrom?: string;      // 导入来源
}

// 岗位表单数据
export type PositionFormData = Omit<Position, 'id' | 'createdAt' | 'updatedAt' | 'matchingScore' | 'isMatched'>;

// 岗位筛选条件
export interface PositionFilter {
  announcementId?: string;
  keyword?: string;
  department?: string;
  category?: string;
  educationLevel?: EducationLevel;
  degree?: DegreeType;
  major?: string;
  politicalStatus?: PoliticalStatus;
  workExperienceRequired?: boolean;
  minMatchingScore?: number;
  workLocation?: string;
}

// 岗位排序字段
export type PositionSortField = 
  | 'code'
  | 'name'
  | 'department'
  | 'recruitCount'
  | 'competitionRatio'
  | 'matchingScore'
  | 'createdAt';

// 岗位统计
export interface PositionStatistics {
  total: number;
  matched: number;
  unmatched: number;
  averageMatchingScore: number;
  byEducation: Record<EducationLevel, number>;
  byDepartment: Record<string, number>;
  topDepartments: Array<{ department: string; count: number }>;
  competitionRatioRange: {
    low: number;    // < 10:1
    medium: number; // 10:1 - 50:1
    high: number;   // > 50:1
  };
}

// Excel导入映射配置
export interface ExcelColumnMapping {
  code: string;
  name: string;
  department: string;
  category: string;
  recruitCount: string;
  educationRequirement: string;
  degreeRequirement: string;
  majorRequirement: string;
  politicalStatusRequirement: string;
  workExperienceRequired: string;
  minAge: string;
  maxAge: string;
  workLocation: string;
  responsibilities: string;
}

// Excel导入结果
export interface ExcelImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  positions: Position[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}
