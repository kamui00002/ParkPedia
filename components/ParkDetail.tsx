import React, { useState, useMemo } from 'react';
import { Park, Review, Photo, PhotoCategory } from '../types';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import { PHOTO_CATEGORIES } from '../constants';

interface ParkDetailProps {
  park: Park;
  onBack: () => void;
  onAddReview: (parkId: string, reviewData: Omit<Review, 'id' | 'author' | 'avatar' | 'helpfulCount' | 'createdAt'>) => void;
}

const ParkDetail: React.FC<ParkDetailProps> = ({ park, onBack, onAddReview }) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activePhotoCategory, setActivePhotoCategory] = useState<'all' | PhotoCategory>('all');

  const averageRating =
    park.reviews.length > 0
      ? park.reviews.reduce((acc, review) => acc + review.rating, 0) / park.reviews.length
      : 0;

  const allTags = [
    ...park.tags.age.map(t => ({ value: t, group: 'age' })),
    ...park.tags.equipment.map(t => ({ value: t, group: 'equipment' })),
    ...park.tags.facilities.map(t => ({ value: t, group: 'facilities' }))
  ];
  
  const handleReviewSubmit = (reviewData: Omit<Review, 'id' | 'author' | 'avatar' | 'helpfulCount' | 'createdAt'>) => {
    onAddReview(park.id, reviewData);
    setIsReviewModalOpen(false);
  };

  const filteredImages = useMemo(() => {
    if (activePhotoCategory === 'all') {
      return park.images;
    }
    return park.images.filter(img => img.category === activePhotoCategory);
  }, [park.images, activePhotoCategory]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-7xl mx-auto">
        <div className="p-4 sm:p-6">
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            ← 公園一覧に戻る
          </button>

          <h1 className="text-3xl font-bold text-gray-800">{park.name}</h1>
          <p className="text-base text-gray-800 mt-1">{park.address}</p>
          <div className="flex items-center mt-2">
            <StarRating rating={averageRating} />
            <span className="text-base text-gray-600 ml-2">
              {averageRating.toFixed(1)} ({park.reviews.length}件のレビュー)
            </span>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-y">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActivePhotoCategory('all')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${activePhotoCategory === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-100'}`}>全て</button>
                {PHOTO_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setActivePhotoCategory(cat.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${activePhotoCategory === cat.id ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-100'}`}>{cat.name}</button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 p-4">
            {filteredImages.map((img, index) => (
              <img key={index} src={img.url} alt={`${park.name} photo ${index + 1}`} className="w-64 h-48 object-cover rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
         {filteredImages.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>このカテゴリの写真はありません。</p>
            </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-3">設備・遊具</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <span key={tag.value} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">{tag.value}</span>
                ))}
              </div>
            </div>
            <div className="relative">
              <h2 className="text-xl font-bold text-gray-800 mb-3">地図</h2>
              <div className="relative rounded-lg overflow-hidden border" style={{ height: '300px' }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${park.latitude},${park.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="absolute bottom-4 right-4 bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition-colors flex items-center shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                レビューを投稿する
              </button>
            </div>
          </div>

          <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">レビュー ({park.reviews.length}件)</h2>
              
            <div className="space-y-6">
              {park.reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          parkName={park.name}
      />
    </>
  );
};

export default ParkDetail;