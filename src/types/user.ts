/**
 * 用户相关类型定义
 */

// 学历层次枚举
export enum EducationLevel {
  HIGH_SCHOOL = '高中',
  ASSOCIATE = '大专',
  BACHELOR = '本科',
  MASTER = '硕士',
  DOCTORATE = '博士',
}

// 学位类型枚举
export enum DegreeType {
  NONE = '无学位',
  BACHELOR = '学士',
  MASTER = '硕士',
  DOCTORATE = '博士',
}

// 政治面貌枚举
export enum PoliticalStatus {
  MASSES = '群众',
  NON_PARTY = '群众',
  LEAGUE_MEMBER = '共青团员',
  PARTY_MEMBER = '中共党员',
  DEMOCRATIC_PARTY = '民主党派',
  OTHER = '其他',
}

// 用户档案接口
export interface UserProfile {
  id: string;                           // UUID
  name: string;                         // 姓名
  gender: '男' | '女';                  // 性别
  birthDate: Date;                      // 出生日期
  age: number;                          // 年龄（自动计算）
  
  // 教育信息
  educationLevel: EducationLevel;       // 学历层次
  degree: DegreeType;                   // 学位
  major: string;                        // 专业
  graduationDate: Date;                 // 毕业时间
  school: string;                       // 毕业院校
  
  // 政治面貌
  politicalStatus: PoliticalStatus;     // 政治面貌
  
  // 工作经历
  hasWorkExperience: boolean;           // 是否有工作经验
  workYears: number;                    // 工作年限
  workExperience?: number;              // 工作年限（可选，0-50）
  currentPosition?: string;             // 当前职位
  workDescription?: string;             // 工作描述
  
  // 联系方式
  phoneNumber?: string;                 // 手机号
  email?: string;                       // 邮箱
  address?: string;                     // 地址
  
  // 元数据
  createdAt: Date;                      // 创建时间
  updatedAt: Date;                      // 更新时间
}
