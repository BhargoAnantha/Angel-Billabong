// src/pages/Admin/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <div className="p-8 pb-20">
          <Outlet /> {/* TEMPAT KONTEN HALAMAN MUNCUL */}
        </div>
        
        <footer className="absolute bottom-6 left-0 w-full text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          @ 2026 Angel Billabong Fast Cruise • Internal Admin System
        </footer>
      </main>
    </div>
  );
}