/**
 * 用户相关类型定义
 */

// 学历层次枚举
export enum EducationLevel {
  HIGH_SCHOOL = '高中',
  ASSOCIATE = '大专',
  BACHELOR = '本科',
  MASTER = '硕士研究生',
  DOCTORATE = '博士研究生',
}

// 学位类型
export enum DegreeType {
  NONE = '无学位',
  BACHELOR = '学士',
  MASTER = '硕士',
  DOCTORATE = '博士',
}

// 政治面貌
export enum PoliticalStatus {
  PARTY_MEMBER = '中共党员',
  PROBATIONARY_PARTY_MEMBER = '中共预备党员',
  LEAGUE_MEMBER = '共青团员',
  DEMOCRATIC_PARTY = '民主党派',
  NON_PARTY = '群众',
}

// 用户档案接口
export interface UserProfile {
  id: string;
  name: string;
  gender: '男' | '女';
  birthDate: string; // ISO 8601 格式
  age: number;
  
  // 教育信息
  educationLevel: EducationLevel;
  degree: DegreeType;
  major: string;
  graduationDate: string;
  school: string;
  
  // 政治面貌
  politicalStatus: PoliticalStatus;
  
  // 工作经历
  hasWorkExperience: boolean;
  workYears: number;
  currentPosition?: string;
  workDescription?: string;
  
  // 其他信息
  phoneNumber?: string;
  email?: string;
  idCard?: string;
  address?: string;
  
  // 系统字段
  createdAt: number;
  updatedAt: number;
}

// 用户档案表单数据
export type UserProfileFormData = Omit<UserProfile, 'id' | 'age' | 'createdAt' | 'updatedAt'>;

// 用户档案验证错误
export interface UserProfileValidationError {
  field: keyof UserProfile;
  message: string;
}
