import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Park, FilterOptions, Photo, PhotoCategory } from '../types';
import { FILTER_CATEGORIES, PHOTO_CATEGORIES } from '../constants';

type NewParkData = Omit<Park, 'id' | 'distance' | 'reviews' | 'latitude' | 'longitude'>;

interface AddParkFormProps {
  onAddPark: (parkData: NewParkData) => void;
  onCancel: () => void;
}

const MAX_PHOTOS = 8;

const AddParkForm: React.FC<AddParkFormProps> = ({ onAddPark, onCancel }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tags, setTags] = useState<FilterOptions>({ age: [], equipment: [], facilities: [] });
  const [error, setError] = useState('');

  const handleTagChange = (category: keyof FilterOptions, option: string) => {
    setTags(prevTags => {
      const currentCategoryTags = prevTags[category];
      const newCategoryTags = currentCategoryTags.includes(option)
        ? currentCategoryTags.filter(item => item !== option)
        : [...currentCategoryTags, option];
      return { ...prevTags, [category]: newCategoryTags };
    });
  };

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
    if (!name.trim()) {
      setError('公園名を入力してください。');
      return;
    }
    if (!address.trim()) {
      setError('住所を入力してください。');
      return;
    }
    if (photos.length === 0) {
      setError('写真を1枚以上アップロードしてください。');
      return;
    }
    setError('');

    const newParkData: NewParkData = {
      name,
      address,
      mainImage: photos[0].url,
      images: photos,
      tags
    };

    onAddPark(newParkData);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">新しい公園を登録する</h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="park-name" className="block text-base font-semibold text-gray-800 mb-2">公園名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="park-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              placeholder="例: ひまわり中央公園"
            />
          </div>

          <div>
            <label htmlFor="park-address" className="block text-base font-semibold text-gray-800 mb-2">住所 <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="park-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              placeholder="例: 東京都世田谷区桜丘1-2-3"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">写真 ({photos.length}/{MAX_PHOTOS}) <span className="text-red-500">*</span></label>
            <p className="text-sm text-gray-500 mb-3">最初の写真がメイン画像になります。</p>
            <div className="flex items-center gap-4">
              <label htmlFor="photo-upload" className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                ファイル選択
              </label>
              <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <span className="text-sm text-gray-400">{photos.length === 0 ? '選択されていません' : `${photos.length}枚選択中`}</span>
            </div>
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo.url} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-md" />
                    <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold" aria-label="Remove photo">&times;</button>
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

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">公園の設備・遊具</h2>
            <div className="space-y-6">
              {FILTER_CATEGORIES.map(category => (
                <div key={category.id}>
                  <h3 className="font-semibold text-gray-800 mb-3">{category.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {category.options.map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={tags[category.id].includes(option)}
                          onChange={() => handleTagChange(category.id, option)}
                        />
                        <span className="h-4 w-4 rounded border-2 border-gray-300 bg-white peer-checked:border-green-600 peer-checked:bg-white border flex items-center justify-center transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-green-600 hidden peer-checked:block">
                            <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0Z" />
                          </svg>
                        </span>
                        <span className="ml-2 text-gray-700 text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
        
        <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            キャンセル
          </button>
          <button type="submit" className="px-6 py-2.5 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700">
            この公園を登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParkForm;