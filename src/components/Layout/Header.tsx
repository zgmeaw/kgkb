/**
 * 页面头部组件 - 现代化设计
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { CloudSyncButton } from '@/components/common/CloudSyncButton';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/announcements', label: '公告管理', icon: '📢' },
    { path: '/positions', label: '岗位列表', icon: '📋' },
    { path: '/profile', label: '个人档案', icon: '👤' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userPassword');
      navigate('/login');
    }
  };

  return (
    <header className="glass-effect sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="text-3xl mr-3 transform group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {APP_NAME}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            {/* Cloud Sync */}
            <div className="ml-4">
              <CloudSyncButton />
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-2 px-6 py-3 rounded-xl font-medium text-white hover:bg-white/20 transition-all"
            >
              <span className="mr-2">🚪</span>
              退出
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 animate-slide-in">
            <div className="space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-6 py-3 rounded-xl font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              <div className="px-6 py-3">
                <CloudSyncButton />
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-6 py-3 rounded-xl font-medium text-white hover:bg-white/20 transition-all"
              >
                <span className="mr-2">🚪</span>
                退出登录
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
