import { motion } from 'framer-motion';
import { X, Ticket, Mail, ChevronRight } from 'lucide-react';

export default function MyReservationModal({ onClose }) {
  return (
    <motion.div 
      // Container utama
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
    >
      {/* 1. Backdrop / Blur Layer - Transisi Lembut */}
      <motion.div 
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 bg-slate-900/60" 
        onClick={onClose} 
      />

      {/* 2. Modal Card - Transisi Pop Up Smooth */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          duration: 0.3 
        }}
        className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header Section */}
        <div className="bg-[#003B6D] p-10 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold tracking-tight">My Reservation</h2>
          <p className="text-blue-100/60 text-sm mt-2">Enter details to retrieve your ticket.</p>
        </div>

        {/* Form Body */}
        <div className="p-10 space-y-8">
          <div className="space-y-6">
            {/* Input Booking Code */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Booking Code
              </label>
              <div className="relative group">
                <Ticket className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003B6D] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="e.g. AB-123456"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-[#003B6D] transition-all font-medium text-slate-900 shadow-sm"
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003B6D] transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-[#003B6D] transition-all font-medium text-slate-900 shadow-sm"
                />
              </div>
            </div>
          </div>

          <button className="w-full bg-[#003B6D] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#002545] transition-all shadow-xl active:scale-95 group">
            Retrieve Reservation
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}