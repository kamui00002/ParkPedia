
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
    ...park.tags.equipment.slice(0, 2)
  ].slice(0, 3);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
      onClick={() => onSelectPark(park)}
    >
      <img src={park.mainImage} alt={park.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800">{park.name}</h3>
        <div className="flex items-center mt-2">
          <StarRating rating={averageRating} />
          <span className="text-sm text-gray-600 ml-2">
            {averageRating.toFixed(1)} ({park.reviews.length}件)
          </span>
        </div>
        <p className="text-sm text-green-600 font-medium mt-2">{park.distance}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map(tag => (
            <span key={tag} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkCard;
