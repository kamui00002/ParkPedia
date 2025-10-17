
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
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
      onClick={() => onSelectPark(park)}
    >
      <img src={park.mainImage} alt={park.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 truncate">{park.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{park.address}</p>
        <div className="flex items-center mt-2">
          <StarRating rating={averageRating} />
          <span className="text-sm text-gray-600 ml-2">
            {averageRating.toFixed(1)} ({park.reviews.length}件)
          </span>
        </div>
        <p className="text-sm text-green-600 font-semibold mt-2">{park.distance}</p>
        <div className="mt-3 flex flex-wrap gap-2">
            {park.tags.facilities.slice(0, 3).map(tag => (
                 <span key={tag} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ParkCard;
