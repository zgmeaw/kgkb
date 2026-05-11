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

  useEffect(() => {
    applyFilters();
  }, [positions, keyword, selectedAnnouncement, userProfile]);

  const applyFilters = () => {
    setLoading(true);
    
    let filtered = filterPositions({
      keyword: keyword || undefined,
      announcementId: selectedAnnouncement || undefined,
    });

    // 如果有用户档案，计算匹配度
    if (userProfile) {
      filtered = matchingService.calculateBatchMatchingScores(filtered, userProfile);
      // 按匹配度排序
      filtered.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
    }

    setFilteredPositions(filtered);
    setLoading(false);
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
          <p className="text-gray-600 mt-2">共 {filteredPositions.length} 个岗位</p>
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
          <div className="space-y-4">
            {filteredPositions.map(position => (
              <PositionCard key={position.id} position={position} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
