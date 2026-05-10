// src/pages/BookingView.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingSearch from '../components/Booking/BookingSearch';
import MyReservationModal from '../components/Booking/MyReservation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, MapPin, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function BookingView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 STATE API
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LISTENER UNTUK NAVBAR
  // Mendengarkan event 'openReservationModal' yang dikirim dari Navbar.jsx
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openReservationModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openReservationModal', handleOpenModal);
    };
  }, []);

  // 🔥 FETCH DATA DARI BACKEND
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/trips");

        const mappedTrips = res.data.map((item) => ({
          id: item.ID,
          img: "/img/trips1.png", 
          title: item.trips_name,
          location: item.location,
          benefits: [
            "Fastboat Return Ticket",
            "Driver as Guide",
            "Private Car & Petrol",
            "Entrance Fee to all Spot",
            "Lunch"
          ]
        }));

        setTrips(mappedTrips);
      } catch (err) {
        console.error("Error fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleBooking = (tripId) => {
    navigate(`/trip-detail/${tripId}`);
  };

  const handleGoToGallery = (e) => {
    e.preventDefault();
    navigate('/gallery');
  };

  return (
    <div className="bg-white min-h-screen relative font-['Poppins'] overflow-x-hidden">
      
      {/* MODAL POP-UP */}
      <AnimatePresence>
        {isModalOpen && (
          <MyReservationModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative h-[85vh] md:h-screen flex items-center justify-center text-white">
        <img src="/img/bookingpages-bg.png" className="absolute w-full h-full object-cover" alt="Hero Background" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 w-full max-w-7xl text-center px-6">
          <h1 className="text-4xl md:text-6xl mb-12 uppercase font-black tracking-tighter">
            {t('booking.hero_title', 'Book Your Boat Trip')}
          </h1>
          <BookingSearch />
        </div>
      </section>

      {/* TRIPS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl text-center font-black mb-16 uppercase tracking-tight">
          {t('booking.recommended_title', 'Recommended Trips')}
        </h2>

        {loading ? (
          <div className="text-center py-20 font-bold italic text-slate-300 animate-pulse">
            LOADING TRIPS...
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {trips.map((trip) => (
              <motion.div 
                key={trip.id} 
                whileHover={{ y: -10 }} 
                className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col border border-slate-50"
              >
                <div className="relative h-64 overflow-hidden">
                   <img src={trip.img} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt={trip.title} />
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-1">{trip.title}</h3>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                    <MapPin size={14} className="text-sky-500" /> {trip.location}
                  </div>

                  <div className="flex-grow space-y-2">
                    {trip.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs font-medium text-slate-600">
                        <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleBooking(trip.id)}
                    className="mt-8 bg-[#001D35] hover:bg-sky-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                  >
                    <Ticket size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                      {t('booking.book_now_btn', 'Book This Trip')}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* GALLERY CTA */}
      <section className="py-24 bg-slate-50 text-center px-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-[#001D35]">Capture The Moments</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto text-sm font-medium">Explore the beauty of our destinations through our lens.</p>

        <button
          onClick={handleGoToGallery}
          className="px-10 py-4 border-2 border-[#001D35] text-[#001D35] rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#001D35] hover:text-white transition-all"
        >
          {t('booking.view_all_gallery', 'view all gallery')}
        </button>
      </section>

    </div>
  );
}