import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Mail, Calendar, Users, Clock,
  UsersRound, Loader2, Check, Cloud, Sun, CloudLightning,
  Info, RefreshCw, X, MessageCircle, AlertCircle
} from 'lucide-react';
import { createTripBook } from '../services/TripBookService';
import {
  getWeatherForTrip,
  forceRefreshWeather,
  getCacheInfo
} from '../services/weatherService';

// ─── Payment Methods (8 metode, sama dengan transport) ────────────────────────
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

const SOURCE_LABELS = {
  api:    { label: 'Live Data',  color: 'text-emerald-600', dot: 'bg-emerald-400' },
  cache:  { label: 'Cached',    color: 'text-sky-600',     dot: 'bg-sky-400'     },
  markov: { label: 'Predicted', color: 'text-amber-600',   dot: 'bg-amber-400'   },
};

const WEATHER_CONFIG = {
  Sunny:  { bg: 'bg-amber-400',  icon: (s) => <Sun size={s} />,            chipText: 'text-amber-700',  chipBg: 'bg-amber-50',  chipBorder: 'border-amber-200' },
  Cloudy: { bg: 'bg-sky-400',    icon: (s) => <Cloud size={s} />,          chipText: 'text-sky-700',    chipBg: 'bg-sky-50',    chipBorder: 'border-sky-200'   },
  Rainy:  { bg: 'bg-slate-500',  icon: (s) => <CloudLightning size={s} />, chipText: 'text-slate-600',  chipBg: 'bg-slate-100', chipBorder: 'border-slate-200' },
};

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#25D366]">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function ProbabilityCard({ label, value, icon, color, isMain }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${isMain ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-white opacity-50'}`}>
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-white mb-2 shadow-lg`}>{icon}</div>
      <p className="text-[8px] font-black uppercase text-slate-400">{label}</p>
      <p className={`text-xs font-black ${isMain ? 'text-sky-600' : 'text-slate-900'}`}>{value}%</p>
    </div>
  );
}

export default function TripBookingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const bookingData = location.state || {
    trip: { id: 1, title: "Nusa Penida Trip", price: 299000, img: "/img/trips1.png" },
    passengers: 1,
    bookingDate: new Date().toISOString().split('T')[0],
    totalPrice: 299000,
    schedule: { time: "07.30 - 08.15" }
  };

  const [loading, setLoading]               = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('QRIS');
  const [isAgreed, setIsAgreed]             = useState(false);
  const [contactInfo, setContactInfo]       = useState({ email: '', phone: '' });
  const [passengerNames, setPassengerNames] = useState(Array(bookingData.passengers).fill(''));
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [weatherData, setWeatherData]               = useState(null);
  const [loadingWeather, setLoadingWeather]         = useState(false);
  const [weatherError, setWeatherError]             = useState(null);
  const [cacheInfo, setCacheInfo]                   = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const tripDate     = bookingData.bookingDate || new Date().toISOString().split('T')[0];
  const tripLocation = 'Nusa Penida';

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      if (forceRefresh) await forceRefreshWeather(tripLocation, tripDate);
      const data = await getWeatherForTrip(tripDate, tripLocation);
      setWeatherData(data);
      setCacheInfo(getCacheInfo());
    } catch (err) {
      setWeatherError('Gagal mengambil data cuaca.');
    } finally {
      setLoadingWeather(false);
    }
  }, [tripDate, tripLocation]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 6 && now.getMinutes() === 0) fetchWeather(true);
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const markovProbabilities = weatherData
    ? { sunny: weatherData.sunny, cloudy: weatherData.cloudy, rainy: weatherData.rainy }
    : { sunny: 0, cloudy: 0, rainy: 0 };
  const weatherResult = weatherData
    ? { status: weatherData.status, prob: weatherData.prob }
    : { status: '—', prob: 0 };
  const sourceInfo = SOURCE_LABELS[weatherData?.source] ?? SOURCE_LABELS.markov;
  const weatherCfg = WEATHER_CONFIG[weatherResult.status] ?? WEATHER_CONFIG.Sunny;

  const handleContactChange = (e) => setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  const handleNameChange    = (index, value) => {
    const newNames = [...passengerNames];
    newNames[index] = value;
    setPassengerNames(newNames);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) { alert("Harap setujui syarat dan ketentuan terlebih dahulu."); return; }
    setLoading(true);

    const allNames    = passengerNames.join(', ');
    const tripTitle   = bookingData.trip?.title || bookingData.trip?.trips_name || bookingData.trip?.TripsName || "Paket Tour";
    const sessionTime = bookingData.schedule?.time || "";

    try {
      const payload = {
        trips_id:         Number(id),
        customer_name:    passengerNames[0],
        email:            contactInfo.email,
        whatsapp:         contactInfo.phone,
        booking_date:     bookingData.bookingDate,
        date:             bookingData.bookingDate,
        total_passengers: Number(bookingData.passengers),
        total_price:      Number(bookingData.totalPrice),
        payment:          selectedMethod,
        status:           "Pending",
        full_name:        allNames,
        travelers:        `${bookingData.passengers} Person`,
        tour_name:        tripTitle,
        trip_name:        tripTitle,
        tour_session:     sessionTime,
      };

      await createTripBook(payload);

      const waMessage =
        `*NEW TRIP BOOKING - ANGEL BILLABONG*\n\n` +
        `*Customer:* ${passengerNames[0]}\n` +
        `*Paket:* ${tripTitle}\n` +
        `*Tanggal:* ${bookingData.bookingDate}\n` +
        `*Sesi:* ${sessionTime}\n` +
        `*Travelers:* ${bookingData.passengers} Orang (${allNames})\n` +
        `*WhatsApp:* ${contactInfo.phone}\n` +
        `*Email:* ${contactInfo.email}\n` +
        `*Payment Method:* ${selectedMethod}\n` +
        `*Total:* IDR ${bookingData.totalPrice.toLocaleString('id-ID')}\n\n` +
        `Please confirm my booking.`;

      window.open(`https://wa.me/6281338134797?text=${encodeURIComponent(waMessage)}`, '_blank');
      navigate('/');
    } catch (error) {
      alert("Maaf, gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F7FA] min-h-screen font-['Poppins'] pt-24 pb-20">

      {/* Weather Modal */}
      <AnimatePresence>
        {isWeatherModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWeatherModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black uppercase text-[#003B6D]">Weather Prediction</h3>
                <button onClick={() => setIsWeatherModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${sourceInfo.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot} inline-block`} />{sourceInfo.label}
                </span>
                {cacheInfo?.fetchedAt && (
                  <span className="text-[9px] text-slate-400">
                    — Diperbarui: {new Date(cacheInfo.fetchedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button onClick={() => fetchWeather(true)} disabled={loadingWeather}
                  className="ml-auto flex items-center gap-1 text-[9px] text-sky-500 font-black uppercase hover:text-sky-700 disabled:opacity-40">
                  <RefreshCw size={11} className={loadingWeather ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
              {loadingWeather ? (
                <div className="flex justify-center items-center h-24"><RefreshCw size={20} className="animate-spin text-slate-400" /></div>
              ) : (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <ProbabilityCard label="Sunny"  value={markovProbabilities.sunny}  icon={<Sun size={18} />}           color="bg-amber-400" isMain={weatherResult.status === 'Sunny'}  />
                  <ProbabilityCard label="Cloudy" value={markovProbabilities.cloudy} icon={<Cloud size={18} />}         color="bg-sky-400"   isMain={weatherResult.status === 'Cloudy'} />
                  <ProbabilityCard label="Rainy"  value={markovProbabilities.rainy}  icon={<CloudLightning size={18} />} color="bg-slate-400" isMain={weatherResult.status === 'Rainy'}  />
                </div>
              )}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                <Info className="text-emerald-600 shrink-0" size={20} />
                <p className="text-[11px] text-emerald-800 italic leading-relaxed">
                  {weatherData?.source === 'cache' || weatherData?.source === 'api'
                    ? 'Data diambil dari Open-Meteo API. Jam-jam berikutnya diprediksi dengan model Markov.'
                    : 'Menggunakan model Markov Chain. Data API akan diambil pada jam 06:00.'}
                </p>
              </div>
              {weatherError && <p className="text-[10px] text-red-500 mt-3">{weatherError}</p>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-[#001D3D] transition-all font-black text-[11px] uppercase tracking-[0.2em] mb-3">
              <ChevronLeft size={18} /> Edit Booking
            </button>
            <h1 className="text-3xl font-black text-[#001D3D] uppercase tracking-tighter">Passenger Details</h1>
          </div>
          <button onClick={() => setIsWeatherModalOpen(true)}
            className="bg-[#003B6D] text-white px-5 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-sky-700 transition-colors self-start md:self-auto">
            {loadingWeather ? <RefreshCw size={20} className="animate-spin" /> : <Cloud size={20} />}
            <div className="leading-tight text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-[8px] font-bold uppercase opacity-70">Weather Prediction</p>
                <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot} opacity-80`} />
              </div>
              <p className="text-[11px] font-black">{loadingWeather ? 'Loading...' : `${weatherResult.status} ${weatherResult.prob}%`}</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Form */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Contact Info */}
              <div className="bg-white rounded-[35px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-white">
                <h2 className="flex items-center gap-3 text-sm font-black text-[#001D3D] uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">
                  <Mail size={18} className="text-sky-500" /> Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input required name="email" value={contactInfo.email} onChange={handleContactChange} type="email" placeholder="john@example.com"
                      className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-bold text-[#001D3D] outline-none border-2 border-transparent focus:border-sky-500/20 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <input required name="phone" value={contactInfo.phone} onChange={handleContactChange} type="tel" placeholder="+62 812..."
                      className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-bold text-[#001D3D] outline-none border-2 border-transparent focus:border-sky-500/20 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Passenger Names */}
              <div className="bg-white rounded-[35px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-white">
                <h2 className="flex items-center gap-3 text-sm font-black text-[#001D3D] uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">
                  <UsersRound size={18} className="text-sky-500" /> Passenger Names
                </h2>
                <div className="space-y-6">
                  {passengerNames.map((name, index) => (
                    <div key={index} className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Passenger {index + 1} Full Name</label>
                      <input required type="text" value={name} onChange={(e) => handleNameChange(index, e.target.value)}
                        placeholder={`Enter name for passenger ${index + 1}`}
                        className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-bold text-[#001D3D] outline-none border-2 border-transparent focus:border-sky-500/20 focus:bg-white transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Payment Selection — identik style ProcessPayment */}
              <div className="bg-white rounded-[35px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-white">

                {/* Info WA hijau */}
                <div className="mb-6 flex items-start gap-4 bg-green-50 border border-green-100 rounded-[20px] px-5 py-4">
                  <div className="w-10 h-10 bg-[#25D366] rounded-2xl flex items-center justify-center shrink-0">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-green-800 uppercase tracking-wide mb-1">Pembayaran via WhatsApp</p>
                    <p className="text-[11px] text-green-700 leading-relaxed">
                      Setelah klik <strong>"Confirm Order"</strong>, kamu akan diarahkan ke <strong>WhatsApp</strong> untuk mengirimkan konfirmasi booking dan melanjutkan proses pembayaran bersama tim kami.
                    </p>
                  </div>
                </div>

                {/* Info kuning */}
                <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-[16px] px-5 py-4">
                  <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Pilih metode pembayaran yang ingin kamu gunakan. Tim kami akan memandu proses pembayaran via WhatsApp sesuai metode yang dipilih.
                  </p>
                </div>

                {/* Grid 8 metode */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} type="button" onClick={() => setSelectedMethod(method.id)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all ${
                        selectedMethod === method.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'
                      }`}>
                      <img src={method.img} alt={method.name}
                        className={`h-8 w-full object-contain mb-3 ${selectedMethod === method.id ? '' : 'grayscale opacity-40'}`} />
                      <span className={`text-[9px] font-black uppercase ${selectedMethod === method.id ? 'text-blue-600' : 'text-slate-400'}`}>
                        {method.name}
                      </span>
                      <div className="mt-2 flex items-center gap-1">
                        <WAIcon />
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

                {/* T&C + Tombol */}
                <div className="mt-8 space-y-5">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-1 accent-blue-600 h-4 w-4 rounded-md" />
                    <span className="text-[9px] font-black text-slate-400 uppercase leading-relaxed group-hover:text-slate-600">
                      I confirm that all passenger data is correct and agree with T&C.
                    </span>
                  </label>

                  <button type="submit" disabled={!isAgreed || loading}
                    className={`w-full py-6 rounded-[25px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                      isAgreed && !loading ? 'bg-[#003B6D] text-white hover:bg-[#001D35]' : 'bg-slate-100 text-slate-300'
                    }`}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><MessageCircle size={16} /> Confirm & Continue to WA</>}
                  </button>

                  {isAgreed && !loading && (
                    <p className="text-center text-[9px] text-slate-400 leading-relaxed">
                      Kamu akan diarahkan ke WhatsApp untuk konfirmasi pembayaran.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[35px] overflow-hidden shadow-xl border border-white sticky top-28">
              <div className="h-40 overflow-hidden relative">
                <img src={bookingData.trip.img} alt="Trip" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001D3D] to-transparent opacity-60" />
                <div className="absolute bottom-4 left-6 text-white font-black text-lg uppercase tracking-tighter">
                  {bookingData.trip?.title || bookingData.trip?.trips_name || "Paket Tour"}
                </div>
              </div>
              <div className="p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-sky-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-black text-[#001D3D]">{bookingData.bookingDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Users size={18} className="text-sky-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travelers</p>
                    <p className="text-sm font-black text-[#001D3D]">{bookingData.passengers} Person</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock size={18} className="text-sky-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour Session</p>
                    <p className="text-sm font-black text-[#001D3D]">{bookingData.schedule?.time}</p>
                  </div>
                </div>
                <div onClick={() => setIsWeatherModalOpen(true)}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-sky-200 transition-all">
                  <div className={`w-9 h-9 ${weatherCfg.bg} rounded-xl flex items-center justify-center text-white shadow`}>
                    {weatherCfg.icon(16)}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weather on Tour Day</p>
                    <p className="text-xs font-black text-[#001D3D]">
                      {loadingWeather ? 'Loading...' : `${weatherResult.status} ${weatherResult.prob}%`}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-black text-sky-600">IDR {bookingData.totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}