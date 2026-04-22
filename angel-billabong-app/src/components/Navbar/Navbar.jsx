import { useState, useEffect, useRef } from 'react';
import { Menu, X, Calendar, ChevronDown, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar({ onMyReservationClick }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Konfigurasi visibilitas tombol aksi
  const hideActionButton = ['/results', '/payment', '/process-payment'].includes(location.pathname);
  const isBookingPage = location.pathname === '/booking';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lock scroll saat menu overlay terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const languages = {
    en: { name: 'EN', flag: 'https://flagcdn.com/w20/us.png' },
    id: { name: 'ID', flag: 'https://flagcdn.com/w20/id.png' }
  };

  // Navigasi yang telah diperbarui ke /contact
  const navLinks = [
    { name: t('navbar.home', 'Home'), href: '/' },
    { name: t('navbar.reservation', 'Reservation'), href: '/booking' },
    { name: t('navbar.gallery', 'Gallery'), href: '/gallery' },
    { name: t('navbar.contact', 'Contact Us'), href: '/contact' }, // Update di sini
  ];

  const handleNavigation = (path) => {
    setIsOpen(false);
    // Delay sedikit agar animasi tutup menu selesai sebelum navigasi (opsional)
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-[100] transition-all duration-500 px-6 md:px-12 flex justify-between items-center ${
          scrolled || isOpen
            ? 'bg-slate-900/95 shadow-lg py-3 backdrop-blur-md' 
            : 'bg-transparent py-6'
        }`}
      >
        {/* LEFT: Hamburger */}
        <div className="flex items-center w-1/3">
          <button 
            onClick={() => setIsOpen(true)} 
            className="text-white hover:text-sky-400 transition-colors p-1 -ml-1 cursor-pointer"
          >
            <Menu size={32} />
          </button>
        </div>

        {/* CENTER: Brand */}
        <div className="flex justify-center w-1/3">
          <Link to="/" className="text-white font-bold text-lg md:text-2xl tracking-tight whitespace-nowrap uppercase">
             Angel Billabong Fast Cruise
          </Link>
        </div>

        {/* RIGHT: Action & Language */}
        <div className="flex items-center justify-end gap-3 md:gap-6 w-1/3">
          {!hideActionButton && (
            <div>
              {isBookingPage ? (
                <button 
                  onClick={onMyReservationClick}
                  className="hidden sm:flex items-center gap-2 border border-white/30 bg-white/10 hover:bg-white hover:text-slate-900 text-white px-5 py-2 rounded-full transition-all text-[11px] font-bold tracking-[0.15em]"
                >
                  <Ticket size={14} /> {t('navbar.my_reservation', 'MY RESERVATION')}
                </button>
              ) : (
                <Link 
                  to="/booking"
                  className="hidden sm:flex items-center gap-2 border border-white/30 bg-white/10 hover:bg-white hover:text-slate-900 text-white px-5 py-2 rounded-full transition-all text-[11px] font-bold tracking-[0.15em]"
                >
                  <Calendar size={14} /> {t('navbar.book_now', 'BOOK NOW')}
                </Link>
              )}
            </div>
          )}

          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-white hover:opacity-80 transition-all py-2"
            >
              <img 
                src={languages[i18n.language.substring(0,2)]?.flag || languages.en.flag} 
                alt="Flag" 
                className="w-5 h-3.5 object-cover rounded-sm shadow-sm" 
              />
              <span className="text-xs font-black hidden md:block uppercase">{i18n.language.substring(0,2)}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-1 z-[110]"
                >
                  {Object.entries(languages).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[11px] font-bold transition-colors hover:bg-slate-50 ${
                        i18n.language.startsWith(code) ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
                      }`}
                    >
                      <img src={info.flag} className="w-4 h-2.5 object-cover rounded-[1px]" alt={code} />
                      {code === 'en' ? 'ENGLISH' : 'INDONESIA'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[20px] flex flex-col" 
          >
            <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>

            <div className={`w-full px-6 md:px-12 flex items-center py-6`}>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:rotate-90 transition-all p-2 -ml-2"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex-grow flex flex-col justify-center px-12 md:px-24 -mt-16 relative z-[210]"> 
              <div className="flex flex-col gap-4 md:gap-6">
                {navLinks.map((link, index) => (
                  <motion.div 
                    key={link.name} 
                    initial={{ x: -30, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 * index }}
                  >
                    <button
                      onClick={() => handleNavigation(link.href)}
                      className="text-4xl md:text-7xl font-bold text-white/40 hover:text-white transition-all duration-300 relative group w-fit tracking-tighter uppercase text-left block"
                    >
                      {link.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-[4px] bg-sky-400 transition-all duration-500 group-hover:w-full"></span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}