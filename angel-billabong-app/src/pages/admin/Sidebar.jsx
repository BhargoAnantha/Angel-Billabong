// src/pages/Admin/Sidebar.jsx
import React from 'react';
import { Ship, ClipboardList, Map, Ticket, LogOut } from 'lucide-react'; // Sudah diperbaiki ke lucide-react
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logout } from '../../services/AuthService';

const menuItems = [
  { name: 'Transport', path: '/admin/transport', icon: <Ship size={18} /> },
  { name: 'Transport Book', path: '/admin/transport-book', icon: <ClipboardList size={18} /> },
  { name: 'Trips', path: '/admin/trips', icon: <Map size={18} /> },
  { name: 'Trips Book', path: '/admin/trips-book', icon: <Ticket size={18} /> }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Keluar dari sistem?")) {
      logout();
      navigate('/login');
    }
  };

  /** * PERBAIKAN LOGIKA WARNA: 
   * Menggunakan perbandingan eksak (===) agar '/admin/trips' 
   * tidak ikut biru saat di halaman '/admin/trips-book'.
   */
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-[280px] bg-[#001D35] text-white/70 h-screen flex flex-col font-sans sticky top-0 border-r border-white/5">
      
      {/* Brand Logo Section */}
      <div className="p-8 pb-12 flex items-center gap-4 text-white">
        <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Ship size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic leading-tight">Angel Billabong</h1>
          <p className="text-[10px] font-bold text-sky-300 uppercase tracking-[0.2em] leading-none">Fast Cruise</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Operational</p>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`w-full px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-4 transition-all duration-300
              ${active 
                ? 'bg-sky-600 text-white shadow-xl shadow-sky-900/40' 
                : 'hover:bg-white/5 hover:text-white'}`}
            >
              <span className={active ? 'text-white' : 'text-white/30 transition-colors group-hover:text-white'}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile & Logout */}
      <div className="p-6 bg-[#00182d]">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center font-black text-white italic text-sm">BA</div>
          <div className="overflow-hidden">
            <p className="font-bold text-white text-xs truncate italic">Bhargo Anantha</p>
            <p className="text-[9px] font-black uppercase text-sky-400 tracking-widest">Super Admin</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}