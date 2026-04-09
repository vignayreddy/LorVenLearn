import { useState } from 'react';
import { ShieldAlert, Users, TrendingUp, Activity, Search, AlertOctagon, CheckCircle2, XCircle, DollarSign, Database, Server, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('radar');
    const stats = [
        { l: 'Total Scholars', v: '14,204', i: <Users />, c: 'blue' },
        { l: 'MRR (Approx)', v: '₹4.2M', i: <TrendingUp />, c: 'emerald' },
        { l: 'Flagged Content', v: '23', i: <ShieldAlert />, c: 'red' },
        { l: 'System Health', v: '99.9%', i: <Activity />, c: 'orange' },
    ];
    return (<div className="max-w-7xl mx-auto px-4 pb-20 space-y-8">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Server className="w-48 h-48 -rotate-12"/>
        </div>
        <div className="relative z-10">
           <h1 className="text-3xl tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
             LorvenLearn Command Center
           </h1>
           <p className="text-zinc-400 font-medium max-w-xl">
             You have full override access. Manage global operations, review flagged components, and monitor system-wide structural integrity.
           </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 relative z-10">
           {stats.map(s => (<div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-${s.c}-400 bg-${s.c}-400/10`}>
                   {s.i}
                </div>
                <h3 className="text-2xl tracking-tighter mb-1">{s.v}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.l}</p>
             </div>))}
        </div>
      </div>

      {/* Control Tabs */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
         <div className="flex bg-zinc-50 border-b border-zinc-100 overflow-x-auto">
           {[
            { id: 'radar', icon: <ShieldAlert />, label: 'Global Radar (100+)' },
            { id: 'finance', icon: <DollarSign />, label: 'Financial Command (100+)' },
            { id: 'users', icon: <Users />, label: 'User Governance (50+)' },
            { id: 'health', icon: <Database />, label: 'System Health (50+)' }
        ].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-8 py-5 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === t.id ? 'text-zinc-900 border-b-2 border-zinc-900 bg-white' : 'text-zinc-400 hover:text-zinc-600'}`}>
               <span className="w-4 h-4">{t.icon}</span> {t.label}
             </button>))}
         </div>

         <div className="p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
               {activeTab === 'radar' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h2 className="text-xl">Content Moderation Queue</h2>
                       <button className="text-xs font-bold bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg hover:bg-zinc-200">Auto-Approve Low Risk</button>
                    </div>
                    <div className="space-y-4">
                       {[1, 2, 3].map(i => (<div key={i} className="flex items-center justify-between bg-zinc-50 p-4 border border-zinc-200 rounded-xl">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                 <AlertOctagon className="w-5 h-5"/>
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-zinc-900">Flagged Review #{8492 + i}</p>
                                  <p className="text-xs text-zinc-500 font-medium">Flagged by AI automated safety filter for inappropriate language.</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button className="p-2 border border-green-200 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><CheckCircle2 className="w-5 h-5"/></button>
                               <button className="p-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><XCircle className="w-5 h-5"/></button>
                            </div>
                         </div>))}
                    </div>
                 </motion.div>)}

               {activeTab === 'finance' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex justify-between items-center">
                       <div>
                         <p className="text-emerald-800 font-bold mb-1">Pending Instructor Payouts</p>
                         <p className="text-2xl font-black text-emerald-900 tracking-tighter">₹1,245,000</p>
                       </div>
                       <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-700">Process All (142)</button>
                    </div>
                 </motion.div>)}

               {activeTab === 'users' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"/>
                       <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Search by email, UID, or exact username..."/>
                    </div>
                    <div className="text-center py-20 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl">Search for a user to expose 50+ management hooks.</div>
                 </motion.div>)}

               {activeTab === 'health' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 text-white p-6 rounded-2xl font-mono text-xs">
                       <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                          <span className="text-orange-400 font-bold">API Latency Trace</span>
                          <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Live</span>
                       </div>
                       <div className="space-y-2 text-green-400">
                          <p>[2026-04-03 08:34] GET /api/courses - 42ms</p>
                          <p>[2026-04-03 08:34] POST /api/progress - 110ms</p>
                          <p>[2026-04-03 08:35] GET /api/auth/verify - 12ms</p>
                       </div>
                    </div>
                 </motion.div>)}
            </AnimatePresence>
         </div>
      </div>
    </div>);
}
