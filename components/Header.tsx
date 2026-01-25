
import React, { useState } from 'react';
import { LayoutGrid, Bell, Search, X, ShieldAlert, MapPin, LogIn, LogOut } from 'lucide-react';
import { Notification, User } from '../types';
import { formatToBanglaTime } from '../utils';
import { BANGLADESH_LOCATIONS, DIVISIONS } from '../constants/locations';

// Added siteName to HeaderProps to resolve TypeScript error in App.tsx
interface HeaderProps {
  onProfileClick: () => void;
  userAvatar: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMobileMenuToggle: () => void;
  onSearch: (term: string) => void;
  currentUser?: User;
  onAdminClick?: () => void;
  selectedDivision: string;
  selectedDistrict: string;
  onDivisionChange: (div: string) => void;
  onDistrictChange: (dist: string) => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
  siteName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onProfileClick, 
  userAvatar, 
  notifications, 
  onMarkRead,
  onMobileMenuToggle,
  onSearch,
  currentUser,
  onAdminClick,
  selectedDivision,
  selectedDistrict,
  onDivisionChange,
  onDistrictChange,
  onLoginClick,
  onLogout,
  siteName
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchChange = (val: string) => {
    setLocalSearchTerm(val);
    onSearch(val);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative gap-4">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden flex-shrink-0">
            <button 
              onClick={onMobileMenuToggle}
              className="p-2 rounded-lg text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            >
              <LayoutGrid className="h-6 w-6" />
            </button>
          </div>

          {/* Logo - Stylized Bangladesh Flag */}
          <div className="flex flex-shrink-0 items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => { clearSearch(); window.scrollTo(0,0); }}>
              <div className="h-8 w-8 bg-[#006a4e] rounded-full flex items-center justify-center mr-2 shadow-sm group-hover:scale-105 transition-transform relative overflow-hidden">
                <div className="h-4 w-4 bg-[#f42a41] rounded-full shadow-inner"></div>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight whitespace-nowrap transition-colors">
                {siteName ? (
                  <>
                    {siteName.slice(0, 4)}<span className="text-emerald-600">{siteName.slice(4)}</span>
                  </>
                ) : (
                  <>Amar<span className="text-emerald-600">Kotha</span></>
                )}
              </span>
            </div>
          </div>

          {/* Location Filters - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-4 border-l border-gray-200 dark:border-gray-800 pl-4 transition-colors">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <select 
                value={selectedDivision} 
                onChange={(e) => onDivisionChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer pr-1 transition-colors"
              >
                <option value="ALL">All Bangladesh</option>
                {DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
              </select>
              {selectedDivision !== 'ALL' && (
                <div className="flex items-center border-l border-gray-300 dark:border-gray-600 ml-1 pl-2 transition-colors">
                   <select 
                    value={selectedDistrict} 
                    onChange={(e) => onDistrictChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer transition-colors"
                   >
                     <option value="ALL">All Districts</option>
                     {BANGLADESH_LOCATIONS[selectedDivision].map(dist => (
                       <option key={dist} value={dist}>{dist}</option>
                     ))}
                   </select>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-4 max-w-md">
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-9 pr-9 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition duration-150 ease-in-out"
                placeholder="Search issues..."
              />
              {localSearchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            
            {currentUser?.role === 'admin' && (
              <button 
                onClick={onAdminClick}
                className="flex items-center gap-1 bg-gray-800 dark:bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-700 dark:hover:bg-emerald-700 transition shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Admin</span>
              </button>
            )}

            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={`p-2 rounded-full lg:hidden transition-colors ${showMobileSearch ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600'}`}
            >
              <Search className="h-5 w-5" />
            </button>

            {currentUser && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 focus:outline-none relative transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                    )}
                  </button>
                   {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 py-1 z-50 transform origin-top-right">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-lg transition-colors">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center">
                            <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                            No notifications.
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors cursor-pointer ${!notification.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                              onClick={() => onMarkRead(notification.id)}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-emerald-500' : 'bg-transparent'}`} />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{notification.message}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatToBanglaTime(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Desktop Logout Button */}
                <button 
                  onClick={onLogout}
                  className="hidden sm:flex p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
                
                {/* Profile Avatar - HIDDEN ON MOBILE */}
                <button 
                  onClick={onProfileClick}
                  className="hidden sm:block p-0.5 rounded-full border-2 border-emerald-500 shrink-0 overflow-hidden ml-1"
                >
                  <img src={userAvatar} className="w-8 h-8 rounded-full" alt="Profile" />
                </button>
              </div>
            )}

            {!currentUser && (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/10 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Join Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search & Location Filters */}
        {showMobileSearch && (
          <div className="lg:hidden pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-9 pr-9 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm transition-colors"
                placeholder="Search issues..."
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <select 
                  value={selectedDivision} 
                  onChange={(e) => onDivisionChange(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none transition-colors"
                >
                  <option value="ALL">All Divisions</option>
                  {DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
                </select>
              </div>
              <div className={`flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors ${selectedDivision === 'ALL' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => onDistrictChange(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none transition-colors"
                >
                  <option value="ALL">All Districts</option>
                  {selectedDivision !== 'ALL' && BANGLADESH_LOCATIONS[selectedDivision].map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
