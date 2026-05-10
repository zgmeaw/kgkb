/**
 * 应用主组件
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import { ToastContainer } from './components/common/Toast';
import { useToast } from './hooks';

// Pages
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
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">页面未找到</p>
        <a href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
