import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Calendar, Clock, Users,
  ChevronDown, ArrowRight, Sun, Cloud, CloudLightning,
  ShieldCheck, Wind, Coffee, Zap, X, Info, Check,
  RefreshCw,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { getTransports } from '../services/TransportService';
import { getWeatherForTrip, forceRefreshWeather, getCacheInfo, getWeatherForHour } from '../services/weatherService';

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCY_DATA = {
  IDR: { symbol: 'IDR', rate: 1,     label: 'INDONESIA RUPIAH'     },
  USD: { symbol: '$',   rate: 15800, label: 'UNITED STATES DOLLAR' },
  AUD: { symbol: 'A$',  rate: 10400, label: 'AUSTRALIAN DOLLAR'    },
  CNY: { symbol: '¥',   rate: 2200,  label: 'CHINA YUAN RENMINBI'  },
};

const SOURCE_LABELS = {
  api:    { label: 'Live Data',  color: 'text-emerald-600', dot: 'bg-emerald-400' },
  cache:  { label: 'Cached',    color: 'text-sky-600',     dot: 'bg-sky-400'     },
  markov: { label: 'Predicted', color: 'text-amber-600',   dot: 'bg-amber-400'   },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultView() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // ── Transport State ──────────────────────────────────────────────────────
  const [transports, setTransports] = useState([]);
  const [loadingTransport, setLoadingTransport] = useState(false);

  // ── UI State ─────────────────────────────────────────────────────────────
  const [isDropdownOpen, setIsDropdownOpen]         = useState(false);
  const [selectedCurrency, setSelectedCurrency]     = useState('IDR');
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [currentStep, setCurrentStep]               = useState('departure');
  const [selectedDepartureTrip, setSelectedDepartureTrip] = useState(null);

  // ── Weather State ────────────────────────────────────────────────────────
  const [weatherData, setWeatherData]       = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError]     = useState(null);
  const [cacheInfo, setCacheInfo]           = useState(null);

  // ── Search Params ────────────────────────────────────────────────────────
  const searchParams = location.state || {
    route:       'Sanur - Nusa Penida',
    departDate:  new Date().toISOString().split('T')[0],
    passengers:  { adult: 1, child: 0, infant: 0 },
    isRoundTrip: false,
  };

  const { route, departDate, returnDate, passengers, isRoundTrip } = searchParams;

  const activeDate = currentStep === 'departure' ? departDate : (returnDate ?? departDate);
  const activeRouteFrom = currentStep === 'departure'
    ? route.split(' - ')[0]
    : route.split(' - ')[1];
  const activeRouteTo = currentStep === 'departure'
    ? route.split(' - ')[1]
    : route.split(' - ')[0];

  const filteredData = useMemo(
    () => transports.filter((t) => t.from === activeRouteFrom && t.to === activeRouteTo),
    [transports, activeRouteFrom, activeRouteTo]
  );

  // ── Fetch Transport ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoadingTransport(true);
      try {
        const data = await getTransports();
        setTransports(data || []);
      } catch (err) {
        console.error('Error fetching transport:', err);
      } finally {
        setLoadingTransport(false);
      }
    };
    fetchData();
  }, []);

  // ── Fetch Weather ────────────────────────────────────────────────────────
  const fetchWeather = useCallback(async (forceRefresh = false) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      if (forceRefresh) {
        await forceRefreshWeather(activeRouteFrom, activeDate);
      }
      const data = await getWeatherForTrip(activeDate, activeRouteFrom);
      setWeatherData(data);
      setCacheInfo(getCacheInfo());
    } catch (err) {
      console.error('Error fetching weather:', err);
      setWeatherError('Gagal mengambil data cuaca.');
    } finally {
      setLoadingWeather(false);
    }
  }, [activeDate, activeRouteFrom]);

  // Fetch weather setiap kali tanggal/lokasi berubah
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Auto-refresh setiap menit — jika jam tepat 06:00, fetch ulang dari API
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 6 && now.getMinutes() === 0) {
        fetchWeather(true);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // ── Click Outside Dropdown ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const convertPrice = (priceInIDR, currencyCode) => {
    const selected = CURRENCY_DATA[currencyCode];
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
    }).format(priceInIDR / selected.rate);
  };

  const handleSelectTrip = (trip) => {
    const totalPax = (passengers.adult || 0) + (passengers.child || 0);

    if (isRoundTrip && currentStep === 'departure') {
      setSelectedDepartureTrip(trip);
      setCurrentStep('return');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const departurePrice      = isRoundTrip ? selectedDepartureTrip.price : trip.price;
      const returnPrice         = isRoundTrip ? trip.price : 0;
      const combinedTicketPrice = Number(departurePrice) + Number(returnPrice);
      const finalTotalPriceIDR  = combinedTicketPrice * totalPax;

      navigate('/process-payment', {
        state: {
          ...searchParams,
          transportId:        isRoundTrip ? selectedDepartureTrip.ID : trip.ID,
          time:               isRoundTrip ? selectedDepartureTrip.time : trip.time,
          boatName:           isRoundTrip ? selectedDepartureTrip.transport_name : trip.transport_name,
          selectedTrip:       isRoundTrip ? selectedDepartureTrip : trip,
          selectedReturnTrip: isRoundTrip ? trip : null,
          returnTime:         isRoundTrip ? trip.time : null,
          isRoundTrip,
          currency:           selectedCurrency,
          departurePrice,
          returnPrice,
          totalPriceIDR:      finalTotalPriceIDR,
        },
      });
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const markovProbabilities = weatherData
    ? { sunny: weatherData.sunny, cloudy: weatherData.cloudy, rainy: weatherData.rainy }
    : { sunny: 0, cloudy: 0, rainy: 0 };

  const weatherResult = weatherData
    ? { status: weatherData.status, prob: weatherData.prob }
    : { status: '—', prob: 0 };

  const sourceInfo = SOURCE_LABELS[weatherData?.source] ?? SOURCE_LABELS.markov;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] overflow-x-hidden pb-20">

      {/* ── Weather Modal ──────────────────────────────────────────────────── */}
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
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black uppercase text-[#003B6D]">
                  Weather Prediction
                </h3>
                <button onClick={() => setIsWeatherModalOpen(false)}>
                  <X />
                </button>
              </div>

              {/* Source badge + cache info */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${sourceInfo.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot} inline-block`} />
                  {sourceInfo.label}
                </span>
                {cacheInfo?.fetchedAt && (
                  <span className="text-[9px] text-slate-400">
                    — Diperbarui:{' '}
                    {new Date(cacheInfo.fetchedAt).toLocaleTimeString('id-ID', {
                      hour:   '2-digit',
                      minute: '2-digit',
                    })}
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
                  <ProbabilityCard
                    label="Sunny"
                    value={markovProbabilities.sunny}
                    icon={<Sun size={18} />}
                    color="bg-amber-400"
                    isMain={weatherResult.status === 'Sunny'}
                  />
                  <ProbabilityCard
                    label="Cloudy"
                    value={markovProbabilities.cloudy}
                    icon={<Cloud size={18} />}
                    color="bg-sky-400"
                    isMain={weatherResult.status === 'Cloudy'}
                  />
                  <ProbabilityCard
                    label="Rainy"
                    value={markovProbabilities.rainy}
                    icon={<CloudLightning size={18} />}
                    color="bg-slate-400"
                    isMain={weatherResult.status === 'Rainy'}
                  />
                </div>
              )}

              {/* Hourly forecast bar (hanya jika ada data dari cache/API) */}
              {weatherData?.hourlyStates && (
                <div className="mb-6">
                  {/* Header + Legenda */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[8px] font-black uppercase text-slate-400">
                      Prakiraan Per Jam — Hari Ini
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
                        <span className="text-[7px] font-bold text-slate-400 uppercase">Sunny</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" />
                        <span className="text-[7px] font-bold text-slate-400 uppercase">Cloudy</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-slate-500 inline-block" />
                        <span className="text-[7px] font-bold text-slate-400 uppercase">Rainy</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm border-2 border-[#003B6D] inline-block" />
                        <span className="text-[7px] font-bold text-slate-400 uppercase">Now</span>
                      </span>
                    </div>
                  </div>
                  <HourlyBar hourlyStates={weatherData.hourlyStates} />
                </div>
              )}

              {/* Info box */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                <Info className="text-emerald-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] text-emerald-800 italic mb-1">
                    {weatherData?.source === 'cache' || weatherData?.source === 'api'
                      ? 'Data diambil dari Open-Meteo API. Jam-jam berikutnya diprediksi dengan model Markov.'
                      : 'Menggunakan model Markov Chain. Data API akan diambil pada jam 06:00.'}
                  </p>
                  {weatherError && (
                    <p className="text-[10px] text-red-500 mt-1">{weatherError}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Hero Header ────────────────────────────────────────────────────── */}
      <div className="relative h-[30vh] bg-[#001D35] flex flex-col items-center justify-center text-white overflow-hidden">
        <img
          src="/img/result-bg.png"
          className="absolute inset-0 w-full h-full object-cover"
          alt="bg"
        />
        <div className="absolute inset-0 bg-[#001D35]/80" />
        <div className="relative z-10 text-center">
          <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">
            {currentStep === 'departure' ? 'Departure' : 'Return Trip'}
          </h1>
          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Angel Billabong Fast Cruise
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">

        {/* ── Search Summary Bar ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl p-3 flex flex-col lg:flex-row gap-2 border border-slate-100">
          <div className="flex-[1.5] flex items-center justify-between px-6 py-4 bg-slate-50 rounded-xl">
            <span className="font-black text-sm uppercase">{activeRouteFrom}</span>
            <ArrowRight size={18} className="text-sky-500" />
            <span className="font-black text-sm uppercase">{activeRouteTo}</span>
          </div>
          <div className="flex-1 flex items-center gap-4 px-6 py-4 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden">
            <Users size={18} className="text-sky-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                Passengers
              </span>
              <span className="text-xs font-bold truncate">
                {passengers.adult} Adult
                {passengers.child > 0 ? `, ${passengers.child} Child` : ''}
              </span>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4 px-6 py-4 border-r border-slate-100">
            <Calendar size={18} className="text-sky-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">Travel Date</span>
              <span className="text-xs font-bold">{activeDate}</span>
            </div>
          </div>

          {/* Weather Badge */}
          <button
            onClick={() => setIsWeatherModalOpen(true)}
            className="bg-[#003B6D] text-white p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-sky-700 transition-colors"
          >
            {loadingWeather ? (
              <RefreshCw size={20} className="text-white animate-spin" />
            ) : (
              <Cloud size={20} className="text-white" />
            )}
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <p className="text-[8px] font-bold uppercase opacity-70">Weather Prediction</p>
                <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot} opacity-80`} />
              </div>
              <p className="text-[11px] font-black">
                {loadingWeather ? 'Loading...' : `${weatherResult.status} ${weatherResult.prob}%`}
              </p>
            </div>
          </button>
        </div>

        {/* ── Controls Row ─────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-10 mb-6 items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-black uppercase flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 hover:bg-slate-50"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm hover:border-sky-300 transition-all"
            >
              <span className="text-xs font-black text-[#003B6D]">{selectedCurrency}</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[100]"
                >
                  {Object.entries(CURRENCY_DATA).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedCurrency(key); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                        selectedCurrency === key
                          ? 'bg-sky-50 text-sky-600'
                          : 'hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase">{value.label}</span>
                      {selectedCurrency === key && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Trip Cards ───────────────────────────────────────────────────── */}
        {loadingTransport ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              No trips available for this route.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredData.map((trip) => {
const tripWeather = getWeatherForHour(activeDate, trip.time, activeRouteFrom);

return (
  <div
    key={trip.ID ?? trip.id}
    className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col sm:flex-row gap-8"
  >
    {/* Foto kapal */}
    <div className="w-full sm:w-1/3 h-40 bg-slate-100 rounded-2xl overflow-hidden relative flex-shrink-0">
      <img
        src="/img/boat1.png"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        alt="Boat"
      />
    </div>

    {/* Info kapal */}
    <div className="flex-1 flex flex-col justify-between min-w-0">
      <div>

        {/* Jam + weather */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-sky-500 shrink-0" />
            <span className="text-2xl font-black text-[#001D35]">
              {trip.time}
            </span>
          </div>

          <TripWeatherChip weather={tripWeather} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Feature icon={<Zap size={10} />} text="Fast Engine" />
          <Feature icon={<ShieldCheck size={10} />} text="Insured" />
          <Feature icon={<Coffee size={10} />} text="Snacks" />
          <Feature icon={<Wind size={10} />} text="AC Cabin" />
        </div>
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-slate-50">
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase">
            Starting From
          </p>
          <p className="text-lg font-black text-[#003B6D]">
            {CURRENCY_DATA[selectedCurrency].symbol}{' '}
            {convertPrice(trip.price, selectedCurrency)}
          </p>
        </div>

        <button
          onClick={() => handleSelectTrip(trip)}
          className="bg-[#003B6D] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-sky-600 transition-all"
        >
          Select
        </button>
      </div>
    </div>
  </div>
);
})}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Weather config per status ────────────────────────────────────────────────

const WEATHER_CONFIG = {
  Sunny: {
    bg:       'bg-amber-400',
    text:     'text-amber-900',
    chipBg:   'bg-amber-50',
    chipText: 'text-amber-700',
    chipBorder: 'border-amber-200',
    icon:     (s) => <Sun size={s} />,
  },
  Cloudy: {
    bg:       'bg-sky-400',
    text:     'text-sky-900',
    chipBg:   'bg-sky-50',
    chipText: 'text-sky-700',
    chipBorder: 'border-sky-200',
    icon:     (s) => <Cloud size={s} />,
  },
  Rainy: {
    bg:       'bg-slate-500',
    text:     'text-white',
    chipBg:   'bg-slate-100',
    chipText: 'text-slate-600',
    chipBorder: 'border-slate-200',
    icon:     (s) => <CloudLightning size={s} />,
  },
};

/**
 * Badge overlay di sudut kiri atas foto kapal
 * Menggantikan badge {trip.weather} yang sebelumnya statis
 */
function TripWeatherBadge({ weather }) {
  const cfg = WEATHER_CONFIG[weather?.status] ?? WEATHER_CONFIG.Sunny;
  return (
    <div className={`absolute top-3 left-3 ${cfg.bg} flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md`}>
      <span className="text-white">{cfg.icon(11)}</span>
      <span className="text-[8px] font-black text-white uppercase tracking-wide">
        {weather?.status}
      </span>
      <span className="text-[8px] font-black text-white/80">
        {weather?.prob}%
      </span>
    </div>
  );
}

/**
 * Chip kecil di samping jam keberangkatan
 */
function TripWeatherChip({ weather }) {
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



function ProbabilityCard({ label, value, icon, color, isMain }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
      isMain ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-white opacity-50'
    }`}>
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-white mb-2 shadow-lg`}>
        {icon}
      </div>
      <p className="text-[8px] font-black uppercase text-slate-400">{label}</p>
      <p className={`text-xs font-black ${isMain ? 'text-sky-600' : 'text-slate-900'}`}>
        {value}%
      </p>
    </div>
  );
}

/**
 * HourlyBar — setiap jam ditampilkan sebagai kartu vertikal kecil
 * berisi: jam, icon cuaca, label status — langsung terlihat tanpa hover.
 * Kuning = Sunny, Biru = Cloudy, Abu = Rainy
 * Jam sekarang diberi highlight ring biru
 */
function HourlyBar({ hourlyStates }) {
  const now = new Date().getHours();

  const STATE_CONFIG = [
    {
      label:   'Sunny',
      short:   'Sun',
      bg:      'bg-amber-50',
      border:  'border-amber-200',
      dot:     'bg-amber-400',
      text:    'text-amber-700',
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-amber-400">
          <circle cx="12" cy="12" r="5"/>
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-400">
            <line x1="12" y1="2"  x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="2"  y1="12" x2="4"  y2="12"/>
            <line x1="20" y1="12" x2="22" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </g>
        </svg>
      ),
    },
    {
      label:   'Cloudy',
      short:   'Cld',
      bg:      'bg-sky-50',
      border:  'border-sky-200',
      dot:     'bg-sky-400',
      text:    'text-sky-700',
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-sky-400">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
      ),
    },
    {
      label:   'Rainy',
      short:   'Rain',
      bg:      'bg-slate-100',
      border:  'border-slate-300',
      dot:     'bg-slate-500',
      text:    'text-slate-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-slate-500">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
          <line x1="8"  y1="19" x2="8"  y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8"  y1="23" x2="8"  y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="18" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="22" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="19" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {hourlyStates.map((state, h) => {
        const cfg     = STATE_CONFIG[state] ?? STATE_CONFIG[0];
        const isNow   = h === now;
        const isPast  = h < now;

        return (
          <div
            key={h}
            className={`
              flex flex-col items-center gap-1 px-1.5 py-2 rounded-xl border transition-all
              ${isNow
                ? 'ring-2 ring-[#003B6D] ring-offset-1 border-[#003B6D] bg-[#003B6D]/5 shadow-md scale-105'
                : isPast
                  ? `${cfg.bg} ${cfg.border} opacity-40`
                  : `${cfg.bg} ${cfg.border}`
              }
            `}
            style={{ minWidth: '36px' }}
          >
            {/* Jam */}
            <span className={`text-[8px] font-black leading-none ${isNow ? 'text-[#003B6D]' : 'text-slate-500'}`}>
              {String(h).padStart(2, '0')}
            </span>

            {/* Icon cuaca */}
            <div className={isNow ? 'scale-110' : ''}>
              {cfg.icon}
            </div>

            {/* Label singkat */}
            <span className={`text-[7px] font-black uppercase leading-none ${isNow ? 'text-[#003B6D]' : cfg.text}`}>
              {cfg.short}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500">
      <span className="text-sky-400">{icon}</span>
      <span className="text-[9px] font-bold uppercase">{text}</span>
    </div>
  );
}