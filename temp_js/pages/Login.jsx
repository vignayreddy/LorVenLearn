import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Check if profile exists
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                console.warn('User profile missing in Firestore');
                toast.error('Account found but profile is missing. Please sign up again.');
                // Optionally sign out if profile is missing to avoid weird states
                await auth.signOut();
                return;
            }
            toast.success('Welcome back!');
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Failed to login');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Welcome Back</h1>
          <p className="text-zinc-500">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"/>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="you@example.com"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"/>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="••••••••"/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (<>
                Login
                <ArrowRight className="w-5 h-5"/>
              </>)}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-600 font-bold hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>);
}
