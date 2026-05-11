/**
 * 用户档案页面
 */

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/Layout';
import { Button, Input, Select, Card } from '@/components/common';
import { useUserProfile } from '@/contexts';
import { UserProfile as UserProfileType, EducationLevel, DegreeType, PoliticalStatus } from '@/types';
import { generateId, calculateAge, validateName, validateEmail, validatePhone, formatDateForInput } from '@/utils';
import { useToast } from '@/hooks';

export function UserProfile() {
  const { userProfile, setUserProfile } = useUserProfile();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState<Partial<UserProfileType>>({
    name: '',
    gender: '男',
    birthDate: undefined,
    educationLevel: EducationLevel.BACHELOR,
    degree: DegreeType.BACHELOR,
    major: '',
    graduationDate: undefined,
    school: '',
    politicalStatus: PoliticalStatus.MASSES,
    hasWorkExperience: false,
    workYears: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name || '');
    if (nameError) newErrors.name = nameError;

    if (!formData.birthDate) {
      newErrors.birthDate = '请选择出生日期';
    }

    if (!formData.major) {
      newErrors.major = '请输入专业';
    }

    if (!formData.school) {
      newErrors.school = '请输入毕业院校';
    }

    if (!formData.graduationDate) {
      newErrors.graduationDate = '请选择毕业日期';
    }

    if (formData.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (formData.phoneNumber) {
      const phoneError = validatePhone(formData.phoneNumber);
      if (phoneError) newErrors.phoneNumber = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      error('请检查表单填写');
      return;
    }

    const age = calculateAge(formData.birthDate!);
    const profile: UserProfileType = {
      id: userProfile?.id || generateId('user'),
      name: formData.name!,
      gender: formData.gender as '男' | '女',
      birthDate: formData.birthDate!,
      age,
      educationLevel: formData.educationLevel!,
      degree: formData.degree!,
      major: formData.major!,
      graduationDate: formData.graduationDate!,
      school: formData.school!,
      politicalStatus: formData.politicalStatus!,
      hasWorkExperience: formData.hasWorkExperience!,
      workYears: formData.workYears!,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      currentPosition: formData.currentPosition,
      workDescription: formData.workDescription,
      createdAt: userProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    setUserProfile(profile);
    success('个人档案保存成功');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container maxWidth="lg">
        <Card title="个人档案" subtitle="完善您的个人信息，获得精准的岗位匹配">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="姓名"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                  fullWidth
                />
                <Select
                  label="性别"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  options={[
                    { label: '男', value: '男' },
                    { label: '女', value: '女' },
                  ]}
                  required
                  fullWidth
                />
                <Input
                  label="出生日期"
                  type="date"
                  value={formatDateForInput(formData.birthDate)}
                  onChange={(e) => handleChange('birthDate', e.target.value ? new Date(e.target.value) : undefined)}
                  error={errors.birthDate}
                  required
                  fullWidth
                />
                <Input
                  label="手机号"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                  fullWidth
                />
                <Input
                  label="邮箱"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  fullWidth
                />
                <Input
                  label="地址"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  fullWidth
                />
              </div>
            </div>

            {/* 教育信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">教育信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="学历层次"
                  value={formData.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value)}
                  options={Object.values(EducationLevel).map(v => ({ label: v, value: v }))}
                  required
                  fullWidth
                />
                <Select
                  label="学位"
                  value={formData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  options={Object.values(DegreeType).map(v => ({ label: v, value: v }))}
                  required
                  fullWidth
                />
                <Input
                  label="专业"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  error={errors.major}
                  required
                  fullWidth
                />
                <Input
                  label="毕业院校"
                  value={formData.school}
                  onChange={(e) => handleChange('school', e.target.value)}
                  error={errors.school}
                  required
                  fullWidth
                />
                <Input
                  label="毕业日期"
                  type="date"
                  value={formatDateForInput(formData.graduationDate)}
                  onChange={(e) => handleChange('graduationDate', e.target.value ? new Date(e.target.value) : undefined)}
                  error={errors.graduationDate}
                  required
                  fullWidth
                />
                <Select
                  label="政治面貌"
                  value={formData.politicalStatus}
                  onChange={(e) => handleChange('politicalStatus', e.target.value)}
                  options={Object.values(PoliticalStatus).map(v => ({ label: v, value: v }))}
                  required
                  fullWidth
                />
              </div>
            </div>

            {/* 工作信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">工作信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="是否有工作经验"
                  value={formData.hasWorkExperience ? 'true' : 'false'}
                  onChange={(e) => handleChange('hasWorkExperience', e.target.value === 'true')}
                  options={[
                    { label: '是', value: 'true' },
                    { label: '否', value: 'false' },
                  ]}
                  required
                  fullWidth
                />
                {formData.hasWorkExperience && (
                  <>
                    <Input
                      label="工作年限"
                      type="number"
                      min="0"
                      value={formData.workYears}
                      onChange={(e) => handleChange('workYears', parseInt(e.target.value) || 0)}
                      fullWidth
                    />
                    <Input
                      label="当前职位"
                      value={formData.currentPosition || ''}
                      onChange={(e) => handleChange('currentPosition', e.target.value)}
                      fullWidth
                    />
                  </>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
              <Button type="submit" size="lg">
                保存档案
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  );
}
