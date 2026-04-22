import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-white min-h-screen pt-32 pb-20 px-8 md:px-16 font-['Poppins'] text-[#001D35]"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* SISI KIRI: JUDUL */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-7xl md:text-8xl font-medium tracking-tight mb-8">
              Contact us
            </h1>
            <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
              Get in touch with us for any enquiries and questions regarding your boat trip.
            </p>
          </div>

          {/* SOCIAL LINKS (BOTTOM LEFT) */}
          <div className="hidden lg:flex gap-8 mt-20">
            {['Instagram', 'Facebook', 'TripAdvisor'].map((social) => (
              <a key={social} href="#" className="text-sm font-semibold hover:text-blue-600 transition-colors uppercase tracking-widest">
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* SISI KANAN: INFO & IMAGE */}
        <div className="space-y-16">
          {/* GRID INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            <ContactItem 
              label="general inquiries" 
              value="info@angelbillabong.com" 
              subValue="+62 812 3456 7890" 
            />
            <ContactItem 
              label="reservations" 
              value="booking@angelbillabong.com" 
              subValue="+62 811 9876 5432" 
            />
            <ContactItem 
              label="collaborations" 
              value="marketing@angelbillabong.com" 
            />
            <ContactItem 
              label="address" 
              value="Sanur Beach, Jalan Matahari Terbit" 
              subValue="Denpasar, Bali 80227" 
            />
          </div>

          {/* GAMBAR (REFERENSI GAMBAR 2) */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl group">
             <img 
               src="/img/contact.png" 
               alt="Angel Billabong Office" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-[#001D35]/10 group-hover:bg-transparent transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactItem({ label, value, subValue }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
        {label}
      </p>
      <div className="space-y-1">
        <p className="text-sm font-bold text-[#001D35] hover:text-blue-600 cursor-pointer transition-colors">
          {value}
        </p>
        {subValue && <p className="text-sm text-slate-500">{subValue}</p>}
      </div>
    </div>
  );
}