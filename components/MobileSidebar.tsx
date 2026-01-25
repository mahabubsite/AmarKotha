
import React from 'react';
import Sidebar from './Sidebar';
import { X, User, ShieldAlert, Sun, Moon, Palette, LogIn, LogOut } from 'lucide-react';
import { User as UserType, PostCategory } from '../types';

// Added siteName and onLogout to MobileSidebarProps
interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onProfileClick: () => void;
  onCategoryClick: (category: PostCategory) => void;
  onTrendingClick: (term: string) => void;
  onAdminClick?: () => void;
  onLegalClick?: (type: 'privacy' | 'terms') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
  siteName?: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onProfileClick,
  onCategoryClick,
  onTrendingClick,
  onAdminClick,
  onLegalClick,
  isDark,
  onToggleTheme,
  onLoginClick,
  onLogout,
  siteName
}) => {
  const isGuest = currentUser.id === 'guest';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-gray-50 dark:bg-gray-950 z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-gray-200 dark:border-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header with stylized flag */}
          <div className="p-5 bg-emerald-700 dark:bg-emerald-800 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 bg-[#006a4e] rounded-full flex items-center justify-center border border-white/20">
                  <div className="w-2.5 h-2.5 bg-[#f42a41] rounded-full"></div>
               </div>
               <span className="font-black uppercase tracking-widest text-[10px]">Citizen Hub</span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-4 mb-4 cursor-pointer" onClick={() => { if(!isGuest) { onProfileClick(); onClose(); } else { onLoginClick?.(); onClose(); } }}>
                <img src={currentUser.avatar} alt="User" className="w-14 h-14 rounded-full border-2 border-emerald-500 shadow-md object-cover" />
                <div>
                   <h3 className="font-black text-gray-900 dark:text-white tracking-tight">{isGuest ? 'Guest Citizen' : currentUser.name}</h3>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{isGuest ? 'Browse Mode' : 'My Profile'}</p>
                </div>
             </div>
             
             <div className="flex gap-2">
                {isGuest ? (
                   <button 
                    onClick={() => { onLoginClick?.(); onClose(); }}
                    className="flex-1 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
                  >
                    <LogIn className="w-4 h-4" /> Join Conversations
                  </button>
                ) : (
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { onProfileClick(); onClose(); }}
                            className="flex-1 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-center gap-2"
                        >
                          <User className="w-3.5 h-3.5" /> Profile
                        </button>
                        {currentUser.role === 'admin' && (
                             <button 
                                onClick={() => { onAdminClick?.(); onClose(); }}
                                className="py-2.5 px-4 bg-gray-900 dark:bg-gray-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-800 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                            >
                            <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Admin
                            </button>
                        )}
                    </div>
                    {/* Logout Button in Mobile Profile Section */}
                    <button 
                        onClick={() => { onLogout?.(); onClose(); }}
                        className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out from {siteName || 'AmarKotha'}
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* Theme Toggle Section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Palette className="w-3 h-3" /> Appearance
            </h4>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-1 flex gap-1">
              <button 
                onClick={() => { if(isDark) onToggleTheme(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isDark ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button 
                onClick={() => { if(!isDark) onToggleTheme(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isDark ? 'bg-gray-800 text-emerald-400 shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             <Sidebar 
                onCategoryClick={(cat) => { onCategoryClick(cat); onClose(); }} 
                onTrendingClick={(term) => { onTrendingClick(term); onClose(); }} 
                onLegalClick={(type) => { onLegalClick?.(type); onClose(); }}
             />
          </div>

          <div className="p-6 text-center text-[10px] font-black text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 uppercase tracking-widest">
             {siteName || 'AmarKotha'} v1.0 &copy; 2026
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
