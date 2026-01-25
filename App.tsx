
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  increment, 
  addDoc, 
  where, 
  limit,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './services/firebase';
import Header from './components/Header';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import UserProfile from './components/UserProfile';
import MobileSidebar from './components/MobileSidebar';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import { Post, User, PostType, Notification, SiteSettings } from './types';
import { Loader2, Search, AlertCircle, Inbox, Plus, X, LogIn } from 'lucide-react';

const ADMIN_EMAIL = 'mdmahbubsite@gmail.com';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'AmarKotha',
  tagline: 'Voice of Bangladesh',
  contactEmail: 'admin@amarkotha.com',
  maintenanceMode: false,
  aiAnalysisEnabled: true,
  aiSuggestionsEnabled: true,
  defaultDivision: 'Dhaka',
  registrationOpen: true,
};

const App: React.FC = () => {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  
  const [view, setView] = useState<'feed' | 'profile' | 'admin'>('feed');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PostType | 'ALL'>('ALL' as any);
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Load Site Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), 
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings);
        } else if (currentUser?.role === 'admin') {
          // Only admin can initialize the settings document
          setDoc(doc(db, "settings", "config"), DEFAULT_SETTINGS).catch(console.error);
        }
      },
      (error) => {
        console.warn("Settings snapshot error:", error.message);
      }
    );
    return unsub;
  }, [currentUser?.role]);

  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    try {
      await setDoc(doc(db, "settings", "config"), newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error("Failed to update settings:", err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setView('feed');
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userDocRef = doc(db, "users", fbUser.uid);
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { id: fbUser.uid, ...docSnap.data() } as User;
            if (fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) userData.role = 'admin';
            setCurrentUser(userData);
            setUsers(prev => ({ ...prev, [fbUser.uid]: userData }));
          } else {
            const initialData: User = { 
              id: fbUser.uid, 
              name: fbUser.displayName || 'Citizen', 
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`, 
              followers: 0, 
              following: 0,
              joinedDate: Date.now()
            };
            setCurrentUser(initialData);
          }
          setIsAuthLoading(false);
          setIsAuthModalOpen(false); 
        });
        return unsubUser;
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Notifications Listener
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.id),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
      },
      (error) => console.warn("Notifications error:", error.code)
    );
    return unsubscribe;
  }, [currentUser?.id]);

  // Posts Listener
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            upvotesBy: data.upvotesBy || [], 
            downvotesBy: data.downvotesBy || [],
            comments: data.comments || [],
            solutions: data.solutions || [],
            hashtags: data.hashtags || [],
            ...data 
          } as Post;
        });
        setPosts(fetchedPosts);
      },
      (error) => console.error("Posts error:", error.message)
    );
    return unsubscribe;
  }, []);

  // Fetch Viewed User
  useEffect(() => {
    if (profileId) {
      if (profileId === currentUser?.id) {
        setViewedUser(currentUser);
      } else if (users[profileId]) {
        setViewedUser(users[profileId]);
      } else {
        getDoc(doc(db, "users", profileId)).then(snap => {
          if (snap.exists()) {
            const u = { id: profileId, ...snap.data() } as User;
            setViewedUser(u);
            setUsers(prev => ({ ...prev, [profileId]: u }));
          }
        });
      }
    }
  }, [profileId, currentUser?.id, users]);

  const handleUpdateProfile = async (updatedUser: User) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", updatedUser.id);
      const { id, ...dataToUpdate } = updatedUser;
      await updateDoc(userRef, dataToUpdate);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    if (currentUser?.role !== 'admin') return;
    try {
      await updateDoc(doc(db, "users", userId), data);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.role !== 'admin') return;
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Permission check handled in Firebase Rules and UI, this is double check
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleEditPost = async (postId: string, newTitle: string, newDesc: string) => {
    try {
      await updateDoc(doc(db, "posts", postId), {
        title: newTitle,
        description: newDesc
      });
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  const handleInteract = async (postId: string, action: 'upvote' | 'downvote') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const upvotesBy = post.upvotesBy || [];
      const downvotesBy = post.downvotesBy || [];
      const hasUpvoted = upvotesBy.includes(currentUser.id);
      const hasDownvoted = downvotesBy.includes(currentUser.id);

      if (action === 'upvote') {
        if (hasUpvoted) {
          await updateDoc(postRef, { upvotes: increment(-1), upvotesBy: arrayRemove(currentUser.id) });
        } else {
          const updates: any = { upvotes: increment(1), upvotesBy: arrayUnion(currentUser.id) };
          if (hasDownvoted) { updates.downvotes = increment(-1); updates.downvotesBy = arrayRemove(currentUser.id); }
          await updateDoc(postRef, updates);
        }
      } else {
        if (hasDownvoted) {
          await updateDoc(postRef, { downvotes: increment(-1), downvotesBy: arrayRemove(currentUser.id) });
        } else {
          const updates: any = { downvotes: increment(1), downvotesBy: arrayUnion(currentUser.id) };
          if (hasUpvoted) { updates.upvotes = increment(-1); updates.upvotesBy = arrayRemove(currentUser.id); }
          await updateDoc(postRef, updates);
        }
      }
    } catch (err) { console.error("Interaction failed:", err); }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const postRef = doc(db, "posts", postId);
      const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        author: currentUser.name,
        authorId: currentUser.id,
        content: text,
        timestamp: Date.now()
      };
      await updateDoc(postRef, { comments: arrayUnion(newComment) });
    } catch (err) { console.error("Comment failed:", err); }
  };

  const filteredPosts = posts.filter(post => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(term) || 
      post.description.toLowerCase().includes(term) ||
      (post.hashtags || []).some(tag => tag.toLowerCase().includes(term));
      
    const matchesType = filterType === 'ALL' || post.type === filterType;
    const matchesDivision = selectedDivision === 'ALL' || post.division === 'National' || post.division === selectedDivision;
    const matchesDistrict = selectedDistrict === 'ALL' || post.district === 'All' || post.district === selectedDistrict;
    return matchesSearch && matchesType && matchesDivision && matchesDistrict;
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Maintenance Page
  if (settings.maintenanceMode && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 p-6 text-center">
        <AlertCircle className="w-20 h-20 text-emerald-500 mb-6" />
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">{settings.siteName} - Maintenance</h1>
        <p className="text-lg text-gray-500 max-w-md">We're currently fine-tuning the platform for a better citizen experience. Please check back soon!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans pb-24 lg:pb-0 transition-colors duration-300">
      {view !== 'admin' && (
        <Header 
          onProfileClick={() => { 
            if (currentUser) {
              setProfileId(currentUser.id); setView('profile'); 
            } else {
              setIsAuthModalOpen(true);
            }
          }} 
          userAvatar={currentUser?.avatar || ''}
          notifications={notifications}
          onMarkRead={() => {}}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          onSearch={setSearchTerm}
          currentUser={currentUser || undefined}
          onAdminClick={() => setView('admin')}
          selectedDivision={selectedDivision}
          selectedDistrict={selectedDistrict}
          onDivisionChange={setSelectedDivision}
          onDistrictChange={setSelectedDistrict}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          siteName={settings.siteName}
        />
      )}

      {view === 'admin' ? (
        <AdminDashboard 
          users={Object.values(users)} 
          posts={posts} 
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onDeletePost={handleDeletePost} 
          onLogout={handleLogout} 
          currentUser={currentUser!} 
          onBack={() => setView('feed')}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : view === 'profile' ? (
        <UserProfile 
          user={viewedUser || currentUser!} 
          currentUser={currentUser!} 
          isFollowing={false} 
          onFollowToggle={() => {}} 
          posts={posts} 
          onBack={() => setView('feed')} 
          onPostInteract={handleInteract} 
          onUserClick={(id) => { setProfileId(id); setView('profile'); }} 
          onUpdateProfile={handleUpdateProfile} 
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6">
          <MobileSidebar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
            currentUser={currentUser || { id: 'guest', name: 'Guest', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest', followers: 0, following: 0 }} 
            onProfileClick={() => { 
              if (currentUser) {
                setProfileId(currentUser.id); setView('profile'); 
              } else {
                setIsAuthModalOpen(true);
              }
            }} 
            onCategoryClick={() => {}} 
            onTrendingClick={(term) => { setSearchTerm(term); setView('feed'); }} 
            onAdminClick={() => setView('admin')} 
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onLoginClick={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            siteName={settings.siteName}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-1 mb-4 flex gap-1 overflow-x-auto no-scrollbar">
                {[ 'ALL', 'Issue', 'Petition', 'Poll' ].map(type => (
                  <button key={type} onClick={() => setFilterType(type as any)} className={`flex-1 py-2 px-4 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${filterType === type ? 'bg-emerald-600 text-white' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {type}
                  </button>
                ))}
              </div>

              {searchTerm && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-xl mb-4 flex items-center justify-between border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Searching for: <span className="font-black">"{searchTerm}"</span></span>
                  </div>
                  <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full text-emerald-600 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="hidden lg:block">
                <CreatePost 
                  onPostCreate={() => {}} 
                  currentUser={currentUser || { name: 'Guest', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest', id: 'guest' }} 
                  onLoginRequired={() => setIsAuthModalOpen(true)}
                  settings={settings}
                />
              </div>

              <div className="space-y-1">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser || { id: 'guest', name: 'Guest', avatar: '', followers: 0, following: 0 }}
                      onInteract={handleInteract} 
                      onAddComment={handleAddComment} 
                      onUserClick={(id) => { setProfileId(id); setView('profile'); }} 
                      onTagClick={(tag) => setSearchTerm(tag)}
                      authorData={users[post.authorId]}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                    />
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                    <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">No contributions found.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-4 hidden lg:block">
              <Sidebar 
                onCategoryClick={() => {}} 
                onTrendingClick={setSearchTerm} 
                isDark={isDark} 
                onToggleTheme={toggleTheme} 
                siteSettings={settings}
                posts={posts}
              />
            </div>
          </div>
        </main>
      )}

      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAuthModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 z-[210] p-2 bg-black/10 hover:bg-black/20 rounded-full text-white sm:text-gray-400 sm:hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <AuthPage onLogin={(user) => { setCurrentUser(user); setIsAuthModalOpen(false); }} siteName={settings.siteName} />
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[40]">
        <button 
          onClick={() => {
            if (currentUser) setIsCreateModalOpen(true);
            else setIsAuthModalOpen(true);
          }}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all animate-in zoom-in-50 duration-300 border-4 border-white dark:border-gray-900"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Create Post Modal for Mobile */}
      {isCreateModalOpen && currentUser && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">New Voice</h2>
            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
             <CreatePost 
                onPostCreate={() => { setIsCreateModalOpen(false); }} 
                currentUser={currentUser} 
                onCancel={() => setIsCreateModalOpen(false)}
                settings={settings}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
