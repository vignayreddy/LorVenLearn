import { Star, ThumbsUp, Medal, ShieldCheck } from 'lucide-react';
export default function ReviewSection() {
    const avgRating = 4.8;
    const totalReviews = 1420;
    const distributions = [
        { stars: 5, pct: 85 },
        { stars: 4, pct: 10 },
        { stars: 3, pct: 3 },
        { stars: 2, pct: 1 },
        { stars: 1, pct: 1 },
    ];
    return (<div className="space-y-12">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row gap-12 items-center justify-center p-8 bg-zinc-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 p-8 opacity-5"><Medal className="w-32 h-32"/></div>
         
         <div className="text-center relative z-10 flex flex-col items-center">
            <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">{avgRating}</h3>
            <div className="flex justify-center gap-1 mb-2">
               {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400"/>)}
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Course Rating</p>
         </div>

         <div className="w-full max-w-sm relative z-10 space-y-2">
           {distributions.map(d => (<div key={d.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 text-xs font-bold text-zinc-300">
                  {d.stars} <Star className="w-3 h-3 text-zinc-500"/>
                </div>
                <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.pct}%` }}/>
                </div>
                <div className="w-10 text-right text-[10px] font-mono text-zinc-500">{d.pct}%</div>
             </div>))}
         </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          Featured Reviews <ShieldCheck className="w-5 h-5 text-green-500"/>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[
            { name: "Rahul Sharma", role: "Software Engineer", r: 5, date: "2 days ago", txt: "This curriculum is insanely good. The way it breaks down complex architectural patterns into bite-sized mental models completely changed how I build systems." },
            { name: "Priya Patel", role: "Frontend Lead", r: 5, date: "1 week ago", txt: "Worth every penny. The project-based approach ensures you aren't just stuck in tutorial hell. Highly recommend to any dev looking to level up." },
            { name: "Arjun K.", role: "Student", r: 4, date: "3 weeks ago", txt: "Extremely in-depth. Sometimes the pace is a bit fast, but pausing to re-watch the tricky parts resolves that. The Q&A community is also super helpful." },
            { name: "DevOps Mike", role: "SysAdmin", r: 5, date: "1 month ago", txt: "I use these patterns in production now. The instructor knows exactly what industry standards are currently." }
        ].map((rev, idx) => (<div key={idx} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {rev.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{rev.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{rev.role}</p>
                      </div>
                   </div>
                   <div className="text-[10px] font-mono text-zinc-400">{rev.date}</div>
                </div>
                <div className="flex gap-1 mb-3">
                   {[...Array(rev.r)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>)}
                   {[...Array(5 - rev.r)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-zinc-300"/>)}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium mb-4">{rev.txt}</p>
                <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                   <ThumbsUp className="w-4 h-4"/> Helpful
                </button>
             </div>))}
        </div>
      </div>
    </div>);
}
