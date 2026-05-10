/**
 * 岗位卡片组件
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Position } from '@/types';
import { Card } from '@/components/common';
import { MatchingScoreIndicator } from './MatchingScoreIndicator';
import { formatArray, formatAgeRange } from '@/utils';

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/positions/${position.id}`);
  };

  return (
    <Card hoverable onClick={handleClick}>
      <div className="flex gap-4">
        {/* 匹配度指示器 */}
        {position.matchingScore !== undefined && (
          <div className="flex-shrink-0">
            <MatchingScoreIndicator score={position.matchingScore} size="sm" />
          </div>
        )}

        {/* 岗位信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {position.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{position.department}</p>
            </div>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {position.code}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">招录人数：</span>
              <span className="font-medium">{position.recruitCount}人</span>
            </div>
            <div>
              <span className="text-gray-500">学历要求：</span>
              <span className="font-medium">{position.educationRequirement}</span>
            </div>
            <div>
              <span className="text-gray-500">专业要求：</span>
              <span className="font-medium">{formatArray(position.majorRequirement)}</span>
            </div>
            <div>
              <span className="text-gray-500">年龄要求：</span>
              <span className="font-medium">{formatAgeRange(position.minAge, position.maxAge)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
              📍 {position.workLocation}
            </span>
            {position.workExperienceRequired && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                需要工作经验
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
