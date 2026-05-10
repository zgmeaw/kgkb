/**
 * 表单验证工具函数
 */

import { VALIDATION_RULES } from '@/constants';

// 验证姓名
export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return '姓名不能为空';
  }
  if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return `姓名至少需要${VALIDATION_RULES.NAME_MIN_LENGTH}个字符`;
  }
  if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    return `姓名不能超过${VALIDATION_RULES.NAME_MAX_LENGTH}个字符`;
  }
  return null;
};

// 验证手机号
export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return null; // 手机号可选
  }
  if (!VALIDATION_RULES.PHONE_PATTERN.test(phone)) {
    return '请输入有效的手机号码';
  }
  return null;
};

// 验证邮箱
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return null; // 邮箱可选
  }
  if (!VALIDATION_RULES.EMAIL_PATTERN.test(email)) {
    return '请输入有效的邮箱地址';
  }
  return null;
};

// 验证身份证号
export const validateIdCard = (idCard: string): string | null => {
  if (!idCard) {
    return null; // 身份证号可选
  }
  if (!VALIDATION_RULES.ID_CARD_PATTERN.test(idCard)) {
    return '请输入有效的身份证号码';
  }
  
  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  if (idCard[17].toUpperCase() !== checkCode) {
    return '身份证号码校验失败';
  }
  
  return null;
};

// 验证日期
export const validateDate = (date: string, fieldName: string = '日期'): string | null => {
  if (!date) {
    return `${fieldName}不能为空`;
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `${fieldName}格式不正确`;
  }
  
  return null;
};

// 验证日期范围
export const validateDateRange = (
  startDate: string,
  endDate: string,
  startLabel: string = '开始日期',
  endLabel: string = '结束日期'
): string | null => {
  const startError = validateDate(startDate, startLabel);
  if (startError) return startError;
  
  const endError = validateDate(endDate, endLabel);
  if (endError) return endError;
  
  if (new Date(startDate) > new Date(endDate)) {
    return `${startLabel}不能晚于${endLabel}`;
  }
  
  return null;
};

// 验证年龄
export const validateAge = (birthDate: string): string | null => {
  const error = validateDate(birthDate, '出生日期');
  if (error) return error;
  
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  
  if (age < 18) {
    return '年龄必须大于18岁';
  }
  if (age > 100) {
    return '年龄不能超过100岁';
  }
  
  return null;
};

// 验证数字范围
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = '数值'
): string | null => {
  if (isNaN(value)) {
    return `${fieldName}必须是数字`;
  }
  if (value < min) {
    return `${fieldName}不能小于${min}`;
  }
  if (value > max) {
    return `${fieldName}不能大于${max}`;
  }
  return null;
};

// 验证必填字段
export const validateRequired = (value: any, fieldName: string = '此字段'): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}不能为空`;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return `${fieldName}不能为空`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName}不能为空`;
  }
  return null;
};

// 验证URL
export const validateUrl = (url: string): string | null => {
  if (!url) {
    return null; // URL可选
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return '请输入有效的URL地址';
  }
};

// 验证文件大小
export const validateFileSize = (file: File, maxSize: number): string | null => {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `文件大小不能超过${maxSizeMB}MB`;
  }
  return null;
};

// 验证文件类型
export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  const fileType = file.type;
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type;
    }
    return fileType === type;
  });
  
  if (!isTypeAllowed) {
    return `不支持的文件类型，仅支持：${allowedTypes.join(', ')}`;
  }
  
  return null;
};
