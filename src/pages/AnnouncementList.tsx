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
                  className="card-modern hover:shadow-2xl transition-all duration-300 cursor-pointer group animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/announcements/${announcement.id}`)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* 左侧内容 */}
                    <div className="flex-1 space-y-4">
                      {/* 标题和徽章 */}
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${typeBadge.color}-100 text-${typeBadge.color}-700 flex items-center gap-1`}>
                            <span>{typeBadge.icon}</span>
                            {typeBadge.label}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${statusBadge.color}-100 text-${statusBadge.color}-700 flex items-center gap-1`}>
                            <span>{statusBadge.icon}</span>
                            {statusBadge.label}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {announcement.title}
                        </h3>
                      </div>

                      {/* 组织单位 */}
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">🏢</span>
                        <span className="font-medium">{announcement.organization}</span>
                      </div>

                      {/* 时间信息 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">📅</span>
                          <div>
                            <div className="text-xs text-gray-500">发布日期</div>
                            <div className="font-medium text-gray-900">{formatDate(announcement.publishDate)}</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">🚀</span>
                          <div>
                            <div className="text-xs text-gray-500">报名开始</div>
                            <div className="font-medium text-gray-900">{formatDate(announcement.registrationStartDate)}</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">⏰</span>
                          <div>
                            <div className="text-xs text-gray-500">报名截止</div>
                            <div className="font-medium text-gray-900">{formatDate(announcement.registrationEndDate)}</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">📊</span>
                          <div>
                            <div className="text-xs text-gray-500">岗位数量</div>
                            <div className="font-medium text-purple-600 text-lg">{announcement.positionCount || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex lg:flex-col gap-3">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(announcement.id);
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        <span className="mr-1">🗑️</span>
                        删除
                      </Button>
                    </div>
                  </div>
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
