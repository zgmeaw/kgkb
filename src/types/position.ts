/**
 * 岗位相关类型定义
 */

// 岗位接口
export interface Position {
  id: string;                           // UUID
  announcementId: string;               // 关联的公告ID
  code: string;                         // 岗位代码
  name: string;                         // 岗位名称
  department: string;                   // 招聘部门
  category: string;                     // 岗位类别
  recruitCount: number;                 // 招聘人数
  
  // 学历要求
  educationRequirement: string;         // 学历要求
  degreeRequirement: string;            // 学位要求
  majorRequirement: string[];           // 专业要求（数组）
  
  // 其他要求
  politicalStatusRequirement: string[]; // 政治面貌要求
  workExperienceRequired: boolean;      // 是否要求工作经验
  minWorkYears?: number;                // 最低工作年限
  minAge?: number;                      // 最低年龄
  maxAge?: number;                      // 最高年龄
  
  // 工作信息
  workLocation: string;                 // 工作地点
  responsibilities?: string;            // 岗位职责
  
  // 匹配信息
  matchingScore?: number;               // 匹配度分数（0-100）
  isMatched?: boolean;                  // 是否匹配
  competitionRatio?: number;            // 竞争比例
  
  // 原始数据
  rawData: Record<string, any>;         // 原始Excel数据
  
  // 元数据
  createdAt: Date;                      // 创建时间
  updatedAt?: Date;                     // 更新时间
}

// 岗位筛选条件
export interface PositionFilter {
  keyword?: string;                     // 关键词搜索
  announcementId?: string;              // 公告ID
  department?: string;                  // 部门
  category?: string;                    // 类别
  educationLevel?: string;              // 学历要求
  degree?: string;                      // 学位要求
  major?: string;                       // 专业要求
  politicalStatus?: string;             // 政治面貌
  workExperienceRequired?: boolean;     // 工作经验要求
  workLocation?: string;                // 工作地点
  minMatchingScore?: number;            // 最低匹配分数
}

// 岗位统计数据
export interface PositionStatistics {
  total: number;                        // 总数
  matched: number;                      // 匹配数
  unmatched: number;                    // 不匹配数
  averageScore: number;                 // 平均匹配分数
  byEducation: Record<string, number>;  // 按学历统计
  byDepartment: Record<string, number>; // 按部门统计
  highCompetition: number;              // 高竞争岗位数
  lowCompetition: number;               // 低竞争岗位数
}

// 动态字段通过rawData访问，例如：
// position.rawData['岗位代码']
// position.rawData['招聘人数']
// position.rawData['专业要求']
