/**
 * 日期处理工具函数
 */

import { format, parse, isValid, differenceInYears, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';
import { DATE_FORMATS } from '@/constants';

// 格式化日期
export const formatDate = (date: Date | string | number, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

// 格式化日期时间
export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_TIME);
};

// 解析日期字符串
export const parseDate = (dateStr: string, formatStr: string = DATE_FORMATS.DISPLAY): Date | null => {
  try {
    const parsed = parse(dateStr, formatStr, new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// 计算年龄
export const calculateAge = (birthDate: Date | string): number => {
  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (!isValid(birth)) {
      return 0;
    }
    return differenceInYears(new Date(), birth);
  } catch {
    return 0;
  }
};

// 计算工作年限
export const calculateWorkYears = (startDate: Date | string): number => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    if (!isValid(start)) {
      return 0;
    }
    const years = differenceInYears(new Date(), start);
    return Math.max(0, years);
  } catch {
    return 0;
  }
};

// 检查日期是否在范围内
export const isDateInRange = (date: Date | string, startDate: Date | string, endDate: Date | string): boolean => {
  try {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (!isValid(checkDate) || !isValid(start) || !isValid(end)) {
      return false;
    }
    
    return checkDate >= start && checkDate <= end;
  } catch {
    return false;
  }
};

// 获取日期范围的天数
export const getDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) {
      return 0;
    }
    
    return Math.abs(differenceInDays(end, start));
  } catch {
    return 0;
  }
};

// 检查日期是否已过期
export const isExpired = (date: Date | string): boolean => {
  try {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(checkDate)) {
      return false;
    }
    return checkDate < new Date();
  } catch {
    return false;
  }
};

// 检查日期是否即将到来（未来N天内）
export const isUpcoming = (date: Date | string, days: number = 7): boolean => {
  try {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(checkDate)) {
      return false;
    }
    const now = new Date();
    const futureDate = addDays(now, days);
    return checkDate >= now && checkDate <= futureDate;
  } catch {
    return false;
  }
};

// 获取今天的开始时间
export const getStartOfToday = (): Date => {
  return startOfDay(new Date());
};

// 获取今天的结束时间
export const getEndOfToday = (): Date => {
  return endOfDay(new Date());
};

// 获取相对时间描述
export const getRelativeTimeDescription = (date: Date | string): string => {
  try {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(targetDate)) {
      return '';
    }
    
    const now = new Date();
    const days = differenceInDays(targetDate, now);
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '明天';
    } else if (days === -1) {
      return '昨天';
    } else if (days > 1 && days <= 7) {
      return `${days}天后`;
    } else if (days < -1 && days >= -7) {
      return `${Math.abs(days)}天前`;
    } else if (days > 7) {
      return formatDate(targetDate);
    } else {
      return formatDate(targetDate);
    }
  } catch {
    return '';
  }
};

// 从身份证号提取出生日期
export const extractBirthDateFromIdCard = (idCard: string): string | null => {
  if (!idCard || idCard.length !== 18) {
    return null;
  }
  
  try {
    const year = idCard.substring(6, 10);
    const month = idCard.substring(10, 12);
    const day = idCard.substring(12, 14);
    const birthDate = `${year}-${month}-${day}`;
    
    const date = new Date(birthDate);
    if (!isValid(date)) {
      return null;
    }
    
    return birthDate;
  } catch {
    return null;
  }
};

// 从身份证号提取性别
export const extractGenderFromIdCard = (idCard: string): '男' | '女' | null => {
  if (!idCard || idCard.length !== 18) {
    return null;
  }
  
  try {
    const genderCode = parseInt(idCard.charAt(16));
    return genderCode % 2 === 0 ? '女' : '男';
  } catch {
    return null;
  }
};
