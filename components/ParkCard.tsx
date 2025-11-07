
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
    ...park.tags.age,
    ...park.tags.equipment,
    ...park.tags.facilities
  ];

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onSelectPark(park)}
    >
      <img src={park.mainImage} alt={park.name} className="w-full h-48 object-cover" />
      <div className="p-3">
        <h3 className="text-lg font-bold text-gray-800 truncate">{park.name}</h3>
        <div className="flex items-center mt-1">
          <StarRating rating={averageRating} />
          <span className="text-sm text-gray-600 ml-1">
            {averageRating.toFixed(1)} ({park.reviews.length}件)
          </span>
        </div>
        <p className="text-sm text-green-600 font-medium mt-1">{park.distance}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {allTags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {allTags.length > 3 && (
            <span className="text-xs text-gray-500">+{allTags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkCard;
