
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post, User } from '../types';
import PostCard from './PostCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface SinglePostViewProps {
  currentUser: User | null;
  onInteract: (id: string, action: 'upvote' | 'downvote') => void;
  onAddComment: (postId: string, text: string) => void;
  onUserClick: (userId: string) => void;
  onEditPost: (postId: string, newTitle: string, newDesc: string) => void;
  onDeletePost: (postId: string) => void;
  users: Record<string, User>;
  onLoginRequired: () => void;
}

const SinglePostView: React.FC<SinglePostViewProps> = ({
  currentUser,
  onInteract,
  onAddComment,
  onUserClick,
  onEditPost,
  onDeletePost,
  users,
  onLoginRequired
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Post not found</h2>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 text-emerald-600 hover:underline"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors text-sm font-bold uppercase tracking-wide"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>
      
      <PostCard
        post={post}
        currentUser={currentUser || { id: 'guest', name: 'Guest', avatar: '', followers: 0, following: 0, joinedDate: Date.now() }}
        onInteract={(pid, action) => {
            if(!currentUser) onLoginRequired();
            else onInteract(pid, action);
        }}
        onAddComment={(pid, text) => {
             if(!currentUser) onLoginRequired();
             else onAddComment(pid, text);
        }}
        onUserClick={onUserClick}
        onTagClick={() => {}} // No-op in single view or could nav to feed with search
        authorData={users[post.authorId]}
        onEdit={onEditPost}
        onDelete={(pid) => {
            onDeletePost(pid);
            navigate('/');
        }}
      />
    </div>
  );
};

export default SinglePostView;
