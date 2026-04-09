import { Code, Flame, Zap, Trophy, Timer, ChevronRight, CheckCircle, Lock, Play, Share2, MessageSquare, Save } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProblemOfTheDay() {
  const [activeLang, setActiveLang] = useState('JavaScript');
  const [code, setCode] = useState(`// Problem: Two Sum\n// Time: O(n), Space: O(n)\n\nfunction solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runCode = () => {
    setRunning(true);
    setTimeout(() => {
      setResults({ status: 'Accepted', time: '12ms', memory: '4.2MB', passed: 4, total: 4 });
      setRunning(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Problem Statement */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-600">
                  <Flame className="w-6 h-6" />
               </div>
               <div>
                  <h1 className="text-xl font-black text-zinc-900 tracking-tight">Today's Protocol</h1>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">April 03, 2026</p>
               </div>
            </div>

            <div className="space-y-4">
               <h2 className="text-2xl font-black text-zinc-900">1. Two Sum Array</h2>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg border border-green-100">Easy</span>
                  <span className="px-3 py-1 bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase rounded-lg border border-zinc-100">+200 XP</span>
               </div>
               <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
                  <br /><br />
                  You may assume that each input would have exactly one solution, and you may not use the same element twice.
               </p>
               
               <div className="bg-zinc-50 p-4 rounded-2xl space-y-3">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Input Example</p>
                  <code className="text-xs font-bold text-zinc-700 block">nums = [2, 7, 11, 15], target = 9</code>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pt-2">Output Example</p>
                  <code className="text-xs font-bold text-orange-600 block">[0, 1]</code>
               </div>

               <div className="pt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900 text-white rounded-2xl text-center">
                     <p className="text-xl font-black">45%</p>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase">Success Rate</p>
                  </div>
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-center">
                     <p className="text-xl font-black text-zinc-900">1.2K</p>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase">Solvers</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden group">
             <Trophy className="absolute bottom-4 right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-700" />
             <h4 className="text-lg font-black mb-2">Global Leaderboard</h4>
             <p className="text-xs text-zinc-400 font-medium mb-6">Top tech architects of today.</p>
             <div className="space-y-4">
                {['John Doe', 'Alice Cooper', 'Steve Jobs II'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-zinc-600">{i+1}</span>
                     <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">{name[0]}</div>
                     <span className="text-xs font-bold flex-1">{name}</span>
                     <span className="text-[10px] font-black text-orange-500">12ms</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Code Editor Simulation */}
        <div className="lg:w-2/3 space-y-6">
           <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[700px]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                 <div className="flex gap-2">
                    {['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'].map(lang => (
                      <button 
                        key={lang} 
                        onClick={() => setActiveLang(lang)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeLang === lang ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                      >
                        {lang}
                      </button>
                    ))}
                 </div>
                 <div className="flex gap-3">
                    <button className="p-3 text-zinc-500 hover:text-white transition-colors"><Save className="w-4 h-4" /></button>
                    <button className="p-3 text-zinc-500 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                 </div>
              </div>

              <div className="flex-1 p-8 font-mono text-sm overflow-y-auto custom-scrollbar">
                 <textarea 
                   value={code} 
                   onChange={(e) => setCode(e.target.value)}
                   className="w-full h-full bg-transparent text-emerald-400 focus:outline-none resize-none leading-relaxed"
                   spellCheck="false"
                 />
              </div>

              <div className="p-8 bg-zinc-900/50 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <AnimatePresence>
                       {results && (
                         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                               <CheckCircle className="w-5 h-5 text-green-500" />
                               <span className="text-xl font-black text-white uppercase tracking-tighter">{results.status}</span>
                            </div>
                            <div className="flex items-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                               <p>Latency: <span className="text-white">{results.time}</span></p>
                               <p>Efficiency: <span className="text-white">99%</span></p>
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                    {!results && <p className="text-xs font-bold text-zinc-600 italic">No execution logs available yet.</p>}
                 </div>
                 <button 
                   onClick={runCode}
                   disabled={running}
                   className="w-full md:w-auto px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-950/20 flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {running ? <Zap className="w-5 h-5 animate-pulse" /> : <><Play className="w-5 h-5" /> Execute Solution</>}
                 </button>
              </div>
           </div>

           <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                    <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-zinc-900 tracking-tight">Discussion Hub</h5>
                    <p className="text-xs text-zinc-500 font-medium">142 scholars are debating this solution.</p>
                 </div>
              </div>
              <button className="px-6 py-3 bg-zinc-50 text-zinc-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition group flex items-center gap-2">
                 Join Debate <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
