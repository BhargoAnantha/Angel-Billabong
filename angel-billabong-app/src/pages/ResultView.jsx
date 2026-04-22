import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Clock, Users,
  ChevronDown, ArrowRight, Star, Sun, Cloud, CloudLightning,
  ShieldCheck, Wind, Coffee, Zap, X, Info
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SCHEDULE_DATA = {
  "Sanur - Nusa Penida": [
    { id: 1, time: "07.30", price: 160000, boat: "Angel Billabong Legend", weather: "Sunny" },
    { id: 2, time: "08.30", price: 160000, boat: "Angel Billabong Spirit", weather: "Cloudy" },
    { id: 3, time: "10.00", price: 180000, boat: "Angel Billabong Legend", weather: "Rainy" },
    { id: 4, time: "14.15", price: 160000, boat: "Prasi Sentana II", weather: "Sunny" },
    { id: 5, time: "17.00", price: 160000, boat: "Angel Billabong Spirit", weather: "Sunny" },
  ],
  "Nusa Penida - Sanur": [
    { id: 6, time: "07.20", price: 160000, boat: "Angel Billabong Spirit", weather: "Sunny" },
    { id: 7, time: "09.00", price: 160000, boat: "Angel Billabong Legend", weather: "Cloudy" },
    { id: 8, time: "13.00", price: 180000, boat: "Prasi Sentana II", weather: "Sunny" },
    { id: 9, time: "16.00", price: 160000, boat: "Angel Billabong Spirit", weather: "Sunny" },
    { id: 10, time: "17.00", price: 160000, boat: "Angel Billabong Legend", weather: "Cloudy" },
  ]
};

const CURRENCY_DATA = {
  IDR: { symbol: 'IDR', rate: 1, label: 'Indonesia Rupiah' },
  USD: { symbol: '$', rate: 15800, label: 'United States Dollar' },
  AUD: { symbol: 'A$', rate: 10400, label: 'Australian Dollar' },
  CNY: { symbol: '¥', rate: 2100, label: 'China Yuan Renminbi' },
};

const REVIEWS = [
  { id: 1, name: "Mateusz Wrzeszcz", date: "02 Nov 2025", rating: 5, route: "Sanur to Nusa Penida", text: "Everything went smooth, very professional crew." },
  { id: 2, name: "Patrik Rigo", date: "16 Oct 2025", rating: 5, route: "Sanur to Nusa Penida", text: "Všetko bolo v poriadku, recommended!" },
  { id: 3, name: "Sarah Miller", date: "10 Jan 2026", rating: 5, route: "Sanur to Nusa Penida", text: "Great experience, very punctual and helpful staff." },
];

export default function ResultView() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState("departure"); 
  const [selectedDepartureTrip, setSelectedDepartureTrip] = useState(null);
  
  const [weatherStatus] = useState("Cloudy");
  const [markovProbabilities] = useState({ sunny: 15, cloudy: 80, rainy: 5 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchParams = location.state || {
    route: "Sanur - Nusa Penida",
    departDate: "2026-03-30",
    returnDate: "2026-04-05",
    passengers: { adult: 1, child: 0, infant: 0 },
    isRoundTrip: true
  };

  const { route, departDate, returnDate, passengers, isRoundTrip } = searchParams;
  const displayFrom = currentStep === "departure" ? route.split(" - ")[0] : route.split(" - ")[1];
  const displayTo = currentStep === "departure" ? route.split(" - ")[1] : route.split(" - ")[0];

  const getFilteredTrips = () => {
    const activeRoute = currentStep === "departure" ? route : `${route.split(" - ")[1]} - ${route.split(" - ")[0]}`;
    const trips = SCHEDULE_DATA[activeRoute] || [];
    return trips;
  };

  const filteredTrips = getFilteredTrips();

  const convertPrice = (priceInIDR, currencyCode) => {
    const selected = CURRENCY_DATA[currencyCode];
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
    }).format(priceInIDR / selected.rate);
  };

  const handleSelectTrip = (trip) => {
    if (isRoundTrip && currentStep === "departure") {
      setSelectedDepartureTrip(trip);
      setCurrentStep("return");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/payment', { 
        state: { ...searchParams, selectedTrip: selectedDepartureTrip || trip, selectedReturnTrip: isRoundTrip ? trip : null, currency: selectedCurrency } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] overflow-x-hidden pb-20">
      
      {/* WEATHER MODAL (Markov Detail) */}
      <AnimatePresence>
        {isWeatherModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWeatherModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#003B6D] p-8 text-white flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">Weather Prediction</h3>
                  <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest text-sky-200">Markov Chain Model Analysis</p>
                </div>
                <button onClick={() => setIsWeatherModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sky-600">
                    <Cloud size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Outlook</p>
                    <h4 className="text-2xl font-black text-[#001D35] uppercase">{weatherStatus}</h4>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Probability Distribution</p>
                  <div className="grid grid-cols-3 gap-4">
                    <ProbabilityCard label="Sunny" value={markovProbabilities.sunny} icon={<Sun size={18}/>} color="bg-amber-400" />
                    <ProbabilityCard label="Cloudy" value={markovProbabilities.cloudy} icon={<Cloud size={18}/>} color="bg-sky-400" isMain />
                    <ProbabilityCard label="Rainy" value={markovProbabilities.rainy} icon={<CloudLightning size={18}/>} color="bg-slate-400" />
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Info size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-[11px] text-emerald-800 font-medium leading-relaxed italic">
                    "Berdasarkan model rantai Markov, kondisi laut hari ini stabil dan aman untuk penyeberangan cepat (Fast Cruise)."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="relative h-[35vh] bg-slate-900 flex flex-col items-center justify-center text-white px-6">
        <img src="/img/result-bg.png" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="background" />
        <h1 className="relative z-10 text-2xl md:text-4xl font-black tracking-tight text-center uppercase">
          {currentStep === "departure" ? "Select Departure Boat" : "Select Return Boat"}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-12 relative z-20">
        {/* SEARCH SUMMARY BAR (Perbaikan Z-Index) */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col lg:flex-row items-stretch gap-2 border border-slate-100 relative z-30">
          <div className="flex-[1.2] flex items-center justify-between px-6 py-4 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 rounded-l-xl">
            <span className="font-black text-slate-900 text-sm uppercase">{displayFrom}</span>
            <ArrowRight size={18} className="text-sky-500 mx-4" />
            <span className="font-black text-slate-900 text-sm uppercase">{displayTo}</span>
          </div>

          <div className="flex-1 flex items-center gap-4 px-6 py-4 border-b lg:border-b-0 lg:border-r border-slate-100">
            <Calendar size={18} className="text-sky-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Date</span>
              <span className="text-xs font-bold">{currentStep === "departure" ? departDate : returnDate}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4 px-6 py-4 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden">
            <Users size={18} className="text-sky-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Passengers</span>
              <span className="text-xs font-bold truncate">
                {passengers.adult} Adult
                {passengers.child > 0 ? `, ${passengers.child} Child` : ''}
              </span>
            </div>
          </div>

          {/* MARKOV BUTTON - FIXED AREA KLIK */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsWeatherModalOpen(true);
            }} 
            className="flex-[1.2] relative z-50 bg-gradient-to-br from-[#003B6D] to-blue-900 rounded-xl p-4 flex items-center gap-4 shadow-lg text-white cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
          >
             <Cloud size={24} className="shrink-0 text-sky-300" />
             <div className="flex flex-col justify-center">
               <p className="text-[10px] leading-tight font-medium">
                 Markov Prediction: <span className="font-black text-yellow-300">{weatherStatus} {markovProbabilities.cloudy}%.</span>
               </p>
               <p className="text-[10px] opacity-70 leading-tight">Safe crossing. Details.</p>
             </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 mb-8">
          <button onClick={() => currentStep === "return" ? setCurrentStep("departure") : navigate(-1)} className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest bg-white px-5 py-3 rounded-full shadow-sm border border-slate-100 transition-all hover:bg-slate-50">
            <ChevronLeft size={16} /> {currentStep === "return" ? "Back to Departure" : "Back"}
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm transition-all hover:border-sky-300">
               <span className="text-xs font-black text-slate-800">{selectedCurrency}</span>
               <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
                  {Object.keys(CURRENCY_DATA).map((code) => (
                    <button key={code} onClick={() => { setSelectedCurrency(code); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase transition-colors ${selectedCurrency === code ? 'text-sky-600 bg-sky-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                      {code} - {CURRENCY_DATA[code].label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TRIP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="group bg-white rounded-[40px] overflow-hidden flex flex-col sm:flex-row shadow-sm border border-slate-100 relative hover:shadow-2xl transition-all duration-500">
              <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] z-10 shadow-sm border
                ${trip.weather === 'Rainy' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                • {trip.weather === 'Rainy' ? 'Moderate Wind' : 'Optimal'}
              </div>

              <div className="w-full sm:w-5/12 overflow-hidden bg-slate-200">
                <img src="/img/boat1.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Boat" />
              </div>

              <div className="w-full sm:w-7/12 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-sky-500" />
                    <span className="font-black text-2xl text-slate-900 tracking-tight">{trip.time}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 mb-6 border-l-2 border-sky-100 pl-4">
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-sky-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">AC Cabin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-sky-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Insurance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coffee size={12} className="text-sky-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Mineral Water</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind size={12} className="text-sky-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">45 Mins</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.2em] mb-2">Vessel: {trip.boat}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Price per person</span>
                    <span className="text-lg font-black text-[#003B6D]">
                      {CURRENCY_DATA[selectedCurrency].symbol} {convertPrice(trip.price, selectedCurrency)}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleSelectTrip(trip)} 
                    className="bg-[#003B6D] hover:bg-sky-700 text-white px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95"
                  >
                    {isRoundTrip && currentStep === "departure" ? 'Next' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* VERIFIED REVIEWS */}
        <div className="mt-24">
          <h2 className="text-2xl font-black text-[#001D35] text-center mb-12 uppercase tracking-[0.2em]">Verified Reviews</h2>
          <div className="relative flex w-full overflow-hidden">
            <motion.div className="flex gap-8 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}>
              {[...REVIEWS, ...REVIEWS].map((rev, idx) => (
                <div key={idx} className="inline-block w-[380px] bg-white rounded-[35px] p-8 border border-slate-100 shadow-sm flex-shrink-0 whitespace-normal">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black uppercase">MB</div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">{rev.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-5 text-[9px] font-black uppercase">
                    <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1"><Star size={10} fill="currentColor" /> {rev.rating}</span>
                    <span className="text-sky-600 underline tracking-tighter">{rev.route}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">"{rev.text}"</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen untuk Modal Markov
function ProbabilityCard({ label, value, icon, color, isMain }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${isMain ? 'border-sky-200 bg-sky-50 shadow-sm scale-105' : 'border-slate-100 bg-white opacity-60'}`}>
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-black ${isMain ? 'text-sky-600' : 'text-slate-900'}`}>{value}%</p>
    </div>
  );
}