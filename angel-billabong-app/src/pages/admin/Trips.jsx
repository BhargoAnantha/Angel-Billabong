import React, { useState, useEffect, useRef } from 'react';
import { MapPin, MoreHorizontal, Plus, Edit2, Trash2, Ship, DollarSign, Loader2, ArrowLeft, AlignLeft, ListCheck, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../../services/TripService';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [viewMode, setViewMode] = useState('list');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Field disesuaikan dengan struct Trips di Go kamu
  const [formData, setFormData] = useState({
    trips_name: '',
    price: '',
    location: '',
    description: '',
    include: '',
    itenaries: ''
  });

  const menuRef = useRef(null);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (trip = null) => {
    if (trip) {
      setIsEditing(true);
      setCurrentId(trip.ID); // GORM menggunakan ID huruf kapital
      setFormData({
        trips_name: trip.trips_name,
        price: trip.Price, // Di React kita pakai price (kecil) biar sinkron ke JSON Go
        location: trip.location,
        description: trip.description || '',
        include: trip.include || '',
        itenaries: trip.itenaries || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ trips_name: '', price: '', location: '', description: '', include: '', itenaries: '' });
    }
    setViewMode('form');
    setActiveMenu(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Konversi price ke number sebelum kirim ke Go (float64)
    const dataToSubmit = {
      ...formData,
      price: parseFloat(formData.price)
    };

    try {
      if (isEditing) {
        await updateTrip(currentId, dataToSubmit);
      } else {
        await createTrip(dataToSubmit);
      }
      alert("Berhasil memperbarui database PostgreSQL! 🚀");
      setViewMode('list');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal konek ke backend Go.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus paket trip ini dari database?")) {
      try {
        await deleteTrip(id);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus.");
      }
    }
    setActiveMenu(null);
  };

  if (viewMode === 'form') {
    return (
      <div className="p-10">
        <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-slate-400 hover:text-[#003B6D] font-black text-[10px] uppercase tracking-widest mb-8 transition-all">
          <ArrowLeft size={14} /> Back to Table
        </button>
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#001D35] uppercase tracking-tighter">{isEditing ? 'Edit Package' : 'New Adventure'}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Update PostgreSQL Data for {formData.trips_name}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl p-12 border border-slate-100 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Trip Name</label>
              <div className="relative">
                <Ship className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-[#001D35] uppercase italic outline-none focus:border-sky-400 transition-all" value={formData.trips_name} onChange={(e) => setFormData({...formData, trips_name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Price (IDR)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-[#003B6D] outline-none focus:border-sky-400 transition-all" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-600 outline-none focus:border-sky-400 transition-all" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            
            {/* Field Tambahan: Include & Itenaries */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">What's Included</label>
              <div className="relative">
                <ListCheck className="absolute left-4 top-5 text-slate-300" size={18} />
                <textarea rows="4" className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-12 pr-4 text-sm font-medium text-slate-600 outline-none focus:border-sky-400 transition-all resize-none" placeholder="Separate with commas..." value={formData.include} onChange={(e) => setFormData({...formData, include: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Itenaries</label>
              <div className="relative">
                <Map className="absolute left-4 top-5 text-slate-300" size={18} />
                <textarea rows="4" className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-12 pr-4 text-sm font-medium text-slate-600 outline-none focus:border-sky-400 transition-all resize-none" placeholder="Destination list..." value={formData.itenaries} onChange={(e) => setFormData({...formData, itenaries: e.target.value})} />
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-5 text-slate-300" size={18} />
                <textarea rows="4" required className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-12 pr-4 text-sm font-medium text-slate-600 outline-none focus:border-sky-400 transition-all resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 bg-[#003B6D] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#002a4e] transition-all flex justify-center items-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? 'Update PostgreSQL' : 'Publish Trip')}
            </button>
            <button type="button" onClick={() => setViewMode('list')} className="px-10 py-5 rounded-2xl border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#001D35] uppercase tracking-tighter">Trip Packages</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Connected to PostgreSQL Database</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center justify-center gap-2 bg-[#003B6D] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#002a4e] transition-all active:scale-[0.98]">
          <Plus size={18} /> Create New Trip
        </button>
      </div>
      <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 overflow-visible relative">
        {loading ? (
          <div className="py-20 text-center animate-pulse uppercase font-black text-slate-400 tracking-widest">Synchronizing with Database...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">
                <th className="px-10 py-5 rounded-l-2xl">Trip Details</th>
                <th className="px-5 py-5 text-center">Price</th>
                <th className="px-5 py-5">Location</th>
                <th className="px-10 py-5 text-center rounded-r-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trips.map((trip) => (
                <tr key={trip.ID} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-8">
                    <span className="block font-black text-[#001D35] text-lg italic uppercase leading-none">{trip.trips_name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Adventure Package</span>
                  </td>
                  <td className="px-5 py-8 text-center font-black text-[#003B6D] text-xl italic italic">IDR {trip.Price?.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-8 font-bold text-slate-600"><div className="flex items-center gap-2"><MapPin size={14} className="text-sky-500" /> {trip.location}</div></td>
                  <td className="px-10 py-8 text-center">
                    <div className="relative inline-block" ref={activeMenu === trip.ID ? menuRef : null}>
                      <button onClick={() => setActiveMenu(activeMenu === trip.ID ? null : trip.ID)} className={`p-3 rounded-xl transition-all ${activeMenu === trip.ID ? 'bg-[#003B6D] text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:text-[#003B6D]'}`}>
                        <MoreHorizontal size={18} />
                      </button>
                      <AnimatePresence>
                        {activeMenu === trip.ID && (
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[100] origin-top-right text-left">
                            <button onClick={() => openForm(trip)} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors rounded-xl uppercase tracking-wider">
                              <Edit2 size={14} /> Edit Trip
                            </button>
                            <div className="h-px bg-slate-50 my-1" />
                            <button onClick={() => handleDelete(trip.ID)} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors rounded-xl uppercase tracking-wider">
                              <Trash2 size={14} /> Delete Package
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}