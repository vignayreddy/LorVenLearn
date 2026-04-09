import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { db, syncCourseProgress, fetchCourseProgress, issueCertificate, saveNote, fetchNote } from '../firebase';
import { toast } from 'sonner';
import { Lock, ArrowLeft, Loader2, IndianRupee, Star, Users, Clock, Globe, Award, FileText, Download, StickyNote, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import DiscussionBoard from '../components/DiscussionBoard';
import ReviewSection from '../components/ReviewSection';
// ── Shared static data ──
const STATIC_COURSES = {
    course_1: {
        id: 'course_1', title: 'Advanced Web Architecture',
        description: 'Learn to build scalable, professional-grade web apps using modern patterns and cloud infrastructure.',
        price: 1999, originalPrice: 4999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600',
        category: 'Web Development', level: 'Advanced', language: 'Hindi + English',
        instructorId: 'inst_1', instructorName: 'Dr. Elena Vance',
        createdAt: '2026-01-01T00:00:00.000Z',
        lessons: [
            { id: 'c1_l1', title: 'Introduction to Microservices', content: 'Microservices architecture is a method of developing software systems...', videoUrl: 'https://www.youtube.com/watch?v=rv4LlmLUX7E', duration: 18 },
            { id: 'c1_l2', title: 'Scalable Database Design', content: 'Designing databases for scale requires understanding partitioning...', duration: 22 },
        ],
    }
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
export default function CourseDetails({ user }) {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [activeLesson, setActiveLesson] = useState(0);
    const [activeTab, setActiveTab] = useState('content');
    // Feature states
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [certId, setCertId] = useState(null);
    const [discussions, setDiscussions] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    // Note state (Feature 77)
    const [noteContent, setNoteContent] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    useEffect(() => {
        if (!courseId)
            return;
        (async () => {
            try {
                let courseData = STATIC_COURSES[courseId] || null;
                const snap = await getDoc(doc(db, 'courses', courseId));
                if (snap.exists())
                    courseData = { ...courseData, ...snap.data(), id: snap.id };
                if (!courseData) {
                    navigate('/');
                    return;
                }
                setCourse(courseData);
                const q = query(collection(db, 'enrollments'), where('studentId', '==', user.uid), where('courseId', '==', courseId));
                const enSnap = await getDocs(q);
                setEnrolled(!enSnap.empty || user.role === 'instructor');
                const prog = await fetchCourseProgress(courseId);
                if (prog)
                    setCompletedLessonIds(prog.completedLessons || []);
                const certQ = query(collection(db, 'certificates'), where('uid', '==', user.uid), where('courseId', '==', courseId));
                const certSnap = await getDocs(certQ);
                if (!certSnap.empty)
                    setCertId(certSnap.docs[0].id);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [courseId, user, navigate]);
    // Sync Notes for active lesson (Feature 77)
    useEffect(() => {
        if (!enrolled || !courseId || !course?.lessons[activeLesson])
            return;
        (async () => {
            const lessonId = course.lessons[activeLesson].id;
            const n = await fetchNote(courseId, lessonId);
            setNoteContent(n?.content || '');
        })();
    }, [activeLesson, enrolled, courseId, course]);
    // Discussions Real-time
    useEffect(() => {
        if (!courseId || activeTab !== 'discussions')
            return;
        const q = query(collection(db, 'discussions'), where('courseId', '==', courseId), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [courseId, activeTab]);
    const handleEnroll = async () => {
        if (!courseId)
            return;
        setEnrolling(true);
        try {
            await setDoc(doc(db, 'enrollments', `${user.uid}_${courseId}`), { studentId: user.uid, courseId, enrolledAt: new Date().toISOString() });
            setEnrolled(true);
            toast.success('Course Enrolled!');
        }
        catch {
            toast.error('Enrollment failed');
        }
        finally {
            setEnrolling(false);
        }
    };
    const toggleComplete = async (lessonId) => {
        if (!course || !courseId)
            return;
        const alreadyDone = completedLessonIds.includes(lessonId);
        const next = alreadyDone ? completedLessonIds.filter(id => id !== lessonId) : [...completedLessonIds, lessonId];
        setCompletedLessonIds(next);
        const percentage = Math.round((next.length / course.lessons.length) * 100);
        await syncCourseProgress({ courseId, completedLessons: next, percentage, lastLessonId: lessonId, updatedAt: new Date().toISOString() });
        if (percentage === 100 && !certId) {
            const cert = await issueCertificate({ uid: user.uid, courseId, studentName: user.displayName || user.email.split('@')[0], courseTitle: course.title });
            if (cert) {
                setCertId(cert.id);
                toast.success('Achievement Unlocked: Certificate Issued!');
            }
        }
    };
    const handleSaveNote = async () => {
        if (!courseId || !course?.lessons[activeLesson])
            return;
        setSavingNote(true);
        const success = await saveNote({ courseId, lessonId: course.lessons[activeLesson].id, content: noteContent });
        if (success)
            toast.success('Notes Synced to Cloud');
        setSavingNote(false);
    };
    if (loading)
        return <div className="flex flex-col items-center justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-zinc-400"/></div>;
    if (!course)
        return null;
    const currentLesson = course.lessons[activeLesson];
    const progressPct = Math.round((completedLessonIds.length / course.lessons.length) * 100);
    return (<div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors py-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-bold">Back</span>
         </button>
         {certId && (<Link to={`/certificates/${certId}`} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-500 shadow-sm">
             <Award className="w-4 h-4"/> View Certificate
           </Link>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {enrolled ? (<>
              {/* Classroom Player (Feature 80: Immersive Player) */}
              <div className="bg-zinc-900 rounded-2xl overflow-hidden aspect-video shadow-lg relative bg-black">
                {currentLesson?.videoUrl ? (<iframe className="w-full h-full" src={`https://www.youtube.com/embed/${new URL(currentLesson.videoUrl).searchParams.get('v') || currentLesson.videoUrl.split('/').pop()}`} allowFullScreen title={currentLesson.title}/>) : (<div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                     <FileText className="w-12 h-12 mb-4 opacity-20"/>
                     <p className="font-bold">Text-based Lesson Content below</p>
                  </div>)}
              </div>

              {/* Advanced Tab System (Features 77-79) */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="flex bg-zinc-50 border-b border-zinc-100 overflow-x-auto">
                   {['content', 'discussions', 'notes', 'reviews'].map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === t ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
                       {t}
                     </button>))}
                </div>

                <div className="p-8">
                  {activeTab === 'content' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-zinc max-w-none">
                       <h2 className="text-xl font-bold mb-4">{currentLesson?.title}</h2>
                       <p className="text-zinc-600 leading-relaxed font-medium">
                         {currentLesson?.content || 'No text content for this lesson.'}
                       </p>
                       <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center justify-between">
                         <button onClick={() => toggleComplete(currentLesson.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${completedLessonIds.includes(currentLesson.id) ? 'bg-green-50 text-green-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                           {completedLessonIds.includes(currentLesson.id) ? <><CheckCircle2 className="w-4 h-4"/> Lesson Passed</> : "Mark as Complete"}
                         </button>
                         <button className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-xs font-bold transition-colors">
                            <Download className="w-4 h-4"/> Resources
                         </button>
                       </div>
                    </motion.div>)}

                  {activeTab === 'notes' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                       <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Lesson Notepad</h3>
                          <button onClick={handleSaveNote} disabled={savingNote} className="text-xs font-bold text-orange-600 hover:text-orange-700 disabled:opacity-30">
                             {savingNote ? 'Syncing...' : 'Save Draft'}
                          </button>
                       </div>
                       <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} className="w-full h-48 p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium text-sm leading-relaxed" placeholder="Synthesize your thoughts here... notes are saved to your cloud profile."/>
                       <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3">
                          <StickyNote className="w-5 h-5 text-orange-600 flex-shrink-0"/>
                          <p className="text-xs text-orange-800 font-medium leading-relaxed">
                            Pro Tip: Reviewing your notes after 24 hours increases retention by 40%. All notes are lesson-specific.
                          </p>
                       </div>
                    </motion.div>)}

                  {activeTab === 'discussions' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                       <DiscussionBoard discussions={discussions} currentUser={user} onSendMessage={async (msg) => {
                    if (!courseId)
                        return;
                    setSendingMsg(true);
                    try {
                        await addDoc(collection(db, 'discussions'), {
                            courseId,
                            uid: user.uid,
                            userName: user.displayName || 'Anonymous',
                            message: msg,
                            createdAt: new Date().toISOString()
                        });
                        toast.success('Reply posted!');
                        setNewMessage('');
                    }
                    catch {
                        toast.error('Failed to post reply.');
                    }
                    finally {
                        setSendingMsg(false);
                    }
                }}/>
                    </motion.div>)}

                  {activeTab === 'reviews' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                       <ReviewSection />
                    </motion.div>)}
                </div>
              </div>
            </>) : (<div className="space-y-8">
               <div className="h-64 rounded-2xl overflow-hidden shadow-lg relative bg-zinc-900">
                  <img src={course.thumbnailUrl || FALLBACK_IMG} className="w-full h-full object-cover opacity-60"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"/>
                  <div className="absolute bottom-0 left-0 p-8">
                     <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2 block">{course.category}</span>
                     <h1 className="text-3xl font-bold text-white tracking-tight">{course.title}</h1>
                  </div>
               </div>

               <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight uppercase">About the Master Curriculum</h2>
                    <p className="text-zinc-600 leading-relaxed font-medium font-serif italic text-lg">{course.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-zinc-100">
                     {[
                { i: <Star />, l: 'Rating', v: `${course.rating || 5}★` },
                { i: <Users />, l: 'Scholars', v: (course.totalStudents || 1500).toLocaleString() },
                { i: <Clock />, l: 'Intensity', v: course.level },
                { i: <Globe />, l: 'Dialect', v: course.language || 'English' }
            ].map(stat => (<div key={stat.l}>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{stat.l}</p>
                          <p className="text-sm font-bold text-zinc-900">{stat.v}</p>
                       </div>))}
                  </div>

                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex items-center justify-between">
                     <div>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 leading-none">Complete Package</p>
                       <div className="flex items-center gap-1">
                          <IndianRupee className="w-5 h-5 text-zinc-900"/>
                          <span className="text-3xl font-bold text-zinc-900 tracking-tighter">{(course.price).toLocaleString('en-IN')}</span>
                       </div>
                     </div>
                     <button onClick={handleEnroll} disabled={enrolling} className="bg-zinc-900 text-white px-10 py-4 rounded-xl font-bold text-sm tracking-tight hover:bg-orange-600 transition shadow-lg active:scale-95">
                        {enrolling ? <Loader2 className="w-5 h-5 animate-spin"/> : "Enroll Now Free"}
                     </button>
                  </div>
               </div>
            </div>)}
        </div>

        {/* Sidebar: Curriculum (Normalized) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
             <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Master Workflow</h3>
                   {enrolled && <span className="text-[10px] font-bold text-zinc-400">{progressPct}%</span>}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                   {course.lessons.map((lesson, idx) => (<button key={lesson.id} disabled={!enrolled} onClick={() => setActiveLesson(idx)} className={`w-full text-left p-5 flex items-start gap-4 transition-all border-b border-zinc-50 group last:border-0 ${!enrolled ? 'opacity-40 pointer-events-none' : 'hover:bg-zinc-50'} ${activeLesson === idx ? 'bg-zinc-50' : ''}`}>
                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${completedLessonIds.includes(lesson.id) ? 'bg-green-500 text-white' : activeLesson === idx ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                           {completedLessonIds.includes(lesson.id) ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-zinc-900 truncate leading-tight mb-1">{lesson.title}</p>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lesson.videoUrl ? 'Video' : 'Text'}</span>
                             {lesson.duration && <span className="text-[10px] text-zinc-300 font-bold">· {lesson.duration}m</span>}
                           </div>
                        </div>
                        {!enrolled && <Lock className="w-3.5 h-3.5 text-zinc-300 ml-auto"/>}
                     </button>))}
                </div>
             </div>

             <div className="bg-zinc-900 rounded-2xl p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-16 h-16"/></div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-orange-400">Security Verified</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-bold">This curriculum is certified by LorvenLearn and is original high-quality content.</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                   <Users className="w-3 h-3"/> 15k Scholars
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>);
}
