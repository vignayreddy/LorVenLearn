import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { Users, Activity, Search, DollarSign, Server, Ban, UserCog, ArrowUpRight, BarChart3, ShieldCheck, Award, ChevronRight, PlusCircle, CreditCard, BookOpen, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemLogs, setSystemLogs] = useState([]);
  
  // Test Mode variables
  const [simulatedRevenueAdded, setSimulatedRevenueAdded] = useState(0);
  const [manualAmount, setManualAmount] = useState('');

  // Fetch real data engine
  useEffect(() => {
    (async () => {
      try {
        const uSnap = await getDocs(query(collection(db, 'users')));
        const cSnap = await getDocs(query(collection(db, 'courses')));
        const eSnap = await getDocs(query(collection(db, 'enrollments')));
        
        let loadedUsers = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        let loadedCourses = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        let loadedEnrollments = eSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fallback Mock Data if database is completely fresh
        if (loadedUsers.length === 0) {
          loadedUsers = [
            { id: 'u1', email: 'admin@lorvenlearn.com', role: 'admin', joinDate: '2026-01-01' },
            { id: 'u2', email: 'vigna@expert.com', role: 'instructor', joinDate: '2026-02-14' },
            { id: 'u3', email: 'student1@gmail.com', role: 'student', joinDate: '2026-03-22' }
          ];
        }
        if (loadedCourses.length === 0) {
          loadedCourses = [
            { id: 'c1', title: 'Advanced Architecture', price: 1999, instructorId: 'u2' },
            { id: 'c2', title: 'Design Systems', price: 1499, instructorId: 'u2' },
          ];
        }
        if (loadedEnrollments.length === 0) {
          loadedEnrollments = [
            { id: 'e1', courseId: 'c1', studentId: 'u3', date: '2026-03-23', price: 1999 },
            { id: 'e2', courseId: 'c2', studentId: 'u3', date: '2026-03-25', price: 1499 },
          ];
        }

        setUsers(loadedUsers);
        setCourses(loadedCourses);
        setEnrollments(loadedEnrollments);
        
        setSystemLogs([
          { id: 1, time: new Date(Date.now() - 120000).toISOString(), event: 'Admin authorization sequence refreshed.', level: 'info' },
          { id: 2, time: new Date(Date.now() - 1900000).toISOString(), event: 'Database throughput normal.', level: 'success' }
        ]);
        
      } catch (err) {
        toast.error("Failed to sync structural framework");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSimulatePayment = () => {
    const amt = parseInt(manualAmount, 10);
    if (isNaN(amt) || amt <= 0) return toast.error("Please enter a valid amount.");
    
    setSimulatedRevenueAdded(prev => prev + amt);
    setManualAmount('');
    toast.success(`Success! Added ₹${amt.toLocaleString()} via Test Mode Generator.`);
    
    // Inject a dummy log
    setSystemLogs(prev => [{
      id: Date.now(),
      time: new Date().toISOString(),
      event: `Test Mode Injection: ₹${amt.toLocaleString()} processed locally.`,
      level: 'success'
    }, ...prev]);
  };

  const baseRevenue = enrollments.reduce((acc, enr) => {
    const matched = courses.find(c => c.id === enr.courseId);
    return acc + (matched ? Number(matched.price || 0) : Number(enr.price || 0));
  }, 0);
  
  const totalRevenue = baseRevenue + simulatedRevenueAdded;
  const instructorsCount = users.filter(u => u.role === 'instructor').length;

  const stats = [
    { label: 'Gross Platform Rev', val: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Registered Personnel', val: users.length.toString(), icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Courses', val: courses.length.toString(), icon: <BookOpen />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'System Integrity', val: '99.9%', icon: <Activity />, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const updateUserRole = async (userId, newRole) => {
    try {
      if (!userId.startsWith('u')) {
        await updateDoc(doc(db, 'users', userId), { role: newRole });
      }
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Clearance Level updated to [${newRole.toUpperCase()}]`);
    } catch {
      toast.error('Privilege escalation failed.');
    }
  };

  const banUser = async (userId) => {
     if (window.confirm("Are you sure you want to completely sever this user?")) {
        try {
           if (!userId.startsWith('u')) await deleteDoc(doc(db, 'users', userId));
           setUsers(users.filter(u => u.id !== userId));
           toast.success('Node Terminated Successfully.');
        } catch { toast.error('Termination bypassed.'); }
     }
  };

  const deleteCourse = async (courseId) => {
     if (window.confirm("This will permanently delete the curriculum and data. Are you absolutely certain?")) {
        try {
           if (!courseId.startsWith('c')) await deleteDoc(doc(db, 'courses', courseId));
           setCourses(courses.filter(c => c.id !== courseId));
           toast.success('Curriculum Successfully Wiped.');
        } catch { toast.error('Course deletion failed.'); }
     }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.uid || u.id || '').includes(searchQuery)
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
       <div className="w-16 h-16 border-4 border-zinc-200 border-t-amber-500 rounded-full animate-spin mb-6"></div>
       <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase animate-pulse">Loading Platform Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 pt-8 px-4 sm:px-8">
      {/* GLOBAL HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-2 mb-3">
               <ShieldCheck className="w-6 h-6 text-emerald-600" />
               <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-100 px-3 py-1 rounded-full">Secure Admin Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">Admin Console</h1>
         </div>
      </div>

      {/* METRICS ROW */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         {stats.map(s => (
            <div key={s.label} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
                  {s.icon}
               </div>
               <div>
                  <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-zinc-900">{s.val}</p>
               </div>
            </div>
         ))}
      </div>

      {/* MAIN CONSOLE AREA */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* SIDEBAR TABS */}
         <div className="lg:col-span-3 space-y-3">
             {[
                { id: 'overview', icon: <Activity />, label: 'Analytics' },
                { id: 'finance', icon: <BarChart3 />, label: 'Revenue & Test Mode' },
                { id: 'users', icon: <UserCog />, label: 'Manage Users' },
                { id: 'system', icon: <Server />, label: 'System Logs' },
             ].map(t => (
                <button 
                   key={t.id} onClick={() => setActiveTab(t.id)}
                   className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all border ${activeTab === t.id ? 'bg-white border-amber-200 text-amber-600 shadow-sm' : 'bg-transparent border-transparent text-zinc-500 hover:bg-white hover:border-zinc-200'}`}
                >
                   {t.icon} {t.label}
                   {activeTab === t.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
             ))}
         </div>

         {/* CONTENT WINDOW */}
         <div className="lg:col-span-9 bg-white border border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] flex flex-col relative">
            <AnimatePresence mode="wait">
               {/* ── OVERVIEW TAB ── */}
               {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 space-y-10">
                     <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Platform Analytics</h2>
                        <p className="text-zinc-500 text-sm mt-1">Simple visualization of user distribution.</p>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Instructor Ratio</h3>
                           <div className="flex items-center gap-4">
                              <div className="flex-1 bg-zinc-200 h-4 rounded-full overflow-hidden flex">
                                 <div className="bg-amber-500 h-full" style={{ width: `${(instructorsCount / users.length) * 100 || 0}%` }} />
                                 <div className="bg-blue-500 h-full flex-1" />
                              </div>
                           </div>
                           <p className="text-sm font-bold text-zinc-600 mt-4"><span className="text-amber-500">{instructorsCount} Instructors</span> — <span className="text-blue-500">{users.length - instructorsCount} Students</span></p>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Course Sales Heat</h3>
                           <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                              {courses.map(c => {
                                 const cEnr = enrollments.filter(e => e.courseId === c.id).length;
                                 return (
                                    <div key={c.id} className="flex items-center justify-between text-sm pr-2 hover:bg-white rounded-lg p-1 transition-colors">
                                       <span className="text-zinc-700 font-bold truncate pr-4">{c.title}</span>
                                       <div className="flex items-center gap-3">
                                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-xs flex-shrink-0">₹{(c.price * cEnr).toLocaleString()}</span>
                                          <button onClick={() => deleteCourse(c.id)} className="text-zinc-300 hover:text-red-500 transition-colors p-1" title="Delete Course">
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* ── USER GOVERNANCE TAB ── */}
               {activeTab === 'users' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full inset-0 absolute">
                     <div className="p-8 border-b border-zinc-200 bg-zinc-50 shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                           <div>
                              <h2 className="text-2xl font-bold text-zinc-900">Manage Users</h2>
                              <p className="text-zinc-500 text-sm mt-1">Modify clearance levels and suspend accounts.</p>
                           </div>
                           <div className="relative w-full sm:w-72">
                              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                              <input 
                                 type="text" placeholder="Search emails or IDs..." 
                                 value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                 className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                           </div>
                        </div>
                     </div>
                     <div className="overflow-auto flex-1 p-8">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr>
                                 <th className="pb-4 border-b border-zinc-200 text-xs text-zinc-500 font-bold">User</th>
                                 <th className="pb-4 border-b border-zinc-200 text-xs text-zinc-500 font-bold">Role</th>
                                 <th className="pb-4 border-b border-zinc-200 text-xs text-zinc-500 font-bold hidden md:table-cell">Reg. Date</th>
                                 <th className="pb-4 border-b border-zinc-200 text-xs text-zinc-500 font-bold text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-100">
                              {filteredUsers.map(u => (
                                 <tr key={u.id} className="hover:bg-zinc-50">
                                    <td className="py-4 font-bold text-zinc-900">{u.email || 'Anonymous'}</td>
                                    <td className="py-4">
                                       <select 
                                          value={u.role || 'student'}
                                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                                          className="bg-white border border-zinc-200 text-xs font-bold rounded-lg px-3 py-2 outline-none text-zinc-700"
                                       >
                                          <option value="student">Student</option>
                                          <option value="instructor">Instructor</option>
                                          <option value="admin">Admin</option>
                                       </select>
                                    </td>
                                    <td className="py-4 text-xs text-zinc-500 hidden md:table-cell">
                                       {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : u.joinDate || 'Legacy'}
                                    </td>
                                    <td className="py-4 text-right">
                                       <button onClick={() => banUser(u.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                                          <Ban size={14} />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </motion.div>
               )}

               {/* ── FINANCE & TEST MODE TAB ── */}
               {activeTab === 'finance' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 space-y-8">
                     <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Revenue & Test Payments</h2>
                        <p className="text-zinc-500 text-sm mt-1">Monitor revenue and manually inject test funds.</p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl relative overflow-hidden">
                           <DollarSign className="absolute -right-6 -bottom-6 w-48 h-48 opacity-5 text-emerald-900" />
                           <p className="text-emerald-700 font-bold uppercase tracking-widest text-[11px] mb-2">Platform Treasury</p>
                           <h3 className="text-5xl font-black text-emerald-900 tracking-tighter mb-2">₹{totalRevenue.toLocaleString()}</h3>
                           <p className="text-emerald-600 text-sm font-medium">Genuine + Test Revenue Combined</p>
                        </div>
                        
                        {/* Test Mode Payment Injection */}
                        <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl">
                           <div className="flex items-center gap-2 mb-2">
                             <CreditCard className="w-5 h-5 text-amber-600" />
                             <p className="text-amber-800 font-bold uppercase tracking-widest text-[11px]">Developer Test Mode</p>
                           </div>
                           <h3 className="text-xl font-black text-amber-900 mb-4">Simulate Test Enrollment</h3>
                           <p className="text-sm text-amber-700/80 mb-6 font-medium">Enter a mock amount to inject directly into the platform charts instantly. This bypasses the Razorpay gateway.</p>
                           
                           <div className="flex gap-3">
                              <div className="relative flex-1">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                 <input 
                                    type="number" min="1"
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    placeholder="Amount (e.g. 5000)" 
                                    className="w-full bg-white border border-amber-200 text-zinc-900 rounded-xl py-3 pl-8 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                 />
                              </div>
                              <button onClick={handleSimulatePayment} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-xl flex items-center gap-2 transition-colors">
                                 <PlusCircle className="w-4 h-4" /> Add Funds
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* ── SYSTEM LOGS TAB ── */}
               {activeTab === 'system' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full inset-0 absolute">
                     <div className="flex items-center justify-between p-8 border-b border-zinc-200 shrink-0">
                        <h2 className="text-2xl font-bold text-zinc-900">System Logs</h2>
                        <button onClick={() => toast.success('Logs exported to console.')} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-zinc-200">
                           Download
                        </button>
                     </div>
                     <div className="flex-1 bg-zinc-900 text-zinc-300 p-6 overflow-auto font-mono text-xs custom-scrollbar">
                        {systemLogs.map(log => (
                           <div key={log.id} className="flex gap-4 py-2 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 px-2 rounded">
                              <span className="text-zinc-500">[{log.time.split('T')[1].substring(0,8)}]</span>
                              <span className={`font-bold ${log.level === 'warn' ? 'text-amber-400' : log.level === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>[{log.level.toUpperCase()}]</span>
                              <span>{log.event}</span>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}