// src/components/Booking/BookingSearch.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, MapPin, Minus, Plus, Search, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("Sanur - Nusa Penida");
  
  const today = new Date().toISOString().split('T')[0];
  const [departDateValue, setDepartDateValue] = useState("");
  const [returnDateValue, setReturnDateValue] = useState("");

  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const departInputRef = useRef(null);
  const returnInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [passengers, setPassengers] = useState({ adult: 1, child: 0, infant: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIconClick = (ref) => {
    if (ref.current) {
      try {
        ref.current.showPicker();
      } catch (err) {
        ref.current.focus();
      }
    }
  };

  const handleSearch = () => {
    setError("");

    if (!departDateValue) {
      setError("Please select a departure date.");
      triggerShake();
      return;
    }

    if (isRoundTrip && !returnDateValue) {
      setError("Please select a return date.");
      triggerShake();
      return;
    }

    // UPDATE: Menentukan rute balik secara otomatis untuk dikirim ke backend/admin
    const returnRoute = selectedRoute === "Sanur - Nusa Penida" 
      ? "Nusa Penida - Sanur" 
      : "Sanur - Nusa Penida";

    const searchParams = {
      route: selectedRoute,
      returnRoute: isRoundTrip ? returnRoute : null, // Menambahkan rute balik
      departDate: departDateValue,
      returnDate: isRoundTrip ? returnDateValue : null,
      passengers: passengers,
      isRoundTrip: isRoundTrip,
      currentStep: "departure"
    };

    navigate('/results', { state: searchParams });
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const updateCount = (type, operation) => {
    setPassengers(prev => {
      const currentVal = prev[type];
      if (operation === 'minus' && currentVal > (type === 'adult' ? 1 : 0)) {
        return { ...prev, [type]: currentVal - 1 };
      }
      if (operation === 'plus') return { ...prev, [type]: currentVal + 1 };
      return prev;
    });
  };

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;

  return (
    <div className="w-full flex flex-col gap-6 font-['Poppins']">
      <style dangerouslySetInnerHTML={{ __html: `
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}} />

      <div className="w-full relative">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-0 right-0 flex justify-center z-[200]"
            >
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl border border-red-400">
                <AlertCircle size={14} />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`w-full bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full border transition-all duration-300 ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'} shadow-2xl`}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center">
            
            {/* ROUTE */}
            <div className="flex-[1.2] w-full flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10">
              <MapPin className="text-sky-400 shrink-0" size={20} />
              <div className="flex flex-col items-start w-full text-left">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1 font-bold">Route</span>
                <select 
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="bg-transparent text-white font-bold outline-none w-full appearance-none cursor-pointer text-sm"
                >
                  <option value="Sanur - Nusa Penida" className="text-slate-900">Sanur - Nusa Penida</option>
                  <option value="Nusa Penida - Sanur" className="text-slate-900">Nusa Penida - Sanur</option>
                </select>
              </div>
            </div>

            {/* DEPART DATE */}
            <div 
              className={`flex-1 w-full flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 cursor-pointer group/item transition-colors ${error && !departDateValue ? 'bg-red-500/10' : ''}`}
              onClick={() => handleIconClick(departInputRef)}
            >
              <Calendar className="text-sky-400 group-hover/item:scale-110 transition-transform shrink-0" size={20} />
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1 font-bold">Departure</span>
                <input 
                  ref={departInputRef}
                  type="date" 
                  min={today}
                  value={departDateValue}
                  onChange={(e) => {
                    setError("");
                    setDepartDateValue(e.target.value);
                  }}
                  className="bg-transparent text-white font-bold outline-none w-full cursor-pointer [color-scheme:dark] text-sm" 
                />
              </div>
            </div>

            {/* RETURN DATE */}
            {isRoundTrip && (
              <div 
                className={`flex-1 w-full flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 cursor-pointer group/item transition-colors ${error && !returnDateValue ? 'bg-red-500/10' : ''}`}
                onClick={() => handleIconClick(returnInputRef)}
              >
                <Calendar className="text-sky-400 shrink-0 group-hover/item:scale-110 transition-transform" size={20} />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1 font-bold">Return</span>
                  <input 
                    ref={returnInputRef}
                    type="date" 
                    min={departDateValue || today}
                    value={returnDateValue}
                    onChange={(e) => {
                      setError("");
                      setReturnDateValue(e.target.value);
                    }}
                    className="bg-transparent text-white font-bold outline-none w-full cursor-pointer [color-scheme:dark] text-sm" 
                  />
                </div>
              </div>
            )}

            {/* PASSENGERS */}
            <div className="flex-1 w-full relative border-b md:border-b-0 md:border-r border-white/10" ref={dropdownRef}>
              <div onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-4 px-6 py-4 cursor-pointer group">
                <Users className="text-sky-400 group-hover:scale-110 transition-transform shrink-0" size={20} />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1 font-bold">Passengers</span>
                  <span className="text-white font-bold whitespace-nowrap text-sm">{totalPassengers} Pax</span>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                    className="absolute top-full left-0 mt-4 w-full md:w-80 bg-white rounded-3xl shadow-2xl p-7 z-[250] border border-slate-100 text-slate-900"
                  >
                    <h4 className="font-bold text-lg mb-6 tracking-tight">Select Passengers</h4>
                    <div className="space-y-6">
                      {['adult', 'child', 'infant'].map((type) => (
                        <div key={type} className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm capitalize">{type === 'child' ? 'Children' : type + 's'}</p>
                            <p className="text-slate-400 text-[11px]">{type === 'adult' ? 'Age 10+' : type === 'child' ? 'Age 3-10' : '0-2 Years Old'}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={() => updateCount(type, 'minus')} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer"><Minus size={14}/></button>
                            <span className="font-bold w-5 text-center text-sm">{passengers[type]}</span>
                            <button onClick={() => updateCount(type, 'plus')} className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition cursor-pointer"><Plus size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-full mt-8 bg-sky-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-sky-400 transition shadow-lg shadow-sky-500/20 cursor-pointer">Done</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SEARCH BUTTON */}
            <div className="p-2 w-full md:w-auto flex items-center justify-center">
              <motion.button 
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={handleSearch}
                className={`w-full md:w-14 h-14 md:h-14 rounded-2xl md:rounded-full transition-all flex items-center justify-center shadow-xl group cursor-pointer ${error ? 'bg-red-500 shadow-red-500/20' : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20'}`}
              >
                <Search size={22} className="text-white group-hover:scale-110 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKBOX ROUND TRIP */}
      <div className="flex items-center justify-center md:justify-start gap-3 px-6">
        <label className="relative flex items-center cursor-pointer group">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isRoundTrip}
            onChange={() => {
              setIsRoundTrip(!isRoundTrip);
              setError(""); 
            }}
          />
          <div className="w-6 h-6 border-2 border-white/20 rounded-lg peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all duration-300 flex items-center justify-center group-hover:border-white/50">
            <AnimatePresence>
              {isRoundTrip && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check size={16} strokeWidth={4} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="ml-4 text-white/80 text-xs font-bold tracking-[0.2em] uppercase group-hover:text-white transition-colors">
            {isRoundTrip ? "Round Trip Enabled" : "Add Return Ticket?"}
          </span>
        </label>
      </div>
    </div>
  );
}