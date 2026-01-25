
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MapPin, BarChart2, CheckCircle2, PenTool, Send, MoreHorizontal, Edit, Trash2, X, Check, Copy } from 'lucide-react';
import { Post, PostType, User } from '../types';
import { formatToBanglaDateTime } from '../utils';

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onInteract: (id: string, action: 'upvote' | 'downvote') => void;
  onUserClick: (userId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onTagClick?: (tag: string) => void;
  authorData?: User; 
  onEdit?: (postId: string, newTitle: string, newDesc: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUser, 
  onInteract, 
  onUserClick, 
  onAddComment, 
  onTagClick, 
  authorData,
  onEdit,
  onDelete
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Menu & Edit States
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDesc, setEditDesc] = useState(post.description);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.id || 'guest';
  const isAdmin = currentUser?.role === 'admin';
  const isAuthor = currentUserId === post.authorId;
  const canEdit = isAuthor || isAdmin;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = () => {
    switch (post.type) {
      case PostType.ISSUE: return <PenTool className="w-3.5 h-3.5" />;
      case PostType.PETITION: return <CheckCircle2 className="w-3.5 h-3.5" />;
      case PostType.POLL: return <BarChart2 className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getTypeStyle = () => {
    switch (post.type) {
      case PostType.ISSUE: return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
      case PostType.PETITION: return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case PostType.POLL: return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700';
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `${post.title}\n\n${post.description}\n\nRead more on AmarKotha.`,
      url: window.location.href // Ideally, this would be a specific post link
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
      alert('Post content copied to clipboard!');
    }
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (onEdit && editTitle.trim() && editDesc.trim()) {
      onEdit(post.id, editTitle, editDesc);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("Are you sure you want to delete this post?")) {
      onDelete(post.id);
    }
  };

  const renderDescription = (text: string) => {
    const parts = text.split(/(#[\w\u0980-\u09FF]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(part);
            }}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const descriptionLimit = 160;
  const isLongDescription = post.description.length > descriptionLimit;

  const hasUpvoted = (post.upvotesBy || []).includes(currentUserId);
  const hasDownvoted = (post.downvotesBy || []).includes(currentUserId);
  
  const authorAvatar = authorData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-4 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all overflow-hidden group">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick(post.authorId)}>
            <img 
              src={authorAvatar} 
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm bg-gray-100 object-cover" 
              alt={post.author} 
            />
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">{authorData?.name || post.author}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatToBanglaDateTime(post.timestamp)}</span>
                {post.division !== 'National' && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                      <MapPin className="w-2.5 h-2.5" /> {post.district}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center relative">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getTypeStyle()}`}>
              {getTypeIcon()}
              {post.type}
            </div>
            
            <div ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {canEdit && (
                    <>
                      <button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 flex items-center gap-2"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Post
                      </button>
                      <button 
                        onClick={() => { handleDelete(); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 flex items-center gap-2 border-t border-gray-50 dark:border-gray-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </>
                  )}
                  <button 
                    onClick={handleShare}
                    className={`w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 flex items-center gap-2 ${canEdit ? 'border-t border-gray-50 dark:border-gray-800' : ''}`}
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pl-0 sm:pl-12">
          {isEditing ? (
            <div className="space-y-3 mb-4 animate-in fade-in duration-300">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-base sm:text-lg font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Post Title"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={4}
                className="w-full text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="Post Description"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || !editDesc.trim()}
                  className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3 h-3" /> Save Changes
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setEditTitle(post.title); setEditDesc(post.description); }}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
                {renderDescription(post.title)}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                <div className={!isExpanded ? 'line-clamp-3' : ''}>
                  {renderDescription(post.description)}
                </div>
                {isLongDescription && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] mt-2 uppercase tracking-widest hover:underline focus:outline-none"
                  >
                    {isExpanded ? 'Read Less' : 'Read Entire Manifesto'}
                  </button>
                )}
              </div>
            </>
          )}
          
          {!isEditing && post.aiAnalysis && (
            <div className="mb-5 p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 italic flex gap-2">
              <span className="shrink-0 text-emerald-500 font-black not-italic">AI ANALYSIS:</span>
              <p>{post.aiAnalysis}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
            <div className="flex gap-5">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-xl">
                <button 
                  onClick={() => onInteract(post.id, 'upvote')} 
                  className={`flex items-center gap-1.5 text-[11px] font-black transition-all ${hasUpvoted ? 'text-emerald-600 scale-110' : 'text-gray-400 hover:text-emerald-600'}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-emerald-600/10' : ''}`} /> {post.upvotes || 0}
                </button>
                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button 
                  onClick={() => onInteract(post.id, 'downvote')} 
                  className={`flex items-center gap-1.5 text-[11px] font-black transition-all ${hasDownvoted ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-500'}`}
                >
                  <ThumbsDown className={`w-4 h-4 ${hasDownvoted ? 'fill-rose-500/10' : ''}`} /> {post.downvotes || 0}
                </button>
              </div>
              <button 
                onClick={() => setShowComments(!showComments)} 
                className={`flex items-center gap-1.5 text-[11px] font-black transition-colors ${showComments ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
              >
                <MessageCircle className="w-4 h-4" /> {post.comments?.length || 0} <span className="hidden xs:inline tracking-widest uppercase">discussions</span>
              </button>
            </div>
            <button 
              onClick={handleShare}
              className="text-gray-300 dark:text-gray-600 hover:text-emerald-600 p-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {showComments && (
            <div className="mt-5 pt-5 border-t border-gray-50 dark:border-gray-800 space-y-4 animate-in fade-in duration-300">
              <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {(post.comments || []).length > 0 ? (
                  post.comments!.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`} 
                        className="w-8 h-8 rounded-full shrink-0 border border-gray-100 object-cover" 
                        alt={comment.author} 
                      />
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{comment.author}</span>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{formatToBanglaDateTime(comment.timestamp)}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-normal">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initial voice needed. Start the discussion.</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mt-3">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Voice your opinion..." 
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="p-3 bg-emerald-600 text-white rounded-2xl disabled:opacity-30 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
