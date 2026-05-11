/**
 * 云端同步按钮组件
 * 
 * 功能：
 * - 显示上传和下载按钮
 * - 显示加载状态和进度信息
 * - 显示用户友好的错误消息
 * - 支持大数据集的进度显示
 */

import React, { useState } from 'react';
import { Button } from './Button';
import { PasswordModal } from './PasswordModal';
import { Loading } from './Loading';
import { cloudStorageService } from '@/services/cloudStorageService';
import { storageService } from '@/services/storageService';
import { STORAGE_KEYS } from '@/constants';

interface CloudSyncButtonProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * 操作状态类型
 */
type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export function CloudSyncButton({ onSuccess, onError }: CloudSyncButtonProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState<'upload' | 'download'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressStatus, setProgressStatus] = useState('');
  const [operationStatus, setOperationStatus] = useState<OperationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = () => {
    setModalMode('upload');
    setShowPasswordModal(true);
    setError('');
    setProgressStatus('');
    setOperationStatus('idle');
    setStatusMessage('');
  };

  const handleDownload = () => {
    setModalMode('download');
    setShowPasswordModal(true);
    setError('');
    setProgressStatus('');
    setOperationStatus('idle');
    setStatusMessage('');
  };

  /**
   * 获取用户友好的错误消息
   * 
   * 根据错误类型返回对应的用户友好消息：
   * - 网络错误：无法连接到云端存储，正在使用缓存数据
   * - 解密错误：密码不正确，请重试
   * - API错误：云端存储服务暂时不可用，正在使用缓存数据
   * - 认证错误：认证失败，请检查登录状态
   */
  const getUserFriendlyErrorMessage = (error: Error): string => {
    const errorMessage = error.message.toLowerCase();

    // 网络错误 - 按照需求 2.7
    if (
      errorMessage.includes('网络') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('连接') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch')
    ) {
      return '无法连接到云端存储。正在使用缓存数据。';
    }

    // 解密错误 - 按照需求 2.7
    if (errorMessage.includes('解密失败') || errorMessage.includes('密码') || errorMessage.includes('decrypt')) {
      return '密码不正确。请重试。';
    }

    // API 错误 - 按照需求 2.7
    if (
      errorMessage.includes('api') ||
      errorMessage.includes('服务') ||
      errorMessage.includes('unavailable') ||
      errorMessage.includes('配置') ||
      errorMessage.includes('gist') ||
      errorMessage.includes('404') ||
      errorMessage.includes('500')
    ) {
      return '云端存储服务暂时不可用。正在使用缓存数据。';
    }

    // 认证错误
    if (errorMessage.includes('token') || errorMessage.includes('认证') || errorMessage.includes('未配置') || errorMessage.includes('auth')) {
      return '认证失败，请检查您的登录状态。';
    }

    // 默认错误消息
    return error.message || '操作失败，请重试。';
  };

  const handlePasswordSubmit = async (password: string) => {
    setLoading(true);
    setError('');
    setProgressStatus('');
    setOperationStatus('loading');
    setStatusMessage('');

    try {
      if (modalMode === 'upload') {
        // 上传数据到云端
        setProgressStatus('正在准备数据...');
        
        const data = {
          announcements: storageService.get<any[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [],
          positions: storageService.get<any[]>(STORAGE_KEYS.POSITIONS) || [],
          userProfile: storageService.get<any>(STORAGE_KEYS.USER_PROFILE) || null,
          scoreHistory: storageService.get<any[]>(STORAGE_KEYS.SCORE_HISTORY) || [],
          lastUpdated: new Date().toISOString(),
        };

        // 显示数据大小信息（用于大数据集）
        const totalItems = data.announcements.length + data.positions.length;
        if (totalItems > 100) {
          setProgressStatus(`正在准备 ${totalItems} 条数据...`);
        }

        setProgressStatus('正在加密数据...');
        await cloudStorageService.uploadData(data, password);
        
        setProgressStatus('上传完成！');
        setOperationStatus('success');
        const successMessage = '✅ 数据已成功上传到云端！';
        setStatusMessage(successMessage);
        
        // 调用成功回调
        if (onSuccess) {
          onSuccess(successMessage);
        } else {
          alert(successMessage);
        }
        
        // 延迟关闭模态框，让用户看到成功消息
        setTimeout(() => {
          setShowPasswordModal(false);
          setOperationStatus('idle');
        }, 1500);
      } else {
        // 从云端下载数据
        setProgressStatus('正在连接云端存储...');
        
        // 使用 initializeFromCloud 方法，支持进度回调
        const success = await cloudStorageService.initializeFromCloud(
          password,
          (status: string) => {
            setProgressStatus(status);
          }
        );

        if (success) {
          setProgressStatus('恢复完成！');
          setOperationStatus('success');
          const successMessage = '✅ 数据已成功从云端恢复！页面即将刷新。';
          setStatusMessage(successMessage);
          
          // 调用成功回调
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            alert(successMessage);
          }
          
          setShowPasswordModal(false);
          
          // 刷新页面以加载新数据
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error('从云端恢复数据失败');
        }
      }
    } catch (err: any) {
      const friendlyErrorMessage = getUserFriendlyErrorMessage(err);
      setError(friendlyErrorMessage);
      setOperationStatus('error');
      setStatusMessage(friendlyErrorMessage);
      
      // 调用错误回调
      if (onError) {
        onError(friendlyErrorMessage);
      }
      
      console.error('云端同步操作失败:', err);
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
          disabled={loading}
        >
          {loading && modalMode === 'upload' ? (
            <>
              <Loading size="sm" />
              <span>上传中...</span>
            </>
          ) : (
            <>
              <span>☁️</span>
              <span>备份到云端</span>
            </>
          )}
        </Button>

        {hasCloudData && (
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            className="flex items-center space-x-2"
            disabled={loading}
          >
            {loading && modalMode === 'download' ? (
              <>
                <Loading size="sm" />
                <span>下载中...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>从云端恢复</span>
              </>
            )}
          </Button>
        )}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          if (!loading) {
            setShowPasswordModal(false);
            setProgressStatus('');
            setError('');
            setOperationStatus('idle');
            setStatusMessage('');
          }
        }}
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

      {/* 进度指示器 - 显示加载状态 */}
      {loading && progressStatus && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Loading size="sm" />
          <span>{progressStatus}</span>
        </div>
      )}

      {/* 成功消息显示 */}
      {operationStatus === 'success' && statusMessage && !loading && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 错误消息显示 - 用户友好的错误提示 */}
      {operationStatus === 'error' && statusMessage && !loading && (
        <div className="mt-3 flex items-start space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">{statusMessage}</p>
            {statusMessage.includes('缓存数据') && (
              <p className="mt-1 text-xs text-red-600">
                您可以继续使用本地缓存的数据。请稍后重试同步操作。
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
