import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Ticket, Mail, ChevronRight, Loader2,
  CheckCircle2, Clock, ArrowRight, ArrowLeftRight,
  User, MapPin, Calendar, CreditCard, AlertCircle,
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/v1';

export default function MyReservationModal({ onClose }) {
  const [bookingCode, setBookingCode] = useState('');
  const [email, setEmail]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [reservation, setReservation] = useState(null);

  const handleLookup = async () => {
    if (!bookingCode.trim() || !email.trim()) {
      setError('Booking code dan email wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    setReservation(null);

    try {
      const code = bookingCode.trim().toUpperCase();
      const emailVal = email.trim().toLowerCase();

      // Tentukan endpoint berdasarkan prefix kode booking:
      // TAB-xxx → trip booking, AB-xxx → transport booking
      const isTrip = code.startsWith('TAB-') || code.startsWith('TAB');
      const endpoint = isTrip
        ? `${API_BASE}/trip-books/lookup`
        : `${API_BASE}/transport_book/lookup`;

      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_code: code,
          email:        emailVal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Reservasi tidak ditemukan.');
        return;
      }

      // Tandai tipe booking untuk tampilan yang berbeda
      setReservation({ ...data, booking_type: isTrip ? 'trip' : 'transport' });
    } catch (err) {
      setError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLookup();
  };

  return (
    <motion.div className="fixed inset-0 z-[999] flex items-center justify-center px-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-[#003B6D] p-10 text-white relative sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold tracking-tight">My Reservation</h2>
          <p className="text-blue-100/60 text-sm mt-2">
            {reservation ? 'Detail tiket kamu' : 'Masukkan kode booking dan email kamu.'}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STATE: Form input ─────────────────────────────────────── */}
          {!reservation && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 space-y-8"
            >
              <div className="space-y-6">
                {/* Input Booking Code */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Booking Code
                  </label>
                  <div className="relative group">
                    <Ticket
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003B6D] transition-colors"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="e.g. AB-016 atau TAB-013"
                      value={bookingCode}
                      onChange={(e) => { setBookingCode(e.target.value); setError(''); }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-[#003B6D] transition-all font-medium text-slate-900 shadow-sm uppercase tracking-widest"
                    />
                  </div>
                </div>

                {/* Input Email */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003B6D] transition-colors"
                      size={20}
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-[#003B6D] transition-all font-medium text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4"
                >
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleLookup}
                disabled={loading}
                className="w-full bg-[#003B6D] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#002545] transition-all shadow-xl active:scale-95 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Retrieve Reservation
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                *Kode booking dikirim ke email kamu saat pembayaran dikonfirmasi.
              </p>
            </motion.div>
          )}

          {/* ── STATE: Ticket detail ──────────────────────────────────── */}
          {reservation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 space-y-6"
            >
              {/* Status badge */}
              <div className="flex justify-center">
                <span className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                  reservation.status === 'Sukses'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {reservation.status === 'Sukses'
                    ? <CheckCircle2 size={14} />
                    : <Clock size={14} />
                  }
                  {reservation.status === 'Sukses' ? 'Payment Confirmed' : 'Pending Payment'}
                </span>
              </div>

              {/* Booking code */}
              <div className="text-center bg-slate-50 rounded-2xl border border-slate-100 py-6 px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Booking Code</p>
                <p className="text-3xl font-black text-[#001D35] tracking-[4px] font-mono">
                  {reservation.booking_code}
                </p>
              </div>

              {/* Route — transport */}
              {reservation.booking_type === 'transport' && (
                <div className="flex items-center justify-center gap-4 bg-[#001D35] rounded-2xl px-6 py-4">
                  <span className="text-white font-black text-sm uppercase">{reservation.transport?.from || 'Sanur'}</span>
                  {reservation.is_round_trip
                    ? <ArrowLeftRight size={18} className="text-sky-400 stroke-[2.5px]" />
                    : <ArrowRight size={18} className="text-sky-400 stroke-[2.5px]" />
                  }
                  <span className="text-white font-black text-sm uppercase">{reservation.transport?.to || 'Nusa Penida'}</span>
                </div>
              )}

              {/* Route — trip */}
              {reservation.booking_type === 'trip' && (
                <div className="flex items-center justify-center gap-3 bg-[#001D35] rounded-2xl px-6 py-4">
                  <span className="text-sky-400 text-lg">🏝️</span>
                  <span className="text-white font-black text-sm uppercase tracking-wide">
                    {reservation.trip_name || 'Paket Tour'}
                  </span>
                </div>
              )}

              {/* Trip details — transport booking */}
              {reservation.booking_type === 'transport' && (
                <div className="space-y-3">
                  <DetailRow icon={<User size={14} />}      label="Pemesan"       value={reservation.customer_name} />
                  <DetailRow icon={<Calendar size={14} />}  label="Keberangkatan" value={`${reservation.departure_date} — ${reservation.departure_time} WITA`} />
                  {reservation.is_round_trip && (
                    <DetailRow icon={<Calendar size={14} />} label="Kepulangan"   value={`${reservation.return_date} — ${reservation.return_time} WITA`} />
                  )}
                  <DetailRow icon={<MapPin size={14} />}    label="Penumpang"     value={reservation.passanger_full_name} />
                  <DetailRow icon={<CreditCard size={14} />} label="Pembayaran"   value={reservation.payment} />
                  <DetailRow
                    icon={<CreditCard size={14} />}
                    label="Total"
                    value={`IDR ${Number(reservation.total_price).toLocaleString('id-ID')}`}
                    highlight
                  />
                </div>
              )}

              {/* Trip details — trip/tour booking */}
              {reservation.booking_type === 'trip' && (
                <div className="space-y-3">
                  <DetailRow icon={<User size={14} />}      label="Pemesan"    value={reservation.customer_name} />
                  <DetailRow icon={<MapPin size={14} />}    label="Paket Tour" value={reservation.trip_name} />
                  <DetailRow icon={<MapPin size={14} />}    label="Lokasi"     value={reservation.trip_location} />
                  <DetailRow icon={<Calendar size={14} />}  label="Tanggal"    value={reservation.date} />
                  <DetailRow icon={<User size={14} />}      label="Travelers"  value={reservation.travelers} />
                  <DetailRow icon={<CreditCard size={14} />} label="Pembayaran" value={reservation.payment} />
                  <DetailRow
                    icon={<CreditCard size={14} />}
                    label="Total"
                    value={`IDR ${Number(reservation.total_price).toLocaleString('id-ID')}`}
                    highlight
                  />
                </div>
              )}

              {/* Pending info box */}
              {reservation.status !== 'Sukses' && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Pembayaran kamu masih <strong>pending</strong>. Setelah admin mengkonfirmasi pembayaran, kamu akan mendapat notifikasi via WhatsApp dan email.
                  </p>
                </div>
              )}

              {/* Back button */}
              <button
                onClick={() => { setReservation(null); setBookingCode(''); setEmail(''); }}
                className="w-full border-2 border-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
              >
                ← Cari Reservasi Lain
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────

function DetailRow({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 text-slate-400 shrink-0">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xs font-bold text-right ${highlight ? 'text-[#003B6D] text-sm' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}