import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { BookOpen, LogOut, PlusCircle, LayoutDashboard, AlertTriangle, Search, Settings, Bell, ChevronDown, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
function LogoutModal({ onConfirm, onCancel, loading }) {
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onCancel}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative overflow-hidden">
          <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500"/>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 text-center mb-2">Sign Out</h2>
          <p className="text-zinc-500 text-sm text-center mb-6 leading-relaxed">
            Are you sure you want to sign out of LorvenLearn? Your progress will be saved.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={onConfirm} disabled={loading} className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : "Sign Out"}
            </button>
            <button onClick={onCancel} className="w-full py-3 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);
}
export default function Navbar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const handleSearch = (e) => {
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
            toast.info('Session ended.');
            setShowModal(false);
            navigate('/');
        }
        catch {
            toast.error('Sign out failed');
        }
        finally {
            setLogoutLoading(false);
        }
    };
    return (<>
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">LorvenLearn</span>
          </Link>

          {/* Search Bar - Normalized */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"/>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for anything..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 text-sm transition-all"/>
          </form>

          {/* Right Nav Navigation */}
          <div className="flex items-center gap-2">
            {user ? (<>
                 {user.role === 'admin' ? (<Link to="/admin" className={`hidden sm:block px-4 py-2 text-sm font-semibold transition-colors ${location.pathname === '/admin' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
                     Command Center
                   </Link>) : (<Link to="/dashboard" className={`hidden sm:block px-4 py-2 text-sm font-semibold transition-colors ${location.pathname === '/dashboard' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
                     My Learning
                   </Link>)}
                 
                 <div className="flex items-center gap-1 pl-4 border-l border-zinc-200">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 relative">
                       <Bell className="w-5 h-5"/>
                       <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"/>
                    </button>
                    
                    <div className="relative">
                      <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-1.5 p-1 hover:bg-zinc-50 rounded-lg transition-all">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 border border-zinc-200">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}/>
                      </button>

                      <AnimatePresence>
                        {showUserMenu && (<>
                            <div className="fixed inset-0 z-0" onClick={() => setShowUserMenu(false)}/>
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg p-2 z-50">
                               <div className="p-3 mb-1 border-b border-zinc-100">
                                 <p className="text-sm font-bold text-zinc-900 truncate">{user.displayName || 'Learner'}</p>
                                 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{user.role}</p>
                               </div>
                               
                               <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition">
                                  <LayoutDashboard className="w-4 h-4"/> Dashboard
                               </Link>
                               <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition">
                                  <Settings className="w-4 h-4"/> Profile Settings
                               </Link>
                               {user.role === 'instructor' && (<Link to="/create-course" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition">
                                    <PlusCircle className="w-4 h-4"/> Create Course
                                 </Link>)}
                               {user.role === 'admin' && (<Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-2 rounded-lg text-sm text-orange-600 bg-orange-50 mt-1 hover:bg-orange-100 transition font-bold">
                                    <ShieldAlert className="w-4 h-4"/> Command Center
                                 </Link>)}
                               
                               <div className="pt-1 mt-1 border-t border-zinc-100">
                                 <button onClick={() => { setShowUserMenu(false); setShowModal(true); }} className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition">
                                    <LogOut className="w-4 h-4"/> Sign Out
                                 </button>
                               </div>
                            </motion.div>
                          </>)}
                      </AnimatePresence>
                    </div>
                 </div>
              </>) : (<div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 p-2">
                  Log in
                </Link>
                <Link to="/signup" className="bg-zinc-900 text-white text-sm px-5 py-2.5 rounded-lg font-bold hover:bg-zinc-800 transition-all shadow-sm">
                  Sign up free
                </Link>
              </div>)}
          </div>
        </div>
      </nav>

      {showModal && (<LogoutModal onConfirm={confirmLogout} onCancel={() => setShowModal(false)} loading={logoutLoading}/>)}
    </>);
}
