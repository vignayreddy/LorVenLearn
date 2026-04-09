import { Shield, Star, Zap, Award, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
export default function GamificationWidget({ user }) {
    const xp = user.totalXP || 0;
    const level = user.level || Math.floor(xp / 1000) + 1;
    const nextLevelXP = level * 1000;
    const progress = (xp % 1000) / 1000;
    const badges = user.badges || ['First Login', 'Early Adopter', 'Fast Learner'];
    return (<div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 shadow-xl text-white overflow-hidden relative group hover-lift">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <Crown className="w-48 h-48 -rotate-12"/>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400"/> Current Level
            </h3>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              Level {level}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Shield className="w-8 h-8 text-amber-400"/>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold font-mono">
            <span>{xp} XP</span>
            <span className="text-zinc-400">{nextLevelXP} XP</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-orange-500 to-amber-400 relative">
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Recent Badges</h4>
          <div className="flex gap-3">
            {badges.map((badge, idx) => (<div key={badge} className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 tooltip relative group/badge">
                {idx === 0 ? <Zap className="w-5 h-5 text-yellow-400"/> :
                idx === 1 ? <Award className="w-5 h-5 text-indigo-400"/> :
                    <Star className="w-5 h-5 text-emerald-400"/>}
                <div className="absolute -bottom-8 whitespace-nowrap bg-zinc-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition shadow-xl pointer-events-none">
                  {badge}
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
