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

  const [loading] = useState(false);

const trips = [
  {
    id: 1,
    img: "/img/trips1.png",
    title: "West Trip Tour",
    description:
      "Explore the breathtaking western coast of Nusa Penida. Visit the iconic Kelingking Beach, Broken Beach, and the natural infinity pool of Angel's Billabong.",
    location: "Nusa Penida",
    itineraries:
      "Kelingking Beach, Paluang Beach, Broken Beach, Angel Billabong, Crystal Bay",
    price: 299000,
    benefits: [
      "Fastboat Return Ticket",
      "Driver as Guide",
      "Private Car & Petrol",
      "Entrance Fee to all Spot",
      "Lunch",
    ],
  },
  {
    id: 2,
    img: "/img/trips2.png",
    title: "East Trip Tour",
    description:
      "Discover the hidden gems of the eastern side. Visit Diamond Beach, Atuh Beach, and the famous Thousand Islands viewpoint with its iconic treehouse.",
    location: "Nusa Penida",
    itineraries:
      "Diamond Beach, Atuh Beach, Tree House, Thousand Island, Teletubbies Hill",
    price: 299000,
    benefits: [
      "Fastboat Return Ticket",
      "Driver as Guide",
      "Private Car & Petrol",
      "Entrance Fee to all Spot",
      "Lunch",
    ],
  },
  {
    id: 3,
    img: "/img/trips3.png",
    title: "Snorkeling Trip",
    description:
      "Dive into the crystal clear waters of Nusa Penida. Swim with Manta Rays and explore 4 beautiful spots: Manta Bay, Gamat Bay, Crystal Bay, and Wall Bay.",
    location: "Nusa Penida",
    itineraries:
      "Manta Bay, Gamat Bay, Crystal Bay, Wall Bay",
    price: 299000,
    benefits: [
      "Fastboat Return Ticket",
      "Sharing Boat Snorkeling",
      "Snorkeling Gear",
      "Towel",
      "Life Jacket",
      "Guide",
      "Lunch",
    ],
  },
];

  const handleBooking = (tripId) => {
    navigate(`/trip-detail/${tripId}`);
  };

  const handleGoToGallery = (e) => {
    e.preventDefault();
    navigate('/gallery');
  };

  return (
    <div className="bg-white min-h-screen relative font-['Poppins'] overflow-x-hidden">
      
      <AnimatePresence>
        {isModalOpen && <MyReservationModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative h-[85vh] md:h-screen flex items-center justify-center text-white">
        <img src="/img/bookingpages-bg.png" className="absolute w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 w-full max-w-7xl text-center px-6">
          <h1 className="text-4xl md:text-6xl mb-12 uppercase">
            {t('booking.hero_title', 'Book Your Boat Trip')}
          </h1>
          <BookingSearch />
        </div>
      </section>

      {/* TRIPS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl text-center font-black mb-16">
          {t('booking.recommended_title', 'Recommended Trips')}
        </h2>

        {/* 🔥 LOADING */}
        {loading ? (
          <div className="text-center font-bold">Loading trips...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {trips.map((trip) => (
              <motion.div key={trip.id} whileHover={{ y: -10 }} className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col">

                <img src={trip.img} className="h-60 object-cover" />

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold">{trip.title}</h3>

                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <MapPin size={14} /> {trip.location}
                  </div>

                  <div className="flex-grow">
                    {trip.benefits.map((b, i) => (
                      <div key={i} className="flex gap-2 text-sm mb-1">
                        <CheckCircle size={14} className="text-green-500" />
                        {b}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleBooking(trip.id)}
                    className="mt-6 bg-[#001D3D] text-white py-3 rounded-xl"
                  >
                    <Ticket size={16} className="inline mr-2" />
                    {t('booking.book_now_btn', 'Book This Trip')}
                  </button>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* GALLERY */}
      <section className="py-24 bg-slate-50 text-center">
        <h2 className="text-3xl font-bold mb-10">Capture The Moments</h2>

        <button
          onClick={handleGoToGallery}
          className="mt-6 px-8 py-3 border rounded-full"
        >
          {t('booking.view_all_gallery', 'view all gallery')}
        </button>
      </section>

    </div>
  );
}