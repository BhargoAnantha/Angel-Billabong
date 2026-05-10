import React, { useState, useEffect } from 'react';
import { Loader2, Search, Calendar, Users, MapPin, CreditCard, MessageCircle, Info, CheckCircle2, Clock, ChevronLeft, ChevronRight, X, User } from 'lucide-react';
import { getTripBooks, updateTripBookStatus } from '../../services/TripBookService'; 

export default function TripsBook() {
  const [tripBookings, setTripBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPax, setSelectedPax] = useState(null);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTripBooks();
      // Urutkan data berdasarkan ID terbaru (Descending)
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => {
        const idA = a.ID || a.id || 0;
        const idB = b.ID || b.id || 0;
        return idB - idA;
      });
      setTripBookings(sortedData);
    } catch (err) {
      console.error("Gagal mengambil data trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Sukses" : "Pending";
    if (window.confirm(`Ubah status booking paket ke ${newStatus}?`)) {
      try {
        await updateTripBookStatus(id, { status: newStatus });
        fetchData(); // Refresh data setelah update
        alert(`Status berhasil diperbarui!`);
      } catch (err) {
        alert("Gagal memperbarui status di database.");
      }
    }
  };

  // Logika Filtering: Nama, WA, dan Kode Booking (TAB-XXX)
  const filteredData = tripBookings.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const id = item.ID || item.id || 0;
    const bookingCode = `TAB-${String(id).padStart(3, '0')}`.toLowerCase();
    const name = (item.full_name || item.FullName || "").toLowerCase();
    const wa = (item.whatsapp || item.WhatsApp || "");

    return (
      name.includes(searchLower) || 
      wa.includes(searchTerm) || 
      bookingCode.includes(searchLower)
    );
  });

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-8 max-w-7xl mx-auto font-['Poppins']">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#001D35] tracking-tight">Booking Paket Tur</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest italic">Angel Billabong Internal System</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Cari nama, WA, atau Kode (TAB-001)..." 
            className="border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-4 focus:ring-[#003B6D]/5 w-72 transition-all"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
              <th className="px-6 py-4 w-28 text-center">Kode</th>
              <th className="px-6 py-4">Pelanggan</th>
              <th className="px-6 py-4">Paket Tour</th>
              <th className="px-6 py-4 text-center">Travelers</th>
              <th className="px-6 py-4 text-center">Jadwal</th>
              <th className="px-6 py-4">Total & Bayar</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#003B6D]" size={32} />
                  <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Memuat Data...</p>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-20 text-center">
                  <Info className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Belum ada data di database</p>
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => {
                const tripData = item.Trips || item.trips || {};
                const bookingId = item.ID || item.id || index;
                const currentStatus = item.status || "Pending";

                return (
                  <tr key={bookingId} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-5 flex justify-center">
                      <span className="bg-[#001D35] text-white px-3 py-1.5 rounded-lg font-mono font-black text-[10px] tracking-tight min-w-[80px] text-center shadow-sm">
                          TAB-{String(bookingId).padStart(3, '0')}
                      </span>
                    </td>

                    {/* KOLOM PAKET TOUR YANG DIPERBARUI */}
                    <td className="px-6 py-5">
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      {/* Mengambil nama pertama saja */}
      <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
        {(item.full_name || item.FullName || 'No Name').split(',')[0].trim()}
      </span>
      
      {/* Tampilkan badge/button jika ada lebih dari 1 nama (dipisahkan koma) */}
      {(item.full_name || "").includes(',') && (
        <button 
          onClick={() => {
            const allNames = item.full_name.split(',').map(n => n.trim());
            setSelectedPax({
              name: allNames[0],
              count: allNames.length,
              details: allNames // Mengirim array nama ke state
            });
          }}
          className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black hover:bg-blue-100 transition-colors border border-blue-100"
        >
          +{item.full_name.split(',').length - 1} Pax
        </button>
      )}
    </div>
    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
      <MessageCircle size={10} /> {item.whatsapp || item.WhatsApp || '-'}
    </div>
  </div>
</td>

<td className="px-6 py-5">

<div className="text-xs font-bold text-[#001D35] whitespace-nowrap uppercase tracking-tight">

{item.tour_name || item.trip_name || tripData.trips_name || tripData.TripsName || item.tour || "Pilihan Paket"}

</div>

<div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">

<MapPin size={8} className="text-sky-500" />

{tripData.location || "Nusa Penida"}

</div>

</td>

                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-slate-700 text-[10px] font-black">
                        <Users size={10} /> {item.travelers || item.Travelers || "1 Person"}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Calendar size={12} className="text-slate-400" />
                          {item.date || item.Date || "-"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-[#001D35]">
                        IDR {(item.total_price || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                        <CreditCard size={10} /> {item.payment || item.Payment || "Cash"}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => handleStatusUpdate(bookingId, currentStatus)}
                        className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border mx-auto min-w-[95px] shadow-sm ${
                          currentStatus === "Sukses" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                          : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                        }`}
                      >
                        {currentStatus === "Sukses" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {currentStatus}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} bookings
            </p>
            <div className="flex gap-2">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                    <ChevronLeft size={14} className="text-[#001D35]" />
                </button>
                <div className="flex items-center px-4 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-[#001D35]">
                    {currentPage} / {totalPages || 1}
                </div>
                <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                    <ChevronRight size={14} className="text-[#001D35]" />
                </button>
            </div>
        </div>
      </div>
      {selectedPax && (
        <div className="fixed inset-0 bg-[#001D35]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-[#001D35]">
                  Detail Pax: {selectedPax.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  {selectedPax.count} Penumpang Total
                </p>
              </div>
              <button
                onClick={() => setSelectedPax(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List penumpang */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {Array.isArray(selectedPax.details) && selectedPax.details.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#001D35] uppercase tracking-tight">
                      {name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Passenger {idx + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}