import React, { useState, useMemo, useEffect } from 'react';
import { Park, FilterOptions } from '../types';
import { FILTER_CATEGORIES } from '../constants';
import ParkCard from './ParkCard';
import RecommendedParks from './RecommendedParks';
import DataSharingInfo from './DataSharingInfo';
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
    <div className="space-y-4 pt-2">
      {/* Mobile-optimized filter section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55a.75.75 0 0 1-1.06 0l-1.937-1.55a2.25 2.25 0 0 1-.844-1.757v-3.037a2.25 2.25 0 0 0-.659-1.59L2.659 6.22a2.25 2.25 0 0 1-.659-1.59V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-gray-800">絞り込み検索</span>
              {(filters.age.length + filters.equipment.length + filters.facilities.length) > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {filters.age.length + filters.equipment.length + filters.facilities.length}
                </span>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </summary>

          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {FILTER_CATEGORIES.map(category => (
                <div key={category.id} className="space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm">{category.name}</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {category.options.map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={filters[category.id].includes(option)}
                          onChange={() => handleFilterChange(category.id, option)}
                        />
                        <span className="h-3 w-3 rounded border-gray-300 bg-white peer-checked:border-green-600 peer-checked:bg-white border flex items-center justify-center transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2 h-2 text-green-600 hidden peer-checked:block">
                            <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0Z" />
                          </svg>
                        </span>
                        <span className="ml-2 text-gray-600 text-xs">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      {/* Main content area */}
      <div className="space-y-6">
        <DataSharingInfo />
        <RecommendedParks parks={recommendedParks} onSelectPark={onSelectPark} />

        <div>
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">公園一覧</h2>

            {/* ソート機能 - モバイル最適化 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">並び順:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'distance' | 'rating' | 'reviews' | 'none')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
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

          <div className="grid grid-cols-1 gap-4">
            {filteredParks.length > 0 ? (
              filteredParks.map(park => (
                <ParkCard key={park.id} park={park} onSelectPark={onSelectPark} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
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