/**
 * 数据格式化工具函数
 */

// 格式化数字为千分位
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 格式化百分比
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 格式化竞争比例
export const formatCompetitionRatio = (ratio: number): string => {
  if (ratio === 0) return '暂无数据';
  return `${ratio.toFixed(1)}:1`;
};

// 格式化匹配分数
export const formatMatchingScore = (score: number): string => {
  return `${score.toFixed(1)}分`;
};

// 格式化数组为字符串
export const formatArray = (arr: string[], separator: string = '、'): string => {
  if (!arr || arr.length === 0) return '无';
  return arr.join(separator);
};

// 格式化手机号（隐藏中间4位）
export const formatPhoneNumber = (phone: string, mask: boolean = false): string => {
  if (!phone) return '';
  if (!mask) return phone;
  
  if (phone.length === 11) {
    return `${phone.substring(0, 3)}****${phone.substring(7)}`;
  }
  return phone;
};

// 格式化身份证号（隐藏中间部分）
export const formatIdCard = (idCard: string, mask: boolean = false): string => {
  if (!idCard) return '';
  if (!mask) return idCard;
  
  if (idCard.length === 18) {
    return `${idCard.substring(0, 6)}********${idCard.substring(14)}`;
  }
  return idCard;
};

// 格式化邮箱（隐藏部分字符）
export const formatEmail = (email: string, mask: boolean = false): string => {
  if (!email) return '';
  if (!mask) return email;
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const visibleLength = Math.min(3, Math.floor(username.length / 2));
  const maskedUsername = username.substring(0, visibleLength) + '***';
  
  return `${maskedUsername}@${domain}`;
};

// 截断文本
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// 高亮关键词
export const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// 格式化工作年限
export const formatWorkYears = (years: number): string => {
  if (years === 0) return '应届毕业生';
  if (years < 1) return '不足1年';
  return `${years}年`;
};

// 格式化年龄范围
export const formatAgeRange = (minAge?: number, maxAge?: number): string => {
  if (!minAge && !maxAge) return '不限';
  if (minAge && !maxAge) return `${minAge}岁以上`;
  if (!minAge && maxAge) return `${maxAge}岁以下`;
  return `${minAge}-${maxAge}岁`;
};

// 格式化薪资范围
export const formatSalaryRange = (salary?: string): string => {
  if (!salary) return '面议';
  return salary;
};

// 首字母大写
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 驼峰转下划线
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// 下划线转驼峰
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// 生成随机ID
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${randomStr}`;
};

// 格式化匹配度等级
export const formatMatchingLevel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: '优秀匹配', color: 'green' };
  if (score >= 75) return { label: '良好匹配', color: 'blue' };
  if (score >= 60) return { label: '一般匹配', color: 'yellow' };
  return { label: '匹配度低', color: 'red' };
};

// 格式化公告状态
export const formatAnnouncementStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'gray' },
    published: { label: '已发布', color: 'blue' },
    ongoing: { label: '进行中', color: 'green' },
    ended: { label: '已结束', color: 'orange' },
    archived: { label: '已归档', color: 'gray' },
  };
  return statusMap[status] || { label: status, color: 'gray' };
};
