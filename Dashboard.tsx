
import React from 'react';
import { AppState } from '../types';

const Dashboard: React.FC<{ state: AppState }> = ({ state }) => {
  const activeTeachers = state.teachers.filter(t => t.isActive).length;
  const lessonsToday = state.lessons.filter(l => l.date === new Date().toISOString().split('T')[0]).length;
  const homeworkToday = state.homework.filter(h => h.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase brand-text">
            FOCUS <span className="text-orange-500">DASHBOARD</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Academic activity overview for <span className="text-slate-900 font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
          Live System Status: <span className="text-emerald-400">Optimal</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Staffing" 
          subLabel="Active Faculty"
          value={activeTeachers} 
          icon={<div className="p-4 bg-blue-50 text-blue-900 rounded-2xl shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>} 
        />
        <StatCard 
          label="Teaching" 
          subLabel="Lessons Captured"
          value={lessonsToday} 
          icon={<div className="p-4 bg-orange-50 text-orange-600 rounded-2xl shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><rect width="20" height="12" x="2" y="10" rx="2"/></svg></div>} 
        />
        <StatCard 
          label="Assignment" 
          subLabel="Homework Today"
          value={homeworkToday} 
          icon={<div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg></div>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Faculty Engagement</h2>
             <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest">Top Performers</span>
          </div>
          <div className="space-y-4">
            {state.teachers.filter(t => t.isActive).slice(0, 5).map(t => {
              const count = state.lessons.filter(l => l.teacherId === t.id).length;
              return (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:bg-orange-500 transition-colors">
                      {t.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Academic Staff</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{count}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Lesson Logs</p>
                  </div>
                </div>
              );
            })}
            {state.teachers.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-300 italic font-medium uppercase text-xs tracking-widest">No faculty data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Visual Archive</h2>
             <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">Latest Boards</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {state.lessons.slice(-4).reverse().map(l => (
              <div key={l.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100">
                <img src={l.whiteboardImage} alt="Lesson" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-xs font-black text-white uppercase tracking-widest">{l.subject}</p>
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">{l.classId}</p>
                </div>
              </div>
            ))}
            {state.lessons.length === 0 && (
              <div className="col-span-2 text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 mx-auto mb-4 text-slate-200">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Board Archive Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, subLabel: string, value: number, icon: React.ReactNode }> = ({ label, subLabel, value, icon }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900 group-hover:text-orange-500 transition-colors">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{subLabel}</p>
    </div>
    <div className="transform group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
  </div>
);

export default Dashboard;