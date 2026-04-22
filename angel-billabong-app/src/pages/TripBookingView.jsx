import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, ArrowRight, Info, Calendar, Users, Clock, UsersRound } from 'lucide-react';

export default function TripBookingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Data default jika state kosong
  const bookingData = location.state || {
    trip: { title: "Nusa Penida Trip", price: 299000, img: "/img/trips1.png" },
    passengers: 1,
    bookingDate: new Date().toISOString().split('T')[0],
    totalPrice: 299000,
    schedule: { time: "07.30 - 08.15" }
  };

  const passengerCount = bookingData.passengers;

  // State untuk informasi kontak utama
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });

  // State untuk daftar nama peserta (array sesuai jumlah penumpang)
  const [passengerNames, setPassengerNames] = useState(
    Array(passengerCount).fill('')
  );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleContactChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const handleNameChange = (index, value) => {
    const newNames = [...passengerNames];
    newNames[index] = value;
    setPassengerNames(newNames);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/process-payment', { 
      state: { 
        ...bookingData, 
        customer: {
          ...contactInfo,
          passengerList: passengerNames // Mengirim daftar nama semua peserta
        } 
      } 
    });
  };

  return (
    <div className="bg-[#F4F7FA] min-h-screen font-['Poppins'] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-[#001D3D] transition-all font-black text-[11px] uppercase tracking-[0.2em] mb-3">
              <ChevronLeft size={18} /> Edit Booking
            </button>
            <h1 className="text-3xl font-black text-[#001D3D] uppercase tracking-tighter">Passenger Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: FORM SECTION */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-[35px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-white">
              
              {/* CONTACT INFO SECTION */}
              <div className="mb-10">
                <h2 className="flex items-center gap-3 text-sm font-black text-[#001D3D] uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">
                  <Mail size={18} className="text-sky-500" /> Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
                      <input required name="email" onChange={handleContactChange} type="email" placeholder="john@example.com" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl font-bold text-[#001D3D] outline-none border-2 border-transparent focus:border-sky-500/20 focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
                      <input required name="phone" onChange={handleContactChange} type="tel" placeholder="+62 812..." className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl font-bold text-[#001D3D] outline-none border-2 border-transparent focus:border-sky-500/20 focus:bg-white transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PASSENGER NAMES SECTION */}
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-sm font-black text-[#001D3D] uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">
                  <UsersRound size={18} className="text-sky-500" /> Passenger Names
                </h2>
                <div className="space-y-6">
                  {passengerNames.map((name, index) => (
                    <div key={index} className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Passenger {index + 1} Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
                        <input 
                          required 
                          type="text" 
                          value={name}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                          placeholder={`Enter name for passenger ${index + 1}`} 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl font-bold text-[#001D3D] outline-none border-2 border-transparent focus:border-sky-500/20 focus:bg-white transition-all" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 bg-sky-50 rounded-[25px] border border-sky-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Info className="text-sky-500" size={20} />
                </div>
                <p className="text-[12px] text-sky-900 font-semibold leading-relaxed">
                  Please make sure all names match with Identity Card (KTP/Passport). E-tickets will be sent to your email.
                </p>
              </div>

              <button type="submit" className="w-full mt-10 bg-[#001D3D] text-white py-6 rounded-[25px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 hover:bg-sky-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                Continue to Payment <ArrowRight size={20} />
              </button>
            </form>
          </div>

          {/* RIGHT: SUMMARY SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[35px] overflow-hidden shadow-xl shadow-slate-200/50 border border-white sticky top-28">
              <div className="h-40 overflow-hidden relative">
                <img src={bookingData.trip.img} alt="Trip" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001D3D] to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-6">
                   <h3 className="text-white font-black text-lg uppercase tracking-tighter">{bookingData.trip.title}</h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sky-500"><Calendar size={18}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-black text-[#001D3D]">{bookingData.bookingDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sky-500"><Users size={18}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travelers</p>
                    <p className="text-sm font-black text-[#001D3D]">{bookingData.passengers} Person</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sky-500"><Clock size={18}/></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour Session</p>
                    <p className="text-sm font-black text-[#001D3D]">{bookingData.schedule?.time}</p>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-slate-100 mt-6 flex justify-between items-end">
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