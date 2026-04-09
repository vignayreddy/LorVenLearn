import { useState } from 'react';
import { MessageSquare, Send, Heart, Reply, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export default function DiscussionBoard({
  discussions,
  onSendMessage,
  onDeleteMessage,
  currentUser
}) {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  return <div className="space-y-8">
      {/* Input Box */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold flex-shrink-0">
          {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
        </div>
        <div className="flex-1 relative">
          <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} className="w-full h-24 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none" placeholder="What are your thoughts on this lesson? Ask a question or share insights..." />
          <div className="absolute right-3 bottom-3">
            <button onClick={handleSend} disabled={!newMessage.trim()} className="bg-zinc-900 hover:bg-orange-600 active:scale-95 text-white p-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 text-xs font-bold">
              <Send className="w-4 h-4" /> Post
            </button>
          </div>
        </div>
      </div>

      {/* Threads */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-600" /> Community Threads ({discussions.length})
        </h3>
        
        {discussions.length === 0 && <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
             <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
             <p className="text-zinc-500 font-bold text-sm">Be the first to start a discussion!</p>
          </div>}

        {discussions.map((d, index) => <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.05
      }} key={d.id} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 group hover:border-zinc-200 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold flex-shrink-0">
                {d.userName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-sm">{d.userName}</span>
                    {d.uid === currentUser.uid && <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">You</span>}
                    <span className="text-[10px] text-zinc-400 font-mono">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     {d.uid === currentUser.uid && onDeleteMessage && (
                       <button onClick={() => onDeleteMessage(d.id)} className="text-zinc-300 hover:text-red-500 transition-colors" title="Delete Post">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                     <button className="text-zinc-300 hover:text-zinc-600">
                        <MoreHorizontal className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                
                <p className="text-zinc-700 text-sm leading-relaxed mb-4">{d.message}</p>
                
                <div className="flex items-center gap-4 border-t border-zinc-200/50 pt-3">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-500 transition-colors">
                     <Heart className="w-4 h-4" /> 24
                  </button>
                  <button onClick={() => setReplyingTo(replyingTo === d.id ? null : d.id)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors">
                     <Reply className="w-4 h-4" /> Reply
                  </button>
                </div>

                {/* Simulated Replies Block */}
                <AnimatePresence>
                  {replyingTo === d.id && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} className="mt-4 overflow-hidden pl-4 border-l-2 border-indigo-100">
                      <div className="flex gap-3">
                         <input autoFocus className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" placeholder="Write a reply..." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} />
                         <button onClick={() => {
                    setReplyingTo(null);
                    setReplyMessage('');
                  }} className="bg-indigo-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-indigo-700">
                           Post
                         </button>
                      </div>
                    </motion.div>}
                </AnimatePresence>

              </div>
            </div>
          </motion.div>)}
      </div>
    </div>;
}