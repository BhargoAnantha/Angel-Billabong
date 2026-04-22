// src/pages/Admin/DashboardUserList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  MapPin, 
  Clock, 
  MoreHorizontal, 
  Users, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
// Path import pastikan sesuai folder project kamu
import { getTrips } from '../../services/TripService'; 

export default function DashboardUserList() {
  // 1. STATE MANAGEMENT
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. FETCHING LOGIC - Langsung ambil data dari API_URL
  const loadTripsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrips();
      
      // Karena TripService baru sudah simpel, 'data' di sini adalah array murni
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Gagal sinkron dengan database. Pastikan backend Go aktif di port 8080.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripsData();
  }, []);

  return (
    <div className="flex-1 bg-slate-100 p-10 font-sans min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#001D35] uppercase tracking-tighter">Trip Management</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring data Angel Billabong Fast Cruise.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Refresh button */}
          <button 
            onClick={loadTripsData}
            disabled={loading}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-white shadow-sm border border-slate-200 hover:text-[#003B6D] transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button className="bg-[#003B6D] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-3 active:scale-95 transition-all">
            <Package size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 overflow-hidden">
        
        {/* TABS (UI ONLY) */}
        <div className="flex gap-2 border-b border-slate-100 mb-12 -mx-10 px-10">
          {['All Trips', 'Nusa Penida', 'Lembongan'].map((tab, idx) => (
            <button 
              key={tab} 
              className={`px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all ${idx === 0 ? 'text-[#003B6D] border-b-2 border-[#003B6D]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-6 mb-12 bg-slate-50 border border-slate-100 p-4 rounded-3xl shadow-inner">
          <SearchFilterInput label="Trip" placeholder="Search by name..." />
          <SearchFilterInput label="Route" placeholder="Select location..." />
          <button className="bg-[#003B6D] text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#002a4e] transition-colors">Filter</button>
        </div>

        {/* TABLE LOGIC */}
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <RefreshCw size={40} className="text-sky-500 animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Data...</p>
          </div>
        ) : error ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <p className="text-sm font-bold text-slate-600">{error}</p>
            <button onClick={loadTripsData} className="text-[#003B6D] font-black text-xs uppercase underline mt-2">Retry Connection</button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-10">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  <th className="px-10 py-5 text-center">ID</th>
                  <th className="px-5 py-5">Trip Package</th>
                  <th className="px-5 py-5 text-center">Base Price</th>
                  <th className="px-5 py-5">Location</th>
                  <th className="px-5 py-5 text-center">Status</th>
                  <th className="px-10 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {trips.length > 0 ? trips.map((trip) => (
                  <motion.tr 
                    key={trip.ID} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-10 py-6 text-slate-400 text-xs font-black text-center">{trip.ID}</td>
                    
                    <td className="px-5 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#001D35] italic uppercase">{trip.trips_name}</span>
                        <span className="text-[9px] text-slate-400 font-black">FAST CRUISE REVENUE</span>
                      </div>
                    </td>
                    
                    <td className="px-5 py-6 text-center font-black italic text-[#003B6D] text-lg">
                      {/* Format IDR: 150000 -> 150.000 */}
                      IDR {trip.Price?.toLocaleString('id-ID')}
                    </td>
                    
                    <td className="px-5 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-sky-500" />
                        <span className="text-xs font-bold">{trip.location}</span>
                      </div>
                    </td>
                    
                    <td className="px-5 py-6 text-center">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm">
                        ACTIVE
                      </span>
                    </td>
                    
                    <td className="px-10 py-6 text-center">
                      <button className="text-slate-400 hover:text-[#003B6D] p-2 rounded-xl bg-white shadow-sm border border-slate-100 transition-all hover:border-sky-200">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                      No data found in Postgres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12 flex justify-between items-center -mx-10 bg-slate-50 p-6 border-t border-slate-100 px-10">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total: {trips.length} Trips</span>
           <div className="flex gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black bg-[#003B6D] text-white shadow-lg">1</div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen Input
const SearchFilterInput = ({ label, placeholder }) => (
  <div className="flex items-center gap-3">
    <label className="text-xs font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">{label}</label>
    <input 
      type="text" 
      placeholder={placeholder} 
      className="w-[200px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-400 transition-all shadow-sm" 
    />
  </div>
);