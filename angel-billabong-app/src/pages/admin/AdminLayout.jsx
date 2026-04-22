// src/pages/Admin/AdminLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* 1. Komponen Sidebar (Langkah 4) */}
      <Sidebar />
      
      {/* 2. Main Content Area yang berisi halaman anak (Langkah 5) */}
      <div className="flex-1 flex flex-column bg-slate-100">
        {/* Placeholder untuk Topbar Minimalist (Optional) */}
        {/* <Topbar /> */}
        
        {children}
      </div>
    </div>
  );
}