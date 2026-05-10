// src/pages/Admin/LoginView.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/AuthService';
import { Ship, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginView() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // PENTING: Di App.jsx kita pakai /admin/transport sebagai index admin
      // Mengarahkan ke /admin saja akan otomatis me-redirect ke /admin/transport
      navigate('/admin', { replace: true });
    } catch (err) {
      // Mengambil pesan error yang lebih spesifik jika ada
      setError(err?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001D35] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-12 relative overflow-hidden">
        {/* Dekorasi Aksen */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#003B6D] rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
            <Ship size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#001D35] uppercase tracking-tighter">Admin Portal</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Angel Billabong Fast Cruise</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-[11px] font-bold animate-shake uppercase tracking-wider">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#003B6D] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-sky-400 focus:bg-white transition-all shadow-inner disabled:opacity-50"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#003B6D] transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-sky-400 focus:bg-white transition-all shadow-inner disabled:opacity-50"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#003B6D] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-[#002a4e] transition-all active:scale-[0.98] mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Sign In to System'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}