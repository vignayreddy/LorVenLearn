import { Mail, Phone, MapPin, Send, MessageSquare, LifeBuoy, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
   const [submitted, setSubmitted] = useState(false);

   return (
      <div className="max-w-7xl mx-auto py-12 px-6">
         <div className="text-center mb-20 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
               Global Support Hub
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">How can we help you <span className="text-orange-600">prosper?</span></h1>
            <p className="text-zinc-500 max-w-2xl mx-auto font-medium">Our architects are standing by to assist with your technical inquiries, enrollment questions, and platform support.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact info cards */}
            <div className="space-y-6">
               {[{
                  icon: <Mail className="w-6 h-6" />,
                  title: 'Email Support',
                  detail: 'lorvenlearn@support.com',
                  sub: '24/7 Response Time'
               }, {
                  icon: <Phone className="w-6 h-6" />,
                  title: 'Global Hotline',
                  detail: '6303789759',
                  sub: 'Mon-Fri, 9am - 6pm IST'
               }, {
                  icon: <MapPin className="w-6 h-6" />,
                  title: 'Corporate HQ',
                  detail: 'CVR College Of Engineering',
                  sub: 'Hyderabad, Telangana'
               }].map((card, i) => (
                  <motion.div key={card.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm group hover:border-zinc-900 transition-all">
                     <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        {card.icon}
                     </div>
                     <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-2">{card.title}</h3>
                     <p className="text-lg font-bold text-zinc-900 mb-1">{card.detail}</p>
                     <p className="text-xs text-zinc-400 font-medium">{card.sub}</p>
                  </motion.div>
               ))}
            </div>

            {/* Form area */}
            <div className="lg:col-span-2">
               <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 md:p-16 shadow-xl shadow-zinc-200/50">
                  {submitted ? (
                     <div className="text-center py-20 animate-fade-in">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                           <Send className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900 mb-4">Transmission Successful</h2>
                        <p className="text-zinc-500 font-medium">Your inquiry has been encrypted and sent to our leads. <br />We will react within 4-6 business hours.</p>
                     </div>
                  ) : (
                     <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Display Name</label>
                              <input type="text" required className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:border-zinc-900 font-bold transition-all" placeholder="Enter name" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Email Address</label>
                              <input type="email" required className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:border-zinc-900 font-bold transition-all" placeholder="Enter email" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Support Category</label>
                           <select className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:border-zinc-900 font-bold transition-all appearance-none">
                              <option>General Tech Inquiry</option>
                              <option>Enrollment & Billing</option>
                              <option>Business Partnership</option>
                              <option>Feedback & Careers</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Detail Your Inquiry</label>
                           <textarea rows={5} required className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:border-zinc-900 font-medium text-zinc-600 transition-all resize-none" placeholder="Explain how we can help..." />
                        </div>
                        <button type="submit" className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3">
                           Submit Support Ticket <ArrowRight className="w-5 h-5" />
                        </button>
                     </form>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
