/**
 * 页面底部组件
 */

import React from 'react';
import { APP_NAME, APP_VERSION } from '@/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              关于系统
            </h3>
            <p className="text-sm text-gray-600">
              {APP_NAME}是一款智能化的公考岗位分析工具，帮助考生快速找到最适合的岗位。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              快速链接
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-blue-600">
                  首页
                </a>
              </li>
              <li>
                <a href="/announcements" className="text-sm text-gray-600 hover:text-blue-600">
                  公告管理
                </a>
              </li>
              <li>
                <a href="/positions" className="text-sm text-gray-600 hover:text-blue-600">
                  岗位列表
                </a>
              </li>
              <li>
                <a href="/profile" className="text-sm text-gray-600 hover:text-blue-600">
                  个人档案
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              联系我们
            </h3>
            <p className="text-sm text-gray-600">
              如有问题或建议，欢迎通过以下方式联系我们：
            </p>
            <p className="text-sm text-gray-600 mt-2">
              邮箱：support@example.com
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {currentYear} {APP_NAME} v{APP_VERSION}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
