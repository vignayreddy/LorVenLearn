import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Search, BookOpen, Code, Mail, Settings, ChevronLeft, ChevronRight, LogOut, Award } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', icon: <Home />, label: 'Marketplace', path: '/' },
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'My Dashboard', path: '/dashboard' },
    { id: 'courses', icon: <BookOpen />, label: 'All Courses', path: '/' },
    { id: 'potd', icon: <Code />, label: 'Coding POTD', path: '/potd' },
    { id: 'contact', icon: <Mail />, label: 'Support Hub', path: '/contact' },
    { id: 'settings', icon: <Settings />, label: 'Elite Settings', path: '/settings' },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="hidden lg:flex flex-col bg-white/60 backdrop-blur-xl border-r border-zinc-200/60 shadow-[var(--shadow-glass)] h-screen sticky top-0 z-40 transition-all duration-300"
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-zinc-200/50">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-[10px] tracking-wider">LL</span>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-zinc-900">Lorven<span className="text-amber-600">Learn</span></span>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-white font-bold text-[10px] tracking-wider">LL</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.id} 
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all group ${
                isActive 
                  ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'
              }`}
            >
              <span className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-600' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isActive && !isCollapsed && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pro Badge */}
      {!isCollapsed && (
        <div className="m-5 p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-200/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">Scholar Plus</span>
          </div>
          <p className="text-[12px] text-amber-900/70 font-medium leading-relaxed mb-4 relative z-10">Get unlimited access to all 50+ premium courses.</p>
          <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all relative z-10">Go Elite</button>
        </div>
      )}

      {/* Footer Toggle */}
      <div className="p-4 border-t border-zinc-50">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all font-medium text-[13px] border border-transparent hover:border-zinc-200/50"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse View</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
