/**
 * 应用主组件
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Loading } from './components/common/Loading';
import { useToast } from './hooks';
import { autoBackupService, cloudStorageService } from './services';

// Pages
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { AnnouncementList } from './pages/AnnouncementList';
import { PositionList } from './pages/PositionList';
import { UserProfile } from './pages/UserProfile';

// Contexts
import { UserProfileProvider } from './contexts/UserProfileContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import { PositionProvider } from './contexts/PositionContext';

function AppContent() {
  const { toasts, removeToast } = useToast();
  const [isLoadingCloudData, setIsLoadingCloudData] = useState(true);
  const [cloudInitError, setCloudInitError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('初始化应用...');

  // 初始化云端数据和自动备份服务
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 检查用户是否已登录
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const userPassword = sessionStorage.getItem('userPassword');
        const githubToken = localStorage.getItem('github_token');

        // 如果用户已登录且有密码和 GitHub Token，尝试从云端初始化数据
        if (isLoggedIn && userPassword && githubToken) {
          setLoadingStatus('正在从云端恢复数据...');
          
          try {
            const success = await cloudStorageService.initializeFromCloud(
              userPassword,
              (status) => {
                setLoadingStatus(status);
              }
            );

            if (success) {
              console.log('✅ 云端数据初始化成功');
              setLoadingStatus('数据加载完成');
            } else {
              console.log('ℹ️ 未找到云端数据或初始化失败，使用本地数据');
              setLoadingStatus('使用本地数据');
            }
          } catch (error) {
            // 云端初始化失败，但不阻止应用启动
            console.warn('云端数据初始化失败，将使用本地缓存数据:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            setCloudInitError(`云端数据加载失败: ${errorMessage}`);
            setLoadingStatus('使用本地缓存数据');
          }
        } else {
          setLoadingStatus('准备就绪');
        }

        // 初始化自动备份服务
        autoBackupService.init();
      } catch (error) {
        console.error('应用初始化失败:', error);
        setCloudInitError('应用初始化失败');
      } finally {
        // 延迟一小段时间以显示最终状态
        setTimeout(() => {
          setIsLoadingCloudData(false);
        }, 500);
      }
    };

    initializeApp();

    return () => {
      autoBackupService.cleanup();
    };
  }, []);

  // 如果正在加载云端数据，显示加载指示器
  if (isLoadingCloudData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="card-modern p-12 max-w-md text-center animate-scale-in">
          <div className="text-6xl mb-6">☁️</div>
          <Loading size="lg" text={loadingStatus} />
          {cloudInitError && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800 flex items-center justify-center">
                <span className="mr-2">⚠️</span>
                {cloudInitError}
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                将使用本地缓存数据继续
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页面 - 不需要保护 */}
        <Route path="/login" element={<Login />} />

        {/* 受保护的路由 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/announcements" element={<AnnouncementList />} />
                    <Route path="/positions" element={<PositionList />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <ToastContainer toasts={toasts} onClose={removeToast} />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center card-modern p-12 max-w-md animate-scale-in">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">页面未找到</p>
        <a href="/" className="btn-gradient inline-block">
          返回首页
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProfileProvider>
      <AnnouncementProvider>
        <PositionProvider>
          <AppContent />
        </PositionProvider>
      </AnnouncementProvider>
    </UserProfileProvider>
  );
}
