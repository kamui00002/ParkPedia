import React from 'react';
import { Badge } from '../types';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const Icon = badge.icon;
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h3 className="text-md font-bold text-gray-800">{badge.name}</h3>
        <p className="text-sm text-gray-500">{badge.description}</p>
      </div>
    </div>
  );
};

export default BadgeCard;