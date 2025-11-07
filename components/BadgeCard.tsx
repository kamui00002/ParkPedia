import React from 'react';
import { Badge } from '../types';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const Icon = badge.icon;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center space-x-4">
      <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-green-100 flex items-center justify-center">
        <Icon className="h-8 w-8 text-white" style={{ color: '#16a34a' }} />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">{badge.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
      </div>
    </div>
  );
};

export default BadgeCard;