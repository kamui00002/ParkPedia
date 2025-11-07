import React from 'react';
import { Park } from '../types';
import StarRating from './StarRating';

interface RecommendedParksProps {
  parks: Park[];
  onSelectPark: (park: Park) => void;
}

const RecommendedCard: React.FC<{ park: Park; onSelectPark: (park: Park) => void }> = ({ park, onSelectPark }) => {
  const averageRating = park.reviews.length > 0
    ? park.reviews.reduce((acc, review) => acc + review.rating, 0) / park.reviews.length
    : 0;

  return (
    <div
      onClick={() => onSelectPark(park)}
      className="flex-shrink-0 w-56 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transform hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      <img src={park.mainImage} alt={park.name} className="w-full h-40 object-cover" />
      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-base font-bold text-gray-800">{park.name}</h4>
        <div className="flex items-center mt-2">
          <StarRating rating={averageRating} />
          <span className="text-sm text-gray-600 ml-2">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{park.address}</p>
      </div>
    </div>
  );
};

const RecommendedParks: React.FC<RecommendedParksProps> = ({ parks, onSelectPark }) => {
  if (parks.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">あなたへのおすすめ</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
        {parks.map(park => (
          <RecommendedCard key={park.id} park={park} onSelectPark={onSelectPark} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedParks;