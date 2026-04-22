import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Users, ChevronDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CURRENCY_DATA = {
  IDR: { symbol: 'IDR', rate: 1, label: 'Indonesia Rupiah' },
  USD: { symbol: '$', rate: 15800, label: 'United States Dollar' },
  AUD: { symbol: 'A$', rate: 10400, label: 'Australian Dollar' },
  CNY: { symbol: '¥', rate: 2100, label: 'China Yuan Renminbi' },
};

export default function PaymentView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const data = location.state || {
    route: "Sanur - Nusa Penida",
    departDate: "2026-04-02",
    passengers: { adult: 1, child: 0, infant: 0 },
    selectedTrip: { time: "07.20 - 08.05", price: 160000, boat: "Angel Billabong Legend" },
    isRoundTrip: false,
    currency: 'IDR'
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(data.currency || 'IDR');

  const { adult = 0, child = 0 } = data.passengers;
  const chargeablePax = adult + child;
  
  const departPrice = data.selectedTrip?.price || 0;
  const returnPrice = data.isRoundTrip ? (data.selectedReturnTrip?.price || 0) : 0;
  const totalPriceIDR = (departPrice + returnPrice) * chargeablePax;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const convertPrice = (priceInIDR, currencyCode) => {
    const selected = CURRENCY_DATA[currencyCode];
    const result = priceInIDR / selected.rate;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
    }).format(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] text-[#003B6D] pb-20">
      {/* HERO SECTION - JUDUL TEGAK & KOKOH */}
      <div className="relative h-[35vh] bg-[#001D35] flex items-center justify-center text-white overflow-hidden">
        <img src="/img/result-bg.png" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001D35] via-transparent to-transparent" />
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-3xl md:text-5xl font-black tracking-tight uppercase text-center px-6"
        >
          {t('payment.confirm_title', 'Confirm Your Booking')}
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        
        {/* NAV BAR - PERBAIKAN POSISI (GAK NAIK LAGI) */}
        <div className="flex justify-between items-center mt-12 mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-3 bg-white px-7 py-3.5 rounded-full shadow-md border border-slate-100 text-[#003B6D] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95"
          >
            <ChevronLeft size={18} /> {t('payment.back', 'Back')}
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-4 bg-white px-7 py-3.5 rounded-full border border-slate-200 shadow-md hover:border-sky-300 transition-all"
            >
               <span className="text-[11px] font-black text-slate-800">{selectedCurrency}</span>
               <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] p-2"
                >
                  {Object.keys(CURRENCY_DATA).map((code) => (
                    <button
                      key={code}
                      onClick={() => { setSelectedCurrency(code); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                        selectedCurrency === code ? 'text-sky-600 bg-sky-50' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {code} - {CURRENCY_DATA[code].label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MAIN CARD CONTENT */}
        <div className="bg-white rounded-[45px] shadow-2xl border border-slate-100 p-8 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* SISI KIRI: GAMBAR & PROMO */}
            <div className="lg:col-span-5">
              <div className="rounded-[35px] overflow-hidden h-[400px] shadow-lg relative group">
                <img src="/img/boat1.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Boat" />
                <div className="absolute top-8 left-8 bg-white px-5 py-2 rounded-2xl shadow-xl">
                    <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest leading-none mb-1">Vessel Name</p>
                    <p className="text-xs font-black text-slate-900 uppercase">{data.selectedTrip.boat}</p>
                </div>
              </div>
              
              <div className="mt-10 flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[22px]">
                <input 
                  type="text" 
                  placeholder={t('payment.promo_placeholder', 'PROMO CODE')} 
                  className="flex-grow bg-transparent px-4 text-[10px] outline-none font-black text-slate-600 uppercase tracking-widest" 
                />
                <button className="bg-[#003B6D] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg">
                  {t('payment.promo_apply', 'Apply')}
                </button>
              </div>
            </div>

            {/* SISI KANAN: DETAIL PERJALANAN */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-12">
                <div className="relative pl-10 border-l-2 border-sky-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-sky-500 rounded-full border-4 border-white shadow-sm" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em] bg-sky-50 px-3 py-1 rounded-full">
                      {t('payment.departure', 'Departure')}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{data.departDate}</span>
                  </div>
                  <div className="flex items-center gap-6 mb-4">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{data.route.split(' - ')[0]}</h2>
                    <ArrowRight className="text-slate-200" size={28} />
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{data.route.split(' - ')[1]}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-black">
                    <Clock size={18} className="text-sky-500" />
                    <span className="text-lg text-slate-700">{data.selectedTrip.time}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[30px] p-8 border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-sky-100 transition-all duration-500">
                   <div className="flex items-center gap-5">
                      <div className="p-4 bg-white rounded-2xl shadow-sm text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('payment.passenger_details', 'Passengers')}</p>
                        <p className="text-lg font-black text-slate-900">
                          {adult} {t('payment.adult', 'Adult')}
                          {child > 0 && `, ${child} ${t('payment.child', 'Child')}`}
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('payment.chargeable', 'Chargeable')}</p>
                      <p className="text-xl font-black text-[#003B6D]">{chargeablePax} PAX</p>
                   </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-2">{t('payment.total_pay', 'Total Payment')}</span>
                  <div className="flex items-center gap-3">
                     <span className="text-xl font-black text-sky-600">IDR</span>
                     <span className="text-5xl font-black text-[#003B6D] tracking-tighter">
                       {convertPrice(totalPriceIDR, selectedCurrency)}
                     </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <button onClick={() => navigate(-1)} className="px-6 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all">
                     {t('payment.cancel_btn', 'Cancel')}
                   </button>
                   <button 
                     onClick={() => navigate('/process-payment', { state: { ...data, totalPriceIDR, selectedCurrency } })}
                     className="bg-[#2D8F29] text-white px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 hover:bg-[#247521] hover:-translate-y-1 transition-all active:scale-95"
                   >
                     {t('payment.proceed_btn', 'Proceed to Checkout')}
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRUSTED PARTNERS */}
        <div className="mt-24 border-t border-slate-200 pt-12">
          <div className="flex items-center justify-center gap-3 mb-10">
            <ShieldCheck size={14} className="text-emerald-500" />
            <h3 className="text-[9px] font-black text-slate-400 tracking-[0.4em] uppercase">{t('payment.partners', 'Trusted Payment Partners')}</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
             <img src="/img/payment/mastercard.png" className="h-10" alt="Mastercard" />
             <img src="/img/payment/visa.png" className="h-6" alt="Visa" />
             <img src="/img/payment/paypal.png" className="h-6" alt="Paypal" />
             <img src="/img/payment/qris.png" className="h-10" alt="QRIS" />
          </div>
        </div>
      </div>
    </div>
  );
}