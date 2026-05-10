import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MapPin, CheckCircle, Ticket,
  Calendar, Minus, Plus, ShieldCheck, Star, Loader2,
  Cloud, Sun, CloudLightning, Info, RefreshCw, X
} from 'lucide-react';
import axios from 'axios';
import {
  getWeatherForTrip,
  getWeatherForHour,
  forceRefreshWeather,
  getCacheInfo
} from '../services/weatherService';

// ─── Weather Config (sama persis dengan ResultView) ───────────────────────────

const SOURCE_LABELS = {
  api:    { label: 'Live Data',  color: 'text-emerald-600', dot: 'bg-emerald-400' },
  cache:  { label: 'Cached',    color: 'text-sky-600',     dot: 'bg-sky-400'     },
  markov: { label: 'Predicted', color: 'text-amber-600',   dot: 'bg-amber-400'   },
};

const WEATHER_CONFIG = {
  Sunny:  {
    bg: 'bg-amber-400', chipBg: 'bg-amber-50', chipText: 'text-amber-700', chipBorder: 'border-amber-200',
    icon: (s) => <Sun size={s} />,
  },
  Cloudy: {
    bg: 'bg-sky-400', chipBg: 'bg-sky-50', chipText: 'text-sky-700', chipBorder: 'border-sky-200',
    icon: (s) => <Cloud size={s} />,
  },
  Rainy:  {
    bg: 'bg-slate-500', chipBg: 'bg-slate-100', chipText: 'text-slate-600', chipBorder: 'border-slate-200',
    icon: (s) => <CloudLightning size={s} />,
  },
};

// ─── Weather Chip — ditempel di setiap baris Tour Session ─────────────────────
// Sama persis dengan TripWeatherChip di ResultView

function SessionWeatherChip({ dateStr, timeStr }) {
  // timeStr format: "07.30 - 08.15" → ambil jam pertama → "07:30"
  const normalizedTime = timeStr?.split(' - ')[0]?.replace('.', ':') ?? '07:00';
  const weather = getWeatherForHour(dateStr, normalizedTime, 'Nusa Penida');
  const cfg = WEATHER_CONFIG[weather?.status] ?? WEATHER_CONFIG.Sunny;

  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${cfg.chipBg} ${cfg.chipBorder}`}>
      <span className={cfg.chipText}>{cfg.icon(11)}</span>
      <span className={`text-[9px] font-black uppercase ${cfg.chipText}`}>
        {weather?.status}
      </span>
      <span className={`text-[9px] font-bold ${cfg.chipText} opacity-70`}>
        {weather?.prob}%
      </span>
    </div>
  );
}

// ─── Probability Card (untuk modal) ──────────────────────────────────────────

function ProbabilityCard({ label, value, icon, color, isMain }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
      isMain ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-white opacity-50'
    }`}>
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-white mb-2 shadow-lg`}>
        {icon}
      </div>
      <p className="text-[8px] font-black uppercase text-slate-400">{label}</p>
      <p className={`text-xs font-black ${isMain ? 'text-sky-600' : 'text-slate-900'}`}>{value}%</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  // ── Trip State ────────────────────────────────────────────────────────────
  const [trip, setTrip]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingDate, setBookingDate]     = useState(today);
  const [passengers, setPassengers]       = useState(1);

  // ── Weather State ─────────────────────────────────────────────────────────
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [weatherData, setWeatherData]               = useState(null);
  const [loadingWeather, setLoadingWeather]         = useState(false);
  const [weatherError, setWeatherError]             = useState(null);
  const [cacheInfo, setCacheInfo]                   = useState(null);

  // ── Fetch Trip ────────────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTripDetail = async () => {
      try {
        setLoading(true);
        const res  = await axios.get(`http://localhost:8080/api/v1/trips/${id}`);
        const data = res.data;
        setTrip({
          id:          data.ID,
          title:       data.trips_name,
          location:    data.location || "NUSA PENIDA",
          price:       data.price,
          img:         data.image || "/img/trips1.png",
          description: data.description,
          benefits:    data.include ? data.include.split(', ') : ["Fastboat Return Ticket", "Lunch"],
          schedules: [
            { id: "s1", time: "07.30 - 08.15", status: "Optimal"  },
            { id: "s2", time: "08.30 - 09.15", status: "Moderate" },
            { id: "s3", time: "14.15 - 15.00", status: "Optimal"  },
          ]
        });
      } catch (err) {
        console.error("Error fetch detail trip:", err);
        alert("Trip tidak ditemukan atau server bermasalah.");
        navigate('/booking');
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetail();
  }, [id, navigate]);

  // ── Fetch Weather — re-run setiap bookingDate berubah ────────────────────
  const fetchWeather = useCallback(async (forceRefresh = false) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      if (forceRefresh) {
        await forceRefreshWeather('Nusa Penida', bookingDate);
      }
      const data = await getWeatherForTrip(bookingDate, 'Nusa Penida');
      setWeatherData(data);
      setCacheInfo(getCacheInfo());
    } catch (err) {
      console.error('Weather error:', err);
      setWeatherError('Gagal mengambil data cuaca.');
    } finally {
      setLoadingWeather(false);
    }
  }, [bookingDate]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // Auto-refresh jam 06:00
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 6 && now.getMinutes() === 0) fetchWeather(true);
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // ── Derived Weather ───────────────────────────────────────────────────────
  const markovProbs  = weatherData
    ? { sunny: weatherData.sunny, cloudy: weatherData.cloudy, rainy: weatherData.rainy }
    : { sunny: 0, cloudy: 0, rainy: 0 };
  const weatherResult = weatherData
    ? { status: weatherData.status, prob: weatherData.prob }
    : { status: '—', prob: 0 };
  const sourceInfo   = SOURCE_LABELS[weatherData?.source] ?? SOURCE_LABELS.markov;
  const weatherCfg   = WEATHER_CONFIG[weatherResult.status] ?? WEATHER_CONFIG.Sunny;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="w-10 h-10 text-[#001D3D] animate-spin" />
    </div>
  );

  const totalPrice  = trip ? trip.price * passengers : 0;

  const handleBooking = () => {
    navigate(`/book-trip/${id}`, {
      state: {
        trip,
        passengers,
        bookingDate,
        totalPrice,
        schedule: trip.schedules.find(s => s.id === selectedSchedule)
      }
    });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Poppins']">

      {/* ── Weather Modal — identik dengan ResultView ── */}
      <AnimatePresence>
        {isWeatherModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWeatherModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black uppercase text-[#003B6D]">Weather Prediction</h3>
                <button onClick={() => setIsWeatherModalOpen(false)}><X size={20} /></button>
              </div>

              {/* Source + Refresh */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${sourceInfo.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot} inline-block`} />
                  {sourceInfo.label}
                </span>
                {cacheInfo?.fetchedAt && (
                  <span className="text-[9px] text-slate-400">
                    — Diperbarui: {new Date(cacheInfo.fetchedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button
                  onClick={() => fetchWeather(true)}
                  disabled={loadingWeather}
                  className="ml-auto flex items-center gap-1 text-[9px] text-sky-500 font-black uppercase hover:text-sky-700 disabled:opacity-40"
                >
                  <RefreshCw size={11} className={loadingWeather ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {/* Probability Cards */}
              {loadingWeather ? (
                <div className="flex justify-center items-center h-24">
                  <RefreshCw size={20} className="animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <ProbabilityCard label="Sunny"  value={markovProbs.sunny}  icon={<Sun size={18} />}          color="bg-amber-400" isMain={weatherResult.status === 'Sunny'}  />
                  <ProbabilityCard label="Cloudy" value={markovProbs.cloudy} icon={<Cloud size={18} />}        color="bg-sky-400"   isMain={weatherResult.status === 'Cloudy'} />
                  <ProbabilityCard label="Rainy"  value={markovProbs.rainy}  icon={<CloudLightning size={18} />} color="bg-slate-400" isMain={weatherResult.status === 'Rainy'}  />
                </div>
              )}

              {/* Info box */}
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

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <button
            onClick={() => navigate('/booking')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#001D3D] transition-all font-black text-[11px] uppercase tracking-widest cursor-pointer"
          >
            <ChevronLeft size={20} /> Back to Selection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* ── LEFT: Trip Info ── */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white bg-white aspect-video"
            >
              <img src={trip.img} className="w-full h-full object-cover" alt={trip.title} />
            </motion.div>

            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-sky-500">
                  <MapPin size={18} />
                  <span className="font-black text-[12px] uppercase tracking-widest">{trip.location}</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
              </div>

              <h1 className="text-4xl font-black text-[#001D3D] mb-6 uppercase tracking-tighter">{trip.title}</h1>
              <p className="text-slate-500 leading-relaxed text-[16px] font-medium mb-12">{trip.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                <div className="space-y-4">
                  <h4 className="font-black text-[11px] uppercase tracking-widest text-slate-400 mb-4">What's Included</h4>
                  {trip.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-[13px] font-bold text-slate-700">
                      <CheckCircle size={18} className="text-emerald-500" /> {benefit}
                    </div>
                  ))}
                </div>
                <div className="bg-[#001D3D] rounded-[30px] p-8 text-white relative overflow-hidden flex flex-col justify-center">
                  <ShieldCheck size={100} className="absolute -right-5 -bottom-5 text-white/5" />
                  <ShieldCheck size={28} className="text-sky-400 mb-4" />
                  <h4 className="font-black text-[11px] uppercase tracking-widest text-sky-300 mb-2">Safe & Reliable</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">International safety standards applied for all our tour programs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Booking Sidebar ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/60 border border-slate-50"
            >
              <h3 className="text-[#001D3D] font-black text-xl mb-8 uppercase tracking-tighter">Booking Details</h3>

              <div className="space-y-8">

                {/* SELECT DATE */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Select Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={today}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-none shadow-inner cursor-pointer"
                    />
                  </div>
                </div>

                {/* TOTAL TRAVELERS */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Total Travelers</label>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100">
                    <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-sky-500 active:scale-90 transition-all cursor-pointer">
                      <Minus size={18} />
                    </button>
                    <div className="text-center px-4">
                      <span className="text-xl font-black text-[#001D3D]">{passengers}</span>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-tighter">Person</span>
                    </div>
                    <button onClick={() => setPassengers(passengers + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-sky-500 active:scale-90 transition-all cursor-pointer">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* ✅ WEATHER PREDICTION BADGE — di bawah Total Travelers */}
                {/* Klik untuk buka modal detail, sama seperti di ResultView */}
                <button
                  onClick={() => setIsWeatherModalOpen(true)}
                  className="w-full bg-[#003B6D] text-white px-5 py-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-sky-700 transition-colors"
                >
                  {loadingWeather ? (
                    <RefreshCw size={22} className="text-white animate-spin shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 ${weatherCfg.bg} rounded-xl flex items-center justify-center text-white shadow shrink-0`}>
                      {weatherCfg.icon(18)}
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[8px] font-bold uppercase opacity-70">Weather Prediction</p>
                      <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot} opacity-80`} />
                    </div>
                    <p className="text-[13px] font-black">
                      {loadingWeather ? 'Loading...' : `${weatherResult.status} ${weatherResult.prob}%`}
                    </p>
                    <p className="text-[9px] opacity-60 mt-0.5">Tap to see full prediction</p>
                  </div>
                  <Cloud size={18} className="opacity-30 shrink-0" />
                </button>

                {/* TOUR SESSION — setiap baris ada weather chip per jam ── */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour Session</label>
                  </div>

                  <div className="space-y-3">
                    {trip.schedules.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSchedule(s.id)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group cursor-pointer
                          ${selectedSchedule === s.id
                            ? 'border-sky-500 bg-sky-50 shadow-md'
                            : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                          }`}
                      >
                        {/* Kiri: Jam + status label */}
                        <div className="text-left">
                          <p className="font-black text-[15px] text-[#001D3D]">{s.time}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            s.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {s.status}
                          </span>
                        </div>

                        {/* Tengah: ✅ Weather chip per jam — sama seperti card transport */}
                        <SessionWeatherChip dateStr={bookingDate} timeStr={s.time} />

                        {/* Kanan: radio indicator */}
                        {selectedSchedule === s.id
                          ? <CheckCircle size={22} className="text-sky-500 shrink-0 ml-3" />
                          : <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0 ml-3" />
                        }
                      </button>
                    ))}
                  </div>
                </div>

                {/* TOTAL PRICE + BOOK BUTTON */}
                <div className="pt-8 border-t-2 border-dashed border-slate-100">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Total Price</p>
                      <p className="text-3xl font-black text-[#001D3D]">IDR {totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={!selectedSchedule}
                    className="w-full bg-[#001D3D] text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-sky-900 active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket size={18} /> Book This Trip
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}