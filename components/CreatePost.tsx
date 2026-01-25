
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PenTool, CheckCircle2, BarChart2, Sparkles, Loader2, X, MapPin, Plus, Minus, LogIn } from 'lucide-react';
import { PostType, PostCategory, Post, SiteSettings } from '../types';
import { analyzePostContent } from '../services/geminiService';
import { BANGLADESH_LOCATIONS, DIVISIONS } from '../constants/locations';

interface CreatePostProps {
  onPostCreate: (post: Post) => void;
  currentUser: { name: string; avatar: string; id: string };
  initialType?: PostType;
  onCancel?: () => void;
  onLoginRequired?: () => void;
  settings?: SiteSettings;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate, currentUser, initialType = PostType.ISSUE, onCancel, onLoginRequired, settings }) => {
  const isGuest = currentUser.id === 'guest';
  const [activeTab, setActiveTab] = useState<PostType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const extractHashtags = (text: string) => {
    const hashtags = text.match(/#[\w\u0980-\u09FF]+/g);
    return hashtags ? Array.from(new Set(hashtags.map(tag => tag.toLowerCase()))) : [];
  };

  const handleAddOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) return; 
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onLoginRequired?.();
      return;
    }
    if (!title || isSubmitting) return;

    const validPollOptions = pollOptions
      .filter(opt => opt.trim() !== '')
      .map((opt, idx) => ({ id: `o${idx + 1}`, text: opt, votes: 0 }));

    if (activeTab === PostType.POLL && validPollOptions.length < 2) {
      alert("Please provide at least 2 poll options.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const combinedText = `${title} ${description}`;
      const hashtags = extractHashtags(combinedText);

      const newPostData = {
        type: activeTab,
        title,
        description,
        author: currentUser.name,
        authorId: currentUser.id,
        category: PostCategory.OTHER, 
        timestamp: Date.now(),
        upvotes: 0,
        downvotes: 0,
        shares: 0,
        upvotesBy: [],
        downvotesBy: [],
        division: division || 'National',
        district: district || 'All',
        hashtags: hashtags,
        aiAnalysis: aiSuggestion || null,
        comments: [],
        solutions: activeTab === PostType.ISSUE ? [] : [],
        pollOptions: activeTab === PostType.POLL ? validPollOptions : []
      };

      await addDoc(collection(db, "posts"), newPostData);
      
      setTitle('');
      setDescription('');
      setPollOptions(['', '']);
      setAiSuggestion(null);
      if (onCancel) onCancel();
    } catch (err) {
      console.error("Error creating post", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicFill = async () => {
    if (isGuest) {
      onLoginRequired?.();
      return;
    }
    if (!title && !description) return;
    setIsAnalyzing(true);
    const r = await analyzePostContent(description || title);
    setAiSuggestion(r.suggestion);
    setIsAnalyzing(false);
  };

  if (isGuest) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl lg:shadow-sm mb-4 p-6 border border-gray-200 dark:border-gray-800 text-center transition-colors">
        <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Have a voice in Bangladesh's future?</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">Join thousands of citizens discussing national issues, proposing solutions, and creating positive change.</p>
        <button 
          onClick={onLoginRequired}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-900/10 flex items-center gap-2 mx-auto"
        >
          <LogIn className="w-4 h-4" /> Start Posting Now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl lg:shadow-sm mb-4 overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {[PostType.ISSUE, PostType.PETITION, PostType.POLL].map(type => (
          <button key={type} type="button" onClick={() => setActiveTab(type)} className={`py-3 px-6 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeTab === type ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            {type}
            {activeTab === type && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 dark:bg-emerald-500" />}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="flex gap-4">
          <img src={currentUser.avatar} className="w-10 h-10 rounded-full shrink-0 border border-gray-200 dark:border-gray-700" alt="Me" />
          <div className="flex-1 space-y-2">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={activeTab === PostType.POLL ? "What is the poll question?" : `What is the ${activeTab.toLowerCase()}? Use #hashtags`} 
              className="w-full text-base font-black border-none bg-transparent text-gray-900 dark:text-white focus:ring-0 p-0 placeholder-gray-300 dark:placeholder-gray-600" 
            />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder={activeTab === PostType.POLL ? "Additional details (optional)..." : "Provide context or evidence... (use #hashtags)"} 
              className="w-full text-sm text-gray-600 dark:text-gray-400 border-none bg-transparent focus:ring-0 resize-none p-0 min-h-[80px]" 
            />
          </div>
        </div>

        {activeTab === PostType.POLL && (
          <div className="ml-0 sm:ml-14 space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Poll Options</label>
              <button 
                type="button" 
                onClick={handleAddOption}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {pollOptions.map((opt, index) => (
                <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-left-2 duration-200">
                  <div className="w-6 text-[10px] font-black text-gray-300 dark:text-gray-700 text-center">{index + 1}</div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                  {pollOptions.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {aiSuggestion && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 ml-0 sm:ml-14 text-xs italic text-emerald-800 dark:text-emerald-300 flex gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <p><b>AI Suggestion:</b> {aiSuggestion}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-50 dark:border-gray-800 ml-0 sm:ml-14">
          <div className="flex gap-2">
            <select value={division} onChange={e => setDivision(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 py-1.5 focus:ring-1 focus:ring-emerald-500">
              <option value="">Division</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {division && (
              <select value={district} onChange={e => setDistrict(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 py-1.5 focus:ring-1 focus:ring-emerald-500">
                <option value="">District</option>
                {BANGLADESH_LOCATIONS[division].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleMagicFill} disabled={isAnalyzing || (!title && !description) || (settings && !settings.aiAnalysisEnabled)} className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 transition-all">
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Refine with AI
            </button>
            <button disabled={!title || isSubmitting} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all">
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Post Now'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
