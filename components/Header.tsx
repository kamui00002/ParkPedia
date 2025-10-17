import React from 'react';

interface HeaderProps {
  onNavigate: (view: 'list' | 'mypage' | 'addPark') => void;
  currentView: 'list' | 'detail' | 'mypage' | 'addPark';
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-gray-600 hover:bg-green-100'
    }`}
  >
    {children}
  </button>
);


const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">ParkPedia</h1>
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
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="公園名、地域名で検索..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;