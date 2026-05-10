/**
 * 应用常量定义
 */

// 应用信息
export const APP_NAME = '公考岗位智能分析系统';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Civil Service Exam Position Analyzer';

// LocalStorage 键名
export const STORAGE_KEYS = {
  ANNOUNCEMENTS: 'civil_service_announcements',
  POSITIONS: 'civil_service_positions',
  USER_PROFILE: 'civil_service_user_profile',
  SCORE_HISTORY: 'civil_service_score_history',
  APP_VERSION: 'civil_service_app_version',
  THEME: 'kgkb_theme',
  LANGUAGE: 'kgkb_language',
} as const;

// 文件限制
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls',
    '.xlsx',
  ] as string[],
} as const;

// 匹配度权重配置（基于设计文档的匹配算法）
export const MATCHING_WEIGHTS = {
  MAJOR: 60,              // 专业权重 60分（完全匹配60分，部分匹配30分）
  EDUCATION: 20,          // 学历权重 20分
  DEGREE: 10,             // 学位权重 10分
  POLITICAL_STATUS: 10,   // 政治面貌权重 10分
  WORK_EXPERIENCE: 10,    // 工作年限权重 10分
  AGE: 10,                // 年龄权重 10分
} as const;

// 专业匹配分数
export const MAJOR_MATCH_SCORES = {
  EXACT: 60,    // 完全匹配
  PARTIAL: 30,  // 部分匹配（包含关系）
  NONE: 0,      // 不匹配
} as const;

// 匹配度等级
export const MATCHING_LEVELS = {
  EXCELLENT: { min: 90, label: '优秀匹配', color: 'green' },
  GOOD: { min: 75, label: '良好匹配', color: 'blue' },
  FAIR: { min: 60, label: '一般匹配', color: 'yellow' },
  POOR: { min: 0, label: '匹配度低', color: 'red' },
} as const;

// 公告状态映射（用于显示状态标签和颜色）
export const ANNOUNCEMENT_STATUS_MAP = {
  NOT_STARTED: {
    label: '未开始',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
  REGISTRATION_OPEN: {
    label: '报名中',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  REGISTRATION_CLOSED: {
    label: '报名结束',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
  },
  ADMIT_CARD_AVAILABLE: {
    label: '准考证打印中',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
  },
  EXAM_IN_PROGRESS: {
    label: '考试进行中',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
  },
  COMPLETED: {
    label: '已结束',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// 日期格式
export const DATE_FORMATS = {
  DISPLAY: 'yyyy-MM-dd',
  DISPLAY_TIME: 'yyyy-MM-dd HH:mm:ss',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// 学历层次顺序（用于比较）
export const EDUCATION_LEVEL_ORDER = {
  '高中': 1,
  '大专': 2,
  '本科': 3,
  '硕士研究生': 4,
  '博士研究生': 5,
} as const;

// 学位类型顺序（用于比较）
export const DEGREE_TYPE_ORDER = {
  '无学位': 0,
  '学士': 1,
  '硕士': 2,
  '博士': 3,
} as const;

// Excel 列映射默认配置
export const DEFAULT_EXCEL_MAPPING = {
  code: '岗位代码',
  name: '岗位名称',
  department: '招录部门',
  category: '岗位类别',
  recruitCount: '招录人数',
  educationRequirement: '学历要求',
  degreeRequirement: '学位要求',
  majorRequirement: '专业要求',
  politicalStatusRequirement: '政治面貌',
  workExperienceRequired: '工作经验',
  minAge: '最小年龄',
  maxAge: '最大年龄',
  workLocation: '工作地点',
  responsibilities: '岗位职责',
} as const;

// 路由路径
export const ROUTES = {
  HOME: '/',
  ANNOUNCEMENTS: '/announcements',
  ANNOUNCEMENT_DETAIL: '/announcements/:id',
  POSITIONS: '/positions',
  POSITION_DETAIL: '/positions/:id',
  USER_PROFILE: '/profile',
  DATA_EXPORT: '/export',
  NOT_FOUND: '*',
} as const;

// Toast 持续时间
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// 验证规则
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_PATTERN: /^1[3-9]\d{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_CARD_PATTERN: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
} as const;

// 默认用户档案
export const DEFAULT_USER_PROFILE = {
  name: '',
  gender: '男' as const,
  birthDate: '',
  educationLevel: '本科' as const,
  degree: '学士' as const,
  major: '',
  graduationDate: '',
  school: '',
  politicalStatus: '群众' as const,
  hasWorkExperience: false,
  workYears: 0,
} as const;
