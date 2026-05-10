/**
 * Excel 文件上传组件
 */

import React, { useRef, useState } from 'react';
import { Button } from '@/components/common';
import { excelService } from '@/services';
import { FILE_LIMITS } from '@/constants';
import { validateFileSize, validateFileType } from '@/utils';

interface ExcelUploaderProps {
  announcementId: string;
  onUploadSuccess: (positions: any[]) => void;
  onUploadError: (error: string) => void;
}

export function ExcelUploader({ announcementId, onUploadSuccess, onUploadError }: ExcelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const sizeError = validateFileSize(file, FILE_LIMITS.MAX_SIZE);
    if (sizeError) {
      onUploadError(sizeError);
      return;
    }

    const typeError = validateFileType(file, FILE_LIMITS.ALLOWED_TYPES);
    if (typeError) {
      onUploadError(typeError);
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      const result = await excelService.parseExcelFile(file, announcementId);

      if (result.errors.length > 0) {
        const errorMsg = `导入完成，但有 ${result.failureCount} 条记录失败。\n${result.errors.slice(0, 3).map(e => `第${e.row}行: ${e.message}`).join('\n')}`;
        onUploadError(errorMsg);
      }

      if (result.positions.length > 0) {
        onUploadSuccess(result.positions);
      } else {
        onUploadError('未能解析到有效的岗位数据');
      }
    } catch (error) {
      onUploadError(`文件解析失败: ${error}`);
    } finally {
      setUploading(false);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    excelService.downloadTemplate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          loading={uploading}
        >
          {uploading ? '上传中...' : '选择Excel文件'}
        </Button>

        <Button variant="secondary" onClick={handleDownloadTemplate}>
          下载模板
        </Button>
      </div>

      {fileName && (
        <p className="text-sm text-gray-600">
          已选择文件: <span className="font-medium">{fileName}</span>
        </p>
      )}

      <div className="text-sm text-gray-500">
        <p>支持的文件格式: .xls, .xlsx</p>
        <p>最大文件大小: 10MB</p>
      </div>
    </div>
  );
}
