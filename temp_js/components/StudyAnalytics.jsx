import { BarChart3, TrendingUp, Filter, Calendar } from 'lucide-react';
export default function StudyAnalytics() {
    // Mock data for weekly study hours
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = [2.5, 3.8, 1.2, 5.0, 4.2, 8.5, 6.0];
    const maxHours = Math.max(...hours);
    return (<div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-start mb-8 border-b border-zinc-100 pb-6">
        <div>
           <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-1">
             <BarChart3 className="w-5 h-5 text-orange-600"/> Learning Analytics
           </h3>
           <p className="text-sm text-zinc-500 font-medium">Your cognitive engagement over the last 7 days.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors">
           <Filter className="w-3.5 h-3.5"/> This Week
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <div className="space-y-6 md:border-r border-zinc-100 pr-6">
            <div>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Time</p>
               <p className="text-4xl font-black text-zinc-900 tracking-tight">31.2<span className="text-lg text-zinc-400">h</span></p>
               <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-md">
                 <TrendingUp className="w-3.5 h-3.5"/> +15% vs Last Wk
               </div>
            </div>
            <div className="pt-6 border-t border-zinc-100">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Best Day</p>
               <p className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-orange-500"/> Saturday
               </p>
            </div>
         </div>

         <div className="md:col-span-3 flex items-end justify-between h-48 gap-2">
            {hours.map((h, i) => {
            const heightPct = (h / maxHours) * 100;
            const isToday = i === 4; // Mock Friday as today
            return (<div key={days[i]} className="flex-1 flex flex-col items-center gap-3 relative group">
                   {/* Tooltip */}
                   <div className="absolute -top-10 bg-zinc-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                      {h} hrs
                   </div>
                   
                   {/* Bar */}
                   <div className="w-full flex justify-center h-full items-end">
                      <div className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out 
                        ${isToday ? 'bg-gradient-to-t from-orange-400 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-zinc-100 group-hover:bg-zinc-200'}`} style={{ height: `${heightPct}%` }}/>
                   </div>
                   
                   {/* Label */}
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-orange-600' : 'text-zinc-400'}`}>
                     {days[i]}
                   </span>
                </div>);
        })}
         </div>
      </div>
    </div>);
}
