
import React, { useMemo } from 'react';
import { PostCategory, SiteSettings, Post } from '../types';
import { Hash, TrendingUp, Info, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  onCategoryClick?: (category: PostCategory) => void;
  onTrendingClick?: (term: string) => void;
  onLegalClick?: (type: 'privacy' | 'terms') => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  siteSettings?: SiteSettings;
  posts?: Post[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onCategoryClick, 
  onTrendingClick, 
  onLegalClick, 
  isDark, 
  onToggleTheme, 
  siteSettings,
  posts = []
}) => {
  const trendingTags = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.hashtags) {
        post.hashtags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [posts]);

  const trendingPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const scoreA = (a.upvotes || 0) + (a.comments?.length || 0) * 2;
        const scoreB = (b.upvotes || 0) + (b.comments?.length || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [posts]);

  return (
    <div className="space-y-6">
      
      {/* Platform Info */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-800 transition-colors">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            About {siteSettings?.siteName || 'AmarKotha'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {siteSettings?.tagline || 'A platform for Bangladesh to discuss issues, propose solutions, and gather support.'}
        </p>
        <div className="mt-4 flex gap-2">
            <div className="text-center flex-1">
                <div className="text-xl font-bold text-gray-900 dark:text-white">12k</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 uppercase font-black text-[9px]">Citizens</div>
            </div>
            <div className="text-center flex-1 border-l border-gray-200 dark:border-gray-700">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">540</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 uppercase font-black text-[9px]">Solved</div>
            </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
          <Hash className="w-4 h-4 text-emerald-500" /> Categories
        </h3>
        <div className="space-y-1">
          {Object.values(PostCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryClick?.(cat)}
              className="w-full text-left px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded transition-colors flex justify-between group"
            >
              {cat}
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 px-1.5 rounded-full transition-colors">
                {posts.filter(p => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Hashtags */}
      {trendingTags.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Trending Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => onTrendingClick?.(tag)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
              >
                {tag} <span className="text-[10px] text-gray-400 font-medium ml-1">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
          <TrendingUp className="w-4 h-4 text-rose-500" /> Hot Topics
        </h3>
        <ul className="space-y-3">
          {trendingPosts.map(post => (
            <li key={post.id} className="text-sm">
              <button 
                onClick={() => onTrendingClick?.(post.title)} 
                className="text-left font-medium text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 block line-clamp-2 w-full transition-colors"
              >
                {post.title}
              </button>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                {(post.upvotes || 0) + (post.comments?.length || 0)} interactions
              </span>
            </li>
          ))}
          {trendingPosts.length === 0 && (
            <p className="text-xs text-gray-400 italic">No trending topics yet.</p>
          )}
        </ul>
      </div>

      {/* Desktop Theme Toggle */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-xs uppercase tracking-widest">Appearance</h3>
        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all border border-gray-100 dark:border-gray-700"
        >
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{isDark ? 'Dark Mode Active' : 'Light Mode Active'}</span>
          {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-emerald-600" />}
        </button>
      </div>

      <div className="px-4 text-center">
        <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
           <button onClick={() => onLegalClick?.('privacy')} className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">Privacy</button>
           <button onClick={() => onLegalClick?.('terms')} className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">Terms</button>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-tighter">
          &copy; 2026 {siteSettings?.siteName || 'AmarKotha'}.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
