/**
 * 公告列表页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Layout';
import { Button, Card, Input, Modal } from '@/components/common';
import { useAnnouncements } from '@/contexts';
import { useToast } from '@/hooks';
import { AnnouncementType, AnnouncementStatus } from '@/types';
import { formatDate, formatAnnouncementStatus } from '@/utils';

export function AnnouncementList() {
  const navigate = useNavigate();
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { success } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: AnnouncementType.NATIONAL,
    organization: '',
    publishDate: '',
    registrationStart: '',
    registrationEnd: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addAnnouncement({
      ...formData,
      status: AnnouncementStatus.PUBLISHED,
      requirements: [],
      createdBy: 'user',
    });

    success('公告创建成功');
    setShowModal(false);
    setFormData({
      title: '',
      type: AnnouncementType.NATIONAL,
      organization: '',
      publishDate: '',
      registrationStart: '',
      registrationEnd: '',
      description: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个公告吗？')) {
      deleteAnnouncement(id);
      success('公告已删除');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">公告管理</h1>
            <p className="text-gray-600 mt-2">共 {announcements.length} 个公告</p>
          </div>
          <Button onClick={() => setShowModal(true)}>创建公告</Button>
        </div>

        {announcements.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">暂无公告</p>
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                创建第一个公告
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => {
              const statusInfo = formatAnnouncementStatus(announcement.status);
              return (
                <Card
                  key={announcement.id}
                  hoverable
                  onClick={() => navigate(`/announcements/${announcement.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                          {statusInfo.label}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {announcement.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{announcement.organization}</p>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">发布日期：</span>
                          <span>{formatDate(announcement.publishDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">报名开始：</span>
                          <span>{formatDate(announcement.registrationStart)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">报名结束：</span>
                          <span>{formatDate(announcement.registrationEnd)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">岗位数量：</span>
                          <span className="font-medium">{announcement.positionCount}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(announcement.id);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="公告标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公告类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {Object.values(AnnouncementType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <Input
                label="组织单位"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                required
                fullWidth
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="发布日期"
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                required
                fullWidth
              />
              <Input
                label="报名开始"
                type="date"
                value={formData.registrationStart}
                onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                required
                fullWidth
              />
              <Input
                label="报名结束"
                type="date"
                value={formData.registrationEnd}
                onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                required
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公告描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button type="submit">创建</Button>
            </div>
          </form>
        </Modal>
      </Container>
    </div>
  );
}
