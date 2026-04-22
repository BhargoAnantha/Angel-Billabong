import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, CheckCircle, Ticket, 
  Calendar, Minus, Plus, Info, ShieldCheck, Star, Loader2
} from 'lucide-react';

// DATA DUMMY
const MOCK_TRIPS = {
  "1": {
    id: 1,
    title: "West Trip Tour",
    location: "NUSA PENIDA",
    price: 299000,
    img: "/img/trips1.png",
    description: "Explore the breathtaking western coast of Nusa Penida. Visit the iconic Kelingking Beach, Broken Beach, and the natural infinity pool of Angel's Billabong.",
    benefits: ["Fastboat Return Ticket", "Driver as Guide", "Private Car & Petrol", "Entrance Fee to all Spot", "Lunch"],
    schedules: [
      { id: "s1", time: "07.30 - 08.15", status: "Optimal" },
      { id: "s2", time: "08.30 - 09.15", status: "Moderate" },
      { id: "s3", time: "14.15 - 15.00", status: "Optimal" }
    ]
  },
  "2": {
    id: 2,
    title: "East Trip Tour",
    location: "NUSA PENIDA",
    price: 299000,
    img: "/img/trips2.png",
    description: "Discover the hidden gems of the eastern side. Visit Diamond Beach, Atuh Beach, and the famous Thousand Islands viewpoint with its iconic treehouse.",
    benefits: ["Fastboat Return Ticket", "Driver as Guide", "Private Car & Petrol", "Entrance Fee to all Spot", "Lunch"],
    schedules: [
      { id: "s1", time: "07.30 - 08.15", status: "Optimal" },
      { id: "s2", time: "08.30 - 09.15", status: "Optimal" }
    ]
  },
  "3": {
    id: 3,
    title: "Snorkeling Trip",
    location: "NUSA PENIDA",
    price: 299000,
    img: "/img/trips3.png",
    description: "Dive into the crystal clear waters of Nusa Penida. Swim with Manta Rays and explore 4 beautiful spots: Manta Bay, Gamat Bay, Crystal Bay, and Wall Bay.",
    benefits: ["Fastboat Return Ticket", "Sharing Boat Snorkeling", "Snorkeling Gear & Towel", "Life Jacket & Guide", "Lunch"],
    schedules: [
      { id: "s1", time: "08.00 - 12.00", status: "Optimal" },
      { id: "s2", time: "13.00 - 17.00", status: "Moderate" }
    ]
  }
};

export default function TripDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingDate, setBookingDate] = useState(today); // Default ke hari ini
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      const foundTrip = MOCK_TRIPS[id];
      if (foundTrip) {
        setTrip(foundTrip);
      } else {
        setTrip(MOCK_TRIPS["1"]);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
    </div>
  );

  const totalPrice = trip.price * passengers;

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
          {/* LEFT: Trip Info */}
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

          {/* RIGHT: Booking Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/60 border border-slate-50"
            >
              <h3 className="text-[#001D3D] font-black text-xl mb-8 uppercase tracking-tighter">Booking Details</h3>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Select Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
                    <input 
                      type="date" 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)} 
                      min={today} // MEMBATASI TANGGAL: Tidak bisa memilih sebelum hari ini
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-none shadow-inner cursor-pointer" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Total Travelers</label>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100">
                    <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-sky-500 active:scale-90 transition-all cursor-pointer"><Minus size={18} /></button>
                    <div className="text-center px-4">
                      <span className="text-xl font-black text-[#001D3D]">{passengers}</span>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-tighter">Person</span>
                    </div>
                    <button onClick={() => setPassengers(passengers + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-sky-500 active:scale-90 transition-all cursor-pointer"><Plus size={18} /></button>
                  </div>
                </div>

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
                          ${selectedSchedule === s.id ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                      >
                        <div className="text-left">
                          <p className="font-black text-[15px] text-[#001D3D]">{s.time}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${s.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {s.status}
                          </span>
                        </div>
                        {selectedSchedule === s.id ? <CheckCircle size={22} className="text-sky-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                      </button>
                    ))}
                  </div>
                </div>

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