import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db, updateStudyStreak } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, GraduationCap, Briefcase, IndianRupee, TrendingUp, Award, ChevronRight, Heart, Users, Target, Settings, ExternalLink, BarChart3, Bell, Flame, TrendingDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GamificationWidget from '../components/GamificationWidget';
import StudyAnalytics from '../components/StudyAnalytics';
// ── Static Catalog Sync ──────────────────────────────────────
const STATIC = {
    course_1: { title: 'Advanced Web Architecture', price: 1999, category: 'Web Development', level: 'Advanced', rating: 4.8 },
    course_2: { title: 'UI/UX Design Systems', price: 1499, category: 'UI/UX Design', level: 'Intermediate', rating: 4.6 },
    course_3: { title: 'Full-Stack React & Node.js', price: 2499, category: 'Web Development', level: 'Intermediate', rating: 4.9 },
    course_4: { title: 'Data Science with Python', price: 2999, category: 'Data Science', level: 'Beginner', rating: 4.7 },
    course_5: { title: 'Cybersecurity Fundamentals', price: 1899, category: 'Cybersecurity', level: 'Beginner', rating: 4.7 }
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
// ── Components ───────────────────────────────────────────────
function StatCard({ icon, label, value, sub, trend, color = 'zinc' }) {
    return (<div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color === 'orange' ? 'bg-orange-50 text-orange-600' :
            color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                color === 'green' ? 'bg-green-50 text-green-600' : 'bg-zinc-50 text-zinc-500'}`}>
          {icon}
        </div>
        {trend && (<span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg ${trend.type === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
            {trend.type === 'up' ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
            {trend.val}
          </span>)}
      </div>
      <p className="text-2xl font-bold text-zinc-900 leading-none mb-1">{value}</p>
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[10px] text-zinc-400 font-medium mt-3 border-t border-zinc-50 pt-3">{sub}</p>}
    </div>);
}
// ── Main Page ────────────────────────────────────────────────
export default function Dashboard({ user }) {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('learning');
    const [progressMap, setProgressMap] = useState({});
    const [certificates, setCertificates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const isInstructor = user.role === 'instructor';
    useEffect(() => {
        (async () => {
            try {
                // 1. Update/Check Streak (Feature 65)
                await updateStudyStreak();
                // 2. Fetch Wishlist
                const wKeys = Object.keys(localStorage).filter(k => k.startsWith('wishlist_') && localStorage.getItem(k) === '1');
                setWishlistIds(wKeys.map(k => k.replace('wishlist_', '')));
                // 3. Fetch User Courses
                let resolved = [];
                if (isInstructor) {
                    const q = query(collection(db, 'courses'), where('instructorId', '==', user.uid));
                    const snap = await getDocs(q);
                    resolved = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                }
                else {
                    const q = query(collection(db, 'enrollments'), where('studentId', '==', user.uid));
                    const snap = await getDocs(q);
                    for (const d of snap.docs) {
                        const e = d.data();
                        const cSnap = await getDoc(doc(db, 'courses', e.courseId));
                        if (cSnap.exists())
                            resolved.push({ id: cSnap.id, ...cSnap.data() });
                        else if (STATIC[e.courseId])
                            resolved.push({ id: e.courseId, ...STATIC[e.courseId] });
                    }
                }
                setCourses(resolved);
                // 4. Fetch Progress
                const progMap = {};
                for (const c of resolved) {
                    const pSnap = await getDoc(doc(db, 'progress', `${user.uid}_${c.id}`));
                    progMap[c.id] = pSnap.exists() ? pSnap.data().percentage : 0;
                }
                setProgressMap(progMap);
                // 5. Fetch Certificates
                const certQuery = query(collection(db, 'certificates'), where('uid', '==', user.uid));
                const certSnap = await getDocs(certQuery);
                setCertificates(certSnap.docs.map(d => d.data()));
                // 6. Fetch Announcements (Feature 66)
                if (resolved.length > 0) {
                    const annQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(5));
                    const annSnap = await getDocs(annQuery);
                    setAnnouncements(annSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [user, isInstructor]);
    const totalEnrollments = isInstructor ? 1520 : courses.length;
    const avgCompletion = isInstructor ? 68 : (courses.length ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / courses.length) : 0);
    return (<div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
             {(user.displayName || user.email)[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{user.displayName || 'Learner'}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isInstructor ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-500'}`}>
                {user.role}
              </span>
            </div>
            <p className="text-zinc-500 font-medium text-sm">{user.email}</p>
            <div className="flex items-center gap-4 mt-3">
               <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
                  <Flame className="w-4 h-4"/>
                  {user.streak?.currentStreak || 0} Day Streak
               </div>
               <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                  <Award className="w-4 h-4 text-zinc-300"/>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
               </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/settings" className="flex-1 md:flex-none p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition group">
             <Settings className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors"/>
          </Link>
          {isInstructor ? (<Link to="/create-course" className="flex-[3] md:flex-none px-8 py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-orange-600 transition shadow-sm active:scale-95 flex items-center justify-center gap-2">
               <Plus className="w-4 h-4"/> Create Course
            </Link>) : (<Link to="/" className="flex-[3] md:flex-none px-8 py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-orange-600 transition shadow-sm active:scale-95 flex items-center justify-center gap-2">
               Explore Courses <ArrowRight className="w-4 h-4"/>
            </Link>)}
        </div>
      </div>

      {/* ── Feature Rich Stats (Features 67-70) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={isInstructor ? <Users /> : <GraduationCap />} label={isInstructor ? "Active Students" : "Enrollments"} value={totalEnrollments} trend={isInstructor ? { type: 'up', val: '8%' } : undefined} color="zinc"/>
        <StatCard icon={<Target />} label="Learning Goal" value={`${avgCompletion}%`} sub={avgCompletion > 85 ? "You're in the top 2% of earners!" : "Keep it up, consistent learning wins."} trend={avgCompletion > 50 ? { type: 'up', val: '5%' } : undefined} color="indigo"/>
        <StatCard icon={<Award />} label="Certificates" value={certificates.length} sub="Add these to your LinkedIn profile." color="green"/>
        <StatCard icon={isInstructor ? <IndianRupee /> : <Heart />} label={isInstructor ? "Revenue Est." : "My Wishlist"} value={isInstructor ? "₹82,450" : wishlistIds.length} color="orange" trend={isInstructor ? { type: 'up', val: '12%' } : undefined}/>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Unified Tab System */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
            {[
            { id: 'learning', label: isInstructor ? 'Published' : 'Learning', icon: <Briefcase /> },
            { id: 'certificates', label: 'Certificates', icon: <Award />, hidden: isInstructor },
            { id: 'wishlist', label: 'Wishlist', icon: <Heart />, hidden: isInstructor },
            { id: 'performance', label: 'Performance', icon: <BarChart3 />, hidden: !isInstructor },
        ].map(tab => !tab.hidden && (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>
                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                {tab.label}
              </button>))}
          </div>

          <div className="min-h-[400px]">
            {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-zinc-100 rounded-2xl aspect-[1/0.8] animate-pulse"/>)}
              </div>) : (<AnimatePresence mode="wait">
                {activeTab === 'learning' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {courses.map(course => (<div key={course.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                        <div className="h-32 bg-zinc-100 relative">
                           <img src={course.thumbnailUrl || FALLBACK_IMG} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                           <div className="absolute top-2 left-2 bg-zinc-900/80 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                              {course.category}
                           </div>
                        </div>
                        <div className="p-4">
                           <h3 className="font-bold text-zinc-900 text-sm mb-1 truncate">{course.title}</h3>
                           {!isInstructor ? (<div className="mt-4 space-y-2">
                               <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                                  <span>{progressMap[course.id] || 0}% Complete</span>
                                  <span>{course.lessons.length} Lessons</span>
                               </div>
                               <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressMap[course.id] || 0}%` }} className="h-full bg-zinc-900"/>
                               </div>
                               <Link to={`/courses/${course.id}`} className="block w-full text-center py-2 bg-zinc-50 hover:bg-zinc-900 hover:text-white rounded-lg text-xs font-bold transition-all mt-4 border border-zinc-200">
                                  Continue Learning
                               </Link>
                             </div>) : (<div className="mt-4 flex items-center justify-between border-t border-zinc-50 pt-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                                   <Users className="w-3.5 h-3.5"/> 1.2K
                                </div>
                                <Link to={`/courses/${course.id}`} className="text-[10px] font-bold text-orange-600 uppercase hover:underline">
                                  Manage Course
                                </Link>
                             </div>)}
                        </div>
                      </div>))}
                    {courses.length === 0 && (<div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                         <div className="text-4xl mb-4">📚</div>
                         <p className="text-zinc-500 font-bold mb-4">No active courses yet.</p>
                         <Link to="/" className="text-orange-600 font-bold hover:underline">Start Exploring</Link>
                      </div>)}
                  </motion.div>)}

                {activeTab === 'wishlist' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                     {wishlistIds.length > 0 ? wishlistIds.map(id => (<Link key={id} to={`/courses/${id}`} className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-3 hover:border-zinc-900 transition p-4">
                          <div className="w-12 h-12 bg-zinc-100 rounded-lg flex-shrink-0"/>
                          <div className="flex-1">
                             <h4 className="font-bold text-zinc-900 text-sm truncate">{STATIC[id]?.title || id}</h4>
                             <p className="text-[10px] text-zinc-400 font-bold uppercase">{STATIC[id]?.category}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-300"/>
                       </Link>)) : <p className="text-zinc-400 text-center py-20 font-bold text-sm">Your wishlist is empty.</p>}
                  </motion.div>)}

                {activeTab === 'certificates' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {certificates.map(cert => (<div key={cert.id} className="bg-white border-b-4 border-zinc-900 rounded-2xl p-6 shadow-sm group hover:-translate-y-1 transition-all">
                          <Award className="w-8 h-8 text-zinc-900 mb-4"/>
                          <h4 className="font-bold text-zinc-900 mb-2 leading-tight">{cert.courseTitle}</h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase mb-6 tracking-wider">Issued {new Date(cert.issueDate).toLocaleDateString()}</p>
                          <Link to={`/certificates/${cert.id}`} className="text-xs font-bold text-orange-600 flex items-center gap-1.5 hover:underline">
                            View Credentials <ExternalLink className="w-3 h-3"/>
                          </Link>
                       </div>))}
                     {certificates.length === 0 && <p className="col-span-full text-zinc-400 text-center py-20 font-bold text-sm italic">Finish a course to earn your first degree!</p>}
                  </motion.div>)}

                {activeTab === 'performance' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <StudyAnalytics />
                     <div className="bg-zinc-900 text-white rounded-2xl p-8 overflow-hidden relative mt-8">
                        <BarChart3 className="absolute bottom-6 right-6 w-24 h-24 opacity-10"/>
                        <h4 className="text-xl font-bold mb-8">Course Engagement Growth</h4>
                        <div className="space-y-5">
                          {[
                    { l: 'Advanced Web Architecture', v: 85 },
                    { l: 'Professional Photography', v: 42 },
                    { l: 'Business of SaaS', v: 67 }
                ].map(b => (<div key={b.l} className="space-y-1.5">
                               <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                  <span>{b.l}</span>
                                  <span>{b.v}% High</span>
                               </div>
                               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.v}%` }} className="h-full bg-orange-500"/>
                               </div>
                            </div>))}
                        </div>
                     </div>
                  </motion.div>)}
              </AnimatePresence>)}
          </div>
        </div>

        {/* Right Column: Mini Widgets (Features 71-75: Social Widgets) */}
        <div className="space-y-6">
          {!isInstructor && <GamificationWidget user={user}/>}
          {/* Announcements Widget */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-600"/> Course Updates
             </h3>
             <div className="space-y-5">
                {announcements.map(ann => (<div key={ann.id} className="pb-4 border-b border-zinc-50 last:border-0 group cursor-pointer">
                     <h4 className="text-xs font-bold text-zinc-900 group-hover:text-orange-600 transition truncate">{ann.title}</h4>
                     <p className="text-[10px] text-zinc-400 font-medium line-clamp-2 mt-1">{ann.content}</p>
                     <p className="text-[10px] text-zinc-300 font-bold mt-2 font-mono">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>))}
                {announcements.length === 0 && <p className="text-xs text-zinc-400 italic">No recent announcements.</p>}
             </div>
          </div>

          {/* Quick Actions (Feature 76: Accessibility) */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
             <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Master Shortcuts</h3>
             <div className="grid grid-cols-1 gap-2">
                {[
            { l: 'Resume Learning', i: <RefreshCw className="w-3.5 h-3.5"/>, next: '/dashboard' },
            { l: 'Learning Hub', i: <GraduationCap className="w-3.5 h-3.5"/>, next: '/' },
            { l: 'Global Community', i: <Users className="w-3.5 h-3.5"/>, next: '/' }
        ].map(b => (<Link key={b.l} to={b.next} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 hover:border-zinc-900 transition">
                     <span className="text-zinc-400">{b.i}</span> {b.l}
                  </Link>))}
             </div>
          </div>
        </div>
      </div>
    </div>);
}
