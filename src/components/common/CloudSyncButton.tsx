/**
 * 云端同步按钮组件
 */

import React, { useState } from 'react';
import { Button } from './Button';
import { PasswordModal } from './PasswordModal';
import { cloudStorageService } from '@/services/cloudStorageService';
import { storageService } from '@/services/storageService';
import { STORAGE_KEYS } from '@/constants';

export function CloudSyncButton() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState<'upload' | 'download'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = () => {
    setModalMode('upload');
    setShowPasswordModal(true);
    setError('');
  };

  const handleDownload = () => {
    setModalMode('download');
    setShowPasswordModal(true);
    setError('');
  };

  const handlePasswordSubmit = async (password: string) => {
    setLoading(true);
    setError('');

    try {
      if (modalMode === 'upload') {
        // 上传数据到云端
        const data = {
          announcements: storageService.get<any[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [],
          positions: storageService.get<any[]>(STORAGE_KEYS.POSITIONS) || [],
          userProfile: storageService.get<any>(STORAGE_KEYS.USER_PROFILE) || null,
          scoreHistory: storageService.get<any[]>(STORAGE_KEYS.SCORE_HISTORY) || [],
          lastUpdated: new Date().toISOString(),
        };

        await cloudStorageService.uploadData(data, password);
        alert('✅ 数据已成功上传到云端！');
        setShowPasswordModal(false);
      } else {
        // 从云端下载数据
        const data = await cloudStorageService.downloadData(password);

        // 保存到本地
        storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, data.announcements);
        storageService.set(STORAGE_KEYS.POSITIONS, data.positions);
        storageService.set(STORAGE_KEYS.USER_PROFILE, data.userProfile);
        storageService.set(STORAGE_KEYS.SCORE_HISTORY, data.scoreHistory);

        alert('✅ 数据已成功从云端恢复！请刷新页面查看。');
        setShowPasswordModal(false);
        
        // 刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const hasCloudData = cloudStorageService.hasCloudData();

  return (
    <>
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleUpload}
          variant="secondary"
          size="sm"
          className="flex items-center space-x-2"
        >
          <span>☁️</span>
          <span>备份到云端</span>
        </Button>

        {hasCloudData && (
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>📥</span>
            <span>从云端恢复</span>
          </Button>
        )}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        title={modalMode === 'upload' ? '备份到云端' : '从云端恢复'}
        description={
          modalMode === 'upload'
            ? '请设置一个密码来加密您的数据'
            : '请输入您之前设置的密码'
        }
        loading={loading}
        error={error}
      />
    </>
  );
}
