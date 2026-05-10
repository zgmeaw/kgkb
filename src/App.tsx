/**
 * 应用主组件
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useToast } from './hooks';

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
