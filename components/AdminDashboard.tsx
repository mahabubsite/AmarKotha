
import React, { useState, useMemo } from 'react';
import { User, Post, PostType, PostCategory, SiteSettings } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  BarChart2,
  Shield,
  PenTool,
  Save,
  Download,
  Plus,
  Edit2,
  X,
  FileText,
  ShieldAlert,
  ArrowLeft,
  Mail,
  MoreVertical,
  Check,
  UserPlus,
  Sparkles,
  Globe,
  Bell,
  Lock,
  Zap,
  Loader2
} from 'lucide-react';
import { formatToBanglaDate } from '../utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DIVISIONS } from '../constants/locations';

interface AdminDashboardProps {
  users: User[];
  posts: Post[];
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  onLogout?: () => void;
  onBack?: () => void;
  currentUser: User;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  posts, 
  onUpdateUser,
  onDeleteUser,
  onDeletePost, 
  onLogout,
  onBack,
  currentUser,
  settings,
  onUpdateSettings
}) => {
  const [activePage, setActivePage] = useState<'dashboard' | 'users' | 'reports' | 'polls' | 'petitions' | 'settings'>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Settings State
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalComments = posts.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);
  const totalSolutions = posts.reduce((acc, curr) => acc + (curr.solutions?.length || 0), 0);
  
  const activityData = [
    { name: 'Jan', value: 10 },
    { name: 'Feb', value: 15 },
    { name: 'Mar', value: 35 },
    { name: 'Apr', value: 25 },
    { name: 'May', value: 55 },
    { name: 'Jun', value: 45 },
    { name: 'Jul', value: 80 },
  ];

  const categoryData = Object.values(PostCategory).map(cat => ({
    name: cat,
    value: posts.filter(p => p.category === cat).length || 1 
  }));

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
                            (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                            (u.username || '').toLowerCase().includes(userSearch.toLowerCase());
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const matchesRole = roleFilter === 'All' || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, userSearch, statusFilter, roleFilter]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSaveStatus('idle');
    try {
      await onUpdateSettings(localSettings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const StatsCard = ({ title, value, change, isPositive }: any) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-2">{title}</h3>
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value.toLocaleString()}</div>
        <div className={`flex items-center gap-0.5 text-[10px] font-black ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}%
        </div>
      </div>
    </div>
  );

  const getStatusStyle = (status: string | undefined) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400';
      case 'Banned': return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400';
      case 'Inactive': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const ContentTable = ({ type, title }: { type: PostType, title: string }) => {
    const items = posts.filter(p => p.type === type);
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
           <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">{title} ({items.length})</h2>
           <button className="text-[10px] font-black uppercase text-emerald-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Title & Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Author</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Engagements</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{post.title}</div>
                    <div className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-tighter mt-0.5">{post.category} • {post.division}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} className="w-6 h-6 rounded-full" />
                       <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4 text-[10px] font-black">
                      <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="w-3 h-3" /> {post.upvotes}</span>
                      <span className="flex items-center gap-1 text-gray-400"><FileText className="w-3 h-3" /> {post.comments?.length || 0}</span>
                      {post.type === PostType.POLL && <span className="flex items-center gap-1 text-blue-500"><BarChart2 className="w-3 h-3" /> Poll</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDeletePost(post.id)} className="p-2 text-gray-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No data available in this category</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Name,Username,Email,Role,Status", ...filteredUsers.map(u => `${u.name},${u.username},${u.email},${u.role},${u.status}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "citizens_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 font-sans transition-colors duration-300">
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Edit Citizen</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Profile #ID-{editingUser.id.slice(0,6)}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Citizen Name</label>
                <input 
                  type="text" 
                  value={editingUser.name} 
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Public Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">@</span>
                  <input 
                    type="text" 
                    value={editingUser.username || ''} 
                    onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-8 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { onUpdateUser(editingUser.id, { name: editingUser.name, username: editingUser.username }); setEditingUser(null); }}
                  className="flex-1 bg-emerald-600 text-white rounded-2xl py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  Update Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] dark:bg-black text-white flex flex-col fixed h-full z-30 shadow-2xl border-r border-white/5">
        <div className="p-8 flex items-center gap-3 mb-6">
          {/* Bangladesh Flag stylization for Admin Sidebar */}
          <div className="h-9 w-9 bg-[#006a4e] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10">
             <div className="h-4 w-4 bg-[#f42a41] rounded-full"></div>
          </div>
          <span className="text-xl font-black tracking-tight uppercase">Amar<span className="text-emerald-500">Kotha</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 mt-2">Platform Engine</p>
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
            { id: 'users', icon: Users, label: 'Citizen Hub' },
            { id: 'reports', icon: PenTool, label: 'Issues & Reports' },
            { id: 'polls', icon: BarChart2, label: 'Voting / Polls' },
            { id: 'petitions', icon: CheckCircle2, label: 'Active Petitions' },
            { id: 'settings', icon: SettingsIcon, label: 'Platform Settings' }
          ].map(btn => (
            <button 
              key={btn.id}
              onClick={() => setActivePage(btn.id as any)} 
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activePage === btn.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <btn.icon className="w-4 h-4" /> {btn.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          <button onClick={onBack} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" /> Site Front
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{activePage} Panel</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">Real-time surveillance and administrative command.</p>
            </div>
            <div className="flex gap-2 text-[10px] font-black text-gray-400">
               <span className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">{new Date().toLocaleDateString()}</span>
               <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">Secure Link</span>
            </div>
        </header>

        {activePage === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatsCard title="Registered Citizens" value={totalUsers} change={12} isPositive={true} />
                <StatsCard title="Citizen Activities" value={totalPosts} change={5} isPositive={true} />
                <StatsCard title="Public Discussions" value={totalComments} change={25} isPositive={true} />
                <StatsCard title="Positive Impact" value={totalSolutions} change={1} isPositive={false} />
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Platform Engagement Flow</h3>
                      <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2">
                        <option>Past 7 Days</option>
                        <option>Past 30 Days</option>
                      </select>
                   </div>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={activityData}>
                            <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-800" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} />
                            <Tooltip contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px'}} />
                            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={4} fill="url(#colorVal)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                   <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs mb-8">Type Distribution</h3>
                   <div className="h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                         <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalPosts}</div>
                         <div className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</div>
                      </div>
                   </div>
                   <div className="mt-4 space-y-2">
                      {categoryData.slice(0, 3).map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                              <span>{cat.name}</span>
                           </div>
                           <span className="text-gray-900 dark:text-white">{cat.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activePage === 'users' && (
           <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-6">
               <div className="flex-1 min-w-[300px] relative">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input 
                  type="text" 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Scan by Name, @Username or Email..." 
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                 />
               </div>
               <div className="flex items-center gap-3">
                  <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-3.5 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">System Admin</option>
                    <option value="User">Standard User</option>
                  </select>
                  <button onClick={handleExport} className="p-3.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 transition shadow-sm">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none">
                    <UserPlus className="w-4 h-4" /> New Citizen
                  </button>
               </div>
             </div>

             <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                     <tr>
                       <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Citizen Entity</th>
                       <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Identity Handle</th>
                       <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status / Risk</th>
                       <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">System Role</th>
                       <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {filteredUsers.map((user) => (
                       <tr key={user.id} className="hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-colors group">
                         <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                             <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-11 h-11 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover" />
                             <div>
                               <div className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{user.name}</div>
                               <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-5">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">@{user.username || 'unknown'}</span>
                         </td>
                         <td className="px-6 py-5">
                           <button 
                             onClick={() => onUpdateUser(user.id, { status: user.status === 'Banned' ? 'Active' : 'Banned' })}
                             className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${getStatusStyle(user.status)}`}
                           >
                             {user.status || 'Active'}
                           </button>
                         </td>
                         <td className="px-6 py-5">
                            <select 
                              value={user.role || 'user'}
                              onChange={(e) => onUpdateUser(user.id, { role: e.target.value as any })}
                              className="bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 border-none rounded-xl focus:ring-0 cursor-pointer py-1.5 px-3"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                         </td>
                         <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setEditingUser(user)} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => onDeleteUser(user.id)} className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        )}

        {activePage === 'reports' && <ContentTable type={PostType.ISSUE} title="National Issues & Reports" />}
        {activePage === 'polls' && <ContentTable type={PostType.POLL} title="Active Polls & Surveys" />}
        {activePage === 'petitions' && <ContentTable type={PostType.PETITION} title="Verified Petitions" />}

        {activePage === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center justify-between mb-2">
                <div>
                   <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Site Configuration</h2>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Manage global platform behavior and identity.</p>
                </div>
                <div className="flex items-center gap-3">
                   {saveStatus === 'success' && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Changes Saved!</span>}
                   {saveStatus === 'error' && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Error Saving</span>}
                   <button 
                    onClick={handleSaveSettings} 
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                   >
                     {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Commit Site Global Updates
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Branding Section */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Identity & Branding</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Platform Name</label>
                         <input 
                            type="text" 
                            value={localSettings.siteName} 
                            onChange={e => setLocalSettings({...localSettings, siteName: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" 
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Global Tagline</label>
                         <input 
                            type="text" 
                            value={localSettings.tagline} 
                            onChange={e => setLocalSettings({...localSettings, tagline: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" 
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Administrative Contact Email</label>
                         <input 
                            type="email" 
                            value={localSettings.contactEmail} 
                            onChange={e => setLocalSettings({...localSettings, contactEmail: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" 
                         />
                      </div>
                   </div>
                </div>

                {/* AI Engine Section */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Gemini AI Control</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">Post Content Analysis</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Automatically categorize and analyze new citizen reports.</p>
                         </div>
                         <button 
                            onClick={() => setLocalSettings({...localSettings, aiAnalysisEnabled: !localSettings.aiAnalysisEnabled})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.aiAnalysisEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.aiAnalysisEnabled ? 'left-7' : 'left-1'}`} />
                         </button>
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">AI Solution Suggestions</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Suggest practical solutions for verified national issues.</p>
                         </div>
                         <button 
                            onClick={() => setLocalSettings({...localSettings, aiSuggestionsEnabled: !localSettings.aiSuggestionsEnabled})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.aiSuggestionsEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.aiSuggestionsEnabled ? 'left-7' : 'left-1'}`} />
                         </button>
                      </div>
                   </div>
                </div>

                {/* Safety & Regional Section */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Safety & Access</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">Maintenance Mode</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter text-rose-500">Lock the platform for all non-admin users.</p>
                         </div>
                         <button 
                            onClick={() => setLocalSettings({...localSettings, maintenanceMode: !localSettings.maintenanceMode})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.maintenanceMode ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                         </button>
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">Public Registration</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Allow new citizens to create accounts.</p>
                         </div>
                         <button 
                            onClick={() => setLocalSettings({...localSettings, registrationOpen: !localSettings.registrationOpen})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.registrationOpen ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.registrationOpen ? 'left-7' : 'left-1'}`} />
                         </button>
                      </div>
                   </div>
                </div>

                {/* Regional Default Section */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-amber-500" />
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Regional Intelligence</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Primary Division Focus</label>
                         <select 
                            value={localSettings.defaultDivision} 
                            onChange={e => setLocalSettings({...localSettings, defaultDivision: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                         >
                            {DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
                         </select>
                         <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2 px-1">New reports will fallback to this region if unspecified.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
