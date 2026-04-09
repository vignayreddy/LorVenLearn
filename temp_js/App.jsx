import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import CreateCourse from './pages/CreateCourse';
import CertificateView from './pages/CertificateView';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // MOCK AUTHENTICATION FOR DEMO
        setUser({
            uid: 'demo-123',
            email: 'demo@lorvenlearn.com',
            role: 'student',
            displayName: 'Demo Scholar',
            createdAt: new Date().toISOString(),
            totalXP: 4500,
            level: 5,
            badges: ['Early Adopter', 'Fast Learner', 'Top Contributor'],
            streak: { currentStreak: 7, longestStreak: 12, lastActivityDate: new Date().toISOString() }
        });
        setLoading(false);
    }, []);
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>);
    }
    return (<Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-orange-100 selection:text-orange-900">
        <Navbar user={user}/>
        
        {/* Role Switcher FOR DEMO */}
        {user && (<div className="fixed bottom-4 left-4 z-50 bg-white p-2 rounded-xl shadow-2xl border border-zinc-200 text-xs font-bold flex flex-col gap-2">
              <span className="text-zinc-500 text-[10px] uppercase text-center">Simulate Role</span>
              <div className="flex gap-1">
                 {['student', 'instructor', 'admin'].map(r => (<button key={r} onClick={() => setUser({ ...user, role: r })} className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${user.role === r ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                     {r}
                   </button>))}
              </div>
           </div>)}

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard"/>}/>
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard"/>}/>
            <Route path="/dashboard" element={user ? <Dashboard user={user}/> : <Navigate to="/login"/>}/>
            <Route path="/courses/:courseId" element={user ? <CourseDetails user={user}/> : <Navigate to="/login"/>}/>
            <Route path="/certificates/:certId" element={user ? <CertificateView /> : <Navigate to="/login"/>}/>
            <Route path="/settings" element={user ? <ProfileSettings user={user}/> : <Navigate to="/login"/>}/>
            <Route path="/create-course" element={user?.role === 'instructor' ? <CreateCourse user={user}/> : <Navigate to="/dashboard"/>}/>
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/"/>}/>
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
        </main>
        <Toaster position="top-right" richColors closeButton/>
      </div>
    </Router>);
}
