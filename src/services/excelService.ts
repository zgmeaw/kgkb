/**
 * Excel 文件处理服务
 */

import * as XLSX from 'xlsx';
import { Position, ExcelImportResult } from '@/types';
import { DEFAULT_EXCEL_MAPPING } from '@/constants';
import { generateId } from '@/utils';
import { EducationLevel, DegreeType, PoliticalStatus } from '@/types/user';

class ExcelService {
  // 解析Excel文件
  async parseExcelFile(file: File, announcementId: string): Promise<ExcelImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          const result = this.parseExcelData(jsonData, announcementId);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            successCount: 0,
            failureCount: 0,
            errors: [{ row: 0, message: `文件解析失败: ${error}` }],
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          successCount: 0,
          failureCount: 0,
          errors: [{ row: 0, message: '文件读取失败' }],
        });
      };

      reader.readAsBinaryString(file);
    });
  }

  // 解析Excel数据
  private parseExcelData(data: any[][], announcementId: string): ExcelImportResult {
    if (data.length < 2) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: [{ row: 0, message: 'Excel文件为空或格式不正确' }],
      };
    }

    const headers = data[0] as string[];
    const columnMapping = this.createColumnMapping(headers);
    const positions: Position[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      try {
        const position = this.parseRow(row, columnMapping, announcementId, i + 1);
        if (position) {
          positions.push(position);
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          message: `行解析失败: ${error}`,
        });
      }
    }

    return {
      success: errors.length === 0,
      successCount: positions.length,
      failureCount: errors.length,
      errors,
    };
  }

  // 创建列映射
  private createColumnMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};

    Object.entries(DEFAULT_EXCEL_MAPPING).forEach(([key, value]) => {
      const index = headers.findIndex(h => h && h.trim() === value);
      if (index !== -1) {
        mapping[key] = index;
      }
    });

    return mapping;
  }

  // 解析单行数据
  private parseRow(
    row: any[],
    mapping: Record<string, number>,
    announcementId: string,
    _rowNumber: number
  ): Position | null {
    const getValue = (key: string): string => {
      const index = mapping[key];
      return index !== undefined && row[index] !== undefined ? String(row[index]).trim() : '';
    };

    const code = getValue('code');
    const name = getValue('name');

    if (!code || !name) {
      return null;
    }

    const position: Position = {
      id: generateId('pos'),
      announcementId,
      code,
      name,
      department: getValue('department') || '未知部门',
      category: getValue('category') || '未分类',
      recruitCount: parseInt(getValue('recruitCount')) || 1,
      educationRequirement: this.parseEducationLevel(getValue('educationRequirement')),
      degreeRequirement: this.parseDegreeType(getValue('degreeRequirement')),
      majorRequirement: this.parseArray(getValue('majorRequirement')),
      politicalStatusRequirement: this.parsePoliticalStatusArray(getValue('politicalStatusRequirement')),
      workExperienceRequired: this.parseBoolean(getValue('workExperienceRequired')),
      minAge: parseInt(getValue('minAge')) || undefined,
      maxAge: parseInt(getValue('maxAge')) || undefined,
      workLocation: getValue('workLocation') || '未知',
      responsibilities: getValue('responsibilities') || '详见公告',
      rawData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return position;
  }

  // 解析学历层次
  private parseEducationLevel(value: string): string {
    const mapping: Record<string, string> = {
      '高中': '高中',
      '大专': '大专',
      '本科': '本科',
      '硕士': '硕士',
      '硕士研究生': '硕士',
      '博士': '博士',
      '博士研究生': '博士',
    };
    return mapping[value] || '本科';
  }

  // 解析学位类型
  private parseDegreeType(value: string): string {
    const mapping: Record<string, string> = {
      '无': '无学位',
      '无学位': '无学位',
      '学士': '学士',
      '硕士': '硕士',
      '博士': '博士',
    };
    return mapping[value] || '无学位';
  }

  // 解析政治面貌数组
  private parsePoliticalStatusArray(value: string): string[] {
    if (!value) return [PoliticalStatus.MASSES];

    const mapping: Record<string, PoliticalStatus> = {
      '中共党员': PoliticalStatus.PARTY_MEMBER,
      '党员': PoliticalStatus.PARTY_MEMBER,
      '中共预备党员': PoliticalStatus.PARTY_MEMBER,
      '预备党员': PoliticalStatus.PARTY_MEMBER,
      '共青团员': PoliticalStatus.LEAGUE_MEMBER,
      '团员': PoliticalStatus.LEAGUE_MEMBER,
      '民主党派': PoliticalStatus.DEMOCRATIC_PARTY,
      '群众': PoliticalStatus.MASSES,
    };

    const items = value.split(/[,，、]/).map(s => s.trim());
    const result = items
      .map(item => mapping[item])
      .filter(Boolean) as PoliticalStatus[];

    return result.length > 0 ? result : [PoliticalStatus.MASSES];
  }

  // 解析数组
  private parseArray(value: string): string[] {
    if (!value) return [];
    return value.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
  }

  // 解析布尔值
  private parseBoolean(value: string): boolean {
    const trueValues = ['是', '需要', '要求', 'true', '1', 'yes'];
    return trueValues.includes(value.toLowerCase());
  }

  // 导出岗位数据为Excel
  exportPositionsToExcel(positions: Position[], filename: string = '岗位数据.xlsx'): void {
    const data = positions.map(pos => ({
      [DEFAULT_EXCEL_MAPPING.code]: pos.code,
      [DEFAULT_EXCEL_MAPPING.name]: pos.name,
      [DEFAULT_EXCEL_MAPPING.department]: pos.department,
      [DEFAULT_EXCEL_MAPPING.category]: pos.category,
      [DEFAULT_EXCEL_MAPPING.recruitCount]: pos.recruitCount,
      [DEFAULT_EXCEL_MAPPING.educationRequirement]: pos.educationRequirement,
      [DEFAULT_EXCEL_MAPPING.degreeRequirement]: pos.degreeRequirement,
      [DEFAULT_EXCEL_MAPPING.majorRequirement]: pos.majorRequirement.join('、'),
      [DEFAULT_EXCEL_MAPPING.politicalStatusRequirement]: pos.politicalStatusRequirement.join('、'),
      [DEFAULT_EXCEL_MAPPING.workExperienceRequired]: pos.workExperienceRequired ? '是' : '否',
      [DEFAULT_EXCEL_MAPPING.minAge]: pos.minAge || '',
      [DEFAULT_EXCEL_MAPPING.maxAge]: pos.maxAge || '',
      [DEFAULT_EXCEL_MAPPING.workLocation]: pos.workLocation,
      [DEFAULT_EXCEL_MAPPING.responsibilities]: pos.responsibilities,
      '匹配分数': pos.matchingScore?.toFixed(1) || '',
      '是否匹配': pos.isMatched ? '是' : '否',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '岗位数据');

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 岗位代码
      { wch: 30 }, // 岗位名称
      { wch: 30 }, // 招录部门
      { wch: 15 }, // 岗位类别
      { wch: 10 }, // 招录人数
      { wch: 15 }, // 学历要求
      { wch: 15 }, // 学位要求
      { wch: 30 }, // 专业要求
      { wch: 20 }, // 政治面貌
      { wch: 12 }, // 工作经验
      { wch: 10 }, // 最小年龄
      { wch: 10 }, // 最大年龄
      { wch: 20 }, // 工作地点
      { wch: 40 }, // 岗位职责
      { wch: 10 }, // 匹配分数
      { wch: 10 }, // 是否匹配
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  }

  // 下载Excel模板
  downloadTemplate(): void {
    const templateData = [
      {
        [DEFAULT_EXCEL_MAPPING.code]: '001',
        [DEFAULT_EXCEL_MAPPING.name]: '示例岗位',
        [DEFAULT_EXCEL_MAPPING.department]: '示例部门',
        [DEFAULT_EXCEL_MAPPING.category]: '综合管理类',
        [DEFAULT_EXCEL_MAPPING.recruitCount]: 1,
        [DEFAULT_EXCEL_MAPPING.educationRequirement]: '本科',
        [DEFAULT_EXCEL_MAPPING.degreeRequirement]: '学士',
        [DEFAULT_EXCEL_MAPPING.majorRequirement]: '计算机科学与技术、软件工程',
        [DEFAULT_EXCEL_MAPPING.politicalStatusRequirement]: '中共党员、中共预备党员',
        [DEFAULT_EXCEL_MAPPING.workExperienceRequired]: '否',
        [DEFAULT_EXCEL_MAPPING.minAge]: 18,
        [DEFAULT_EXCEL_MAPPING.maxAge]: 35,
        [DEFAULT_EXCEL_MAPPING.workLocation]: '北京市',
        [DEFAULT_EXCEL_MAPPING.responsibilities]: '负责日常管理工作',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '岗位模板');

    XLSX.writeFile(workbook, '岗位导入模板.xlsx');
  }
}

// 导出单例
export const excelService = new ExcelService();
