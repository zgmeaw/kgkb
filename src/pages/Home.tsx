/**
 * 首页 - 现代化设计
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Layout';
import { Button } from '@/components/common';
import { useAnnouncements, usePositions, useUserProfile } from '@/contexts';
import { APP_NAME } from '@/constants';

export function Home() {
  const navigate = useNavigate();
  const { announcements } = useAnnouncements();
  const { positions } = usePositions();
  const { hasProfile } = useUserProfile();

  const stats = {
    announcements: announcements.length,
    positions: positions.length,
    matched: positions.filter(p => p.isMatched).length,
  };

  const features = [
    {
      title: '公告管理',
      description: '管理和查看各类公考招录公告信息',
      icon: '📢',
      gradient: 'from-blue-500 to-cyan-500',
      action: () => navigate('/announcements'),
    },
    {
      title: '岗位分析',
      description: '智能分析岗位要求，找到最适合的岗位',
      icon: '🎯',
      gradient: 'from-purple-500 to-pink-500',
      action: () => navigate('/positions'),
    },
    {
      title: '个人档案',
      description: '完善个人信息，获得精准的岗位匹配',
      icon: '👤',
      gradient: 'from-green-500 to-teal-500',
      action: () => navigate('/profile'),
    },
    {
      title: '数据导出',
      description: '导出分析结果，方便后续查看和分享',
      icon: '📊',
      gradient: 'from-orange-500 to-red-500',
      action: () => navigate('/export'),
    },
  ];

  return (
    <div className="min-h-screen">
      <Container className="py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-4">🎓</div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {APP_NAME}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            智能化公考岗位分析，助您找到最适合的岗位
          </p>
          {!hasProfile ? (
            <button
              onClick={() => navigate('/profile')}
              className="btn-gradient text-lg px-10 py-4 animate-scale-in"
            >
              🚀 立即创建个人档案
            </button>
          ) : (
            <button
              onClick={() => navigate('/positions')}
              className="btn-gradient text-lg px-10 py-4 animate-scale-in"
            >
              🎯 查看岗位匹配
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm font-medium mb-2">招录公告</div>
                <div className="text-4xl font-bold">{stats.announcements}</div>
              </div>
              <div className="text-5xl opacity-50">📢</div>
            </div>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm font-medium mb-2">岗位数量</div>
                <div className="text-4xl font-bold">{stats.positions}</div>
              </div>
              <div className="text-5xl opacity-50">📋</div>
            </div>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm font-medium mb-2">匹配岗位</div>
                <div className="text-4xl font-bold">{stats.matched}</div>
              </div>
              <div className="text-5xl opacity-50">✨</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={feature.action}
              className="card-modern p-8 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className="text-center">
                <div className={`text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                <div className={`mt-6 h-1 w-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div className="card-modern p-10 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-3xl font-bold text-center mb-10 text-gradient">
            快速开始指南
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-2">创建个人档案</h4>
              <p className="text-sm text-gray-600">填写您的学历、专业、工作经验等信息</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-2">添加招录公告</h4>
              <p className="text-sm text-gray-600">录入或导入您关注的公考招录公告</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-2">导入岗位数据</h4>
              <p className="text-sm text-gray-600">使用Excel批量导入岗位信息</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h4 className="font-bold text-gray-900 mb-2">查看匹配结果</h4>
              <p className="text-sm text-gray-600">系统自动计算匹配度，推荐最适合的岗位</p>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center text-white animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">智能匹配</h3>
            <p className="text-white/80">多维度智能算法，精准推荐最适合的岗位</p>
          </div>
          <div className="text-center text-white animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">数据分析</h3>
            <p className="text-white/80">全面的岗位数据分析，助您做出明智选择</p>
          </div>
          <div className="text-center text-white animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">本地存储</h3>
            <p className="text-white/80">数据本地保存，隐私安全有保障</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
