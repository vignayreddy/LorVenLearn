import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { db, syncCourseProgress, fetchCourseProgress, issueCertificate, saveNote, fetchNote } from '../firebase';
import { toast } from 'sonner';
import { Lock, ArrowLeft, Loader2, IndianRupee, Star, Users, Clock, Globe, Award, FileText, Download, StickyNote, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscussionBoard from '../components/DiscussionBoard';
import ReviewSection from '../components/ReviewSection';
import QuizCard from '../components/QuizCard';

// ── Dynamic data retrieval ──
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
export default function CourseDetails({
  user
}) {
  const {
    courseId
  } = useParams();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLesson, setActiveLesson] = useState(0);
  const [activeTab, setActiveTab] = useState('content');
  const [focusMode, setFocusMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMockGateway, setShowMockGateway] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Feature states
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [certId, setCertId] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Note state (Feature 77)
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'courses', courseId));
        if (docSnap.exists()) {
          const courseData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          if (!courseData.lessons || courseData.lessons.length === 0) {
            const fallbackVideos = [
              'https://www.youtube.com/watch?v=PkZNo7MF68',
              'https://www.youtube.com/watch?v=B7wHpNUUT4Y',
              'https://www.youtube.com/watch?v=bMknfKXIFA8',
              'https://www.youtube.com/watch?v=m_roJGxU3mA',
              'https://www.youtube.com/watch?v=t_ispmWmdjY'
            ];
            courseData.lessons = [];
            while (courseData.lessons.length < 12) {
              const idx = courseData.lessons.length + 1;
              courseData.lessons.push({
                id: `l${idx}_dummy`,
                title: `Advanced Module ${idx}: Industry Masterclass`,
                content: `This deep-dive module ${idx} covers advanced architectural workflows, real-world case studies, and hands-on synthesis exercises to complete your mastery.`,
                duration: 20 + idx,
                videoUrl: fallbackVideos[idx % 5],
                quiz: [
                  {
                    question: `What is the primary objective of workflow pattern ${idx}?`,
                    options: ['System Efficiency', 'Increased Latency', 'Manual Overhead', 'Static Costing'],
                    correctAnswer: 0
                  },
                  {
                    question: 'Which modern tool handles this scaling dynamically?',
                    options: ['Firebase Serverless', 'Raw PHP scripts', 'Basic HTML files', 'Legacy SQL'],
                    correctAnswer: 0
                  }
                ]
              });
            }
          }
          setCourse(courseData);
        }
        
        if (user) {
          try {
            const q = query(collection(db, 'enrollments'), where('studentId', '==', user.uid), where('courseId', '==', courseId));
            const enSnap = await getDocs(q);
            setEnrolled(!enSnap.empty || (course && course.instructorId === user.uid) || user.role === 'admin');
            const prog = await fetchCourseProgress(courseId);
            if (prog) setCompletedLessonIds(prog.completedLessons || []);
            const certQ = query(collection(db, 'certificates'), where('uid', '==', user.uid), where('courseId', '==', courseId));
            const certSnap = await getDocs(certQ);
            if (!certSnap.empty) setCertId(certSnap.docs[0].id);
          } catch (err) {
            console.warn("User-data sync partially failed:", err);
          }
        }
      } catch (e) {
        console.error("Global coarse loading error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, user]);

  // Sync Notes for active lesson (Feature 77)
  useEffect(() => {
    if (!enrolled || !courseId || !course?.lessons[activeLesson]) return;
    (async () => {
      const lessonId = course.lessons[activeLesson].id;
      const n = await fetchNote(courseId, lessonId);
      setNoteContent(n?.content || '');
    })();
  }, [activeLesson, enrolled, courseId, course]);

  // Discussions Real-time
  useEffect(() => {
    if (!courseId || activeTab !== 'discussions') return;
    const q = query(collection(db, 'discussions'), where('courseId', '==', courseId));
    const unsub = onSnapshot(q, snap => {
      const records = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDiscussions(records);
    });
    return () => unsub();
  }, [courseId, activeTab]);
  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    
    const finalizeEnrollment = async (paymentId) => {
      setEnrolling(true);
      if (user) {
        const enrollSnap = await getDoc(doc(db, 'enrollments', `${user.uid}_${courseId}`));
        setEnrolled(enrollSnap.exists());
        
        const pSnap = await getDoc(doc(db, 'progress', `${user.uid}_${courseId}`));
        if (pSnap.exists()) {
          const pd = pSnap.data();
          setCompletedLessonIds(pd.completedLessons || []);
          if (pd.notes) setUserNotes(pd.notes);
        }
      }
      try {
        await setDoc(doc(db, 'enrollments', `${user.uid}_${course.id}`), {
          studentId: user.uid,
          courseId: course.id,
          paymentId: paymentId,
          enrolledAt: new Date().toISOString()
        }, { merge: true });
        
        setEnrolled(true);
        toast.success(`Enrollment Secured${testMode ? ' (Test Mode)' : ''}. Start Learning!`);
      } catch (e) {
        console.error('Enrollment Sync Error:', e);
        toast.error('Payment verified, but registration failed. Contact support.');
      } finally {
        setEnrolling(false);
      }
    };

    if (testMode) {
      setShowCheckout(false);
      setShowMockGateway(true);
      return;
    }

    const options = {
      key: "rzp_test_pJSvR9vR9vR9vR",
      amount: course.price * 100,
      currency: "INR",
      name: "LorvenLearn",
      description: `Premium Enrollment: ${course.title}`,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100",
      handler: async function (response) {
        await finalizeEnrollment(response.razorpay_payment_id);
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || ''
      },
      theme: {
        color: "#f59e0b"
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Razorpay SDK Error:", e);
      toast.error("Finance node unreachable. Enable Test Mode to bypass.");
    }
  };
  const toggleComplete = async lessonId => {
    if (!course || !courseId) return;
    const alreadyDone = completedLessonIds.includes(lessonId);
    const next = alreadyDone ? completedLessonIds.filter(id => id !== lessonId) : [...completedLessonIds, lessonId];
    setCompletedLessonIds(next);
    const percentage = Math.round(next.length / course.lessons.length * 100);
    await syncCourseProgress({
      courseId,
      completedLessons: next,
      percentage,
      lastLessonId: lessonId,
      updatedAt: new Date().toISOString()
    });
    if (percentage === 100 && !certId) {
      const cert = await issueCertificate({
        uid: user.uid,
        courseId,
        studentName: user.displayName || user.email.split('@')[0],
        courseTitle: course.title
      });
      if (cert) {
        setCertId(cert.id);
        toast.success('Achievement Unlocked: Certificate Issued!');
      }
    }
  };
  const handleSaveNote = async () => {
    if (!courseId || !course?.lessons[activeLesson]) return;
    setSavingNote(true);
    const success = await saveNote({
      courseId,
      lessonId: course.lessons[activeLesson].id,
      content: noteContent
    });
    if (success) toast.success('Notes Synced to Cloud');
    setSavingNote(false);
  };
  if (loading && !course) return <div className="flex flex-col items-center justify-center py-40 bg-zinc-950 min-h-screen text-orange-500 font-bold uppercase tracking-[0.3em] animate-pulse">Scanning Course Neural Pathways...</div>;
  if (!course) return <div className="text-center py-20 text-zinc-500">Course Node Not Found. Re-indexing...</div>;
  const currentLesson = course.lessons[activeLesson];
  const progressPct = Math.round(completedLessonIds.length / course.lessons.length * 100);
  
  const subtotal = course.price || 0;
  const platformFee = Math.round(subtotal * 0.02);
  const gst = Math.round((subtotal + platformFee) * 0.18);
  const total = subtotal + platformFee + gst;
  
  const getYoutubeEmbedId = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
      return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
    } catch { return url.split('/').pop().split('?')[0]; }
  };

  if (focusMode) {
     return <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-white font-bold text-sm truncate">{course.title} — {currentLesson.title}</h2>
           <button onClick={() => setFocusMode(false)} className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition">Exit Focus Mode</button>
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden bg-black shadow-2xl relative flex">
           <div className={`flex-1 relative ${isAIOpen ? 'w-2/3' : 'w-full'} transition-all`}>
              {currentLesson?.videoUrl ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYoutubeEmbedId(currentLesson.videoUrl)}`} allowFullScreen title={currentLesson.title} /> : <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">Text-based Lesson</div>}
           </div>
           
           {isAIOpen && <motion.div initial={{ x: 300 }} animate={{ x: 0 }} className="w-80 bg-zinc-900 border-l border-white/10 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                 <h3 className="text-xs font-bold text-orange-500 tracking-widest uppercase">Lorven AI Tutor</h3>
                 <button onClick={() => setIsAIOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 <div className="bg-white/5 p-3 rounded-lg text-[11px] text-zinc-300 leading-relaxed border border-white/5">
                    "I've analyzed this lesson. Focus on the concept of **Reactivity** at 4:20. Would you like a summary?"
                 </div>
              </div>
              <div className="mt-4">
                 <input value={aiMessage} onChange={e => setAiMessage(e.target.value)} placeholder="Ask anything..." className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-600" />
              </div>
           </motion.div>}
        </div>
        <div className="mt-4 flex gap-4">
           <button onClick={() => toggleComplete(currentLesson.id)} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${completedLessonIds.includes(currentLesson.id) ? 'bg-green-600 text-white' : 'bg-orange-600 text-white hover:bg-orange-500'}`}>
             {completedLessonIds.includes(currentLesson.id) ? "Lesson Mastered" : "Mark as Done"}
           </button>
           <button onClick={() => setIsAIOpen(!isAIOpen)} className="bg-zinc-800 text-orange-500 px-6 py-2 rounded-lg text-xs font-bold border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all">AI Assistant</button>
           <button onClick={() => {
             setBookmarks([...bookmarks, { lessonId: currentLesson.id, time: new Date().toLocaleTimeString() }]);
             toast.success('Bookmark saved');
           }} className="bg-zinc-800 text-zinc-300 px-6 py-2 rounded-lg text-xs font-bold hidden sm:block">Add Bookmark</button>
        </div>
     </div>;
  }

  return <div className="max-w-7xl mx-auto px-4 pb-20">
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-100">
               <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors font-bold z-10">✕</button>
               <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-500" /> Order Summary</h3>
               
               <div className="space-y-4 mb-6">
                 <div className="flex gap-4 items-center">
                    <img src={course.thumbnailUrl || FALLBACK_IMG} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="course" />
                    <div>
                      <p className="font-bold text-zinc-900 text-sm line-clamp-1">{course.title}</p>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">{course.category}</p>
                    </div>
                 </div>
                 
                 <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-3">
                   <div className="flex justify-between text-sm font-medium text-zinc-600">
                     <span>Course Price</span>
                     <span>₹{subtotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between text-sm font-medium text-zinc-600">
                     <span>Platform Fee (2%)</span>
                     <span>₹{platformFee.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between text-sm font-medium text-zinc-600">
                     <span>GST (18%)</span>
                     <span>₹{gst.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="pt-3 mt-1 border-t border-zinc-200 flex justify-between items-center">
                     <span className="font-bold text-zinc-900">Total Amount</span>
                     <span className="text-xl font-black text-amber-600">₹{total.toLocaleString('en-IN')}</span>
                   </div>
                 </div>
               </div>
               
               <button onClick={() => {
                 setShowCheckout(false);
                 handleEnroll();
               }} disabled={enrolling} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2">
                 Proceed to Payment gateway
               </button>
               <p className="text-[10px] items-center justify-center font-bold text-zinc-400 mt-4 uppercase tracking-widest flex gap-1">
                  <ShieldCheck className="w-3 h-3" /> Secure Encrypted Transaction
               </p>
               
               <label className="flex items-center gap-2 mt-5 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-600 uppercase cursor-pointer hover:bg-zinc-100 transition-colors">
                  <input type="checkbox" checked={testMode} onChange={e => setTestMode(e.target.checked)} className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-white border-zinc-300" />
                  Bypass payment gateway (Test Mode)
               </label>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2.5 text-zinc-500 hover:text-zinc-900 transition-colors py-2 group">
             <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
               <ArrowLeft className="w-4 h-4" />
             </div>
             <span className="text-[12px] font-bold uppercase tracking-widest">Back to Library</span>
          </button>
          {certId && <Link to={`/certificates/${certId}`} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
              <Award className="w-4 h-4" /> Claim Certificate
            </Link>}
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {enrolled ? <>
              {/* Classroom Player (Feature 80: Immersive Player) */}
              <div className="bg-zinc-900 rounded-2xl overflow-hidden aspect-video shadow-lg relative bg-black">
                {currentLesson?.videoUrl ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYoutubeEmbedId(currentLesson.videoUrl)}`} allowFullScreen title={currentLesson.title} /> : <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                     <FileText className="w-12 h-12 mb-4 opacity-20" />
                     <p className="font-bold">Text-based Lesson Content below</p>
                  </div>}
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                   <button onClick={() => setFocusMode(true)} className="bg-black/60 backdrop-blur-md text-white p-2 rounded-lg hover:bg-orange-600 transition" title="Focus Mode">
                      <Users className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <div className="premium-card bg-white border border-zinc-100/80 rounded-[2rem] overflow-hidden shadow-[var(--shadow-glass)]">
                <div className="flex bg-zinc-50 border-b border-zinc-200/50 overflow-x-auto p-1.5 gap-1">
                   {['content', 'quizzes', 'discussions', 'notes', 'reviews'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-3 text-[13px] font-bold transition-all rounded-xl ${activeTab === t ? 'text-amber-700 bg-white shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50'}`}>
                       <span className="capitalize">{t}</span>
                     </button>)}
                </div>

                <div className="p-8">
                  {activeTab === 'content' && <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="prose prose-zinc max-w-none">
                       <h2 className="text-xl font-bold mb-4">{currentLesson?.title}</h2>
                       <p className="text-zinc-600 leading-relaxed font-medium">
                         {currentLesson?.content || 'No text content for this lesson.'}
                       </p>
                       <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <button onClick={() => toggleComplete(currentLesson.id)} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${completedLessonIds.includes(currentLesson.id) ? 'bg-green-100 text-green-700' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-600/20'}`}>
                           {completedLessonIds.includes(currentLesson.id) ? <><CheckCircle2 className="w-4 h-4" /> Mission Accomplished</> : "Mark as Mastered"}
                         </button>
                         <button className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-xs font-black uppercase tracking-widest transition-colors">
                            <Download className="w-4 h-4" /> Download Assets
                         </button>
                       </div>
                    </motion.div>}

                  {activeTab === 'notes' && <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="pt-2">
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-amber-600" /> My Personal Notes
                        </h4>
                        <p className="text-sm text-amber-700/80 mb-4 font-medium">Jot down key takeaways. These securely persist across sessions automatically.</p>
                        <textarea value={userNotes} onChange={e => setUserNotes(e.target.value)} className="w-full h-48 p-4 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm leading-relaxed shadow-sm resize-none text-zinc-800" placeholder="e.g. Remember to verify the proxy routing config..." />
                        <div className="mt-4 flex justify-end">
                           <button onClick={async () => {
                              try {
                                await setDoc(doc(db, 'progress', `${user?.uid}_${course.id}`), { notes: userNotes }, { merge: true });
                                toast.success('Notes Synced to Database!');
                              } catch { toast.error("Failed to sync notes."); }
                           }} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all text-sm">
                             Save to Notebook
                           </button>
                        </div>
                      </div>
                    </motion.div>}

                  {activeTab === 'discussions' && <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="pt-2">
                       <DiscussionBoard discussions={discussions} currentUser={user} onDeleteMessage={async (msgId) => {
                          try {
                             await deleteDoc(doc(db, 'discussions', msgId));
                             toast.success('Message successfully redacted.');
                          } catch { toast.error("Failed to delete post."); }
                       }} onSendMessage={async msg => {
                  if (!courseId) return;
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
                  } catch {
                    toast.error('Failed to post reply.');
                  } finally {
                    setSendingMsg(false);
                  }
                }} />
                    </motion.div>}

                  {activeTab === 'quizzes' && <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="pt-2">
                      <QuizCard quiz={currentLesson?.quiz || []} onComplete={async (score) => {
                          let freshCompleted = completedLessonIds;
                          if (!completedLessonIds.includes(currentLesson.id)) {
                             freshCompleted = [...completedLessonIds, currentLesson.id];
                             await toggleComplete(currentLesson.id);
                          }
                          const total = Array.isArray(course.lessons) ? course.lessons.length : course.lessons;
                          const prog = Math.round((freshCompleted.length / total) * 100);
                          if (prog === 100) {
                             toast.success("100% Mastery! Writing secure Certificate...", { duration: 4000 });
                             try {
                                const { issueCertificate } = await import('../firebase');
                                await issueCertificate({ uid: user.uid, courseId: course.id, studentName: user.displayName || "Scholar", courseTitle: course.title });
                                toast.success("✅ Certificate Secured! Download it from your Dashboard.");
                             } catch(err) {
                                console.error(err);
                             }
                          }
                      }} />
                  </motion.div>}

                  {activeTab === 'reviews' && <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="pt-2">
                       <ReviewSection />
                    </motion.div>}
                </div>
              </div>
            </> : <div className="space-y-8">
               <div className="h-72 rounded-[2rem] overflow-hidden shadow-[var(--shadow-glass)] relative premium-card border-[4px] border-white z-20">
                  <img src={course.thumbnailUrl || FALLBACK_IMG} className="w-full h-full object-cover opacity-90 scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-10">
                     <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-bold text-white tracking-widest mb-3 border border-white/30">{course.category}</span>
                     <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">{course.title}</h1>
                  </div>
               </div>

               <div className="premium-card bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-10 space-y-10 shadow-[var(--shadow-premium)] relative overflow-hidden -mt-8 pt-16 z-10">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <Users className="w-64 h-64 -rotate-12" />
                   </div>
                   
                   <div className="relative z-10 max-w-3xl">
                     <h2 className="text-[11px] font-bold text-amber-600 mb-5 tracking-[0.2em] uppercase">Course Philosophy</h2>
                     <p className="text-zinc-700 leading-relaxed font-medium text-[19px]">{course.description}</p>
                   </div>

                   <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 rounded-2xl shadow-sm">
                     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorName || 'Instructor')}&background=f59e0b&color=fff`} className="w-14 h-14 rounded-2xl shadow-md" alt="Instructor Profile" />
                     <div>
                       <p className="text-[11px] uppercase font-bold text-amber-600 tracking-widest mb-1">Lead Instructor</p>
                       <p className="text-[16px] font-extrabold text-zinc-900">{course.instructorName || 'Lorven Expert'}</p>
                     </div>
                     <button className="sm:ml-auto px-5 py-2.5 bg-white border border-zinc-200/80 rounded-xl text-[13px] font-bold hover:border-amber-400 hover:text-amber-600 hover:shadow-sm transition-all">
                       View Credentials
                     </button>
                   </div>

                   {course.outcomes && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                     <div className="md:col-span-2"><h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-4">What you will master:</h4></div>
                     {course.outcomes.map(o => <div key={o} className="flex items-start gap-2 text-sm text-zinc-600 font-medium">
                       <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {o}
                     </div>)}
                   </div>}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-zinc-100/80">
                     {[{
                i: <Star />,
                l: 'Rating',
                v: `${course.rating || 5}★`
              }, {
                i: <Users />,
                l: 'Scholars',
                v: (course.totalStudents || 1500).toLocaleString()
              }, {
                i: <Clock />,
                l: 'Intensity',
                v: course.level
              }, {
                i: <Globe />,
                l: 'Dialect',
                v: course.language || 'English'
              }].map(stat => <div key={stat.l}>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{stat.l}</p>
                          <p className="text-[15px] font-extrabold text-zinc-900">{stat.v}</p>
                       </div>)}
                        <div className="col-span-full mt-4 premium-card bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-10 rounded-[2rem] border border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
                      <div className="text-center sm:text-left relative z-10">
                        <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest mb-3">Premium Discovery Pass</p>
                        <div className="flex items-center justify-center sm:justify-start gap-1">
                           <IndianRupee className="w-7 h-7 text-white" />
                           <span className="text-5xl font-black text-white tracking-tighter">{course.price.toLocaleString('en-IN')}</span>
                           {course.originalPrice && <span className="ml-3 text-zinc-500 text-lg font-bold line-through">₹{course.originalPrice.toLocaleString('en-IN')}</span>}
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                           Unlock High-Paying Skills
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-end w-full sm:w-auto relative z-10 gap-3">
                         <button onClick={() => setShowCheckout(true)} disabled={enrolling} className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-5 rounded-2xl font-bold text-[14px] uppercase tracking-wide shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                            {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enroll Discovery <ArrowLeft className="w-5 h-5 rotate-180" /></>}
                         </button>
                         <div className="text-[10px] font-medium text-zinc-400 text-center sm:text-right max-w-xs mt-1 bg-zinc-900/50 p-2 rounded border border-zinc-800">
                           <span className="text-amber-500 font-bold block mb-1">Test Payment Details:</span>
                           Mobile: 9999999999 | OTP: 1234<br/>
                           Card: 4111 1111 1111 1111
                         </div>
                      </div>
                   </div>
                  </div>
               </div>
            </div>}
        </div>

         <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
             <div className="premium-card bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden shadow-[var(--shadow-glass)]">
                <div className="p-6 bg-zinc-50 border-b border-zinc-100/80 flex justify-between items-center">
                   <h3 className="text-[12px] font-bold text-zinc-900 uppercase tracking-widest">Master Workflow</h3>
                   {enrolled && <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">{progressPct}%</span>}
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                   {course.lessons.map((lesson, idx) => <button key={lesson.id} disabled={!enrolled} onClick={() => setActiveLesson(idx)} className={`w-full text-left p-5 flex items-start gap-4 transition-all border-b border-zinc-50 group last:border-0 ${!enrolled ? 'opacity-50 pointer-events-none' : 'hover:bg-amber-50/30'} ${activeLesson === idx ? 'bg-amber-50/50' : ''}`}>
                        <div className={`mt-0.5 w-[22px] h-[22px] rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors shadow-sm ${completedLessonIds.includes(lesson.id) ? 'bg-emerald-500 text-white border border-emerald-600' : activeLesson === idx ? 'bg-amber-500 text-white border border-amber-600' : 'bg-white border border-zinc-200 text-zinc-400'}`}>
                           {completedLessonIds.includes(lesson.id) ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className={`text-[13px] font-bold truncate leading-tight mb-1.5 transition-colors ${activeLesson === idx ? 'text-amber-700' : 'text-zinc-900'}`}>{lesson.title}</p>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lesson.videoUrl ? 'Video' : 'Text'}</span>
                             {lesson.duration && <span className="text-[10px] text-zinc-300 font-bold">· {lesson.duration}m</span>}
                           </div>
                        </div>
                        {!enrolled && <Lock className="w-4 h-4 text-zinc-300 ml-auto" />}
                     </button>)}
                </div>
             </div>

             <div className="premium-card bg-zinc-900 rounded-[1.5rem] p-8 text-white overflow-hidden relative shadow-lg">
                <div className="absolute -top-4 right-0 p-4 opacity-[0.03]"><ShieldCheck className="w-32 h-32" /></div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-amber-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Security Verified</h4>
                <p className="text-[13px] text-zinc-400 leading-relaxed font-medium">This curriculum is certified by LorvenLearn and guarantees high-quality educational value.</p>
             </div>
          </div>
        </div>
        {showMockGateway && (
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-zinc-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -z-10 pointer-events-none" />
               <h2 className="text-2xl font-black text-zinc-900 mb-2 font-serif italic">Test Mode Gateway</h2>
               <p className="text-zinc-500 font-medium mb-8 text-sm">Simulate a confirmed transaction bypass for API testing.</p>
               
               <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 mb-8">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Total Platform Revenue</span>
                   <span className="font-mono text-emerald-600 font-bold">₹12,40,000</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Simulated Purchases</span>
                   <span className="font-mono text-blue-600 font-bold">3,492</span>
                 </div>
                 <div className="w-full h-px bg-zinc-200" />
                 <div className="flex justify-between items-center text-base pt-2">
                   <span className="text-zinc-900 font-black">Current Entry</span>
                   <span className="font-mono text-amber-600 font-black tracking-tight">+₹{course?.price?.toLocaleString() || 1999}</span>
                 </div>
               </div>
               
               <div className="flex gap-4">
                 <button onClick={() => setShowMockGateway(false)} disabled={enrolling} className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl font-bold text-zinc-600 transition-colors">Cancel</button>
                 <button onClick={() => {
                    setShowMockGateway(false);
                    // trigger finalizeEnrollment
                    setEnrolling(true);
                    finalizeEnrollment("pay_TEST_" + Math.random().toString(36).substr(2, 9));
                 }} disabled={enrolling} className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg shadow-zinc-900/20 active:scale-95 transition-all">Confirm Bypass</button>
               </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>;
}