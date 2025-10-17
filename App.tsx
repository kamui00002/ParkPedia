import React, { useState } from 'react';
import Header from './components/Header';
import ParkList from './components/ParkList';
import ParkDetail from './components/ParkDetail';
import MyPage from './components/MyPage';
import AddParkForm from './components/AddParkForm'; // Import the new component
import { Park, Review, Photo } from './types';
import { PARKS } from './constants';

type View = 'list' | 'detail' | 'mypage' | 'addPark';

const App: React.FC = () => {
  const [parks, setParks] = useState<Park[]>(PARKS);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [view, setView] = useState<View>('list');

  const handleAddReview = (parkId: string, newReviewData: Omit<Review, 'id' | 'author' | 'avatar' | 'helpfulCount' | 'createdAt'>) => {
    const newReview: Review = {
      ...newReviewData,
      id: `review-${Date.now()}`,
      author: 'あなた', // Placeholder for logged in user
      avatar: 'https://picsum.photos/seed/avatar_user/100/100', // Placeholder avatar
      helpfulCount: 0,
      createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

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

  const handleAddPark = (newParkData: Omit<Park, 'id' | 'distance' | 'reviews' | 'latitude' | 'longitude'>) => {
    const newPark: Park = {
      ...newParkData,
      id: `park-${Date.now()}`,
      distance: '現在地から?', // Placeholder distance
      reviews: [],
      // Placeholder coordinates, ideally we'd get this from an address
      latitude: 35.658581, 
      longitude: 139.745438,
    };
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

  const renderContent = () => {
    switch (view) {
      case 'detail':
        return selectedPark ? (
          <ParkDetail park={selectedPark} onBack={handleBackToList} onAddReview={handleAddReview} />
        ) : (
          <ParkList parks={parks} onSelectPark={handleSelectPark} />
        );
      case 'mypage':
        return <MyPage />;
      case 'addPark':
        return <AddParkForm onAddPark={handleAddPark} onCancel={() => setView('list')} />;
      case 'list':
      default:
        return <ParkList parks={parks} onSelectPark={handleSelectPark} />;
    }
  };

  return (
    <div className="min-h-screen bg-green-50 font-sans">
      <Header onNavigate={navigateTo} currentView={view} />
      <main className="container mx-auto p-4 max-w-7xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;