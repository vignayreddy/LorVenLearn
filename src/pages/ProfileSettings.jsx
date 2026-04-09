import { useState } from 'react';
import { updateUserDetails } from '../firebase';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Shield, Save, ArrowLeft, Camera, Loader2, Bell, History, Smartphone as DeviceIcon, Award, Zap, Star, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, db } from '../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
export default function ProfileSettings({
  user
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
    twitter: user.socialLinks?.twitter || '',
    linkedin: user.socialLinks?.linkedin || '',
    website: user.socialLinks?.website || ''
  });
  const [notifPrefs, setNotifPrefs] = useState(user.notificationPrefs || {
    emailAnnouncements: true,
    emailReminders: true,
    appNotifications: true
  });
  const [appPrefs, setAppPrefs] = useState(user.appPrefs || {
    theme: 'system',
    language: 'English',
    highContrast: false,
    fontSize: 'normal'
  });
  const [learningGoals, setLearningGoals] = useState(user.learningGoals || {
    dailyMinutes: 30,
    weeklyTarget: 5,
    emailReminders: true
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const stopCamera = () => {
    const video = document.getElementById('webcam');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
       setIsCameraOpen(true);
       setTimeout(() => {
         const video = document.getElementById('webcam');
         if (video) video.srcObject = stream;
       }, 100);
     } catch (e) {
       toast.error('Camera Access Denied or Unavailable');
       console.error(e);
     }
  };

  const capturePhoto = async () => {
     const video = document.getElementById('webcam');
     const canvas = document.createElement('canvas');
     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;
     canvas.getContext('2d').drawImage(video, 0, 0);
     const dataUrl = canvas.toDataURL('image/jpeg');
     
     setCameraLoading(true);
     try {
        const storageRef = ref(storage, `profiles/${user.uid}.jpg`);
        await uploadString(storageRef, dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadUrl });
        toast.success('Identity Photo Updated');
        window.location.reload(); 
     } catch (e) {
        toast.error('Upload failed');
     } finally {
        setCameraLoading(false);
        stopCamera();
     }
  };

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    const success = await updateUserDetails(user.uid, {
      displayName: formData.displayName,
      bio: formData.bio,
      socialLinks: {
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        website: formData.website
      },
      notificationPrefs: notifPrefs,
      appPrefs,
      learningGoals
    });
    if (success) toast.success('Identity Updated');
    setLoading(false);
  };
  return (
    <>
    <div className="max-w-5xl mx-auto py-10 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 mb-10 transition group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-tight">Return to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card p-6 text-center shadow-[var(--shadow-glass)] flex flex-col items-center">
            <div className="relative inline-block mb-4 group cursor-pointer" onClick={startCamera}>
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-zinc-900/20 ring-4 ring-white border-2 border-transparent group-hover:border-amber-400 transition-all">
                   {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : (formData.displayName || user.email)[0].toUpperCase()}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2.5 bg-white text-zinc-900 rounded-xl shadow-md border border-zinc-100/50 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white group-hover:border-transparent transition-all">
                   <Camera className="w-4 h-4" />
                </button>
            </div>
            <h2 className="text-[17px] font-extrabold text-zinc-900 min-w-0 w-full truncate">{formData.displayName || 'Learner'}</h2>
            <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100/50 font-bold uppercase tracking-widest mt-2">{user.role}</p>
          </div>

          <nav className="flex flex-col p-2 bg-zinc-50/50 rounded-[2rem] border border-zinc-100/50 shadow-inner">
             {[{
            id: 'profile',
            label: 'Public Profile',
            icon: <UserIcon />
          }, {
            id: 'learning',
            label: 'Learning Hub',
            icon: <Zap />
          }, {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell />
          }, {
            id: 'appearance',
            label: 'Appearance',
            icon: <Star />
          }, {
            id: 'security',
            label: 'Security & Privacy',
            icon: <Shield />
          }].map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === item.id ? 'bg-white text-amber-700 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:bg-zinc-100/50 hover:text-zinc-900'}`}>
                 <span className={`w-4 h-4 ${activeTab === item.id ? 'text-amber-500' : ''}`}>{item.icon}</span> {item.label}
               </button>)}
          </nav>

          {/* User History (Feature 83) */}
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-4">
             <div className="flex items-center gap-2 text-zinc-400">
               <History className="w-4 h-4" />
               <h3 className="text-[10px] font-bold uppercase tracking-widest">Master Records</h3>
             </div>
             <div>
               <p className="text-xl font-bold text-zinc-900">124 hrs</p>
               <p className="text-[10px] text-zinc-400 font-bold uppercase">Learning Time</p>
             </div>
             <div>
               <p className="text-xl font-bold text-zinc-900">5</p>
               <p className="text-[10px] text-zinc-400 font-bold uppercase">Diplomas Earned</p>
             </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && <motion.form initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} onSubmit={handleSave} className="premium-card bg-white border border-white/60 rounded-[2.5rem] p-8 md:p-14 shadow-[var(--shadow-glass)] space-y-12">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Public Profile</h1>
                  <p className="text-sm text-zinc-400 font-medium">This information is shared across the platform.</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Display Name</label>
                       <input type="text" value={formData.displayName} onChange={e => setFormData({
                    ...formData,
                    displayName: e.target.value
                  })} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] focus:outline-none focus:border-amber-400 focus:bg-white font-bold text-[14px] shadow-inner transition-all duration-300" placeholder="e.g. John Wick" />
                    </div>
                    <div className="space-y-2 opacity-50 cursor-not-allowed">
                       <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Email Address</label>
                       <div className="flex items-center gap-3 px-5 py-3.5 bg-zinc-100 rounded-xl font-bold text-zinc-500">
                          <Mail className="w-4 h-4" /> {user.email}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Professional Bio</label>
                    <textarea rows={4} value={formData.bio} onChange={e => setFormData({
                  ...formData,
                  bio: e.target.value
                })} className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-medium text-zinc-600 leading-relaxed font-serif italic text-lg" placeholder="Share your expertise with fellow scholars..." />
                  </div>

                  <div className="pt-6 border-t border-zinc-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['website', 'linkedin', 'twitter'].map(s => <div key={s} className="space-y-2">
                         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2 capitalize">{s}</label>
                         <input type="text" value={formData[s]} onChange={e => setFormData({
                    ...formData,
                    [s]: e.target.value
                  })} className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-bold text-xs" placeholder="https://..." />
                      </div>)}
                  </div>
                </div>

                <div className="pt-8">
                   <button type="submit" disabled={loading} className="w-full md:w-auto px-10 py-4 btn-primary flex items-center justify-center gap-2 text-[14px]">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Metadata</>}
                   </button>
                </div>
              </motion.form>}

            {activeTab === 'notifications' && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} className="premium-card bg-white border border-white/60 rounded-[2.5rem] p-8 md:p-14 shadow-[var(--shadow-glass)] space-y-12">
                 <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Notification Channels</h2>
                 <div className="space-y-6">
                    {[{
                id: 'emailAnnouncements',
                l: 'Announcements',
                d: 'Receive important course updates via email.'
              }, {
                id: 'emailReminders',
                l: 'Learning Reminders',
                d: 'Periodic emails to help keep your streak alive.'
              }, {
                id: 'appNotifications',
                l: 'App Notifications',
                d: 'In-app real-time alerts for discussions and grading.'
              }].map(n => <div key={n.id} className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0">
                         <div className="max-w-md">
                            <p className="text-sm font-bold text-zinc-900">{n.l}</p>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">{n.d}</p>
                         </div>
                          <button onClick={() => setNotifPrefs({
                  ...notifPrefs,
                  [n.id]: !notifPrefs[n.id]
                })} className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${notifPrefs[n.id] ? 'bg-amber-500' : 'bg-zinc-200'}`}>
                             <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${notifPrefs[n.id] ? 'left-8' : 'left-1'}`} />
                          </button>
                       </div>)}
                  </div>
                  <button onClick={handleSave} className="btn-primary px-8 py-3.5">Apply Changes</button>
               </motion.div>}

            {activeTab === 'learning' && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card bg-white border border-white/60 rounded-[2.5rem] p-8 md:p-14 shadow-[var(--shadow-glass)] space-y-12">
                 <div>
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Learning Hub</h2>
                    <p className="text-sm text-zinc-400 font-medium">Set your intensity for global recognition.</p>
                 </div>
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Daily Study Target (Minutes)</label>
                       <div className="flex items-center gap-4">
                           {[15, 30, 45, 60, 90].map(m => (
                             <button key={m} onClick={() => setLearningGoals({...learningGoals, dailyMinutes: m})} className={`px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${learningGoals.dailyMinutes === m ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-zinc-50 border-zinc-200/80 text-zinc-500 hover:border-amber-400 hover:bg-white'}`}>
                                {m}m
                             </button>
                           ))}
                       </div>
                    </div>
                    <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-zinc-900">Email Streak Alerts</p>
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed">We'll alert you if your daily streak is in danger of being lost.</p>
                       </div>
                        <button onClick={() => setLearningGoals({...learningGoals, emailReminders: !learningGoals.emailReminders})} className={`w-14 h-7 rounded-full shadow-inner transition-colors relative ${learningGoals.emailReminders ? 'bg-amber-500' : 'bg-zinc-200'}`}>
                           <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${learningGoals.emailReminders ? 'left-8' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
                  <button onClick={handleSave} className="btn-primary px-8 py-3.5">Save Goals</button>
              </motion.div>}

            {activeTab === 'appearance' && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card bg-white border border-white/60 rounded-[2.5rem] p-8 md:p-14 shadow-[var(--shadow-glass)] space-y-12">
                 <div>
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Appearance & Access</h2>
                    <p className="text-sm text-zinc-400 font-medium">Customize your interface for maximum performance.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Interface Language</label>
                       <select value={appPrefs.language} onChange={e => setAppPrefs({...appPrefs, language: e.target.value})} className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-bold text-xs focus:ring-0 focus:border-zinc-900 transition-all">
                          {['English', 'Hindi', 'Spanish', 'French', 'German'].map(l => <option key={l}>{l}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Theme</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['light', 'dark', 'system'].map(t => (
                            <button key={t} onClick={() => setAppPrefs({...appPrefs, theme: t})} className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${appPrefs.theme === t ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}>
                               {t}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                    <div>
                       <p className="text-sm font-bold text-zinc-900">High Contrast Mode</p>
                       <p className="text-xs text-zinc-400 font-medium leading-relaxed">Increase visibility of UI elements for easier reading.</p>
                    </div>
                     <button onClick={() => setAppPrefs({...appPrefs, highContrast: !appPrefs.highContrast})} className={`w-14 h-7 rounded-full shadow-inner transition-colors relative ${appPrefs.highContrast ? 'bg-amber-500' : 'bg-zinc-200'}`}>
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${appPrefs.highContrast ? 'left-8' : 'left-1'}`} />
                     </button>
                  </div>
                  <button onClick={handleSave} className="btn-primary px-8 py-3.5">Apply Aesthetic</button>
              </motion.div>}

            {activeTab === 'security' && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} className="space-y-8">
                  <div className="premium-card bg-white border border-zinc-100/80 rounded-[2.5rem] p-8 md:p-14 shadow-[var(--shadow-glass)]">
                     <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-4">Security Protocol</h2>
                     <p className="text-sm text-zinc-500 font-medium mb-10">We suggest multi-factor authentication for high-value instructor profiles.</p>
                     
                     <div className="space-y-8">
                         <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Active Session Logs</h3>
                         <div className="space-y-3">
                            {[{
                    d: 'Windows Desktop',
                    l: 'Mumbai, IN',
                    s: 'Current Session'
                  }, {
                    d: 'iPhone 15 Pro',
                    l: 'Delhi, IN',
                    s: '2 days ago'
                  }].map(sess => <div key={sess.l} className="flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-xl group transition-all">
                                   <DeviceIcon className="w-5 h-5 text-zinc-300" />
                                   <div className="flex-1">
                                      <p className="text-sm font-bold text-zinc-900">{sess.d}</p>
                                      <p className="text-[10px] text-zinc-400 font-bold uppercase">{sess.l}</p>
                                   </div>
                                   <span className="text-[10px] font-bold text-zinc-500">{sess.s}</span>
                                </div>)}
                         </div>
                         
                         <div className="pt-8 border-t border-zinc-50 space-y-6">
                            <div>
                               <h4 className="text-sm font-bold text-zinc-900 mb-2">Vault & Data Privacy</h4>
                               <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">Control how your learning data is shared and stored.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <button className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-zinc-900 transition group">
                                  <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-900">Download Learning History (JSON)</span>
                                  <ArrowLeft className="w-4 h-4 rotate-180 text-zinc-300 group-hover:text-zinc-900 transition" />
                               </button>
                               <button className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-red-500 transition group">
                                  <span className="text-xs font-bold text-zinc-600 group-hover:text-red-600">Deactivate Elite Account</span>
                                  <ShieldCheck className="w-4 h-4 text-zinc-300 group-hover:text-red-500 transition" />
                               </button>
                            </div>
                         </div>
                     </div>
                  </div>
                  
                  <div className="premium-card bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-[2rem] p-10 mt-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
                     <div className="text-center md:text-left relative z-10 w-full md:w-auto">
                        <h4 className="text-[19px] font-extrabold mb-1.5">Two-Factor Authentication</h4>
                        <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">Double down on your account vault with 2FA protection.</p>
                     </div>
                     <button className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20 relative z-10">
                        Enable 2FA
                     </button>
                  </div>
               </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
    
    <AnimatePresence>
        {isCameraOpen && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card bg-white border border-white/60 p-10 rounded-[2.5rem] max-w-lg w-full text-center shadow-2xl">
             <h3 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight">Identity Capture</h3>
             <div className="aspect-square bg-zinc-100 rounded-[2rem] overflow-hidden mb-8 relative shadow-inner">
                <video id="webcam" autoPlay playsInline className="w-full h-full object-cover" />
                {cameraLoading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                </div>}
             </div>
             <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={capturePhoto} disabled={cameraLoading} className="flex-1 py-4 btn-primary text-[15px]">Capture & Sync</button>
                <button onClick={stopCamera} className="flex-1 px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold border border-zinc-200/80 hover:bg-zinc-200 hover:text-zinc-900 transition-all text-[15px]">Cancel</button>
             </div>
          </motion.div>
       </div>}
    </AnimatePresence>
    </>
  );
}