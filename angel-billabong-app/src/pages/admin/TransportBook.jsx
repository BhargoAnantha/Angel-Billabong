// src/pages/admin/TransportBook.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Search, CheckCircle2, Clock, ArrowRight, ArrowLeftRight, X, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransportBooks, updateTransportBookStatus } from '../../services/TransportBookService';

export default function TransportBook() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPax, setSelectedPax] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await getTransportBooks();
      setBookings((data || []).sort((a, b) => b.ID - a.ID));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Sukses" : "Pending";
    if (window.confirm(`Ubah status pembayaran ke ${newStatus}?`)) {
      try {
        await updateTransportBookStatus(id, { payment_status: newStatus });
        fetchData();
      } catch (err) {
        alert("Gagal update.");
      }
    }
  };

  const parsePaxDetails = (details) => {
    try {
      return typeof details === 'string' ? JSON.parse(details) : (details || []);
    } catch (e) {
      return [];
    }
  };

  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const code = `AB-${String(b.ID).padStart(3, '0')}`.toLowerCase();
    return (
      b.passanger_full_name?.toLowerCase().includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.whatsapp?.includes(searchTerm) ||
      code.includes(q)
    );
  });

  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems     = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(filteredBookings.length / itemsPerPage);

  return (
    <div className="p-8 max-w-7xl mx-auto font-['Poppins']">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#001D35] tracking-tight">Data Booking Penumpang</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest italic">
            Angel Billabong Internal System
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari nama, WA, atau Kode (AB-001)..."
            className="border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-4 focus:ring-[#003B6D]/5 w-72 transition-all"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Table — overflow-x-auto agar tidak melar ke kanan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
            <colgroup>
              <col style={{ width: '100px' }} />  {/* Kode */}
              <col style={{ width: '160px' }} />  {/* Data Pemesan */}
              <col style={{ width: '160px' }} />  {/* Data Penumpang */}
              <col style={{ width: '160px' }} />  {/* Rute */}
              <col style={{ width: '130px' }} />  {/* Jadwal Kapal */}
              <col style={{ width: '80px' }}  />  {/* Tgl Pesan */}
              <col style={{ width: '110px' }} />  {/* Total Bayar */}
              <col style={{ width: '110px' }} />  {/* Status */}
            </colgroup>
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <th className="px-4 py-4 text-center">Kode</th>
                <th className="px-4 py-4">Data Pemesan</th>
                <th className="px-4 py-4">Data Penumpang</th>
                <th className="px-4 py-4">Rute</th>
                <th className="px-4 py-4 text-center">Jadwal Kapal</th>
                <th className="px-4 py-4 text-center">Tgl Pesan</th>
                <th className="px-4 py-4">Total Bayar</th>
                <th className="px-4 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#003B6D]" size={32} />
                  </td>
                </tr>
              ) : currentItems.map((book) => {
                const allPax        = parsePaxDetails(book.passanger_details);
                const transportData = book.Transport || book.transport || {};
                const isRoundTrip   = book.is_round_trip === 1;
                const totalPassengers = allPax.length > 0 ? allPax.length : 1;
                const pricePerWay   = Number(transportData.price || 0);
                const totalAmount   = isRoundTrip
                  ? (pricePerWay * 2) * totalPassengers
                  : pricePerWay * totalPassengers;

                // Nama penumpang utama — potong jika terlalu panjang
                const paxName = book.passanger_full_name || '-';

                return (
                  <tr key={book.ID} className="hover:bg-slate-50/30 transition-colors">

                    {/* Kode */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <span className="bg-[#001D35] text-white px-2.5 py-1.5 rounded-lg font-mono font-black text-[10px] tracking-tight text-center shadow-sm">
                          AB-{String(book.ID).padStart(3, '0')}
                        </span>
                      </div>
                    </td>

                    {/* Data Pemesan */}
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                        {book.customer_name || `${book.first_name} ${book.last_name}`}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter truncate max-w-[140px]">
                        {book.whatsapp}
                      </div>
                    </td>

                    {/* Data Penumpang — dibatasi lebar, nama dipotong dengan tooltip */}
                    <td className="px-4 py-4">
                      <div
                        className="text-xs font-bold text-blue-600 truncate max-w-[140px]"
                        title={paxName} // tooltip nama lengkap saat hover
                      >
                        {paxName}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tight truncate max-w-[80px]">
                          {book.passanger_nation}
                        </span>
                        {allPax.length > 1 && (
                          <button
                            onClick={() => setSelectedPax({ name: book.customer_name, details: allPax })}
                            className="text-[9px] font-black text-sky-500 uppercase hover:underline shrink-0"
                          >
                            +{allPax.length - 1} Pax
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Rute */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 uppercase text-[9px]">
                          {transportData.from || "Sanur"}
                        </span>
                        {isRoundTrip
                          ? <ArrowLeftRight size={12} className="text-sky-500 stroke-[3px] shrink-0" />
                          : <ArrowRight     size={12} className="text-slate-300 shrink-0" />
                        }
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 uppercase text-[9px]">
                          {transportData.to || "Penida"}
                        </span>
                      </div>
                    </td>

                    {/* Jadwal Kapal */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100 w-full">
                          <div className="font-black text-blue-700 text-[10px] leading-tight">
                            {transportData.time || "07:30"}
                          </div>
                          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                            {book.departure_date}
                          </div>
                        </div>
                        {isRoundTrip && (
                          <div className="bg-emerald-50/50 px-2 py-1 rounded-md border border-emerald-100 w-full">
                            <div className="font-black text-emerald-700 text-[10px] leading-tight">
                              {book.return_time || "16:00"}
                            </div>
                            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                              {book.return_date}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Tgl Pesan */}
                    <td className="px-4 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      {book.CreatedAt
                        ? new Date(book.CreatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
                        : '-'}
                    </td>

                    {/* Total Bayar */}
                    <td className="px-4 py-4 font-bold text-[#001D35] text-xs">
                      IDR {totalAmount.toLocaleString('id-ID')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleStatusUpdate(book.ID, book.status || "Pending")}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border mx-auto w-full max-w-[100px] transition-all shadow-sm ${
                          book.status === "Sukses"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {book.status === "Sukses" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {book.status || "Pending"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} bookings
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={14} className="text-[#001D35]" />
            </button>
            <div className="flex items-center px-4 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-[#001D35]">
              {currentPage} / {totalPages || 1}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={14} className="text-[#001D35]" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal detail pax */}
      {selectedPax && (
        <div className="fixed inset-0 bg-[#001D35]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-xs uppercase tracking-widest text-[#001D35]">
                Detail Pax: {selectedPax.name}
              </h3>
              <button onClick={() => setSelectedPax(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {selectedPax.details.map((p, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#001D35] uppercase">{p.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {p.gender} • {p.age} Tahun • {p.nationality}
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