/**
 * 匹配度指示器组件
 */

import React from 'react';
import { formatMatchingLevel } from '@/utils';

interface MatchingScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MatchingScoreIndicator({ score, size = 'md', showLabel = true }: MatchingScoreIndicatorProps) {
  const { label, color } = formatMatchingLevel(score);

  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-24 h-24 text-base',
  };

  const colorClasses: Record<string, string> = {
    green: 'text-green-600 border-green-600',
    blue: 'text-blue-600 border-blue-600',
    yellow: 'text-yellow-600 border-yellow-600',
    red: 'text-red-600 border-red-600',
  };

  const bgColorClasses: Record<string, string> = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          ${bgColorClasses[color]}
          rounded-full border-4 flex items-center justify-center font-bold
        `}
      >
        {score.toFixed(0)}
      </div>
      {showLabel && (
        <span className={`mt-2 text-sm font-medium ${colorClasses[color]}`}>
          {label}
        </span>
      )}
    </div>
  );
}
