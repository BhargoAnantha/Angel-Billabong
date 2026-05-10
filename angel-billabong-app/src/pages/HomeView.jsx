import Features from '../components/Feature/Features'
import ScrollTop from '../components/Scroll/ScrollTop'
import { ArrowRight, Star, MapPin, Ticket } from 'lucide-react' 
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function HomeView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const goToBooking = () => {
    navigate('/booking');
  };

  const goToDetail = (tripId) => {
    navigate(`/trip-detail/${tripId}`);
  };

  const recommendedTrips = [
    { id: 1, title: "West Trip Tour", location: "NUSA PENIDA", image: "/img/trips1.png" },
    { id: 2, title: "East Trip Tour", location: "NUSA PENIDA", image: "/img/trips2.png" },
    { id: 3, title: "Snorkeling Trip", location: "NUSA PENIDA", image: "/img/trips3.png" }
  ];

  return (
    <div className="bg-white font-sans overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center text-center text-white font-['Poppins']">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2 }} className="absolute inset-0 z-0">
          <img src="/img/hero.png" className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-black/40"></div>
        </motion.div>
        <div className="relative z-10 px-4 max-w-6xl">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="text-[40px] md:text-[64px] leading-tight font-normal tracking-wide uppercase" dangerouslySetInnerHTML={{ __html: t('home.hero.title') }} />
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-12 flex flex-col items-center">
            <div className="w-[2px] h-16 bg-white"></div>
            <div className="w-4 h-4 border-b-2 border-r-2 border-white rotate-45 -mt-2"></div>
          </motion.div>
        </div>
      </section>

      {/* NEW: ABOUT US SECTION (Gambar 2) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          {/* Teks Deskripsi */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8 font-['Poppins']"
          >
            <h4 className="text-[13px] font-bold tracking-[0.3em] text-[#001D3D] uppercase">
              Welcome to <span className="font-black">Angel Billabong Fast Cruise</span>
            </h4>
            <h2 className="text-[38px] md:text-[54px] font-medium leading-[1.1] text-[#001D3D] tracking-tight">
              A seamless journey for those seeking speed, comfort, and scenic beauty.
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed max-w-xl">
              <p>
                Departing from Bali, Angel Billabong Fast Cruise offers swift transfers to Nusa Penida with modern speed boats. Enjoy spacious cabins with <span className="text-[#e2c139] font-bold">comfortable seating</span> and life jackets for added safety. 
              </p>
              <p>
                Utilizing the latest sailing technology, the service ensures a smooth and secure voyage across the ocean. Guests are provided with two lifeboats for peace of mind, making Angel Billabong Fast Cruise the ideal choice for a quick and pleasant escape to Nusa Penida.
              </p>
            </div>
            <button 
              onClick={goToBooking}
              className="bg-[#e2c139] hover:bg-[#d4b535] text-white px-10 py-4 rounded-sm font-bold text-sm tracking-widest transition-all shadow-xl uppercase cursor-pointer"
            >
              Book Now!
            </button>
          </motion.div>

          {/* Gambar Kapal Portrait */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#f8fafc] rounded-sm -z-10 group-hover:bg-[#e2c139]/10 transition-colors duration-500"></div>
              <img 
                src="/img/about.png" 
                className="w-full h-[650px] object-cover rounded-sm shadow-2xl"
                alt="Angel Billabong Boat Service"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* RECOMMENDED TRIPS SECTION */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h4 className="text-sky-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Available Trips</h4>
            <h2 className="text-4xl md:text-5xl font-black text-[#001D3D] uppercase tracking-tighter">Recommended Trips</h2>
            <div className="w-20 h-1.5 bg-sky-500 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {recommendedTrips.map((trip) => (
              <motion.div 
                key={trip.id}
                whileHover={{ y: -15 }}
                className="group relative bg-white rounded-[45px] overflow-hidden shadow-2xl border border-white cursor-pointer"
                onClick={() => goToDetail(trip.id)}
              >
                <div className="relative h-[550px] w-full">
                  <img src={trip.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={trip.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex text-amber-400 mb-2">
                           {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{trip.title}</h3>
                        <div className="flex items-center gap-2 text-white/70">
                          <MapPin size={14} className="text-sky-400" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{trip.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button className="w-full bg-white text-[#001D3D] py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl cursor-pointer">
                        <Ticket size={18} /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCHEDULE SECTION */}
      <div ref={containerRef} className="relative w-full bg-white overflow-hidden py-20">
        <div className="flex items-center justify-center">
          <motion.div 
            style={{ 
              width: useTransform(scrollYProgress, [0, 0.4], ["40%", "100%"]),
              borderRadius: useTransform(scrollYProgress, [0, 0.4], ["60px", "0px"]),
              scale: useTransform(scrollYProgress, [0, 0.4], [0.95, 1])
            }}
            className="relative h-auto py-16 md:py-0 md:h-[75vh] bg-slate-900 text-white overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 z-0">
              <img src="/img/schedule-bg.png" className="w-full h-full object-cover opacity-50" alt="Ocean" />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="w-full overflow-hidden rounded-xl border border-white/20 shadow-2xl">
                <table className="w-full text-center border-collapse bg-white/10 backdrop-blur-lg font-['Poppins']">
                  <thead>
                    <tr><th colSpan="2" className="bg-[#1e295b] py-5 text-lg font-semibold border-b border-white/10 tracking-widest uppercase">{t('home.schedule.title')}</th></tr>
                    <tr className="bg-[#e2c139] text-slate-900 text-xs font-bold uppercase tracking-widest">
                      <th className="py-3 border-r border-slate-800/10">Sanur - Nusa Penida</th>
                      <th className="py-3">Nusa Penida - Sanur</th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-xs md:text-base">
                    {[{ go: "07.30 AM", back: "07.20 AM" }, { go: "08.30 AM", back: "09.00 AM" }, { go: "10.00 AM", back: "13.00 PM" }, { go: "14.15 PM", back: "16.00 PM" }, { go: "17.00 PM", back: "17.00 PM" }].map((time, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 border-r border-white/10">{time.go}</td>
                        <td className="py-4">{time.back}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <div className="flex flex-col justify-center font-['Poppins']">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-[36px] md:text-[52px] font-semibold mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: t('home.schedule.heading') }} />
                  <p className="text-slate-200 text-sm md:text-lg leading-relaxed mb-8 opacity-90 max-w-md font-light">{t('home.schedule.description')}</p>
                  
                  <button onClick={goToBooking} className="w-fit text-[#e2c139] font-black uppercase tracking-[0.2em] border-b-2 border-[#e2c139] pb-1 hover:text-white hover:border-white transition-all cursor-pointer">
                    {t('home.schedule.button', 'BOOK NOW')}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Features fadeIn={fadeIn} staggerContainer={staggerContainer} />

      {/* CTA SECTION */}
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/img/book-bg.png" className="w-full h-full object-cover" alt="CTA" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{t('home.cta.title')}</h2>
            <p className="text-lg md:text-xl font-light mb-10 opacity-90">{t('home.cta.subtitle')}</p>
            <motion.button 
              onClick={goToBooking}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
              className="bg-[#e2c139] hover:bg-[#d4b535] text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto shadow-2xl cursor-pointer"
            >
              {t('home.cta.button')}
              <div className="bg-white/20 p-1 rounded-full"><ArrowRight size={20} className="text-white" /></div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <ScrollTop />
    </div>
  )
}