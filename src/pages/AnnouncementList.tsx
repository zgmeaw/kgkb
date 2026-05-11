/**
 * 公告列表页面 - 现代化设计
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Layout';
import { Button, Input, Modal } from '@/components/common';
import { useAnnouncements } from '@/contexts';
import { useToast } from '@/hooks';
import { AnnouncementType, AnnouncementStatus } from '@/types';
import { formatDate } from '@/utils';

export function AnnouncementList() {
  const navigate = useNavigate();
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { success } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: AnnouncementType.NATIONAL as string,
    organization: '',
    publishDate: '',
    registrationStart: '',
    registrationEnd: '',
    examDate: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addAnnouncement({
      title: formData.title,
      organization: formData.organization,
      announcementUrl: '',
      type: formData.type,
      status: AnnouncementStatus.PUBLISHED,
      publishDate: new Date(formData.publishDate),
      registrationStartDate: new Date(formData.registrationStart),
      registrationEndDate: new Date(formData.registrationEnd),
      admitCardPrintDate: new Date(formData.registrationEnd),
      examDate: new Date(formData.examDate || formData.registrationEnd),
      requirements: [],
    });

    success('公告创建成功，数据将自动备份到云端');
    setShowModal(false);
    setFormData({
      title: '',
      type: AnnouncementType.NATIONAL as string,
      organization: '',
      publishDate: '',
      registrationStart: '',
      registrationEnd: '',
      examDate: '',
      description: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个公告吗？')) {
      deleteAnnouncement(id);
      success('公告已删除，数据将自动备份到云端');
    }
  };

  const getStatusBadge = (status: AnnouncementStatus) => {
    const badges = {
      [AnnouncementStatus.NOT_STARTED]: { label: '未开始', color: 'gray', icon: '📝' },
      [AnnouncementStatus.PUBLISHED]: { label: '已发布', color: 'blue', icon: '📢' },
      [AnnouncementStatus.ONGOING]: { label: '进行中', color: 'green', icon: '🔥' },
      [AnnouncementStatus.REGISTRATION_OPEN]: { label: '报名中', color: 'green', icon: '🚀' },
      [AnnouncementStatus.REGISTRATION_CLOSED]: { label: '报名结束', color: 'yellow', icon: '⏰' },
      [AnnouncementStatus.EXAM_IN_PROGRESS]: { label: '考试中', color: 'orange', icon: '📝' },
      [AnnouncementStatus.COMPLETED]: { label: '已结束', color: 'gray', icon: '✅' },
      [AnnouncementStatus.ADMIT_CARD_AVAILABLE]: { label: '准考证打印', color: 'blue', icon: '🎫' },
    };
    return badges[status] || badges[AnnouncementStatus.NOT_STARTED];
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string; icon: string }> = {
      [AnnouncementType.NATIONAL]: { label: '国考', color: 'purple', icon: '🏛️' },
      [AnnouncementType.PROVINCIAL]: { label: '省考', color: 'indigo', icon: '🏢' },
      [AnnouncementType.CIVIL_SERVICE]: { label: '公务员', color: 'blue', icon: '🏛️' },
      [AnnouncementType.PUBLIC_INSTITUTION]: { label: '事业编', color: 'teal', icon: '🏫' },
      [AnnouncementType.STATE_OWNED_ENTERPRISE]: { label: '国企', color: 'cyan', icon: '🏭' },
      [AnnouncementType.OTHER]: { label: '其他', color: 'gray', icon: '📋' },
    };
    return badges[type] || badges[AnnouncementType.OTHER];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <Container>
        {/* 页面头部 */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">📢 公告管理</h1>
              <p className="text-gray-600">
                共 <span className="font-semibold text-purple-600">{announcements.length}</span> 个公告
                {announcements.length > 0 && (
                  <span className="ml-2 text-sm">
                    · 数据已自动备份到云端 ☁️
                  </span>
                )}
              </p>
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              className="btn-gradient shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              size="lg"
            >
              <span className="mr-2">➕</span>
              创建公告
            </Button>
          </div>
        </div>

        {/* 公告列表 */}
        {announcements.length === 0 ? (
          <div className="card-modern p-16 text-center animate-scale-in">
            <div className="text-8xl mb-6">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">暂无公告</h3>
            <p className="text-gray-600 mb-8">创建您的第一个公告，开始管理招录信息</p>
            <Button 
              onClick={() => setShowModal(true)}
              className="btn-gradient"
              size="lg"
            >
              <span className="mr-2">➕</span>
              创建第一个公告
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {announcements.map((announcement, index) => {
              const statusBadge = getStatusBadge(announcement.status);
              const typeBadge = getTypeBadge(announcement.type);
              
              return (
                <div
                  key={announcement.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer animate-slide-in border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/announcements/${announcement.id}`)}
                >
                  {/* 渐变背景装饰 */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 -z-0" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-0" />
                  
                  <div className="relative z-10 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* 左侧内容 */}
                      <div className="flex-1 space-y-5">
                        {/* 标题和徽章 */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md">
                              <span className="text-base">{typeBadge.icon}</span>
                              {typeBadge.label}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md">
                              <span className="text-base">{statusBadge.icon}</span>
                              {statusBadge.label}
                            </span>
                          </div>
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300 leading-tight">
                            {announcement.title}
                          </h3>
                        </div>

                        {/* 组织单位 */}
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl shadow-md">
                            🏢
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">招录单位</div>
                            <div className="text-base font-bold text-gray-900">{announcement.organization}</div>
                          </div>
                        </div>

                        {/* 时间信息 - 卡片式设计 */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">📅</span>
                              <div className="text-xs font-semibold text-blue-700">发布日期</div>
                            </div>
                            <div className="text-sm font-bold text-gray-900">{formatDate(announcement.publishDate)}</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🚀</span>
                              <div className="text-xs font-semibold text-green-700">报名开始</div>
                            </div>
                            <div className="text-sm font-bold text-gray-900">{formatDate(announcement.registrationStartDate)}</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">⏰</span>
                              <div className="text-xs font-semibold text-orange-700">报名截止</div>
                            </div>
                            <div className="text-sm font-bold text-gray-900">{formatDate(announcement.registrationEndDate)}</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">📊</span>
                              <div className="text-xs font-semibold text-purple-700">岗位数量</div>
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {announcement.positionCount || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 右侧操作按钮 */}
                      <div className="flex lg:flex-col gap-3 lg:items-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(announcement.id);
                          }}
                          className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                          <span className="text-lg group-hover/btn:rotate-12 transition-transform">🗑️</span>
                          <span>删除</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/positions?announcement=${announcement.id}`);
                          }}
                          className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                          <span className="text-lg group-hover/btn:scale-110 transition-transform">📋</span>
                          <span>查看岗位</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 底部装饰线 */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              );
            })}
          </div>
        )}

        {/* 创建公告模态框 */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="创建公告"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📝</span>
                基本信息
              </h3>
              
              <Input
                label="公告标题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：2024年国家公务员考试公告"
                required
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公告类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-modern"
                    required
                  >
                    {Object.values(AnnouncementType).map(type => {
                      const badge = getTypeBadge(type);
                      return (
                        <option key={type} value={type}>
                          {badge.icon} {badge.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <Input
                  label="组织单位"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="例如：国家公务员局"
                  required
                  fullWidth
                />
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">⏰</span>
                时间安排
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="发布日期"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  required
                  fullWidth
                />
                <Input
                  label="考试日期"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="报名开始"
                  type="date"
                  value={formData.registrationStart}
                  onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                  required
                  fullWidth
                />
                <Input
                  label="报名截止"
                  type="date"
                  value={formData.registrationEnd}
                  onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                  required
                  fullWidth
                />
              </div>
            </div>

            {/* 公告描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">📄</span>
                公告描述（可选）
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-modern min-h-[100px]"
                placeholder="输入公告的详细描述..."
                rows={4}
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowModal(false)}
              >
                取消
              </Button>
              <Button type="submit" className="btn-gradient">
                <span className="mr-2">✨</span>
                创建公告
              </Button>
            </div>
          </form>
        </Modal>
      </Container>
    </div>
  );
}
