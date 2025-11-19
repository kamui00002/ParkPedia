import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ParkList from './components/ParkList';
import ParkDetail from './components/ParkDetail';
import MyPage from './components/MyPage';
import AddParkForm from './components/AddParkForm'; // Import the new component
import { Park, Review, Photo } from './types';
import { PARKS } from './constants';
import { DataService } from './services/dataService';

type View = 'list' | 'detail' | 'mypage' | 'addPark';

const App: React.FC = () => {
  const [parks, setParks] = useState<Park[]>(PARKS);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [view, setView] = useState<View>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // アプリ起動時にローカルストレージからデータを読み込み
  useEffect(() => {
    const loadParks = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const storedParks = await DataService.getParks();
        if (storedParks.length > 0) {
          setParks(storedParks);
        } else {
          // 初回起動時はサンプルデータを保存
          await DataService.saveParks(PARKS);
          setParks(PARKS);
        }
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        setLoadError('データの読み込みに失敗しました。アプリを再起動してください。');
        // エラーが発生してもサンプルデータを表示
        setParks(PARKS);
      } finally {
        setIsLoading(false);
      }
    };
    loadParks();
  }, []);

  const handleAddReview = async (parkId: string, newReviewData: Omit<Review, 'id' | 'author' | 'avatar' | 'helpfulCount' | 'createdAt'>) => {
    const newReview: Review = {
      ...newReviewData,
      id: `review-${Date.now()}`,
      author: 'あなた', // Placeholder for logged in user
      avatar: 'https://picsum.photos/seed/avatar_user/100/100', // Placeholder avatar
      helpfulCount: 0,
      createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    // データサービスに保存
    await DataService.addReview(parkId, newReview);

    const updatedParks = parks.map(p =>
      p.id === parkId
        ? { ...p, reviews: [newReview, ...p.reviews] }
        : p
    );
    setParks(updatedParks);

    if (selectedPark && selectedPark.id === parkId) {
      setSelectedPark(prev => prev ? { ...prev, reviews: [newReview, ...prev.reviews] } : null);
    }
  };

  const handleAddPark = async (newParkData: Omit<Park, 'id' | 'distance' | 'reviews' | 'latitude' | 'longitude'>) => {
    const newPark: Park = {
      ...newParkData,
      id: `park-${Date.now()}`,
      distance: '現在地から?', // Placeholder distance
      reviews: [],
      // Placeholder coordinates, ideally we'd get this from an address
      latitude: 35.658581,
      longitude: 139.745438,
    };

    // データサービスに保存
    await DataService.addPark(newPark);

    setParks(prevParks => [newPark, ...prevParks]);
    setView('list'); // Redirect to list view after adding
  };


  const handleSelectPark = (park: Park) => {
    // Find the latest version of the park from the state to show new reviews
    const currentParkState = parks.find(p => p.id === park.id) || park;
    setSelectedPark(currentParkState);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedPark(null);
    setView('list');
  };

  const navigateTo = (newView: View) => {
    if (newView === 'list') {
      setSelectedPark(null);
    }
    setView(newView);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderContent = () => {
    // ローディング中の表示
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      );
    }

    // エラー表示（エラーがあってもコンテンツは表示）
    const errorBanner = loadError ? (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
        <p className="font-bold">注意</p>
        <p>{loadError}</p>
      </div>
    ) : null;

    switch (view) {
      case 'detail':
        return (
          <>
            {errorBanner}
            {selectedPark ? (
              <ParkDetail park={selectedPark} onBack={handleBackToList} onAddReview={handleAddReview} />
            ) : (
              <ParkList parks={parks} onSelectPark={handleSelectPark} />
            )}
          </>
        );
      case 'mypage':
        return (
          <>
            {errorBanner}
            <MyPage />
          </>
        );
      case 'addPark':
        return (
          <>
            {errorBanner}
            <AddParkForm onAddPark={handleAddPark} onCancel={() => setView('list')} />
          </>
        );
      case 'list':
      default:
        return (
          <>
            {errorBanner}
            <ParkList parks={parks} onSelectPark={handleSelectPark} searchQuery={searchQuery} />
          </>
        );
    }
  };

  return (
    <div className="mobile-viewport bg-green-50 font-sans no-bounce" style={{ backgroundColor: '#F0FBF4' }}>
      <Header
        onNavigate={navigateTo}
        currentView={view}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <main className="px-4 bg-green-50 no-bounce" style={{
        backgroundColor: '#F0FBF4',
        paddingTop: 'calc(env(safe-area-inset-top) + 120px)',
        minHeight: 'calc(100vh - env(safe-area-inset-top) - 120px)'
      }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;