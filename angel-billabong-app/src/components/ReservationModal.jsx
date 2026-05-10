// src/components/ReservationModal.jsx
import { X, Ticket, Mail, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReservationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
        {/* Overlay Blur */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black italic text-[#001D35] uppercase tracking-tighter">Check Reservation</h2>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Enter your details below</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="BOOKING CODE (e.g. ABC12345)"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              <button className="w-full bg-[#001D35] hover:bg-sky-600 text-white rounded-2xl py-4 flex items-center justify-center gap-3 transition-all group">
                <Search size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Find My Reservation</span>
              </button>
            </div>

            <p className="mt-6 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
              *If you forgot your booking code, please check your email confirmation or contact our support.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}