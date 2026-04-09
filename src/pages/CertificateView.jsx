import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Award, Download, Share2, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export default function CertificateView() {
  const {
    certId
  } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);
  useEffect(() => {
    (async () => {
      if (!certId) return;
      try {
        const snap = await getDoc(doc(db, 'certificates', certId));
        if (snap.exists()) {
          setCert(snap.data());
        } else {
          toast.error('Certificate not found');
          navigate('/dashboard');
        }
      } catch (e) {
        console.error(e);
        toast.error('Error loading certificate');
      } finally {
        setLoading(false);
      }
    })();
  }, [certId, navigate]);
  const handlePrint = () => {
    window.print();
  };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };
  if (loading) return <div className="flex items-center justify-center py-32">
      <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
    </div>;
  if (!cert) return null;
  const dateStr = new Date(cert.issueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition shadow-lg">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Certificate UI */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white border-[12px] border-zinc-900 p-1 rounded-sm shadow-2xl relative overflow-hidden print:shadow-none print:border-[8px]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="border-[2px] border-zinc-200 p-16 flex flex-col items-center text-center relative print:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-12">
            <Award className="w-12 h-12 text-orange-600" />
            <span className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Lorven Learn</span>
          </div>

          <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-4 italic tracking-tight print:text-4xl">Certificate of Appreciation</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] mb-12">This is proudly presented to</p>

          <div className="mb-12">
            <h2 className="text-6xl font-serif font-black text-orange-600 mb-2 border-b-4 border-zinc-900 inline-block px-8 print:text-5xl">
              {cert.studentName}
            </h2>
          </div>

          <p className="text-zinc-600 text-lg max-w-xl mx-auto leading-relaxed mb-4">
            For successfully completing the comprehensive professional training course 
            <span className="block text-zinc-900 font-extrabold text-2xl mt-2 italic">"{cert.courseTitle}"</span>
          </p>

          <p className="text-zinc-500 mb-16">issued on {dateStr}</p>

          {/* Signatures */}
          <div className="flex justify-between w-full max-w-2xl mt-8">
            <div className="flex flex-col items-center">
              <div className="w-48 h-px bg-zinc-300 mb-2" />
              <p className="font-serif italic text-zinc-900 text-lg">Dr. Elena Vance</p>
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest">Head of Content</p>
            </div>
            
            <div className="relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-orange-600/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-orange-600" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-48 h-px bg-zinc-300 mb-2" />
              <p className="font-serif italic text-zinc-900 text-lg">Priya Sharma</p>
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest">Master Instructor</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              VERIFIED CERTIFICATE: {cert.id}
            </div>
            <div>VERIFY AT: LORVENLEARN.COM/VERIFY</div>
          </div>
        </div>
      </motion.div>

      {/* Info card no-print */}
      <div className="mt-8 bg-orange-50 border border-orange-100 rounded-2xl p-6 no-print">
        <div className="flex items-start gap-4">
          <div className="bg-orange-100 p-2 rounded-xl">
            <Award className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Official Certification</h3>
            <p className="text-sm text-zinc-600 mt-1">
              This certificate is an official recognition of your skill and dedication. 
              You can share the verification ID <span className="font-mono bg-zinc-100 px-1 rounded">{cert.id}</span> 
              on your LinkedIn profile or resume.
            </p>
          </div>
        </div>
      </div>
    </div>;
}