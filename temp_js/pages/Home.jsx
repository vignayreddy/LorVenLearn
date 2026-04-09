import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Star, IndianRupee, Search, X, Globe, Timer, ShieldCheck, Zap as FlashIcon, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
// ── Shared Static Catalog ─────────────────────────────────────
const STATIC_COURSES = [
    {
        id: 'course_1', title: 'Advanced Web Architecture',
        description: 'Learn to build scalable, professional-grade web apps using modern patterns and cloud infrastructure.',
        price: 1999, originalPrice: 4999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&auto=format&fit=crop&q=80',
        category: 'Web Development', level: 'Advanced', language: 'Hindi + English',
        instructorId: 'inst_1', instructorName: 'Dr. Elena Vance',
        createdAt: '2026-01-01T00:00:00.000Z', isBestseller: true, rating: 4.8, ratingCount: 2341, totalStudents: 12450,
        lessons: [{ id: 'l1', title: 'Intro', content: '...' }], tags: ['cloud', 'architecture']
    },
    {
        id: 'course_2', title: 'UI/UX Design Systems',
        description: 'A comprehensive guide to creating consistent, accessible, and beautiful design systems.',
        price: 1499, originalPrice: 3499,
        thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80',
        category: 'UI/UX Design', level: 'Intermediate', language: 'English',
        instructorId: 'inst_2', instructorName: 'Marcus Aurelius',
        createdAt: '2026-01-15T00:00:00.000Z', rating: 4.6, ratingCount: 1820, totalStudents: 9300,
        lessons: [{ id: 'l1', title: 'Intro', content: '...' }], tags: ['design', 'figma']
    },
    {
        id: 'course_3', title: 'Full-Stack React & Node.js',
        description: 'Build production-ready full-stack apps from scratch using modern technologies.',
        price: 2499, originalPrice: 5999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
        category: 'Web Development', level: 'Intermediate', language: 'Hindi + English',
        instructorId: 'inst_3', instructorName: 'Priya Sharma',
        createdAt: '2026-02-01T00:00:00.000Z', isBestseller: true, rating: 4.9, ratingCount: 4100, totalStudents: 21000,
        lessons: [{ id: 'l1', title: 'Intro', content: '...' }], tags: ['react', 'mern']
    },
    {
        id: 'course_4', title: 'Data Science with Python',
        description: 'Master data analysis, visualization, and ML fundamentals using real-world datasets.',
        price: 2999, originalPrice: 6999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        category: 'Data Science', level: 'Beginner', language: 'English',
        instructorId: 'inst_4', instructorName: 'Arjun Mehta',
        createdAt: '2026-02-15T00:00:00.000Z', rating: 4.7, ratingCount: 3200, totalStudents: 17800,
        lessons: [{ id: 'l1', title: 'Intro', content: '...' }], tags: ['python', 'ai']
    },
    {
        id: 'course_5', title: 'Cybersecurity Fundamentals',
        description: 'Protect yourself and your company from modern cyber threats with ethical hacking.',
        price: 1899, originalPrice: 3999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
        category: 'Cybersecurity', level: 'Beginner', language: 'English',
        instructorId: 'inst_5', instructorName: 'David Miller',
        createdAt: '2026-03-20T00:00:00.000Z', rating: 4.7, ratingCount: 1200, totalStudents: 6800,
        lessons: [{ id: 'l1', title: 'Intro', content: '...' }], tags: ['hacking', 'security']
    }
];
const CATEGORIES = [
    'Web Development', 'UI/UX Design', 'Data Science', 'Mobile Development',
    'AI & Machine Learning', 'DevOps', 'Cybersecurity', 'Business', 'Marketing', 'Photography', 'Music'
];
// ── Components ───────────────────────────────────────────────
function CourseCard({ course, index }) {
    const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
    return (<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col group">
      <Link to={`/courses/${course.id}`} className="block relative h-40 overflow-hidden bg-zinc-100">
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"/>
        {course.isBestseller && (<div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
            Bestseller
          </div>)}
        {discount > 0 && (<div className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </div>)}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{course.category}</span>
          <div className="flex items-center gap-0.5 text-xs font-bold text-zinc-900 border-l border-zinc-200 pl-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400"/>
            {course.rating?.toFixed(1)}
          </div>
        </div>

        <h3 className="font-bold text-zinc-900 text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-xs text-zinc-400 mb-4 truncate font-medium">{course.instructorName}</p>

        <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-zinc-900"/>
            <span className="text-lg font-bold text-zinc-900">{course.price.toLocaleString('en-IN')}</span>
            {course.originalPrice && (<span className="text-xs text-zinc-400 line-through font-medium ml-1">₹{course.originalPrice.toLocaleString('en-IN')}</span>)}
          </div>
          <Link to={`/courses/${course.id}`} className="p-1 px-3 text-xs bg-zinc-900 text-white rounded font-bold hover:bg-orange-600 transition tracking-tight">
            Enroll
          </Link>
        </div>
      </div>
    </motion.div>);
}
// ── Main Page ────────────────────────────────────────────────
export default function Home() {
    const [courses, setCourses] = useState(STATIC_COURSES);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    useEffect(() => {
        (async () => {
            try {
                const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(50));
                const snap = await getDocs(q);
                const fsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const merged = [...STATIC_COURSES, ...fsData.filter(f => !STATIC_COURSES.some(s => s.id === f.id))];
                setCourses(merged);
            }
            catch { /* fallback to static */ }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const filtered = useMemo(() => {
        return courses.filter(c => {
            const q = searchTerm.toLowerCase();
            const matchSearch = c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q);
            const matchCat = activeCategory === 'All' || c.category === activeCategory;
            return matchSearch && matchCat;
        });
    }, [courses, searchTerm, activeCategory]);
    return (<div className="space-y-12 pb-24">
      
      {/* ── Normalized Hero Section (Feature 55: Interactive Discovery) ── */}
      <section className="bg-zinc-900 text-white rounded-3xl p-10 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl opacity-50"/>
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-orange-400">
            <FlashIcon className="w-4 h-4 fill-orange-400"/>
            Limited Time Offer: Courses from ₹499
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Unlock New Potential with Pro Skills Training
          </h1>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-lg">
            Join the most ambitious learning platform in India. Learn from top industry experts and earn globally recognized certifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors"/>
               <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for skills, tech, or teachers..." className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-medium text-sm"/>
            </div>
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
              Browse Now
            </button>
          </div>
        </div>
      </section>

      {/* ── Category Bar (Feature 56: Smooth Category Filtering) ── */}
      <section className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
           <button onClick={() => setActiveCategory('All')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeCategory === 'All' ? 'bg-zinc-900 text-white shadow-sm' : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>
             All Courses
           </button>
           {CATEGORIES.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeCategory === cat ? 'bg-zinc-900 text-white shadow-sm' : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>
               {cat}
             </button>))}
        </div>
      </section>

      {/* ── Features Spotlight (Features 57-60: Engagement Triggers) ── */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { icon: <Globe className="w-5 h-5 text-orange-600"/>, title: 'Global Certifications', desc: 'Industry recognized credentials' },
            { icon: <ShieldCheck className="w-5 h-5 text-green-600"/>, title: 'Secure Learning', desc: 'Encrypted payment & data' },
            { icon: <Timer className="w-5 h-5 text-blue-600"/>, title: 'Lifetime Access', desc: 'No time limits on mastery' },
            { icon: <Flame className="w-5 h-5 text-red-500"/>, title: 'Premium Content', desc: 'Hand-picked expert trainers' }
        ].map(item => (<div key={item.title} className="bg-white p-5 rounded-2xl border border-zinc-100 flex items-center gap-4 hover:shadow-md transition">
             <div className="bg-zinc-50 p-2 rounded-xl">{item.icon}</div>
             <div>
               <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{item.desc}</p>
             </div>
          </div>))}
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

        {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (<div key={i} className="bg-zinc-100 rounded-xl aspect-[1/1.2] animate-pulse"/>))}
          </div>) : filtered.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((c, i) => <CourseCard key={c.id} course={c} index={i}/>)}
          </div>) : (<div className="text-center py-24 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
             <X className="w-12 h-12 text-zinc-200 mx-auto mb-4"/>
             <h3 className="text-lg font-bold text-zinc-900">No courses match your search</h3>
             <p className="text-zinc-500 text-sm">Better luck next time? Just kidding, try another keyword!</p>
             <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition">
               Clear Filters
             </button>
          </div>)}
      </section>

      {/* ── Community Success (Features 61-63: Social Proof) ── */}
      <section className="bg-zinc-50 rounded-3xl p-10 border border-zinc-100 flex flex-col md:flex-row items-center gap-12">
         <div className="flex-1 space-y-4">
           <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Our Global Learning Metrics</h3>
           <p className="text-zinc-500 font-medium">We deliver quality education at scale across 50+ countries.</p>
           <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                 <p className="text-2xl font-bold text-orange-600">50K+</p>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase">Students</p>
              </div>
              <div>
                 <p className="text-2xl font-bold text-orange-600">4.8/5</p>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase">Feedback</p>
              </div>
              <div>
                 <p className="text-2xl font-bold text-orange-600">12M+</p>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase">Watch Time</p>
              </div>
           </div>
         </div>
         <div className="w-full max-w-sm">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">AR</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Arjun Rai</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Senior React Dev @ Nykaa</p>
                  </div>
               </div>
               <p className="text-sm text-zinc-500 italic leading-relaxed">
                 "The Advanced Web Architecture course completely changed how I think about scalable systems. Worth every rupee!"
               </p>
            </div>
         </div>
      </section>

    </div>);
}
