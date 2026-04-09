import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { BookOpen, LogOut, PlusCircle, LayoutDashboard, AlertTriangle, Search, Settings, Bell, ChevronDown, ShieldAlert, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function LogoutModal({ onConfirm, onCancel, loading }) {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-zinc-900/30 backdrop-blur-md z-[200] flex items-center justify-center p-4" 
        onClick={onCancel}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 10 }} 
          onClick={e => e.stopPropagation()} 
          className="premium-card w-full max-w-sm p-8 relative overflow-hidden text-zinc-900"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-rose-50 rounded-2xl mx-auto mb-5 shadow-inner">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Sign Out</h2>
          <p className="text-zinc-500 text-sm text-center mb-8 leading-relaxed">
            Ready to pause your growth? Your progress is synchronized to the cloud and waiting for your return.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm} 
              disabled={loading} 
              className="btn-primary w-full shadow-rose-200"
            >
              {loading ? "Signing out..." : "Sign Out Now"}
            </button>
            <button 
              onClick={onCancel} 
              className="btn-outline w-full"
            >
              Stay Logged In
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await auth.signOut();
      toast.info('Session ended.', { icon: '👋' });
      setShowModal(false);
      navigate('/');
    } catch {
      toast.error('Sign out failed');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <nav className={`sticky top-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 shadow-[var(--shadow-glass)] py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-8 h-12">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              Lorven<span className="text-amber-600">Learn</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[400px] relative group mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search for courses, skills..." 
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-100/80 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white text-sm text-zinc-900 transition-all placeholder:text-zinc-400 font-medium shadow-inner" 
            />
            <button 
              type="button"
              onClick={() => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) return toast.error('Browser does not support Speech API');
                const rec = new SpeechRecognition();
                rec.onstart = () => toast.info('Listening...', { icon: '🎙️' });
                rec.onresult = (e) => setSearchQuery(e.results[0][0].transcript);
                rec.start();
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-600 transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>

          {/* Right Nav Navigation */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <Link to="/" className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all ${location.pathname === '/' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                Marketplace
              </Link>
              <Link to="/contact" className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all ${location.pathname === '/contact' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                Support Hub
              </Link>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                 {user.role === 'admin' ? (
                   <Link to="/admin" className={`hidden sm:block px-4 py-2 text-[13px] font-bold rounded-xl transition-all ${location.pathname === '/admin' ? 'text-zinc-900 bg-zinc-100 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                     Command Center
                   </Link>
                 ) : (
                   <Link to="/dashboard" className={`hidden sm:block px-4 py-2 text-[13px] font-bold rounded-xl transition-all ${location.pathname === '/dashboard' ? 'text-zinc-900 bg-zinc-100 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                     My Learning
                   </Link>
                 )}
                 
                 <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)} 
                      className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-amber-50 text-amber-600' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
                    >
                       <Bell className="w-5 h-5" />
                       <span className="absolute top-2.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                    </button>
                    
                    <AnimatePresence>
                      {showNotifications && (
                        <>
                          <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                            className="absolute right-0 top-full mt-3 w-80 premium-card p-5 z-50 origin-top-right"
                          >
                             <div className="flex items-center justify-between mb-4">
                               <h4 className="text-[13px] font-bold text-zinc-900 uppercase tracking-wider">Activity Stream</h4>
                               <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700">Mark all read</button>
                             </div>
                             <div className="space-y-3">
                                {[
                                  { t: 'Course Unlocked', m: 'Advanced Web Architecture is now live.', d: '2m ago', icon: '🚀' },
                                  { t: 'New Achievement', m: 'You reached Level 5! Keep it up.', d: '1h ago', icon: '🏆' },
                                  { t: 'Community Reply', m: 'Dr. Elena Vance replied to your post.', d: '4h ago', icon: '💬' }
                                ].map((n, i) => (
                                  <div key={i} className="flex gap-3 p-3 rounded-2xl border border-zinc-100 hover:border-amber-200 hover:bg-amber-50/50 transition cursor-pointer group">
                                     <div className="text-xl bg-zinc-50 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white">{n.icon}</div>
                                     <div>
                                       <p className="text-[11px] font-bold text-amber-600 uppercase mb-0.5 tracking-wide">{n.t}</p>
                                       <p className="text-[13px] text-zinc-700 font-medium line-clamp-2 leading-snug">{n.m}</p>
                                       <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">{n.d}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowUserMenu(!showUserMenu)} 
                        className="flex items-center gap-2 p-1 pl-2 pr-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all border border-zinc-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showUserMenu && (
                          <>
                            <div className="fixed inset-0 z-0" onClick={() => setShowUserMenu(false)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                              animate={{ opacity: 1, scale: 1, y: 0 }} 
                              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                              className="absolute right-0 mt-3 w-64 premium-card p-3 z-50 origin-top-right"
                            >
                               <div className="p-3 mb-2 bg-gradient-to-br from-zinc-50 to-white rounded-2xl border border-zinc-100">
                                 <p className="text-[15px] font-bold text-zinc-900 truncate">{user.displayName || 'Learner'}</p>
                                 <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
                               </div>
                               
                               <div className="space-y-1">
                                 <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition">
                                    <LayoutDashboard className="w-4 h-4 text-zinc-400" /> Dashboard
                                 </Link>
                                 <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition">
                                    <Settings className="w-4 h-4 text-zinc-400" /> Account Settings
                                 </Link>
                                 {user.role === 'instructor' && (
                                   <Link to="/create-course" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 mt-1 hover:bg-amber-100 transition">
                                      <PlusCircle className="w-4 h-4" /> Create Course
                                   </Link>
                                 )}
                                 {user.role === 'admin' && (
                                   <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 mt-1 hover:bg-rose-100 transition">
                                      <ShieldAlert className="w-4 h-4" /> Command Center
                                   </Link>
                                 )}
                               </div>
                               
                               <div className="pt-2 mt-2 border-t border-zinc-100">
                                 <button 
                                   onClick={() => {
                                     setShowUserMenu(false);
                                     setShowModal(true);
                                   }} 
                                   className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                 >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                 </button>
                               </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary py-2.5 px-5 rounded-xl shadow-amber-500/20 shadow-lg text-[13px] bg-gradient-to-r from-amber-600 to-orange-500 border-none before:hidden">
                  Start Free Trial
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showModal && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowModal(false)} loading={logoutLoading} />}
    </>
  );
}