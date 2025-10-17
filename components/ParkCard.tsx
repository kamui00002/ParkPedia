
import React from 'react';
import { Park } from '../types';
import StarRating from './StarRating';

interface ParkCardProps {
  park: Park;
  onSelectPark: (park: Park) => void;
}

const ParkCard: React.FC<ParkCardProps> = ({ park, onSelectPark }) => {
  const averageRating = park.reviews.length > 0
    ? park.reviews.reduce((acc, review) => acc + review.rating, 0) / park.reviews.length
    : 0;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onSelectPark(park)}
    >
      <div className="flex">
        <img src={park.mainImage} alt={park.name} className="w-24 h-24 object-cover flex-shrink-0" />
        <div className="p-3 flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 truncate">{park.name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{park.address}</p>
          <div className="flex items-center mt-2">
            <StarRating rating={averageRating} />
            <span className="text-xs text-gray-600 ml-1">
              {averageRating.toFixed(1)} ({park.reviews.length})
            </span>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-1">{park.distance}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {park.tags.facilities.slice(0, 2).map(tag => (
              <span key={tag} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            {park.tags.facilities.length > 2 && (
              <span className="text-xs text-gray-500">+{park.tags.facilities.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkCard;
