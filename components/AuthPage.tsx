
import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AtSign, ArrowLeft, Loader2, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';

// Added siteName to AuthPageProps to resolve TypeScript error in App.tsx
interface AuthPageProps {
  onLogin: (userData: any) => void;
  siteName?: string;
}

type AuthState = 'LOGIN' | 'SIGNUP' | 'FORGOT';

const ADMIN_EMAIL = 'mdmahbubsite@gmail.com';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, siteName }) => {
  const [view, setView] = useState<AuthState>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const [usernameStatus, setUsernameStatus] = useState<'IDLE' | 'CHECKING' | 'TAKEN' | 'AVAILABLE'>('IDLE');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (view !== 'SIGNUP' || !formData.username || formData.username.length < 3) {
      setUsernameStatus('IDLE');
      return;
    }

    const checkUsernameAvailability = async () => {
      setUsernameStatus('CHECKING');
      try {
        const usernameRef = doc(db, "usernames", formData.username.toLowerCase().trim());
        const docSnap = await getDoc(usernameRef);
        
        if (docSnap.exists()) {
          setUsernameStatus('TAKEN');
          setSuggestions([
            `${formData.username}_bd`,
            `${formData.username}${Math.floor(Math.random() * 99)}`,
            `citizen.${formData.username}`
          ]);
        } else {
          setUsernameStatus('AVAILABLE');
          setSuggestions([]);
        }
      } catch (e: any) {
        console.warn("Username check encountered an issue:", e.message);
        setUsernameStatus('IDLE');
      }
    };

    const timer = setTimeout(checkUsernameAvailability, 600);
    return () => clearTimeout(timer);
  }, [formData.username, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (view === 'LOGIN') {
        const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
        
        let userData;
        if (userDoc.exists()) {
          userData = { id: userCred.user.uid, ...userDoc.data() };
        } else {
          userData = { 
            id: userCred.user.uid, 
            name: userCred.user.displayName || 'Citizen', 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCred.user.uid}` 
          };
        }

        if (formData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          userData.role = 'admin';
        }
        
        onLogin(userData);
      } else if (view === 'SIGNUP') {
        if (usernameStatus === 'TAKEN') throw new Error("Username is already taken.");
        if (!formData.agreeTerms) throw new Error("Please agree to the Terms & Privacy Policy.");
        
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCred.user, { displayName: formData.name });
        
        const username = formData.username.toLowerCase().trim();
        const isAdmin = formData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        const userData = {
          id: userCred.user.uid,
          name: formData.name,
          username: username,
          email: formData.email.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCred.user.uid}`,
          role: isAdmin ? 'admin' : 'user',
          followers: 0,
          following: 0,
          joinedDate: Date.now(),
          status: 'Active'
        };

        const batch = writeBatch(db);
        batch.set(doc(db, "users", userCred.user.uid), userData);
        batch.set(doc(db, "usernames", username), { uid: userCred.user.uid });
        await batch.commit();

        onLogin(userData);
      } else if (view === 'FORGOT') {
        await sendPasswordResetEmail(auth, formData.email);
        setIsEmailSent(true);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message.replace('Firebase:', '').replace('auth/', '');
      // Friendly error messages
      if (msg.includes('email-already-in-use')) msg = 'Email is already registered.';
      if (msg.includes('weak-password')) msg = 'Password should be at least 6 characters.';
      if (msg.includes('invalid-credential')) msg = 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (sug: string) => {
    setFormData({ ...formData, username: sug });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 dark:shadow-none overflow-hidden flex flex-col md:flex-row transition-all duration-500 border border-transparent dark:border-gray-800">
        
        <div className="hidden md:flex md:w-1/2 bg-emerald-600 dark:bg-emerald-700 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="h-4 w-4 bg-red-500 rounded-full"></div>
              </div>
              <span className="font-black text-2xl text-white tracking-tighter">{siteName || 'AmarKotha'}</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-6">
              {view === 'LOGIN' && 'বাংলাদেশের মানুষের শক্তি, সবার কথা।'}
              {view === 'SIGNUP' && 'নতুন যাত্রায় আপনাকে স্বাগতম।'}
              {view === 'FORGOT' && 'চিন্তা করবেন না, আমরা আছি সাথে।'}
            </h1>
            <p className="text-emerald-50 text-lg opacity-80 leading-relaxed font-medium">
              Join the movement. Report issues. Build the future.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 text-emerald-100 text-sm font-bold bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
            <span>Secure Citizen Authentication</span>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white dark:bg-gray-900">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-[2.5rem]">
               <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          )}

          {view !== 'LOGIN' && (
            <button onClick={() => { setView('LOGIN'); setIsEmailSent(false); }} className="group flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-8 transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </button>
          )}

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {view === 'LOGIN' ? 'স্বাগতম!' : view === 'SIGNUP' ? 'একউন্ট খুলুন' : 'পাসওয়ার্ড উদ্ধার'}
            </h2>
            {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/30 mb-4">{error}</div>}
          </div>

          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'SIGNUP' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500" />
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Joy Ahmed" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-11 pr-4 py-3 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 flex justify-between">
                      Username
                      {usernameStatus === 'CHECKING' && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
                      {usernameStatus === 'AVAILABLE' && <span className="text-emerald-500 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 rounded">AVAILABLE</span>}
                      {usernameStatus === 'TAKEN' && <span className="text-red-500 text-[9px] font-bold bg-red-50 dark:bg-red-900/20 px-1.5 rounded">UNAVAILABLE</span>}
                    </label>
                    <div className="relative group">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.replace(/\s+/g, '').toLowerCase()})} placeholder="joy_bd" className={`w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-11 pr-4 py-3 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white ${usernameStatus === 'TAKEN' ? 'ring-2 ring-red-500/20' : ''}`} />
                    </div>
                    {usernameStatus === 'TAKEN' && suggestions.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-1">
                        <span className="text-[9px] text-gray-400 font-bold">Try:</span>
                        {suggestions.map(s => (
                          <button key={s} type="button" onClick={() => handleSuggestionClick(s)} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500" />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="joy@example.com" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-11 pr-4 py-3 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white" />
                </div>
              </div>

              {view !== 'FORGOT' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                    {view === 'LOGIN' && <button type="button" onClick={() => setView('FORGOT')} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Forgot?</button>}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="••••••••" 
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-11 pr-12 py-3 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {view === 'SIGNUP' && (
                <div className="flex items-center gap-3 px-1 py-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, agreeTerms: !formData.agreeTerms })}
                    className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.agreeTerms ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 dark:border-gray-700 bg-transparent'}`}
                  >
                    {formData.agreeTerms && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium cursor-pointer" onClick={() => setFormData({ ...formData, agreeTerms: !formData.agreeTerms })}>
                    I agree to the <span className="text-emerald-600 font-bold hover:underline">Terms of Service</span> and <span className="text-emerald-600 font-bold hover:underline">Privacy Policy</span>.
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || (view === 'SIGNUP' && (!formData.agreeTerms || usernameStatus === 'TAKEN'))}
                className="w-full bg-emerald-600 text-white rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {view === 'LOGIN' ? 'Login Now' : view === 'SIGNUP' ? 'Create Account' : 'Send Link'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center p-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in-95">
              <Mail className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="font-black text-gray-900 dark:text-white mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">We've sent reset instructions to {formData.email}</p>
              <button onClick={() => setIsEmailSent(false)} className="mt-6 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest hover:underline">Try another email</button>
            </div>
          )}

          <div className="mt-10 text-center">
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {view === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => { setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(null); }} className="ml-2 text-emerald-600 dark:text-emerald-400 font-black hover:underline">
                  {view === 'LOGIN' ? 'Join Now' : 'Login'}
                </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
