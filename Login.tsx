
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Logo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <div className={`relative ${className} flex items-center justify-center mx-auto mb-6`}>
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-xl">
      <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
      <path d="M20 50 Q 50 20 80 50 L 80 85 Q 50 95 20 85 Z" fill="#f8fafc" />
      <path d="M30 55 L 50 45 L 70 55 L 70 80 L 50 85 L 30 80 Z" fill="#93c5fd" />
      <circle cx="50" cy="35" r="12" fill="#f97316" />
      <path d="M50 20 L 50 25 M 65 35 L 60 35 M 35 35 L 40 35 M 50 50 L 50 45" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 90 L 45 90 M 50 90 L 55 90 M 60 90 L 65 90" stroke="#f97316" strokeWidth="2" />
    </svg>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin(username);
    } else {
      setError('Invalid admin credentials. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden p-10 space-y-8 relative border border-white/10">
        <div className="text-center">
          <Logo />
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase brand-text">
            FOCUS <span className="text-orange-500">ACADEMY</span>
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">Administrative Access Only</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-black border border-rose-100 animate-bounce text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-orange-500 text-white font-black py-4 px-4 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 uppercase tracking-widest text-sm"
          >
            Authenticate
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">FOCUS ACADEMY © 2025</p>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">Cloud-Sync Enabled Offline Portal</p>
        </div>
      </div>
    </div>
  );
};

export default Login;