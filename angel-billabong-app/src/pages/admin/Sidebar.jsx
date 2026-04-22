// src/pages/Admin/Sidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  Anchor, 
  Ship, 
  ClipboardList, 
  Map, 
  Ticket, 
  Settings, 
  ChevronDown, 
  UserCircle 
} from 'lucide-react';

const navItems = [
  { 
    group: 'Management', 
    icon: <LayoutDashboard size={18} />, 
    subItems: [
      { name: 'Account Management', icon: <UserCircle size={18} /> }
    ] 
  },
  { 
    group: 'Operational', 
    icon: <Anchor size={18} />, 
    subItems: [
      { name: 'Transport', icon: <Ship size={18} /> },
      { name: 'Transport Book', icon: <ClipboardList size={18} /> },
      { name: 'Trips', icon: <Map size={18} /> },
      { name: 'Trips Book', icon: <Ticket size={18} /> }
    ] 
  },
  { 
    group: 'Event Settings', 
    icon: <Settings size={18} />, 
    subItems: [
      { name: 'Event List', icon: <ClipboardList size={18} /> }
    ] 
  },
];

export default function Sidebar() {
  return (
    <div className="w-[280px] bg-[#001D35] text-white/70 h-screen flex flex-col font-sans sticky top-0 overflow-hidden">
      
      {/* 1. BRAND LOGO */}
      <div className="p-8 pb-12 flex items-center gap-4 text-white">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Ship size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-tight">Angel Billabong</h1>
          <p className="text-[10px] font-bold text-sky-200 uppercase tracking-widest leading-none">Fast Cruise</p>
        </div>
      </div>

      {/* 2. NAVIGATION MENU */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((group, index) => (
          <div key={index} className="mb-6">
            <div className="flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
              <span>{group.group}</span>
              <ChevronDown size={12} />
            </div>
            
            <div className="space-y-1">
              {group.subItems.map((item) => (
                <button
                  key={item.name}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-4 group
                  ${item.name === 'Transport' ? 'bg-[#003B6D] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  <span className={`${item.name === 'Transport' ? 'text-sky-300' : 'text-white/30 group-hover:text-sky-300'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="tracking-tight">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. PROFILE / ACCOUNT SECTION */}
      <div className="p-8 border-t border-white/5 bg-[#00182d]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center font-black text-white italic text-lg shadow-inner border border-white/10">
            BH
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm truncate">Bhargo Agency</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Admin Panel</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}