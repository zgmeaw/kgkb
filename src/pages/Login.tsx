/**
 * 登录页面 - 密码保护
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, STORAGE_KEYS } from '@/constants';
import { cloudStorageService, storageService } from '@/services';

export function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showGithubConfig, setShowGithubConfig] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 计算密码的SHA-256哈希
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // 从环境变量获取正确的密码哈希
      const correctHash = import.meta.env.VITE_ACCESS_PASSWORD_HASH;

      // 如果没有设置密码哈希，拒绝访问
      if (!correctHash) {
        setError('系统未配置访问密码，请联系管理员');
        setLoading(false);
        return;
      }

      // 验证密码哈希
      if (hashHex === correctHash) {
        // 密码正确
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userPassword', password); // 保存密码用于云端加密
        
        // 保存 GitHub 配置到 localStorage（如果用户输入了）
        if (githubToken.trim() && githubOwner.trim() && githubRepo.trim()) {
          localStorage.setItem('github_token', githubToken.trim());
          localStorage.setItem('github_owner', githubOwner.trim());
          localStorage.setItem('github_repo', githubRepo.trim());
          console.log('✅ GitHub 文件系统配置已保存');
        } else if (githubToken.trim()) {
          // 只有 token，用于 Gist 云端存储
          localStorage.setItem('github_token', githubToken.trim());
        }
        
        // 尝试从云端恢复数据
        try {
          if (githubToken.trim()) {
            setError('正在从云端恢复数据...');
            const hasData = await cloudStorageService.hasCloudData();
            
            if (hasData) {
              const cloudData = await cloudStorageService.downloadData(password);
              
              // 恢复数据到 localStorage
              if (cloudData.announcements) {
                storageService.set(STORAGE_KEYS.ANNOUNCEMENTS, cloudData.announcements);
              }
              if (cloudData.positions) {
                storageService.set(STORAGE_KEYS.POSITIONS, cloudData.positions);
              }
              if (cloudData.userProfile) {
                storageService.set(STORAGE_KEYS.USER_PROFILE, cloudData.userProfile);
              }
              if (cloudData.scoreHistory) {
                storageService.set(STORAGE_KEYS.SCORE_HISTORY, cloudData.scoreHistory);
              }
              
              console.log('✅ 云端数据恢复成功');
            } else {
              console.log('ℹ️ 未找到云端数据，使用本地数据');
            }
          }
        } catch (cloudError) {
          console.warn('云端数据恢复失败，使用本地数据:', cloudError);
          // 不阻止登录，继续使用本地数据
        }
        
        navigate('/', { replace: true });
      } else {
        setError('密码错误，请重试');
      }
    } catch (err) {
      setError('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-modern max-w-md w-full p-10 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">{APP_NAME}</h1>
          <p className="text-gray-600">请输入密码访问系统</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              访问密码
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Token（可选，用于云端存储）
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="input-modern pr-12"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                disabled={loading}
              >
                {showToken ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              如需使用云端备份功能，请输入您的 GitHub Personal Access Token
            </p>
            
            {/* GitHub 文件系统配置（可选） */}
            <button
              type="button"
              onClick={() => setShowGithubConfig(!showGithubConfig)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-2 flex items-center"
            >
              {showGithubConfig ? '▼' : '▶'} 高级：配置 GitHub 文件系统存储
            </button>
            
            {showGithubConfig && (
              <div className="mt-3 space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GitHub 用户名
                  </label>
                  <input
                    type="text"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                    className="input-modern text-sm"
                    placeholder="your-username"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    仓库名称
                  </label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="input-modern text-sm"
                    placeholder="your-repo-name"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  💡 配置后，数据将自动保存为仓库文件，支持版本控制和历史记录
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
              <p className="text-red-600 text-sm flex items-center">
                <span className="mr-2">❌</span>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || loading}
            className="btn-gradient w-full text-lg"
          >
            {loading ? '验证中...' : '🔓 登录'}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 提示：如果忘记密码，请联系管理员
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
            系统特性
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">☁️</div>
              <p className="text-xs text-gray-600">云端存储</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-xs text-gray-600">数据加密</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-xs text-gray-600">智能匹配</p>
            </div>
            <div>
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs text-gray-600">数据分析</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
