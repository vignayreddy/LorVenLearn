import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db, updateStudyStreak } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, GraduationCap, Briefcase, IndianRupee, TrendingUp, Award, ChevronRight, Heart, Users, Target, Settings, ExternalLink, BarChart3, Bell, Flame, TrendingDown, RefreshCw, Zap, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GamificationWidget from '../components/GamificationWidget';
import StudyAnalytics from '../components/StudyAnalytics';

// ── Dynamic Course Helpers ──────────────────────────────────────
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';

// ── Components ───────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  color = 'zinc'
}) {
  return <div className="premium-card p-6 flex flex-col justify-between hover-lift">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${color === 'orange' ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600' : color === 'indigo' ? 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600' : color === 'green' ? 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600' : 'bg-gradient-to-br from-zinc-100 to-zinc-50 text-zinc-600'}`}>
          {icon}
        </div>
        {trend && <span className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl shadow-sm ${trend.type === 'up' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100/50' : 'text-rose-600 bg-rose-50 border border-rose-100/50'}`}>
            {trend.type === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend.val}
          </span>}
      </div>
      <p className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-1">{value}</p>
      <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      {sub && <p className="text-[11px] text-zinc-500 font-medium mt-4 pt-4 border-t border-zinc-100/80">{sub}</p>}
    </div>;
}

// ── Main Page ────────────────────────────────────────────────

export default function Dashboard({
  user
}) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('learning');
  const [progressMap, setProgressMap] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
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
          resolved = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }));
        } else {
          const q = query(collection(db, 'enrollments'), where('studentId', '==', user.uid));
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            const e = d.data();
            const cSnap = await getDoc(doc(db, 'courses', e.courseId));
            if (cSnap.exists()) resolved.push({
              id: cSnap.id,
              ...cSnap.data()
            });
          }
        }
        setCourses(resolved);
        
        // Removed demo injection

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
          setAnnouncements(annSnap.docs.map(d => ({
            id: d.id,
            ...d.data()
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, isInstructor]);
  const totalEnrollments = isInstructor ? 1520 : courses.length;
  const avgCompletion = isInstructor ? 68 : courses.length ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / courses.length) : 0;
  return <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 premium-card p-10 relative overflow-hidden bg-gradient-to-br from-white to-amber-50/20">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-zinc-900/20 ring-4 ring-white">
             {(user.displayName || user.email || 'L')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{user.displayName || 'Learner'}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm ${isInstructor ? 'bg-amber-100 text-amber-700 border border-amber-200/50' : 'bg-zinc-100 text-zinc-600'}`}>
                {user.role}
              </span>
            </div>
            <p className="text-zinc-500 font-medium text-[15px]">{user.email}</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-5">
               <div className="flex items-center gap-1.5 text-[13px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50 shadow-sm">
                  <Flame className="w-4 h-4" />
                  {user.streak?.currentStreak || 0} Day Streak
               </div>
               <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                     <span>Rank: Architect</span>
                     <span className="text-amber-600">Lvl {level} — {xp}/5000 XP</span>
                  </div>
                  <div className="h-2 w-full sm:w-56 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${(xp / 5000) * 100}%` }} className="h-full bg-gradient-to-r from-amber-400 to-orange-500" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto relative z-10 mt-4 md:mt-0">
          <Link to="/settings" className="flex-1 md:flex-none p-4 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-2xl transition-all shadow-sm hover:shadow-md group">
             <Settings className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </Link>
          {isInstructor ? <Link to="/create-course" className="flex-[3] md:flex-none btn-primary flex items-center justify-center gap-2">
               <Plus className="w-5 h-5" /> Create Course
            </Link> : <Link to="/" className="flex-[3] md:flex-none btn-primary flex items-center justify-center gap-2">
               Explore Courses <ArrowRight className="w-5 h-5 ml-1" />
            </Link>}
        </div>
      </div>

      {/* ── Feature Rich Stats (Features 67-70) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={isInstructor ? <Users /> : <GraduationCap />} label={isInstructor ? "Active Students" : "Enrollments"} value={totalEnrollments} trend={isInstructor ? {
        type: 'up',
        val: '8%'
      } : undefined} color="zinc" />
        <StatCard icon={<Target />} label="Learning Goal" value={`${avgCompletion}%`} sub={avgCompletion > 85 ? "You're in the top 2% of earners!" : "Keep it up, consistent learning wins."} trend={avgCompletion > 50 ? {
        type: 'up',
        val: '5%'
      } : undefined} color="indigo" />
        <StatCard icon={<Award />} label="Certificates" value={certificates.length} sub="Add these to your LinkedIn profile." color="green" />
        <StatCard icon={isInstructor ? <IndianRupee /> : <Heart />} label={isInstructor ? "Revenue Est." : "My Wishlist"} value={isInstructor ? "₹82,450" : wishlistIds.length} color="orange" trend={isInstructor ? {
        type: 'up',
        val: '12%'
      } : undefined} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Unified Tab System */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 p-1.5 bg-zinc-100/80 backdrop-blur-md rounded-2xl w-fit border border-zinc-200/50">
            {[{
            id: 'learning',
            label: isInstructor ? 'Published' : 'Learning',
            icon: <Briefcase />
          }, {
            id: 'certificates',
            label: 'Certificates',
            icon: <Award />,
            hidden: isInstructor
          }, {
            id: 'wishlist',
            label: 'Wishlist',
            icon: <Heart />,
            hidden: isInstructor
          }, {
            id: 'performance',
            label: 'Performance',
            icon: <BarChart3 />,
            hidden: !isInstructor
          }].map(tab => !tab.hidden && <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-zinc-900 shadow-[var(--shadow-glass)]' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'}`}>
                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                {tab.label}
              </button>)}
          </div>

          <div className="min-h-[400px]">
            {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-zinc-100 rounded-2xl aspect-[1/0.8] animate-pulse" />)}
              </div> : <AnimatePresence mode="wait">
                {activeTab === 'learning' && <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {courses.map(course => <div key={course.id} className="premium-card bg-white border border-zinc-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col group h-full">
                        <div className="h-40 bg-zinc-100 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <img src={course.thumbnailUrl || FALLBACK_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-zinc-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg z-20 shadow-sm">
                              {course.category}
                           </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                           <h3 className="font-bold text-zinc-900 text-[16px] mb-2 leading-tight min-h-[2.5rem] group-hover:text-amber-600 transition-colors">{course.title}</h3>
                           {!isInstructor ? <div className="mt-auto pt-4 space-y-3">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                   <span className="text-amber-600">{progressMap[course.id] || 0}% Complete</span>
                                   <span>{Array.isArray(course.lessons) ? course.lessons.length : (course.lessons || 0)} Lessons</span>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden shadow-inner border border-zinc-200/50">
                                   <motion.div initial={{
                        width: 0
                      }} animate={{
                        width: `${progressMap[course.id] || 0}%`
                      }} className="h-full bg-gradient-to-r from-amber-400 to-orange-500" />
                                </div>
                                <Link to={`/course/${course.id}`} className="block w-full text-center py-2.5 bg-zinc-50 hover:bg-amber-500 hover:text-white rounded-xl text-[13px] font-bold transition-all duration-300 mt-5 border border-zinc-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95">
                                   Continue Learning
                                </Link>
                             </div> : <div className="mt-4 flex items-center justify-between border-t border-zinc-50 pt-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                                   <Users className="w-3.5 h-3.5" /> 1.2K
                                </div>
                                <Link to={`/course/${course.id}`} className="text-[10px] font-bold text-orange-600 uppercase hover:underline">
                                  Manage Course
                                </Link>
                             </div>}
                        </div>
                      </div>)}
                    {courses.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                         <div className="text-4xl mb-4">📚</div>
                         <p className="text-zinc-500 font-bold mb-4">No active courses yet.</p>
                         <Link to="/" className="text-orange-600 font-bold hover:underline">Start Exploring</Link>
                      </div>}
                  </motion.div>}

                {activeTab === 'wishlist' && <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="space-y-3">
                     {wishlistIds.length > 0 ? wishlistIds.map(id => <Link key={id} to={`/course/${id}`} className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-3 hover:border-zinc-900 transition p-4">
                          <div className="w-12 h-12 bg-zinc-100 rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                             <h4 className="font-bold text-zinc-900 text-sm truncate">Wishlist Course</h4>
                             <p className="text-[10px] text-zinc-400 font-bold uppercase">View details</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-300" />
                       </Link>) : <p className="text-zinc-400 text-center py-20 font-bold text-sm">Your wishlist is empty.</p>}
                  </motion.div>}

                {activeTab === 'certificates' && <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {certificates.map(cert => <div key={cert.id} className="bg-white border-b-4 border-zinc-900 rounded-2xl p-6 shadow-sm group hover:-translate-y-1 transition-all">
                          <Award className="w-8 h-8 text-zinc-900 mb-4" />
                          <h4 className="font-bold text-zinc-900 mb-2 leading-tight">{cert.courseTitle}</h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase mb-6 tracking-wider">Issued {new Date(cert.issueDate).toLocaleDateString()}</p>
                          <Link to={`/certificates/${cert.id}`} className="text-xs font-bold text-orange-600 flex items-center gap-1.5 hover:underline">
                            View Credentials <ExternalLink className="w-3 h-3" />
                          </Link>
                       </div>)}
                     {certificates.length === 0 && <p className="col-span-full text-zinc-400 text-center py-20 font-bold text-sm italic">Finish a course to earn your first degree!</p>}
                  </motion.div>}

                {activeTab === 'performance' && <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="space-y-6">
                     <StudyAnalytics />
                     <div className="bg-zinc-900 text-white rounded-2xl p-8 overflow-hidden relative mt-8">
                        <BarChart3 className="absolute bottom-6 right-6 w-24 h-24 opacity-10" />
                        <h4 className="text-xl font-bold mb-8">Course Engagement Growth</h4>
                        <div className="space-y-5">
                          {[{
                    l: 'Advanced Web Architecture',
                    v: 85
                  }, {
                    l: 'Professional Photography',
                    v: 42
                  }, {
                    l: 'Business of SaaS',
                    v: 67
                  }].map(b => <div key={b.l} className="space-y-1.5">
                               <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                  <span>{b.l}</span>
                                  <span>{b.v}% High</span>
                               </div>
                               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div initial={{
                        width: 0
                      }} animate={{
                        width: `${b.v}%`
                      }} className="h-full bg-orange-500" />
                               </div>
                            </div>)}
                        </div>
                     </div>
                  </motion.div>}
              </AnimatePresence>}
          </div>
        </div>

        {/* Right Column: Mini Widgets (Features 71-75: Social Widgets) */}
        <div className="space-y-6">
          {!isInstructor && <GamificationWidget user={user} />}
          {/* Achievements (Feature 92) */}
          <div className="premium-card p-6 border-zinc-100 shadow-[var(--shadow-glass)]">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-bold text-zinc-900 flex items-center gap-2">
                   <Award className="w-[18px] h-[18px] text-amber-600" /> Achievements
                </h3>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 uppercase tracking-widest">4 Earned</span>
             </div>
             <div className="grid grid-cols-4 gap-3">
                {[{
                  i: <Zap className="w-5 h-5" />,
                  c: 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600',
                  l: 'Early Adopter'
                }, {
                  i: <Star className="w-5 h-5 fill-current" />,
                  c: 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-600',
                  l: 'Fast Learner'
                }, {
                  i: <ShieldCheck className="w-5 h-5" />,
                  c: 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600',
                  l: 'Streak Master'
                }, {
                  i: <Award className="w-5 h-5" />,
                  c: 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600',
                  l: 'Scholar'
                }].map(badge => <div key={badge.l} className="group relative focus-within:outline-none">
                     <div className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-white/50 hover:shadow-lg ${badge.c}`}>
                        {badge.i}
                     </div>
                     <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                        {badge.l}
                     </div>
                  </div>)}
             </div>
          </div>

          <div className="premium-card p-6 border-zinc-100 shadow-[var(--shadow-glass)]">
             <h3 className="text-[15px] font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Target className="w-[18px] h-[18px] text-amber-600" /> Daily Quests
             </h3>
             <div className="space-y-4">
                {[{
                  t: 'Watch 2 lessons',
                  xp: '+200 XP',
                  done: true
                }, {
                  t: 'Write 1 community post',
                  xp: '+150 XP',
                  done: false
                }, {
                  t: 'Complete 10 min study',
                  xp: '+100 XP',
                  done: false
                }].map(q => <div key={q.t} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm hover:border-zinc-200 transition-all">
                     <div className={`mt-0.5 w-[18px] h-[18px] rounded-[6px] border-[1.5px] flex items-center justify-center transition-colors ${q.done ? 'bg-amber-500 border-amber-500 shadow-sm' : 'bg-white border-zinc-300'}`}>
                        {q.done && <Plus className="w-3.5 h-3.5 text-white rotate-45" />}
                     </div>
                     <div className="flex-1">
                        <p className={`text-[13px] font-bold leading-none mb-1.5 ${q.done ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{q.t}</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600/80">{q.xp}</p>
                     </div>
                  </div>)}
             </div>
          </div>

          <div className="premium-card p-6 border-zinc-100 shadow-[var(--shadow-glass)]">
             <h3 className="text-[15px] font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Bell className="w-[18px] h-[18px] text-amber-600" /> Course Updates
             </h3>
             <div className="space-y-5">
                {announcements.map(ann => <div key={ann.id} className="pb-4 border-b border-zinc-100 last:border-0 group cursor-pointer">
                     <h4 className="text-[13px] font-bold text-zinc-900 group-hover:text-amber-600 transition-colors leading-snug">{ann.title}</h4>
                     <p className="text-[12px] text-zinc-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">{ann.content}</p>
                     <p className="text-[10px] text-zinc-400 font-bold mt-2.5 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>)}
                {announcements.length === 0 && <p className="text-[13px] text-zinc-400 font-medium italic">No recent announcements.</p>}
             </div>
          </div>

          {/* Quick Actions (Feature 76: Accessibility) */}
          <div className="glass-card bg-amber-50 p-6 border-amber-100/50">
             <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-[0.2em] mb-4 text-center">Power Shortcuts</h3>
             <div className="grid grid-cols-1 gap-2.5">
                {[{
              l: 'Resume Learning',
              i: <RefreshCw className="w-4 h-4" />,
              next: '/dashboard'
            }, {
              l: 'Learning Hub',
              i: <GraduationCap className="w-4 h-4" />,
              next: '/'
            }, {
              l: 'Global Community',
              i: <Users className="w-4 h-4" />,
              next: '/'
            }].map(b => <Link key={b.l} to={b.next} className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-transparent shadow-sm text-[13px] font-bold text-zinc-800 hover:border-amber-200 hover:shadow-[var(--shadow-glass)] hover:-translate-y-0.5 transition-all">
                     <span className="text-amber-500 bg-amber-50 p-1.5 rounded-lg">{b.i}</span> {b.l}
                  </Link>)}
             </div>
          </div>
        </div>
      </div>
    </div>;
}