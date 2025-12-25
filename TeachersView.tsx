
import React, { useState } from 'react';
import { Teacher, Gender } from '../types';

interface TeachersViewProps {
  teachers: Teacher[];
  onAdd: (teacher: Omit<Teacher, 'id' | 'isActive'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (teacher: Teacher) => void;
}

const TeachersView: React.FC<TeachersViewProps> = ({ teachers, onAdd, onToggle, onDelete, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: Gender.MALE,
    phoneNumber: '',
    email: '',
    specialization: '',
    yearStarted: new Date().getFullYear()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = teachers.find(t => t.id === editingId);
      if (existing) {
        onUpdate({ ...existing, ...formData });
        setEditingId(null);
      }
    } else {
      onAdd(formData);
    }
    setIsAdding(false);
    resetForm();
  };

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({
      fullName: teacher.fullName,
      gender: teacher.gender,
      phoneNumber: teacher.phoneNumber,
      email: teacher.email || '',
      specialization: teacher.specialization || '',
      yearStarted: teacher.yearStarted
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      gender: Gender.MALE,
      phoneNumber: '',
      email: '',
      specialization: '',
      yearStarted: new Date().getFullYear()
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase brand-text">
            Faculty <span className="text-orange-500">Management</span>
          </h1>
          <p className="text-slate-500">Maintain records of FOCUS Academy academic staff.</p>
        </div>
        <button 
          onClick={() => {
            if (isAdding) { setIsAdding(false); resetForm(); }
            else { setIsAdding(true); }
          }}
          className={`${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'} px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105`}
        >
          {isAdding ? 'Cancel' : '+ Register New Faculty'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 animate-in slide-in-from-top duration-300">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            {editingId ? 'Modify Faculty Details' : 'New Faculty Registration'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
              >
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.OTHER}>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address (Optional)</label>
              <input 
                type="email"
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                placeholder="teacher@focus.academy"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization (Optional)</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                placeholder="e.g. Pure Mathematics"
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Year Started</label>
              <input 
                type="number"
                required
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                value={formData.yearStarted}
                onChange={e => setFormData({...formData, yearStarted: parseInt(e.target.value)})}
              />
            </div>
            <div className="lg:col-span-3 flex space-x-3 mt-4">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-colors shadow-lg shadow-slate-900/10">
                {editingId ? 'Confirm Changes' : 'Complete Registration'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-slate-100 text-slate-500 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertise</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map(t => (
              <tr key={t.id} className={`hover:bg-slate-50/80 transition-all group ${!t.isActive ? 'bg-slate-50/50 opacity-70' : ''}`}>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg">
                      {t.fullName.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-black text-slate-900">{t.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.gender} — Joined {t.yearStarted}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${t.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {t.isActive ? 'Active' : 'Resigned'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-800">{t.phoneNumber}</p>
                  {t.email && <p className="text-[10px] text-slate-400 italic lowercase">{t.email}</p>}
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-lg">{t.specialization || 'General Academic'}</span>
                </td>
                <td className="px-8 py-6 text-right space-x-1">
                  <button 
                    onClick={() => startEdit(t)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors bg-slate-50 p-2 rounded-lg"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onToggle(t.id)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${t.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    {t.isActive ? 'Resign' : 'Restore'}
                  </button>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-rose-400 hover:text-rose-600 p-2 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeachersView;
