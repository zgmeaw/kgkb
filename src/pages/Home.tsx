/**
 * 首页
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Layout';
import { Button, Card } from '@/components/common';
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
      action: () => navigate('/announcements'),
    },
    {
      title: '岗位分析',
      description: '智能分析岗位要求，找到最适合的岗位',
      icon: '🎯',
      action: () => navigate('/positions'),
    },
    {
      title: '个人档案',
      description: '完善个人信息，获得精准的岗位匹配',
      icon: '👤',
      action: () => navigate('/profile'),
    },
    {
      title: '数据导出',
      description: '导出分析结果，方便后续查看和分享',
      icon: '📊',
      action: () => navigate('/export'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{APP_NAME}</h1>
          <p className="text-xl text-gray-600 mb-8">
            智能化公考岗位分析，助您找到最适合的岗位
          </p>
          {!hasProfile && (
            <Button size="lg" onClick={() => navigate('/profile')}>
              立即创建个人档案
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.announcements}</div>
              <div className="text-sm text-gray-600 mt-2">招录公告</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.positions}</div>
              <div className="text-sm text-gray-600 mt-2">岗位数量</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.matched}</div>
              <div className="text-sm text-gray-600 mt-2">匹配岗位</div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hoverable onClick={feature.action}>
              <div className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12">
          <Card title="快速开始">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">创建个人档案</h4>
                  <p className="text-sm text-gray-600">填写您的学历、专业、工作经验等信息</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">添加招录公告</h4>
                  <p className="text-sm text-gray-600">录入或导入您关注的公考招录公告</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">导入岗位数据</h4>
                  <p className="text-sm text-gray-600">使用Excel批量导入岗位信息</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">查看匹配结果</h4>
                  <p className="text-sm text-gray-600">系统自动计算匹配度，推荐最适合的岗位</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
