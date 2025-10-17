import React, { useState, useMemo, useEffect } from 'react';
import { Park, FilterOptions } from '../types';
import { FILTER_CATEGORIES } from '../constants';
import ParkCard from './ParkCard';
import RecommendedParks from './RecommendedParks';
import { SearchService } from '../services/searchService';
import { LocationService } from '../services/locationService';

interface ParkListProps {
  parks: Park[];
  onSelectPark: (park: Park) => void;
  searchQuery?: string;
}

const ParkList: React.FC<ParkListProps> = ({ parks, onSelectPark, searchQuery = '' }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    age: [],
    equipment: [],
    facilities: [],
  });
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews' | 'none'>('none');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    // 位置情報の許可をリクエスト
    LocationService.requestPermissions().then(permitted => {
      setLocationPermission(permitted);
      if (permitted) {
        LocationService.getCurrentPosition()
          .then(location => setUserLocation(location))
          .catch(error => console.error('位置情報の取得に失敗:', error));
      }
    });
  }, []);

  const handleFilterChange = (category: keyof FilterOptions, option: string) => {
    setFilters(prevFilters => {
      const currentCategoryFilters = prevFilters[category];
      const newCategoryFilters = currentCategoryFilters.includes(option)
        ? currentCategoryFilters.filter(item => item !== option)
        : [...currentCategoryFilters, option];
      return { ...prevFilters, [category]: newCategoryFilters };
    });
  };

  const handleSortChange = (newSortBy: 'distance' | 'rating' | 'reviews' | 'none') => {
    setSortBy(newSortBy);
  };

  const filteredParks = useMemo(() => {
    let result = parks;

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      result = SearchService.searchParks(result, searchQuery);
    }

    // フィルターでフィルタリング
    result = result.filter(park => {
      return (Object.keys(filters) as Array<keyof FilterOptions>).every(category => {
        if (filters[category].length === 0) return true;
        return filters[category].some(filterOption => park.tags[category].includes(filterOption));
      });
    });

    // ソート
    switch (sortBy) {
      case 'distance':
        if (userLocation) {
          result = SearchService.sortParksByDistance(result, userLocation.latitude, userLocation.longitude);
        }
        break;
      case 'rating':
        result = SearchService.sortParksByRating(result);
        break;
      case 'reviews':
        result = SearchService.sortParksByReviewCount(result);
        break;
      default:
        // ソートなし
        break;
    }

    return result;
  }, [parks, filters, searchQuery, sortBy, userLocation]);

  const recommendedParks = useMemo(() => {
    // Simple recommendation logic: parks with the most or highest-rated reviews
    return [...parks]
      .sort((a, b) => b.reviews.length - a.reviews.length)
      .slice(0, 5);
  }, [parks]);


  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left column for filters */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <div className="bg-white p-4 rounded-lg shadow sticky top-24">
          <h2 className="text-lg font-bold mb-4 text-gray-800">絞り込み検索</h2>
          {FILTER_CATEGORIES.map(category => (
            <div key={category.id} className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">{category.name}</h3>
              <div className="space-y-2">
                {category.options.map(option => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={filters[category.id].includes(option)}
                      onChange={() => handleFilterChange(category.id, option)}
                    />
                    <span className="h-4 w-4 rounded border-gray-300 bg-white peer-checked:border-green-600 peer-checked:bg-white border flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-green-600 hidden peer-checked:block">
                        <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0Z" />
                      </svg>
                    </span>
                    <span className="ml-2 text-gray-600 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right column for recommended parks and the list */}
      <div className="w-full md:w-3/4 lg:w-4/5 space-y-8">
        <RecommendedParks parks={recommendedParks} onSelectPark={onSelectPark} />

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">公園一覧</h2>

            {/* ソート機能 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">並び順:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'distance' | 'rating' | 'reviews' | 'none')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="none">指定なし</option>
                {locationPermission && userLocation && (
                  <option value="distance">距離順</option>
                )}
                <option value="rating">評価順</option>
                <option value="reviews">レビュー数順</option>
              </select>
            </div>
          </div>

          {/* 検索結果の表示 */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                「{searchQuery}」の検索結果: {filteredParks.length}件
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredParks.length > 0 ? (
              filteredParks.map(park => (
                <ParkCard key={park.id} park={park} onSelectPark={onSelectPark} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                <p className="font-semibold">該当する公園が見つかりませんでした。</p>
                <p className="text-sm mt-1">絞り込み条件を変更してみてください。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkList;