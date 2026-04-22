import { motion } from 'framer-motion';
import { Camera, MapPin, Expand } from 'lucide-react';
import ScrollTop from '../components/Scroll/ScrollTop';

export default function GalleryView() {
  // Data gambar gallery
  const galleryImages = [
    { id: 1, src: '/img/trips1.png', title: 'Kelingking Beach', size: 'large' },
    { id: 2, src: '/img/trips2.png', title: 'Diamond Beach', size: 'small' },
    { id: 3, src: '/img/trips3.png', title: 'Snorkeling Spot', size: 'small' },
    { id: 4, src: '/img/hero.png', title: 'Angel Billabong', size: 'medium' },
    { id: 5, src: '/img/schedule-bg.png', title: 'Crystal Bay', size: 'small' },
    { id: 6, src: '/img/book-bg.png', title: 'Broken Beach', size: 'medium' },
  ];

  return (
    <div className="bg-[#F4F7FA] min-h-screen font-['Poppins'] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h4 className="text-sky-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Visual Journey</h4>
            <h2 className="text-4xl md:text-5xl font-black text-[#001D3D] uppercase tracking-tighter">Our Gallery</h2>
            <div className="w-20 h-1.5 bg-sky-500 mt-6 rounded-full"></div>
            <p className="text-slate-400 text-sm font-bold mt-6 max-w-md uppercase tracking-widest leading-loose">
              Capturing the breathtaking moments of Nusa Penida's paradise
            </p>
          </motion.div>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryImages.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative group break-inside-avoid rounded-[35px] overflow-hidden shadow-xl shadow-slate-200/50 border-4 border-white"
            >
              {/* Image */}
              <img 
                src={item.src} 
                alt={item.title} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#001D3D]/90 via-[#001D3D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 text-sky-400 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <MapPin size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nusa Penida</span>
                </div>
                <h3 className="text-white text-xl font-black uppercase tracking-tighter transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  {item.title}
                </h3>
                
                <button className="mt-4 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#001D3D] self-end shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-150">
                  <Expand size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA (Gaya Angel Billabong) */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-12 bg-[#001D3D] rounded-[50px] text-center relative overflow-hidden shadow-2xl shadow-blue-900/20"
        >
          <div className="relative z-10">
            <Camera className="text-sky-500 mx-auto mb-6" size={48} />
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">Share Your Moments</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">Tag us on Instagram @angelbillabongfastcruise</p>
            <button className="bg-white text-[#001D3D] px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-sky-100 transition-all">
              Follow Us
            </button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        </motion.div>

      </div>
      <ScrollTop />
    </div>
  );
}