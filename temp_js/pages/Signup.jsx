import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'sonner';
import { User, Mail, Lock, ArrowRight, Loader2, GraduationCap, Briefcase } from 'lucide-react';
export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: name,
                    role: role,
                    createdAt: new Date().toISOString()
                });
            }
            catch (firestoreError) {
                console.error('Firestore Error:', firestoreError);
            }
            toast.success('Account created successfully!');
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Signup error:', error);
            toast.error(error.message || 'Failed to sign up');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create Account</h1>
          <p className="text-zinc-500">Join Lorven Learn and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setRole('student')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'student'
            ? 'border-zinc-900 bg-zinc-50 text-zinc-900'
            : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'}`}>
              <GraduationCap className="w-6 h-6"/>
              <span className="font-bold text-sm">Student</span>
            </button>
            <button type="button" onClick={() => setRole('instructor')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'instructor'
            ? 'border-zinc-900 bg-zinc-50 text-zinc-900'
            : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'}`}>
              <Briefcase className="w-6 h-6"/>
              <span className="font-bold text-sm">Instructor</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"/>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="John Doe"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"/>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="you@example.com"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"/>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="••••••••"/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (<>
                Create Account
                <ArrowRight className="w-5 h-5"/>
              </>)}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>);
}
