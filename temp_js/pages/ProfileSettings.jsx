import { useState } from 'react';
import { updateUserDetails } from '../firebase';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Shield, Save, ArrowLeft, Camera, Loader2, Bell, History, Smartphone as DeviceIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
export default function ProfileSettings({ user }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        displayName: user.displayName || '',
        bio: user.bio || '',
        twitter: user.socialLinks?.twitter || '',
        linkedin: user.socialLinks?.linkedin || '',
        website: user.socialLinks?.website || '',
    });
    const [notifPrefs, setNotifPrefs] = useState(user.notificationPrefs || {
        emailAnnouncements: true,
        emailReminders: true,
        appNotifications: true,
    });
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await updateUserDetails(user.uid, {
            displayName: formData.displayName,
            bio: formData.bio,
            socialLinks: {
                twitter: formData.twitter,
                linkedin: formData.linkedin,
                website: formData.website,
            },
            notificationPrefs: notifPrefs
        });
        if (success)
            toast.success('Identity Updated');
        setLoading(false);
    };
    return (<div className="max-w-5xl mx-auto py-10 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 mb-10 transition group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
        <span className="text-sm font-bold uppercase tracking-tight">Return to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="relative inline-block mb-4">
               <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {(formData.displayName || user.email)[0].toUpperCase()}
               </div>
               <button className="absolute -bottom-1 -right-1 p-2 bg-white text-zinc-900 rounded-lg shadow-md border border-zinc-100 hover:bg-zinc-50 transition">
                  <Camera className="w-3.5 h-3.5"/>
               </button>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 truncate">{formData.displayName || 'Learner'}</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{user.role}</p>
          </div>

          <nav className="flex flex-col gap-1">
             {[
            { id: 'profile', label: 'Public Profile', icon: <UserIcon /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell /> },
            { id: 'security', label: 'Security & Access', icon: <Shield /> },
        ].map(item => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900'}`}>
                 <span className="w-4 h-4">{item.icon}</span> {item.label}
               </button>))}
          </nav>

          {/* User History (Feature 83) */}
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-4">
             <div className="flex items-center gap-2 text-zinc-400">
               <History className="w-4 h-4"/>
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
            {activeTab === 'profile' && (<motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-10">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Public Profile</h1>
                  <p className="text-sm text-zinc-400 font-medium">This information is shared across the platform.</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Display Name</label>
                       <input type="text" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-bold transition-all" placeholder="e.g. John Wick"/>
                    </div>
                    <div className="space-y-2 opacity-50 cursor-not-allowed">
                       <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Email Address</label>
                       <div className="flex items-center gap-3 px-5 py-3.5 bg-zinc-100 rounded-xl font-bold text-zinc-500">
                          <Mail className="w-4 h-4"/> {user.email}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Professional Bio</label>
                    <textarea rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-medium text-zinc-600 leading-relaxed font-serif italic text-lg" placeholder="Share your expertise with fellow scholars..."/>
                  </div>

                  <div className="pt-6 border-t border-zinc-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['website', 'linkedin', 'twitter'].map((s) => (<div key={s} className="space-y-2">
                         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2 capitalize">{s}</label>
                         <input type="text" value={formData[s]} onChange={e => setFormData({ ...formData, [s]: e.target.value })} className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 font-bold text-xs" placeholder="https://..."/>
                      </div>))}
                  </div>
                </div>

                <div className="pt-8">
                   <button type="submit" disabled={loading} className="w-full md:w-auto px-10 py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-4 h-4"/> Save Metadata</>}
                   </button>
                </div>
              </motion.form>)}

            {activeTab === 'notifications' && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-3xl p-10 shadow-sm space-y-8">
                 <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Notification Channels</h2>
                 <div className="space-y-6">
                    {[
                { id: 'emailAnnouncements', l: 'Announcements', d: 'Receive important course updates via email.' },
                { id: 'emailReminders', l: 'Learning Reminders', d: 'Periodic emails to help keep your streak alive.' },
                { id: 'appNotifications', l: 'App Notifications', d: 'In-app real-time alerts for discussions and grading.' }
            ].map(n => (<div key={n.id} className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0">
                         <div className="max-w-md">
                            <p className="text-sm font-bold text-zinc-900">{n.l}</p>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">{n.d}</p>
                         </div>
                         <button onClick={() => setNotifPrefs({ ...notifPrefs, [n.id]: !notifPrefs[n.id] })} className={`w-12 h-6 rounded-full transition-colors relative ${notifPrefs[n.id] ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifPrefs[n.id] ? 'left-7' : 'left-1'}`}/>
                         </button>
                      </div>))}
                 </div>
                 <button onClick={handleSave} className="px-8 py-3 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition">Apply Changes</button>
              </motion.div>)}

            {activeTab === 'security' && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="bg-white border border-zinc-200 rounded-3xl p-10 shadow-sm">
                     <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-4">Account Persistence</h2>
                     <p className="text-sm text-zinc-500 font-medium mb-10">We suggest multi-factor authentication for high-value instructor profiles.</p>
                     
                     <div className="space-y-6">
                         <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Active Session Logs (Feature 82)</h3>
                         <div className="space-y-3">
                            {[
                { d: 'Windows Desktop', l: 'Mumbai, IN', s: 'Current Session' },
                { d: 'iPhone 15 Pro', l: 'Delhi, IN', s: '2 days ago' }
            ].map(sess => (<div key={sess.l} className="flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-xl group transition-all">
                                  <DeviceIcon className="w-5 h-5 text-zinc-300"/>
                                  <div className="flex-1">
                                     <p className="text-sm font-bold text-zinc-900">{sess.d}</p>
                                     <p className="text-[10px] text-zinc-400 font-bold uppercase">{sess.l}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-500">{sess.s}</span>
                               </div>))}
                         </div>
                     </div>
                  </div>
                  
                  <div className="bg-zinc-900 rounded-3xl p-8 text-white flex items-center justify-between gap-6">
                     <div>
                        <h4 className="text-lg font-bold">Two-Factor Authentication</h4>
                        <p className="text-xs text-zinc-400 font-medium italic">Double down on your account vault with 2FA.</p>
                     </div>
                     <button className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition group">
                        Enable 2FA
                     </button>
                  </div>
               </motion.div>)}
          </AnimatePresence>
        </div>
      </div>
    </div>);
}
