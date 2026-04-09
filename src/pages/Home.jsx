import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Star, IndianRupee, Search, X, Globe, Timer, ShieldCheck, Zap as FlashIcon, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Shared Static Catalog ─────────────────────────────────────
const CATEGORIES = ['All', 'Web Development', 'UI/UX Design', 'Data Science', 'Mobile Development', 'Finance', 'Health', 'Music', 'Business', 'Marketing', 'Cybersecurity', 'AI & Machine Learning', 'Arts', 'DevOps'];
const LEVELS = ['All Icons', 'Beginner', 'Intermediate', 'Advanced'];

// ── Components ───────────────────────────────────────────────

const CourseCard = React.memo(({ course, index }) => {
  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} 
      className="premium-card hover-lift flex flex-col group overflow-hidden h-full"
    >
      <Link to={`/course/${course.id}`} className="block relative h-48 overflow-hidden bg-zinc-100">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img 
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
        />
        {course.isBestseller && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm z-20">
            Bestseller
          </div>
        )}
        {discount > 0 && (
          <div className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm z-20">
            Save {discount}%
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">{course.category}</span>
          <div className="flex items-center gap-1 text-[12px] font-bold text-zinc-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {(course.rating || 4.5).toFixed(1)}
          </div>
        </div>

        <h3 className="font-bold text-zinc-900 text-[17px] leading-snug mb-2 line-clamp-2 min-h-[2.8rem] group-hover:text-amber-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-[13px] text-zinc-500 mb-5 truncate font-medium flex-1">{course.instructorName}</p>

        <div className="mt-auto pt-4 border-t border-zinc-100/80 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-zinc-900 tracking-tight">
              <span className="text-[14px]">₹</span>{course.price.toLocaleString('en-IN')}
            </span>
            {course.originalPrice && (
              <span className="text-[12px] text-zinc-400 line-through font-medium ml-1">₹{course.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <Link 
            to={`/course/${course.id}`} 
            className="w-8 h-8 rounded-full bg-zinc-50 text-zinc-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.3)] transition-all duration-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

// ── Main Page ────────────────────────────────────────────────

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All Icons');
  
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const fsData = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setCourses(fsData);
      } catch (err) {
        console.error("Failed to load courses from Firestore:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const filtered = useMemo(() => {
    return courses.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchSearch = c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q);
      const matchCat = activeCategory === 'All' || c.category === activeCategory;
      const matchLevel = activeLevel === 'All Icons' || c.level === activeLevel;
      return matchSearch && matchCat && matchLevel;
    });
  }, [courses, searchTerm, activeCategory, activeLevel]);
  return <div className="space-y-12 pb-24">
      
      {/* ── Premium Hero Evolution ── */}
      <section className="relative rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-premium)] min-h-[500px] flex items-center bg-white border border-white">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 z-0" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-amber-200/40 via-orange-100/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center px-8 md:px-16 py-16 md:py-0 gap-16">
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ease: "easeOut", duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white shadow-sm px-4 py-2.5 rounded-full text-[11px] font-bold text-amber-900 tracking-wide"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-inner">
                <FlashIcon className="w-3 h-3 text-white" />
              </div>
              Top #1 Learning Ecosystem of 2026
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                Master Your Craft. <br />
                <span className="text-gradient-accent">Shape the Future.</span>
              </h1>
              <p className="text-zinc-600 text-lg font-medium leading-relaxed max-w-lg">
                Join 50,000+ ambitious learners. Access elite, industry-certified courses taught by world-class experts.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md pt-2"
            >
              <div className="relative flex-1 group shadow-[var(--shadow-glass)] rounded-2xl">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                 <input 
                   value={searchTerm} 
                   onChange={e => setSearchTerm(e.target.value)} 
                   placeholder="What will you conquer today?" 
                   className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm text-zinc-900 placeholder:text-zinc-400" 
                 />
              </div>
              <button className="bg-zinc-900 text-white px-8 py-3.5 rounded-2xl font-bold text-[13px] tracking-wide hover:bg-zinc-800 transition-all h-full shadow-lg hover:shadow-xl active:scale-[0.98]">
                Explore
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center gap-6 pt-2"
            >
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Student" />
                 ))}
               </div>
               <p className="text-[12px] font-bold text-zinc-500">
                 Trusted by <span className="text-zinc-900">50K+</span> students worldwide
               </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full max-w-lg aspect-[4/3] relative hidden md:block"
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-3xl transform rotate-3 shadow-[var(--shadow-glass)] border border-white/60" />
            <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop" 
                alt="Professional Scholars" 
                className="w-full h-full object-cover scale-[1.02]"
              />
              <div className="absolute bottom-6 left-6 right-6 glass-card p-5 border-white/60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <Star className="w-6 h-6 text-amber-600 fill-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-zinc-900">Industry Leading</h4>
                    <p className="text-[12px] text-zinc-600 font-medium mt-0.5">Voted #1 for Career Outcomes</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="space-y-5 max-w-5xl mx-auto pb-4">
        <div className="flex flex-wrap gap-2 justify-center">
           {CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300 ${activeCategory === cat ? 'bg-zinc-900 text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:shadow-sm'}`}>
               {cat}
             </button>)}
        </div>
        <div className="flex flex-wrap gap-2 justify-center pb-2">
           {LEVELS.map(lvl => <button key={lvl} onClick={() => setActiveLevel(lvl)} className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${activeLevel === lvl ? 'bg-amber-100 text-amber-800' : 'bg-transparent text-zinc-400 hover:text-zinc-700'}`}>
               {lvl}
             </button>)}
        </div>
      </section>

      {/* ── Features Spotlight ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        icon: <Globe className="w-6 h-6 text-indigo-500" />,
        title: 'Global Certifications',
        desc: 'Industry recognized credentials everywhere'
      }, {
        icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
        title: 'Secure Learning',
        desc: 'Encrypted payment & data safety'
      }, {
        icon: <Timer className="w-6 h-6 text-sky-500" />,
        title: 'Lifetime Access',
        desc: 'No time limits on your mastery'
      }, {
        icon: <Flame className="w-6 h-6 text-red-500" />,
        title: 'Premium Content',
        desc: 'Hand-picked elite expert trainers'
      }].map((item, i) => <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={item.title} className="premium-card p-6 flex flex-col items-center text-center gap-4 hover-lift">
             <div className="bg-zinc-50/80 p-3 rounded-2xl shadow-inner border border-zinc-100">{item.icon}</div>
             <div>
               <h4 className="text-[15px] font-bold text-zinc-900 mb-1">{item.title}</h4>
               <p className="text-[12px] text-zinc-500 font-medium leading-tight px-2">{item.desc}</p>
             </div>
          </motion.div>)}
      </section>

      {/* ── Main Catalog Grid ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-xl font-bold text-zinc-900">Featured Courses</h2>
             <p className="text-sm text-zinc-500">Pick up where the world is leading.</p>
           </div>
           <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
              <span className="hidden sm:inline">Sorted by</span>
              <select className="bg-transparent border-none focus:ring-0 text-zinc-900 cursor-pointer">
                <option>Newest First</option>
                <option>Top Rated</option>
                <option>Trending</option>
              </select>
           </div>
        </div>

        {filtered.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div> : loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="bg-zinc-100 rounded-xl aspect-[1/1.2] animate-pulse" />)}
          </div> : <div className="text-center py-24 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
             <X className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-zinc-900">No courses match your search</h3>
             <p className="text-zinc-500 text-sm">Better luck next time? Just kidding, try another keyword!</p>
             <button onClick={() => {
          setSearchTerm('');
          setActiveCategory('All');
        }} className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition">
               Clear Filters
             </button>
          </div>}
      </section>

      {/* ── Community Success ── */}
      <section className="premium-card bg-gradient-to-br from-white to-amber-50/30 p-12 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
         <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
         <div className="flex-1 space-y-6 relative z-10">
           <h3 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">Trusted by a Global <br/> Learning Community.</h3>
           <p className="text-zinc-500 font-medium text-lg max-w-md">We deliver world-class engineering and creative education at scale across 50+ countries.</p>
           <div className="grid grid-cols-3 gap-8 pt-6 border-t border-zinc-100">
              <div>
                 <p className="text-3xl font-black text-amber-600 mb-1">50K+</p>
                 <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Active Students</p>
              </div>
              <div>
                 <p className="text-3xl font-black text-amber-600 mb-1">4.8/5</p>
                 <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Avg. Rating</p>
              </div>
              <div>
                 <p className="text-3xl font-black text-amber-600 mb-1">10M+</p>
                 <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Watch Hours</p>
              </div>
           </div>
         </div>
         <div className="w-full max-w-sm relative z-10">
            <div className="glass-card bg-white/80 p-8">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-inner">AR</div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-[15px] font-bold text-zinc-900">Arjun Rai</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Senior React Dev @ Nykaa</p>
                  </div>
               </div>
               <p className="text-[15px] text-zinc-700 font-medium leading-relaxed italic relative">
                 <span className="text-4xl text-amber-200 absolute -top-4 -left-3 opacity-50">"</span>
                 The Advanced Web Architecture course entirely changed how I think about scalable microservices. Unmatched quality.
               </p>
            </div>
         </div>
      </section>

    </div>;
}