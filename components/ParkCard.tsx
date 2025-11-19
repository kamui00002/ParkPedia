
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

  const allTags = [
    ...park.tags.facilities,
    ...park.tags.equipment,
    ...park.tags.age
  ];

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transform hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onSelectPark(park)}
    >
      <img src={park.mainImage} alt={park.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{park.name}</h3>
        <div className="flex items-center mb-2">
          <StarRating rating={averageRating} />
          <span className="text-sm text-gray-600 ml-1">
            {averageRating.toFixed(1)} ({park.reviews.length}件)
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{park.distance}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {allTags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkCard;
