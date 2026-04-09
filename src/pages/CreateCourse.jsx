import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { Plus, Trash2, Book, Loader2, ArrowLeft, IndianRupee, Layers, Sparkles, Globe, Ticket, BarChart, Target, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const CATEGORIES = ['Web Development', 'UI/UX Design', 'Data Science', 'Mobile Development', 'AI & Machine Learning', 'DevOps', 'Cybersecurity', 'Business', 'Marketing', 'Photography', 'Music'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
export default function CreateCourse({
  user
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('499');
  const [originalPrice, setOriginalPrice] = useState('1999');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('Hindi + English');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [lessons, setLessons] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      id: `l${i + 1}`,
      title: `Lesson ${i + 1}`,
      content: '',
      videoUrl: '',
      duration: 15
    }))
  );
  const handleAddLesson = () => {
    setLessons([...lessons, {
      id: `l${lessons.length + 1}`,
      title: '',
      content: '',
      videoUrl: '',
      duration: 10
    }]);
  };
  const handleRemoveLesson = idx => {
    if (lessons.length === 1) return;
    setLessons(lessons.filter((_, i) => i !== idx));
  };
  const handleLessonChange = (idx, field, value) => {
    const newLessons = [...lessons];
    newLessons[idx] = {
      ...newLessons[idx],
      [field]: value
    };
    setLessons(newLessons);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (lessons.some(l => !l.title)) {
      toast.error('Every lesson needs a title.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'courses'), {
        title,
        description,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        category,
        level,
        language,
        thumbnailUrl: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        instructorId: user.uid,
        instructorName: user.displayName || user.email.split('@')[0],
        instructorBio: user.bio || '',
        createdAt: new Date().toISOString(),
        lessons,
        rating: 5.0,
        ratingCount: 0,
        totalStudents: 0,
        isBestseller: false,
        whatYouLearn: ['New skill mastery'],
        requirements: ['Willingness to learn']
      });
      toast.success('Course Launched to Global Audience');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Launch Error: Failed to sync.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-5xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-tight">Return to Base</span>
      </button>

      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Publish Your Expertise</h1>
        <p className="text-zinc-500 font-medium italic">Join 500+ instructors teaching millions of scholars worldwide.</p>
      </header>

      {/* Feature 88: Multi-Step Course Builder UI */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl w-fit mb-8">
        {[{
        id: 'details',
        label: 'Primary Details',
        icon: <Book />
      }, {
        id: 'curriculum',
        label: 'Chapter Workflow',
        icon: <Layers />
      }, {
        id: 'marketing',
        label: 'Market Strategy',
        icon: <Target />
      }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
            {tab.label}
          </button>)}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'details' && <motion.section initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 10
        }} className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Course Title</label>
                       <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-bold transition-all" placeholder="e.g. Mastering Cloud Scale" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Category</label>
                          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl font-bold text-sm">
                             {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Mastery Level</label>
                          <select value={level} onChange={e => setLevel(e.target.value)} className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl font-bold text-sm">
                             {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Cover Artwork URL</label>
                       <input type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-medium text-xs focus:outline-none focus:border-zinc-900" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Landing Summary</label>
                    <textarea rows={10} required value={description} onChange={e => setDescription(e.target.value)} className="w-full h-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-medium text-zinc-600 leading-relaxed font-serif italic" placeholder="Narrate the value of this course..." />
                 </div>
              </div>
            </motion.section>}

          {activeTab === 'curriculum' && <motion.section initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 10
        }} className="space-y-4">
               <div className="flex justify-between items-center px-4 mb-4">
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Structured Content</h2>
                  <button type="button" onClick={handleAddLesson} className="text-xs font-bold text-orange-600 flex items-center gap-1.5 hover:underline">
                     <Plus className="w-4 h-4" /> New Chapter
                  </button>
               </div>
               {lessons.map((lesson, idx) => <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm group relative">
                    <button type="button" onClick={() => handleRemoveLesson(idx)} className="absolute top-6 right-6 p-2 text-zinc-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                       <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                       <div className="md:col-span-1 py-1 text-center font-bold text-zinc-300 text-sm">
                          {idx + 1}
                       </div>
                       <div className="md:col-span-11 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Heading</label>
                                <input value={lesson.title} onChange={e => handleLessonChange(idx, 'title', e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-50 rounded-lg font-bold text-sm" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Video Stream ID</label>
                                <input value={lesson.videoUrl} onChange={e => handleLessonChange(idx, 'videoUrl', e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-50 rounded-lg font-medium text-xs" />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Readings</label>
                             <textarea rows={3} value={lesson.content} onChange={e => handleLessonChange(idx, 'content', e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-50 rounded-lg text-sm text-zinc-600 italic font-medium" />
                          </div>
                       </div>
                    </div>
                 </div>)}
            </motion.section>}

          {activeTab === 'marketing' && <motion.section initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 10
        }} className="bg-white border border-zinc-200 rounded-2xl p-10 shadow-sm space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <h3 className="text-sm font-bold text-zinc-900 uppercase flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-orange-600" /> Monitization Structure
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase">Offer Price</label>
                           <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase">List Price</label>
                           <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-bold text-zinc-400" />
                        </div>
                     </div>
                  </div>
                  
                  {/* Feature 86: Coupon Code Generator Stubs */}
                  <div className="space-y-6">
                     <h3 className="text-sm font-bold text-zinc-900 uppercase flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-orange-600" /> Growth Tools
                     </h3>
                     <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 border-dashed border-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Apply Promo Mechanics</span>
                        <button type="button" className="text-[10px] font-bold text-zinc-900 underline">Add Rule</button>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-zinc-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[{
              i: <ShieldCheck />,
              l: 'Privacy Protected',
              d: 'Content stays in Lorven vault.'
            }, {
              i: <Globe />,
              l: 'SEO Optimized',
              d: 'Indexed on Google Search.'
            }, {
              i: <BarChart />,
              l: 'Sales Reports',
              d: 'Track conversion metrics.'
            }].map(ft => <div key={ft.l} className="flex flex-col items-center text-center p-4">
                       <div className="text-zinc-300 mb-2">{ft.i}</div>
                       <p className="text-xs font-bold text-zinc-900 mb-1">{ft.l}</p>
                       <p className="text-[10px] text-zinc-400 font-medium leading-tight">{ft.d}</p>
                    </div>)}
               </div>
            </motion.section>}
        </AnimatePresence>

        <div className="flex justify-end pt-10 border-t border-zinc-100 gap-3">
           <button type="button" onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-white border border-zinc-200 text-zinc-500 rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-50 transition">Save Draft</button>
           <button type="submit" disabled={loading} className="px-12 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-orange-600 transition shadow-lg active:scale-95 flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Publish Universe</>}
           </button>
        </div>
      </form>
    </div>;
}