import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, BookOpen } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.warn('User profile missing in Firestore');
        toast.error('Account found but profile is missing. Please sign up again.');
        await auth.signOut();
        return;
      }
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] mx-auto z-10">
        <div className="premium-card p-10 bg-white/70 backdrop-blur-3xl shadow-[var(--shadow-premium)] relative">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-[14px] text-zinc-500 font-medium">Log in to resume your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all text-sm font-medium" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-bold text-zinc-900 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-[12px] font-bold text-amber-600 hover:text-amber-700 transition">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all text-sm font-medium" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                  Log In Securely
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
            <p className="text-zinc-500 text-[13px] font-medium">
              New to LorvenLearn?{' '}
              <Link to="/signup" className="text-amber-600 font-bold hover:text-amber-700 underline underline-offset-4 decoration-amber-200 hover:decoration-amber-500 transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}