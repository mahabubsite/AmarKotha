
import React, { useState, useEffect, useMemo } from 'react';
import { User, Post } from '../types';
import { MapPin, Calendar, ArrowLeft, MessageSquare, FileText, Zap, UserPlus, UserCheck, Edit2, Save, X, Check, Loader2, Shield } from 'lucide-react';
import PostCard from './PostCard';
import { formatToBanglaDate } from '../utils';

interface UserProfileProps {
  user: User;
  currentUser: User;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  posts: Post[];
  onBack: () => void;
  onPostInteract: (id: string, action: 'upvote' | 'downvote') => void;
  onUserClick: (userId: string) => void;
  onUpdateProfile: (updatedUser: User) => void;
  onEditPost: (postId: string, newTitle: string, newDesc: string) => void;
  onDeletePost: (postId: string) => void;
}

const AVATAR_PRESETS = [
{
id: 'flag',
url: 'https://flagcdn.com/w160/bd.png',
label: 'BD',
},
{
id: 'm1',
url: '/avatar/doctor.svg',
label: 'M1',
},
{
id: 'm2',
url: '/avatar/engineer.svg',
label: 'M2',
},
{
id: 'm3',
url: '/avatar/female-01.svg',
label: 'M3',
},
{
id: 'f1',
url: '/avatar/female-02.svg',
label: 'F1',
},
{
id: 'f2',
url: '/avatar/female-03.svg',
label: 'F2',
},
{
id: 'f3',
url: '/avatar/female-04.svg',
label: 'F3',
},
{
id: 'bot',
url: '/avatar/male-01.svg',
label: 'AI',
},
{
id: 'bot',
url: '/avatar/male-02.svg',
label: 'AI',
},
{
id: 'bot',
url: '/avatar/male-03.svg',
label: 'AI',
},
{
id: 'bot',
url: '/avatar/male-04.svg',
label: 'AI',
},
{
id: 'bot',
url: '/avatar/protest.svg',
label: 'AI',
},
];

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  currentUser,
  isFollowing,
  onFollowToggle,
  posts, 
  onBack, 
  onPostInteract, 
  onUserClick,
  onUpdateProfile,
  onEditPost,
  onDeletePost
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'history'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
      });
    }
  }, [user]);

  const userPosts = posts.filter(p => p.authorId === user.id);
  
  const userHistory = useMemo(() => {
    const comments = posts.flatMap(p => (p.comments || []).filter(c => c.authorId === user.id).map(c => ({
      ...c, postTitle: p.title, postId: p.id, type: 'Comment'
    })));
    const solutions = posts.flatMap(p => (p.solutions || []).filter(s => s.authorId === user.id).map(s => ({
      id: s.id, author: s.author, authorId: s.authorId || '', content: s.content, timestamp: Date.now(), postTitle: p.title, postId: p.id, type: 'Solution'
    })));
    return [...comments, ...solutions].sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [posts, user.id]);

  const totalImpact = useMemo(() => {
    const postUpvotes = userPosts.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);
    const solutionUpvotes = posts.flatMap(p => p.solutions || [])
      .filter(s => s.authorId === user.id)
      .reduce((acc, curr) => acc + (curr.upvotes || 0), 0);
    return postUpvotes + solutionUpvotes;
  }, [userPosts, posts, user.id]);

  const isMe = user.id === currentUser.id;
  const userAvatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

  const handleSaveProfile = () => {
    onUpdateProfile({ ...user, ...editForm });
    setIsEditing(false);
  };

  if (!user) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="h-44 sm:h-64 bg-emerald-700 dark:bg-emerald-900 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white"></div>
        <button onClick={onBack} className="absolute top-6 left-6 bg-black/20 hover:bg-black/40 text-white p-3 rounded-2xl backdrop-blur-md transition-all z-10 border border-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-20 sm:-mt-32 mb-8">
          <div className="flex flex-col sm:flex-row items-end gap-6">
            <div className="relative group shrink-0">
              <img 
                src={isEditing ? editForm.avatar : userAvatar} 
                alt={user.name} 
                className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border-8 border-white dark:border-gray-950 shadow-2xl object-cover bg-white dark:bg-gray-800 transition-transform"
              />
              {isMe && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 p-3 bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition-all border-4 border-white dark:border-gray-950"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{user.name}</h1>
                    {user.role === 'admin' && <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />}
                  </div>
                  <p className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">@{user.username || 'citizen'}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-md mt-2">{user.bio || 'Building a better Bangladesh through voice and action.'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {user.location || 'Bangladesh'}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {formatToBanglaDate(user.joinedDate || Date.now())}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isMe && (
                    <button
                        onClick={() => onFollowToggle(user.id)}
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg
                        ${isFollowing ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                        {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {isFollowing ? 'Following' : 'Connect'}
                    </button>
                  )}
                  {isMe && isEditing && (
                    <button onClick={handleSaveProfile} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none flex items-center gap-2">
                        <Save className="w-4 h-4" /> Commit Changes
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in duration-300">
               <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Choose Personal Emblem (Avatar)</label>
                    <div className="flex flex-wrap gap-3">
                       {AVATAR_PRESETS.map(preset => (
                         <button 
                            key={preset.id}
                            onClick={() => setEditForm({ ...editForm, avatar: preset.url })}
                            className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all ${editForm.avatar === preset.url ? 'border-emerald-500 scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                         >
                            <img src={preset.url} className="w-full h-full object-cover" alt={preset.label} />
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Display Name</label>
                       <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Base (Location)</label>
                       <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Short Manifesto (Bio)</label>
                     <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-emerald-500 resize-none" />
                  </div>
                  <button onClick={() => setIsEditing(false)} className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl">Revert Changes</button>
               </div>
            </div>
          )}
          
          {!isEditing && (
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                    <span className="text-xl font-black text-gray-900 dark:text-white">{user.followers || 0}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Followers</span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                    <span className="text-xl font-black text-gray-900 dark:text-white">{user.following || 0}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Following</span>
                </div>
                <div className="bg-emerald-600 p-5 rounded-2xl shadow-xl shadow-emerald-900/10 flex flex-col items-center relative overflow-hidden group">
                    <Zap className="absolute -right-3 -bottom-3 w-16 h-16 text-white/10" />
                    <span className="text-xl font-black text-white z-10">{totalImpact}</span>
                    <span className="text-[9px] font-black text-emerald-100 uppercase tracking-[0.2em] mt-1 z-10">Citizen Impact</span>
                </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'posts', label: `Manifestos (${userPosts.length})` },
            { id: 'history', label: `Public Record (${userHistory.length})` }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-gray-900 dark:bg-emerald-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pb-24 space-y-3">
          {activeTab === 'posts' ? (
            userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUser={currentUser} 
                  onInteract={onPostInteract} 
                  onUserClick={onUserClick} 
                  onAddComment={() => {}} 
                  onEdit={onEditPost}
                  onDelete={onDeletePost}
                />
              ))
            ) : (
              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                <FileText className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No contributions recorded</p>
              </div>
            )
          ) : (
            userHistory.length > 0 ? (
              userHistory.map((item: any, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${item.type === 'Solution' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{item.type}</span>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[200px]">Ref: {item.postTitle}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{item.content}</p>
                  <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <Calendar className="w-3 h-3" /> {formatToBanglaDate(item.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                <MessageSquare className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No history found</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
