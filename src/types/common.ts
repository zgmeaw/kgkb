/**
 * 通用类型定义
 */

// 筛选选项
export interface FilterOption {
  field: string;                        // 字段名（表头）
  label: string;                        // 显示标签
  values: FilterValue[];                // 可选值列表
}

// 筛选值
export interface FilterValue {
  value: string;                        // 实际值
  label: string;                        // 显示标签
  count: number;                        // 该值的岗位数量
}

// 评分历史记录
export interface ScoreHistory {
  id: string;
  positionCode: string;                 // 岗位代码
  positionName: string;                 // 岗位名称
  year: number;                         // 年份
  score: number;                        // 录取分数
  rank?: number;                        // 排名
}

// 匹配详情
export interface MatchingDetails {
  totalScore: number;                   // 总分
  majorScore: number;                   // 专业匹配分
  educationScore: number;               // 学历匹配分
  politicalStatusScore: number;         // 政治面貌匹配分
  workExperienceScore: number;          // 工作经验匹配分
  
  // 详细匹配信息
  educationMatch: boolean;              // 学历是否匹配
  degreeMatch: boolean;                 // 学位是否匹配
  degreeScore: number;                  // 学位匹配分
  majorMatch: boolean;                  // 专业是否匹配
  politicalStatusMatch: boolean;        // 政治面貌是否匹配
  workExperienceMatch: boolean;         // 工作经验是否匹配
  ageMatch: boolean;                    // 年龄是否匹配
  ageScore: number;                     // 年龄匹配分
  matchPercentage: number;              // 匹配百分比
  
  // 建议
  recommendations: string[];            // 匹配建议
}

// Excel解析数据
export interface ParsedExcelData {
  headers: string[];
  rows: Record<string, any>[];
}

// Excel导入结果
export interface ExcelImportResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  positions?: any[]; // 可选的岗位数组
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
