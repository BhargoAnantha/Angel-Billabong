// src/pages/ProcessPayment.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Users, ChevronLeft, Calendar, ChevronDown, CreditCard, Check, ChevronUp, Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTransportBook } from '../services/TransportBookService'; 

const CURRENCY_DATA = {
  IDR: { symbol: 'IDR', rate: 1, label: 'Indonesia Rupiah' },
  USD: { symbol: '$', rate: 15800, label: 'United States Dollar' },
  AUD: { symbol: 'A$', rate: 10400, label: 'Australian Dollar' },
  CNY: { symbol: '¥', rate: 2100, label: 'China Yuan Renminbi' },
};

const PAYMENT_METHODS = [
  { id: 'Mastercard', name: 'Mastercard', img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/mastercard.svg' },
  { id: 'Visa',       name: 'Visa',       img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/visa.svg' },
  { id: 'JCB',        name: 'JCB',        img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/jcb.svg' },
  { id: 'Amex',       name: 'Amex',       img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/amex.svg' },
  { id: 'QRIS',       name: 'QRIS',       img: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg' },
  { id: 'PayPal',     name: 'PayPal',     img: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/paypal.svg' },
  { id: 'OVO',        name: 'OVO',        img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg' },
  { id: 'Shopee',     name: 'Shopee',     img: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg' },
];

export default function ProcessPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const initialData = location.state || {
    route: "Sanur - Nusa Penida",
    departDate: new Date().toISOString().split('T')[0],
    returnDate: null,
    isRoundTrip: false,
    passengers: { adult: 1, child: 0 },
    totalPriceIDR: 450000,
    currency: 'IDR',
    transportId: 1,
    time: "07:30",
    returnTime: "16:00"
  };

  const [data, setData]                 = useState(initialData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAgreed, setIsAgreed]         = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('QRIS');
  const [openPaxIndex, setOpenPaxIndex] = useState(0);
  const [loading, setLoading]           = useState(false);

  const [bookedBy, setBookedBy] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const totalPaxCount = (data.passengers?.adult || 0) + (data.passengers?.child || 0);
  
  const [passengerData, setPassengerData] = useState(
    Array(totalPaxCount || 1).fill({ gender: '', fullName: '', age: '', nationality: '' })
  );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handlePaxChange = (index, field, value) => {
    const updated = [...passengerData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerData(updated);
  };

  const handleProceedToPayment = async () => {
    if (!bookedBy.firstName || !bookedBy.phone) {
      alert("Please complete at least First Name and WhatsApp.");
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        transport_id:        Number(data.transportId),
        customer_name:       `${bookedBy.firstName} ${bookedBy.lastName}`.trim(),
        first_name:          bookedBy.firstName,
        last_name:           bookedBy.lastName,
        email:               bookedBy.email,
        whatsapp:            bookedBy.phone,
        payment:             selectedMethod,
        status:              "Pending",
        total_price:         parseFloat(data.totalPriceIDR || 0), 
        route_name:          String(data.route),
        departure_date:      String(data.departDate),
        is_round_trip:       data.isRoundTrip ? 1 : 0,
        return_date:         String(data.returnDate || "-"),
        return_time:         data.isRoundTrip ? String(data.returnTime || "16:00") : "-",
        passanger_full_name: passengerData[0]?.fullName || "Guest",
        passanger_gender:    passengerData[0]?.gender || "",
        passanger_age:       String(passengerData[0]?.age || ""),
        passanger_nation:    passengerData[0]?.nationality || "",
        passanger_details:   JSON.stringify(passengerData)
      };
      
      await createTransportBook(payload);
      
      const returnInfo = data.isRoundTrip
        ? `\n*Return Date:* ${data.returnDate}\n*Return Time:* ${data.returnTime} WITA`
        : '';
      
      const waMessage =
        `*NEW TRANSPORT BOOKING - ANGEL BILLABONG*\n\n` +
        `*Customer:* ${payload.customer_name}\n` +
        `*Route:* ${data.route}${data.isRoundTrip ? ' (Round Trip)' : ''}\n` +
        `*Travel Date:* ${data.departDate}\n` +
        `*Departure Time:* ${data.time} WITA${returnInfo}\n` +
        `*Payment Method:* ${selectedMethod}\n` +
        `*Total:* IDR ${data.totalPriceIDR.toLocaleString('id-ID')}\n\n` +
        `Please confirm my booking.`;

      window.open(`https://wa.me/6281338134797?text=${encodeURIComponent(waMessage)}`, '_blank');
      navigate('/'); 
      
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getConvertedPrice = () => {
    const res = (data.totalPriceIDR || 0) / CURRENCY_DATA[data.currency].rate;
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: data.currency === 'IDR' ? 0 : 2 
    }).format(res);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-['Poppins'] text-[#001D35]">
      <div className="relative h-[280px] w-full flex items-center justify-center overflow-hidden">
        <img src="/img/result-bg.png" className="absolute inset-0 w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-[#001D35]/80" />
        <div className="relative z-10 text-center">
          <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">Checkout Transport</h1>
          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Angel Billabong Fast Cruise</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="flex justify-between items-center mt-10 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 bg-white px-7 py-3.5 rounded-full shadow-md border border-slate-100 text-[#003B6D] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-4 bg-white px-7 py-3.5 rounded-full border border-slate-200 shadow-md transition-all hover:border-blue-300"
            >
              <span className="text-[10px] font-black text-slate-800 uppercase">{data.currency}</span>
              <ChevronDown size={14} className={isDropdownOpen ? 'rotate-180' : ''} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-50 z-[100] p-2">
                {Object.keys(CURRENCY_DATA).map((code) => (
                  <button
                    key={code}
                    onClick={() => { setData(p => ({...p, currency: code})); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase flex justify-between items-center rounded-xl ${
                      data.currency === code ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {CURRENCY_DATA[code].label} {data.currency === code && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-[63%] space-y-10">

            {/* ── Booked By ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-50">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <User size={22} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Booked By</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputBox label="First Name*"       placeholder="John"             value={bookedBy.firstName} onChange={(v) => setBookedBy({...bookedBy, firstName: v})} />
                <InputBox label="Last Name"         placeholder="Doe"              value={bookedBy.lastName}  onChange={(v) => setBookedBy({...bookedBy, lastName: v})} />
                <InputBox label="WhatsApp Number*"  placeholder="0813..."          value={bookedBy.phone}     onChange={(v) => setBookedBy({...bookedBy, phone: v})} />
                <InputBox label="Email Address"     placeholder="john@example.com" value={bookedBy.email}     onChange={(v) => setBookedBy({...bookedBy, email: v})} />
              </div>
            </div>

            {/* ── Passenger Details ─────────────────────────────────────── */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-50">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Users size={22} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Passenger Details</h2>
              </div>
              <div className="space-y-5">
                {passengerData.map((pax, i) => (
                  <div key={i} className="border border-slate-100 rounded-[30px] overflow-hidden transition-all hover:border-blue-100">
                    <button
                      onClick={() => setOpenPaxIndex(openPaxIndex === i ? -1 : i)}
                      className="w-full flex items-center justify-between p-7 bg-white"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                          openPaxIndex === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">
                          {pax.fullName || `Passenger ${i + 1}`}
                        </span>
                      </div>
                      {openPaxIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openPaxIndex === i && (
                      <div className="p-10 pt-2 bg-white border-t border-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gender*</label>
                            <div className="flex gap-10">
                              {['Male', 'Female'].map((g) => (
                                <label key={g} className="flex items-center gap-4 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`gender-${i}`}
                                    checked={pax.gender === g}
                                    onChange={() => handlePaxChange(i, 'gender', g)}
                                    className="hidden"
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    pax.gender === g ? 'border-blue-600' : 'border-slate-200'
                                  }`}>
                                    {pax.gender === g && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                  </div>
                                  <span className={`text-[11px] font-black uppercase ${pax.gender === g ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {g}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <InputBox label="Full Name*"    placeholder="As per ID/Passport" value={pax.fullName}    onChange={(v) => handlePaxChange(i, 'fullName', v)} />
                          <InputBox label="Age*"          placeholder="Age" type="number"  value={pax.age}         onChange={(v) => handlePaxChange(i, 'age', v)} />
                          <InputBox label="Nationality*"  placeholder="Example: Indonesia" value={pax.nationality} onChange={(v) => handlePaxChange(i, 'nationality', v)} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Payment Selection + WA Announcement ──────────────────── */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-50">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <CreditCard size={22} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Payment Selection</h2>
              </div>

              {/* ── WA Announcement Banner ─────────────────────────────── */}
              <div className="mb-8 bg-[#dcfce7] border border-[#86efac] rounded-[20px] p-5 flex gap-4 items-start">
                {/* WA icon */}
                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-black text-green-800 uppercase tracking-wide mb-1">
                    Pembayaran via WhatsApp
                  </p>
                  <p className="text-[11px] text-green-700 leading-relaxed">
                    Setelah klik <strong>"Confirm Order"</strong>, kamu akan diarahkan ke <strong>WhatsApp</strong> untuk mengirimkan konfirmasi booking dan melanjutkan proses pembayaran bersama tim kami.
                  </p>
                </div>
              </div>

              {/* ── Info metode pembayaran ─────────────────────────────── */}
              <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-[16px] px-5 py-4">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Pilih metode pembayaran yang ingin kamu gunakan. Tim kami akan memandu proses pembayaran via WhatsApp sesuai metode yang dipilih.
                </p>
              </div>

              {/* ── Grid metode pembayaran ─────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative flex flex-col items-center justify-center p-8 rounded-[30px] border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50/30'
                        : 'border-slate-50 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={method.img}
                      alt={method.name}
                      className={`h-8 w-full object-contain mb-3 ${
                        selectedMethod === method.id ? '' : 'grayscale opacity-40'
                      }`}
                    />
                    <span className={`text-[9px] font-black uppercase ${
                      selectedMethod === method.id ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {method.name}
                    </span>
                    {/* WA badge kecil di setiap kartu */}
                    <div className="mt-2 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-[8px] font-bold text-[#25D366]">via WA</span>
                    </div>
                    {selectedMethod === method.id && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Order Summary Sidebar ──────────────────────────────────── */}
          <aside className="w-full lg:w-[37%]">
            <div className="bg-white rounded-[45px] p-10 shadow-2xl border border-slate-50 sticky top-10">
              <div className="space-y-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transport Detail</p>
                    <p className="text-xs font-black uppercase">{data.route}</p>
                    <p className="text-[10px] font-bold text-blue-600">{data.departDate} • {data.time} WITA</p>
                    {data.isRoundTrip && (
                      <p className="text-[10px] font-bold text-sky-600 mt-1 uppercase">
                        Return: {data.returnDate} • {data.returnTime} WITA
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-10 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                    <p className="text-[10px] font-bold text-slate-600">{totalPaxCount} Person</p>
                  </div>
                  <h3 className="text-4xl font-black text-[#003B6D] tracking-tighter">
                    <span className="text-sm align-top mr-1 font-black">{CURRENCY_DATA[data.currency].symbol}</span>
                    {getConvertedPrice()}
                  </h3>
                </div>

                <div className="space-y-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-1 accent-blue-600 h-4 w-4 rounded-md"
                    />
                    <span className="text-[9px] font-black text-slate-400 uppercase leading-relaxed transition-colors group-hover:text-slate-600">
                      I confirm that all passenger data is correct and agree with T&C.
                    </span>
                  </label>

                  {/* Confirm Order button dengan WA icon */}
                  <button 
                    onClick={handleProceedToPayment} 
                    disabled={!isAgreed || loading} 
                    className={`w-full py-6 rounded-[25px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                      isAgreed && !loading
                        ? 'bg-[#003B6D] text-white hover:bg-[#001D35]'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <MessageCircle size={16} />
                        Confirm & Continue to WA
                      </>
                    )}
                  </button>

                  {/* Reminder kecil di bawah tombol */}
                  {isAgreed && (
                    <p className="text-center text-[9px] text-slate-400 leading-relaxed">
                      Kamu akan diarahkan ke WhatsApp untuk konfirmasi pembayaran.
                    </p>
                  )}
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
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-5 px-7 outline-none focus:border-blue-300 focus:bg-white transition-all text-xs font-bold shadow-inner" 
        placeholder={placeholder} 
      />
    </div>
  );
}