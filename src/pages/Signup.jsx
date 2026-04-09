import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'sonner';
import { User, Mail, Lock, ArrowRight, Loader2, GraduationCap, Briefcase, BookOpen } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: role,
          createdAt: new Date().toISOString(),
          isVerified: false 
        });
      } catch (firestoreError) {
        console.error('Firestore Error:', firestoreError);
      }
      
      toast.success('Account created! Verification link sent. Please verify your email.');
      navigate('/login'); 
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Try logging in.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error(error.message.replace('Firebase:', '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] mx-auto z-10">
        <div className="premium-card p-10 bg-white/70 backdrop-blur-3xl shadow-[var(--shadow-premium)] relative">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-zinc-900 mb-2 tracking-tight">Create Account</h1>
            <p className="text-[14px] text-zinc-500 font-medium">Join LorvenLearn and accelerate your career</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-3 text-center">I am here to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setRole('student')} 
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${role === 'student' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/20' : 'border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50'}`}
                >
                  <GraduationCap className="w-6 h-6" />
                  <span className="font-bold text-[13px]">Learn</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole('instructor')} 
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${role === 'instructor' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/20' : 'border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50'}`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="font-bold text-[13px]">Teach</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-sm" 
                  placeholder="Arjun Rai" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-sm" 
                  placeholder="you@email.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                  Join LorvenLearn Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
            <p className="text-[13px] text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-zinc-900 font-bold hover:text-amber-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-amber-500 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}