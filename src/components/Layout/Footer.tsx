/**
 * 页面底部组件 - 现代化设计
 */

import React from 'react';
import { APP_NAME, APP_VERSION } from '@/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-effect mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">关于我们</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {APP_NAME}是一款智能化的公考岗位分析工具，帮助考生快速找到最适合的岗位。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-white/80 hover:text-white text-sm transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/announcements" className="text-white/80 hover:text-white text-sm transition-colors">
                  公告管理
                </a>
              </li>
              <li>
                <a href="/positions" className="text-white/80 hover:text-white text-sm transition-colors">
                  岗位列表
                </a>
              </li>
              <li>
                <a href="/profile" className="text-white/80 hover:text-white text-sm transition-colors">
                  个人档案
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center">
                <span className="mr-2">📧</span>
                support@example.com
              </li>
              <li className="flex items-center">
                <span className="mr-2">🌐</span>
                GitHub
              </li>
              <li className="flex items-center">
                <span className="mr-2">📱</span>
                微信公众号
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/80">
            <div className="mb-4 md:mb-0">
              © {currentYear} {APP_NAME}. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>版本 {APP_VERSION}</span>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                隐私政策
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                使用条款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
