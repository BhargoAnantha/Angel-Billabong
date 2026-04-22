import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Users, ChevronLeft, Calendar, ChevronDown, Clock, CreditCard, Check, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENCY_DATA = {
  IDR: { symbol: 'IDR', rate: 1, label: 'Indonesia Rupiah' },
  USD: { symbol: '$', rate: 15800, label: 'United States Dollar' },
  AUD: { symbol: 'A$', rate: 10400, label: 'Australian Dollar' },
  CNY: { symbol: '¥', rate: 2100, label: 'China Yuan Renminbi' },
};

const PAYMENT_METHODS = [
  { id: 'mastercard', name: 'Mastercard', img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/mastercard.svg' },
  { id: 'visa', name: 'Visa', img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/visa.svg' },
  { id: 'jcb', name: 'JCB', img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/jcb.svg' },
  { id: 'amex', name: 'Amex', img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/amex.svg' },
  { id: 'qris', name: 'QRIS', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg' },
  { id: 'paypal', name: 'PayPal', img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/paypal.svg' },
  { id: 'ovo', name: 'OVO', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg' },
  { id: 'shopee', name: 'Shopee', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg' },
];

export default function ProcessPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const initialData = location.state || {
    route: "Sanur - Nusa Penida",
    departDate: "2026-04-02",
    passengers: { adult: 1, child: 0, infant: 0 },
    selectedTrip: { time: "07.30", price: 160000 },
    totalPriceIDR: 160000,
    currency: 'IDR'
  };

  const [data, setData] = useState(initialData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('visa');
  const [openPaxIndex, setOpenPaxIndex] = useState(0);

  // STATE UNTUK FORM DATA
  const [bookedBy, setBookedBy] = useState({ firstName: '', lastName: '', email: '' });
  const totalPaxCount = data.passengers.adult + data.passengers.child;
  const [passengerData, setPassengerData] = useState(
    Array(totalPaxCount).fill({ gender: '', fullName: '', age: '', nationality: '' })
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePaxChange = (index, field, value) => {
    const updated = [...passengerData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerData(updated);
  };

  const handleProceedToWA = () => {
    // 1. Validasi Booked By
    if (!bookedBy.firstName || !bookedBy.lastName || !bookedBy.email) {
      alert("Please complete the 'Booked By' information first.");
      return;
    }

    // 2. Validasi Passenger Details
    for (let i = 0; i < passengerData.length; i++) {
      const p = passengerData[i];
      if (!p.gender || !p.fullName || !p.age || !p.nationality) {
        setOpenPaxIndex(i); // Buka accordion yang belum diisi
        alert(`Please complete details for Passenger ${i + 1}.`);
        return;
      }
    }

    // 3. Construct Message
    const message = `Halo Angel Billabong Fast Cruise, saya ingin melakukan reservasi:
    
Detail Pemesan:
- Nama: ${bookedBy.firstName} ${bookedBy.lastName}
- Email: ${bookedBy.email}

Detail Perjalanan:
- Rute: ${data.route}
- Tanggal: ${data.departDate}
- Jam: ${data.selectedTrip.time}
- Total Bayar: ${CURRENCY_DATA[data.currency].symbol} ${getConvertedPrice()} (${selectedMethod.toUpperCase()})

Detail Penumpang:
${passengerData.map((p, i) => `${i + 1}. ${p.fullName} (${p.gender}, ${p.age} thn, ${p.nationality})`).join('\n')}

Mohon informasi langkah pembayaran selanjutnya. Terima kasih.`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const getConvertedPrice = () => {
    const currency = data.currency || 'IDR';
    const selected = CURRENCY_DATA[currency];
    const result = data.totalPriceIDR / selected.rate;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(result);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-['Poppins'] text-[#001D35]">
      
      <div className="relative h-[250px] md:h-[300px] w-full flex items-center justify-center overflow-hidden">
        <img src="/img/result-bg.png" className="absolute inset-0 w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-[#001D35]/80" />
        <h1 className="relative z-10 text-white text-3xl md:text-5xl font-black uppercase tracking-tight text-center px-4">
          Complete Your Payment
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        
        <div className="flex justify-between items-center mt-12 mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-3 bg-white px-7 py-3.5 rounded-full shadow-md border border-slate-100 text-[#003B6D] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95"
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-4 bg-white px-7 py-3.5 rounded-full border border-slate-200 shadow-md hover:border-sky-300 transition-all"
            >
               <span className="text-[11px] font-black text-slate-800 uppercase">{data.currency}</span>
               <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-50 z-[100] overflow-hidden p-2"
                >
                  {Object.keys(CURRENCY_DATA).map((code) => (
                    <button
                      key={code}
                      onClick={() => { setData(p => ({...p, currency: code})); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase flex justify-between items-center rounded-xl transition-all ${
                        data.currency === code ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span>{CURRENCY_DATA[code].label}</span>
                      {data.currency === code && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-[63%] space-y-10">
            
            {/* BOOKED BY */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-50">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <User size={22} />
                </div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Booked By</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputBox label="First Name*" placeholder="Enter your first name" value={bookedBy.firstName} onChange={(v) => setBookedBy({...bookedBy, firstName: v})} />
                <InputBox label="Last Name*" placeholder="Enter your last name" value={bookedBy.lastName} onChange={(v) => setBookedBy({...bookedBy, lastName: v})} />
                <div className="md:col-span-2">
                  <InputBox label="Email Address*" placeholder="example@email.com" type="email" value={bookedBy.email} onChange={(v) => setBookedBy({...bookedBy, email: v})} />
                </div>
              </div>
            </div>

            {/* PASSENGERS */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-50">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Users size={22} />
                </div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Passenger Details</h2>
              </div>

              <div className="space-y-5">
                {passengerData.map((pax, i) => (
                  <div key={i} className="border border-slate-100 rounded-[30px] overflow-hidden bg-slate-50/30 transition-all">
                    <button 
                      onClick={() => setOpenPaxIndex(openPaxIndex === i ? -1 : i)}
                      className="w-full flex items-center justify-between p-7 bg-white hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${openPaxIndex === i ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-black text-[#001D35] uppercase tracking-widest">
                          Passenger {i + 1} {pax.fullName ? `- ${pax.fullName}` : ''}
                        </span>
                      </div>
                      {openPaxIndex === i ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} className="text-slate-300" />}
                    </button>

                    <AnimatePresence>
                      {openPaxIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="p-10 pt-2 border-t border-slate-50 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
                              <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender*</label>
                                <div className="flex gap-12">
                                  {['Male', 'Female'].map((g) => (
                                    <label key={g} className="flex items-center gap-4 cursor-pointer group">
                                      <input 
                                        type="radio" 
                                        name={`g-${i}`} 
                                        checked={pax.gender === g}
                                        onChange={() => handlePaxChange(i, 'gender', g)}
                                        className="w-5 h-5 accent-blue-600" 
                                      />
                                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">{g}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <InputBox label="Full Name*" placeholder="Full Name as per ID" value={pax.fullName} onChange={(v) => handlePaxChange(i, 'fullName', v)} />
                              <InputBox label="Age*" placeholder="Ex: 25" type="number" value={pax.age} onChange={(v) => handlePaxChange(i, 'age', v)} />
                              <InputBox label="Nationality*" placeholder="Ex: Indonesian" value={pax.nationality} onChange={(v) => handlePaxChange(i, 'nationality', v)} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT METHODS */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-50">
              <div className="flex items-center gap-5 mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <CreditCard size={22} />
                </div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Payment Method</h2>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 ml-[68px]">Secure encryption & instant verification.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative flex flex-col items-center justify-center p-8 rounded-[30px] border-2 transition-all duration-300 group ${selectedMethod === method.id ? 'border-blue-500 bg-blue-50/30 shadow-xl scale-[1.02]' : 'border-slate-50 bg-white hover:border-blue-200'}`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white"><Check size={14} strokeWidth={4} /></div>
                    )}
                    <img src={method.img} alt={method.name} className={`h-10 w-full object-contain transition-all ${selectedMethod === method.id ? 'grayscale-0' : 'grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="w-full lg:w-[37%] lg:sticky lg:top-10">
            <div className="bg-white rounded-[45px] p-10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.15)] border border-slate-50">
              <div className="space-y-10">
                <div className="space-y-7">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Departure Date</p>
                      <p className="text-sm font-black text-[#001D35] uppercase">{data.departDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50 w-fit">
                    <Clock size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase">TIME: {data.selectedTrip.time}</span>
                  </div>
                  <div className="relative pl-10 py-2">
                    <div className="absolute left-[7px] top-5 bottom-5 w-[1.5px] bg-slate-100" />
                    <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md" />
                    <div className="absolute left-0 bottom-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-md" />
                    <div className="mb-10">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">FROM</p>
                      <p className="text-sm font-black text-[#001D35] uppercase">{data.route.split(' - ')[0]}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">TO</p>
                      <p className="text-sm font-black text-[#001D35] uppercase">{data.route.split(' - ')[1]}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 space-y-8">
                  <div className="relative group">
                    <input type="text" placeholder="PROMO CODE" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-6 pr-24 outline-none text-[10px] font-black tracking-widest uppercase focus:border-blue-300 focus:bg-white transition-all shadow-inner" />
                    <button className="absolute right-2.5 top-2.5 bottom-2.5 bg-[#003B6D] text-white px-6 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all active:scale-95 shadow-lg">Apply</button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">TOTAL PAYMENT</p>
                      <h3 className="text-4xl font-black text-blue-600 tracking-tighter leading-none">
                        {CURRENCY_DATA[data.currency].symbol} {getConvertedPrice()}
                      </h3>
                    </div>
                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow-lg shadow-blue-200">{data.currency}</span>
                  </div>
                  
                  <div className="space-y-6 pt-4">
                    <label className="flex items-start gap-5 cursor-pointer group">
                      <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="h-5 w-5 rounded-lg border-slate-200 text-blue-600 focus:ring-0 mt-0.5 cursor-pointer" />
                      <span className="text-[9px] font-black text-slate-400 leading-relaxed uppercase tracking-tighter">
                        I agree with the <span className="underline text-blue-500">Terms & Conditions</span> and <span className="underline text-blue-500">Privacy Policy</span>
                      </span>
                    </label>
                    <button 
                      onClick={handleProceedToWA}
                      disabled={!isAgreed} 
                      className={`w-full py-6 rounded-[25px] font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-500 shadow-2xl ${isAgreed ? 'bg-[#2D8F29] text-white hover:bg-[#257a22] hover:translate-y-[-2px] active:scale-[0.97]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InputBox({ label, placeholder, type = "text", value, onChange }) {
    return (
        <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
            <input 
              type={type} 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-[22px] py-5 px-7 outline-none focus:border-blue-300 focus:bg-white transition-all text-xs font-bold text-[#001D35] placeholder:text-slate-300 shadow-inner" 
              placeholder={placeholder} 
            />
        </div>
    );
}