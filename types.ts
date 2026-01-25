
export enum PostCategory {
  INFRASTRUCTURE = 'Infrastructure',
  EDUCATION = 'Education',
  ECONOMY = 'Economy',
  CORRUPTION = 'Corruption',
  HEALTH = 'Health',
  ENVIRONMENT = 'Environment',
  OTHER = 'Other'
}

export enum PostType {
  ISSUE = 'Issue',
  PETITION = 'Petition',
  POLL = 'Poll'
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Solution {
  id: string;
  author: string;
  authorId?: string;
  content: string;
  upvotes: number;
  aiSuggested?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'success' | 'info' | 'alert';
  message: string;
  read: boolean;
  timestamp: number;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  author: string;
  authorId: string;
  category: PostCategory;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  shares: number;
  
  // Tracking reactions
  upvotesBy: string[];
  downvotesBy: string[];
  
  // Location
  division: string;
  district: string;
  
  // Hashtags
  hashtags: string[];
  
  // Specific for Issues
  solutions?: Solution[];
  
  // Comments for all types
  comments?: Comment[];
  
  // Specific for Polls/Petitions
  pollOptions?: PollOption[];
  targetSignatures?: number;
  currentSignatures?: number;
  
  // AI Enhanced
  aiAnalysis?: string;

  // User Interaction State (Local user)
  hasSigned?: boolean;
  selectedPollOptionId?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  joinedDate?: number;
  location?: string;
  followers: number;
  following: number;
  role?: 'user' | 'admin';
  
  // Extended fields for Admin Panel
  email?: string;
  username?: string;
  status?: 'Active' | 'Inactive' | 'Banned' | 'Pending' | 'Suspended';
  lastActive?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  maintenanceMode: boolean;
  aiAnalysisEnabled: boolean;
  aiSuggestionsEnabled: boolean;
  defaultDivision: string;
  registrationOpen: boolean;
}
