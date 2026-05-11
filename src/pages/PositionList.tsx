/**
 * 岗位列表页面
 */

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/Layout';
import { Button, Input, Select, Card, Loading } from '@/components/common';
import { PositionCard, ExcelUploader } from '@/components/position';
import { usePositions, useAnnouncements, useUserProfile } from '@/contexts';
import { useToast } from '@/hooks';
import { matchingService } from '@/services';
import { Position } from '@/types';

export function PositionList() {
  const { positions, addPositions, filterPositions } = usePositions();
  const { announcements } = useAnnouncements();
  const { userProfile } = useUserProfile();
  const { success, error } = useToast();

  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 从 URL 参数读取公告 ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const announcementId = urlParams.get('announcement');
    if (announcementId) {
      setSelectedAnnouncement(announcementId);
      console.log(`📋 从 URL 参数加载公告: ${announcementId}`);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [positions, keyword, selectedAnnouncement, userProfile]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedAnnouncement, pageSize]);

  const applyFilters = () => {
    setLoading(true);
    
    console.log(`🔍 开始筛选岗位 - 总数: ${positions.length}, 关键词: "${keyword}", 公告: ${selectedAnnouncement || '全部'}`);
    
    let filtered = filterPositions({
      keyword: keyword || undefined,
      announcementId: selectedAnnouncement || undefined,
    });

    console.log(`✅ 筛选后岗位数: ${filtered.length}`);

    // 如果有用户档案，计算匹配度
    if (userProfile) {
      filtered = matchingService.calculateBatchMatchingScores(filtered, userProfile);
      // 按匹配度排序
      filtered.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
      console.log(`📊 已计算匹配度并排序`);
    }

    setFilteredPositions(filtered);
    setLoading(false);
  };

  // Calculate pagination
  const totalItems = filteredPositions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const visiblePositions = filteredPositions.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page and surrounding pages
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleUploadSuccess = (newPositions: Position[]) => {
    console.log('📥 准备添加岗位:', newPositions.length, '个');
    console.log('📊 岗位数据:', newPositions);
    addPositions(newPositions);
    success(`成功导入 ${newPositions.length} 个岗位，数据将自动备份到云端`);
    setShowUploader(false);
  };

  const handleUploadError = (errorMsg: string) => {
    error(errorMsg);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">岗位列表</h1>
          <p className="text-gray-600 mt-2">
            共 {totalItems} 个岗位
            {totalItems > 0 && ` (显示 ${startIndex + 1}-${endIndex} 条)`}
          </p>
        </div>

        {/* 筛选和操作栏 */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="搜索岗位名称、部门或代码"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                fullWidth
              />
              <Select
                value={selectedAnnouncement}
                onChange={(e) => setSelectedAnnouncement(e.target.value)}
                options={[
                  { label: '全部公告', value: '' },
                  ...announcements.map(ann => ({ label: ann.title, value: ann.id })),
                ]}
                fullWidth
              />
              <Button onClick={() => setShowUploader(!showUploader)} fullWidth>
                {showUploader ? '关闭上传' : '导入岗位'}
              </Button>
            </div>

            {showUploader && selectedAnnouncement && (
              <div className="pt-4 border-t">
                <ExcelUploader
                  announcementId={selectedAnnouncement}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>
            )}

            {showUploader && !selectedAnnouncement && (
              <div className="pt-4 border-t">
                <p className="text-sm text-orange-600">请先选择一个公告，然后再导入岗位数据</p>
              </div>
            )}
          </div>
        </Card>

        {/* 岗位列表 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="加载中..." />
          </div>
        ) : filteredPositions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">暂无岗位数据</p>
              <p className="text-sm text-gray-400 mt-2">请先添加公告，然后导入岗位信息</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {visiblePositions.map(position => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Card className="mt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">每页显示:</span>
                    <Select
                      value={pageSize.toString()}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      options={[
                        { label: '25 条', value: '25' },
                        { label: '50 条', value: '50' },
                        { label: '100 条', value: '100' },
                      ]}
                    />
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      variant="secondary"
                      size="sm"
                    >
                      上一页
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="px-2 text-gray-400">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(page as number)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      variant="secondary"
                      size="sm"
                    >
                      下一页
                    </Button>
                  </div>

                  {/* Page info */}
                  <div className="text-sm text-gray-600">
                    第 {currentPage} / {totalPages} 页
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
