/**
 * 登录页面 - 密码保护
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/constants';

export function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      // 从环境变量获取密码（支持明文密码或哈希）
      const envPassword = import.meta.env.VITE_ACCESS_PASSWORD;
      const envPasswordHash = import.meta.env.VITE_ACCESS_PASSWORD_HASH;

      // 如果没有配置任何密码，默认允许访问
      if (!envPassword && !envPasswordHash) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userPassword', password);
        navigate('/', { replace: true });
        return;
      }

      // 优先使用明文密码比对
      if (envPassword) {
        if (password === envPassword) {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userPassword', password);
          navigate('/', { replace: true });
        } else {
          setError('密码错误，请重试');
        }
      } 
      // 否则使用哈希比对
      else if (envPasswordHash) {
        if (hashHex === envPasswordHash) {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userPassword', password);
          navigate('/', { replace: true });
        } else {
          setError('密码错误，请重试');
        }
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
