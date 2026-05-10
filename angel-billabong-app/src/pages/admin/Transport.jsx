import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, ArrowLeft, DollarSign, Loader2, Save } from 'lucide-react';
import { getTransports, createTransport, updateTransport, deleteTransport } from '../../services/TransportService';

export default function Transport() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Sanur"); 
  const [viewMode, setViewMode] = useState('list'); 
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    transport_name: 'ANGEL BILLABONG FAST CRUISE',
    from: '',
    to: '',
    time: '',
    date: '',
    price: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTransports();
      setTransports(data || []);
    } catch (err) {
      console.error("Error fetching transport:", err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentId(item.ID);
      setFormData({
        transport_name: item.transport_name,
        from: item.from,
        to: item.to,
        time: item.time,
        date: item.date,
        price: item.price,
        status: item.status
      });
    } else {
      setIsEditing(false);
      setFormData({
        transport_name: 'ANGEL BILLABONG FAST CRUISE',
        from: activeTab,
        to: activeTab === "Sanur" ? "Nusa Penida" : "Sanur",
        time: '',
        date: new Date().toISOString().split('T')[0],
        price: '',
        status: 'Available'
      });
    }
    setViewMode('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, price: parseFloat(formData.price) };
      if (isEditing) {
        await updateTransport(currentId, payload);
      } else {
        await createTransport(payload);
      }
      setViewMode('list');
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus jadwal keberangkatan ini?")) {
      try {
        await deleteTransport(id);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus.");
      }
    }
  };

  const filteredData = transports.filter(t => t.from === activeTab);

  if (viewMode === 'form') {
    return (
      <div className="p-10">
        <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-slate-400 hover:text-[#003B6D] font-black text-[10px] uppercase tracking-widest mb-8 transition-all">
          <ArrowLeft size={14} /> Back to Schedule
        </button>
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#001D35] uppercase tracking-tighter">{isEditing ? 'Edit Schedule' : 'Add New Departure'}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Route: {formData.from} to {formData.to}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 max-w-2xl">
          <div className="grid grid-cols-1 gap-8 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Departure Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="e.g. 08.30 AM" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-[#001D35] outline-none focus:border-sky-400" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Price (IDR)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-[#003B6D] outline-none focus:border-sky-400" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 bg-[#003B6D] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#002a4e] transition-all flex justify-center items-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18}/> {isEditing ? 'Update Schedule' : 'Save Schedule'}</>}
            </button>
            <button type="button" onClick={() => setViewMode('list')} className="px-10 py-5 rounded-2xl border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#001D35] uppercase tracking-tighter">Departure Schedule</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Quick management for {activeTab} route</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center justify-center gap-2 bg-[#003B6D] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#002a4e] transition-all active:scale-[0.98]">
          <Plus size={18} /> Add New Time
        </button>
      </div>
      
      <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100">
        <div className="flex gap-2 border-b border-slate-100 mb-10 -mx-10 px-10">
          {["Sanur", "Nusa Penida"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#003B6D] border-b-2 border-[#003B6D]' : 'text-slate-400'}`}
            >
              {tab === "Sanur" ? "Sanur - Nusa Penida" : "Nusa Penida - Sanur"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse uppercase font-black text-slate-400 tracking-widest">Refreshing...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length > 0 ? filteredData.map((item) => (
              <div key={item.ID} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:border-sky-300 transition-all relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#003B6D] shadow-sm"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                    <p className="text-xl font-black text-[#001D35] italic">{item.time}</p>
                    <p className="text-[9px] font-bold text-sky-600 uppercase">IDR {item.price?.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openForm(item)} className="p-2 text-slate-300 hover:text-sky-500 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(item.ID)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No schedule entries found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}