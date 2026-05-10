/**
 * 密码输入模态框
 */

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
}

export function PasswordModal({
  isOpen,
  onClose,
  onSubmit,
  title = '输入密码',
  description = '请输入您的访问密码',
  loading = false,
  error,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-gray-600">{description}</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-modern pr-12"
              placeholder="请输入密码"
              autoFocus
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={!password.trim() || loading}
            loading={loading}
          >
            {loading ? '验证中...' : '确认'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
