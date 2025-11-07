import React from 'react';
import { PARKS, MOCK_USER } from '../constants';
import { Park } from '../types';
import BadgeCard from './BadgeCard';

interface MyParkCardProps {
    park: Park;
}

const MyParkCard: React.FC<MyParkCardProps> = ({ park }) => (
    <div className="bg-gray-50 rounded-lg overflow-hidden flex">
        <img src={park.mainImage} alt={park.name} className="w-32 h-32 object-cover flex-shrink-0" />
        <div className="p-4 flex flex-col justify-between flex-grow">
            <div>
                <h3 className="text-base font-bold text-gray-800">{park.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{park.address}</p>
            </div>
            <button className="text-left text-sm text-red-500 font-medium hover:text-red-700 mt-2">
                リストから削除
            </button>
        </div>
    </div>
);

const MyPage: React.FC = () => {
    // These would typically come from user data
    const favoriteParks = PARKS.slice(0, 2);
    const wantToGoParks = PARKS.slice(1, 3);
  
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-4 pb-2 border-t-2" style={{ color: '#166534', borderColor: '#16a34a' }}>
                    お気に入りした公園
                </h2>
                {favoriteParks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favoriteParks.map(park => <MyParkCard key={park.id} park={park} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">まだお気に入りの公園はありません。</p>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4 pb-2 border-t-2" style={{ color: '#166534', borderColor: '#16a34a' }}>
                    「行ってみたい！」リスト
                </h2>
                {wantToGoParks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wantToGoParks.map(park => <MyParkCard key={park.id} park={park} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">まだ行ってみたい公園はありません。</p>
                )}
            </div>
            
            <div>
                <h2 className="text-xl font-bold mb-4 pb-2 border-t-2" style={{ color: '#166534', borderColor: '#16a34a' }}>
                    獲得したバッジ
                </h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_USER.badges.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))}
                </div>
            </div>

             <div>
                <h2 className="text-xl font-bold mb-4 pb-2 border-t-2" style={{ color: '#166534', borderColor: '#16a34a' }}>
                    自分の投稿レビュー
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                   <p className="text-gray-500">まだ投稿したレビューはありません。</p>
                </div>
            </div>
        </div>
    );
};

export default MyPage;