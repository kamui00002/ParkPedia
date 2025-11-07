import React, { useState } from 'react';

interface HeaderProps {
  onNavigate: (view: 'list' | 'mypage' | 'addPark') => void;
  currentView: 'list' | 'detail' | 'mypage' | 'addPark';
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive
      ? 'bg-green-600 text-white'
      : 'text-gray-700 hover:bg-gray-50'
      }`}
  >
    {children}
  </button>
);


const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, onSearch, searchQuery = '' }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchQuery);
    }
  };

  return (
    <header
      className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 w-full dynamic-island-header no-bounce"
      style={{
        backgroundColor: '#ffffff',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="px-4 py-3 w-full">
        {/* アプリ名とナビゲーション */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold" style={{ color: '#166534' }}>ParkPedia</h1>
          <div className="flex items-center space-x-2">
            <NavLink onClick={() => onNavigate('list')} isActive={currentView === 'list' || currentView === 'detail'}>
              公園検索
            </NavLink>
            <NavLink onClick={() => onNavigate('addPark')} isActive={currentView === 'addPark'}>
              公園を投稿
            </NavLink>
            <NavLink onClick={() => onNavigate('mypage')} isActive={currentView === 'mypage'}>
              マイページ
            </NavLink>
          </div>
        </div>

        {/* 検索バー - ロゴの下に配置 */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="公園名、地域名で検索..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none text-sm placeholder-gray-400"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;