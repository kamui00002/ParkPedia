import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Photo, PhotoCategory } from '../types';
import { PHOTO_CATEGORIES } from '../constants';

interface NewReviewData {
  rating: number;
  comment: string;
  photos: Photo[];
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: NewReviewData) => void;
  parkName: string;
}

const MAX_PHOTOS = 5;
const MAX_COMMENT_LENGTH = 200;

const InteractiveStar: React.FC< { filled: boolean; onMouseEnter: () => void; onClick: () => void; }> = ({ filled, onMouseEnter, onClick }) => (
    <svg 
        onMouseEnter={onMouseEnter} 
        onClick={onClick}
        className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-none stroke-2 stroke-current'}`} 
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, parkName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length + photos.length > MAX_PHOTOS) {
        setError(`写真は${MAX_PHOTOS}枚までアップロードできます。`);
        return;
      }
      setError('');
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files.item(i);
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotos(prev => [...prev, { url: reader.result as string, category: 'equipment' }]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };
  
  const handleCategoryChange = (index: number, category: PhotoCategory) => {
    setPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, category } : photo));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('評価（★）を選択してください。');
      return;
    }
    if (comment.trim() === '') {
      setError('コメントを入力してください。');
      return;
    }
    setError('');
    onSubmit({ rating, comment, photos });
    // Reset state for next time
    setRating(0);
    setComment('');
    setPhotos([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">「{parkName}」のレビューを投稿</h2>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">総合評価</label>
              <div className="flex items-center mt-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map(star => (
                    <InteractiveStar 
                        key={star}
                        filled={(hoverRating || rating) >= star}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setRating(star)}
                    />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">コメント</label>
              <div className="mt-1 relative">
                <textarea
                  id="comment"
                  rows={4}
                  maxLength={MAX_COMMENT_LENGTH}
                  className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="公園の良かった点、気になった点などを教えてください。"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {comment.length}/{MAX_COMMENT_LENGTH}
                </div>
              </div>
            </div>

            <div className="mt-4">
               <label className="block text-sm font-medium text-gray-700 mb-1">写真を追加 ({photos.length}/{MAX_PHOTOS})</label>
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm mb-3">
                    <p className="font-bold">投稿ルールのお願い</p>
                    <p>トラブル防止のため、人物の顔が特定できる写真の投稿は避けてください。</p>
                </div>
               <div className="flex items-center gap-4">
                   <label htmlFor="photo-upload" className="cursor-pointer bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                       ファイルを選択
                   </label>
                   <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
               </div>
               {photos.length > 0 && (
                 <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {photos.map((photo, index) => (
                     <div key={index} className="relative">
                       <img src={photo.url} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                       <button 
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                        aria-label="Remove photo"
                       >
                           &times;
                       </button>
                       <select 
                         value={photo.category} 
                         onChange={(e) => handleCategoryChange(index, e.target.value as PhotoCategory)}
                         className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md border-0 focus:ring-0"
                       >
                         {PHOTO_CATEGORIES.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                       </select>
                     </div>
                   ))}
                 </div>
               )}
            </div>
             {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700">
              投稿する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;