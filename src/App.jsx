import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Performance Optimization: Lazy Load all routing components to achieve Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const CreateCourse = lazy(() => import('./pages/CreateCourse'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Contact = lazy(() => import('./pages/Contact'));
const Chatbot = lazy(() => import('./components/Chatbot'));

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: authUser.uid, email: authUser.email, ...userDoc.data() });
          } else {
            setUser({ uid: authUser.uid, email: authUser.email, role: 'student' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({ uid: authUser.uid, email: authUser.email, role: 'student' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-orange-100 selection:text-orange-900">
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={
            <div className="h-96 w-full flex items-center justify-center text-orange-500 font-bold tracking-widest text-xs uppercase animate-pulse">
              Initializing Core Architecture...
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <ProfileSettings user={user} /> : <Navigate to="/login" />} />
              <Route path="/course/:courseId" element={<CourseDetails user={user} />} />
              <Route path="/course/:courseId/certificate" element={user ? <CertificateView user={user} /> : <Navigate to="/login" />} />
              <Route path="/create-course" element={user?.role === 'instructor' ? <CreateCourse user={user} /> : <Navigate to="/dashboard" />} />
              <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
          <Chatbot />
        </main>

        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </Router>
  );
}