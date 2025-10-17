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
      className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
    >
      <img src={park.mainImage} alt={park.name} className="w-full h-32 object-cover" />
      <div className="p-3">
        <h4 className="text-md font-bold text-gray-800 truncate">{park.name}</h4>
        <div className="flex items-center mt-1">
          <StarRating rating={averageRating} />
          <span className="text-xs text-gray-600 ml-1.5">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">{park.address}</p>
      </div>
    </div>
  );
};

const RecommendedParks: React.FC<RecommendedParksProps> = ({ parks, onSelectPark }) => {
  if (parks.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
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