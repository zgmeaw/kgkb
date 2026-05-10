/**
 * 通用类型定义
 */

// 筛选选项
export interface FilterOption {
  label: string;
  value: string;
}

// 筛选值类型
export type FilterValue = string | string[] | number | boolean | null;

// 评分历史记录
export interface ScoreHistory {
  positionId: string;
  positionName: string;
  score: number;
  timestamp: number;
  matchingDetails: MatchingDetails;
}

// 匹配详情
export interface MatchingDetails {
  educationMatch: boolean;
  educationScore: number;
  degreeMatch: boolean;
  degreeScore: number;
  majorMatch: boolean;
  majorScore: number;
  politicalStatusMatch: boolean;
  politicalStatusScore: number;
  workExperienceMatch: boolean;
  workExperienceScore: number;
  ageMatch: boolean;
  ageScore: number;
  totalScore: number;
  matchPercentage: number;
  recommendations: string[];
}

// Excel解析数据
export interface ParsedExcelData {
  positions: any[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  validRows: number;
}

// 排序方向
export type SortDirection = 'asc' | 'desc';

// 排序配置
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// 分页配置
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// API响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 统计数据
export interface Statistics {
  total: number;
  matched: number;
  unmatched: number;
  averageScore: number;
}
