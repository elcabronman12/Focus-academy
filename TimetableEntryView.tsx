
import React, { useState } from 'react';
import { Teacher, TimetableEntry, SchoolClass, DayOfWeek } from '../types';
import { DAYS, CLASSES, PERIODS } from '../constants';

interface TimetableProps {
  teachers: Teacher[];
  timetable: TimetableEntry[];
  onUpdate: (entry: TimetableEntry) => void;
  onClear: (id: string) => void;
}

const TimetableEntryView: React.FC<TimetableProps> = ({ teachers, timetable, onUpdate, onClear }) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0]);

  const activeTeachers = teachers.filter(t => t.isActive);

  const getEntry = (period: number) => {
    return timetable.find(e => e.day === selectedDay && e.classId === selectedClass as SchoolClass && e.periodNumber === period);
  };

  const handleSave = (period: number, field: string, value: string) => {
    const existing = getEntry(period);
    const updated: TimetableEntry = existing 
      ? { ...existing, [field]: value }
      : { 
          id: crypto.randomUUID(), 
          day: selectedDay, 
          classId: selectedClass as SchoolClass, 
          periodNumber: period, 
          subject: field === 'subject' ? value : '', 
          teacherId: field === 'teacherId' ? value : '',
          startTime: field === 'startTime' ? value : '08:00',
          endTime: field === 'endTime' ? value : '09:00'
        };
    onUpdate(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase brand-text">
          Weekly <span className="text-orange-500">Academic Schedule</span>
        </h1>
        <p className="text-slate-500">Define fixed teaching slots for FOCUS Academy classes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex space-x-1">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedDay === day ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <select 
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-xs uppercase tracking-widest"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-black text-slate-800 uppercase tracking-tighter">Academic Agenda: {selectedClass}</h2>
          <span className="text-[10px] font-black px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full uppercase tracking-widest">Fixed 5-Period Logic</span>
        </div>
        <div className="divide-y divide-slate-100">
          {PERIODS.map(period => {
            const entry = getEntry(period);
            return (
              <div key={period} className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8 items-end relative group">
                <div>
                  <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Slot {period}: Subject</label>
                  <input 
                    placeholder="e.g. Literacy"
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    value={entry?.subject || ''}
                    onChange={e => handleSave(period, 'subject', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Educator</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    value={entry?.teacherId || ''}
                    onChange={e => handleSave(period, 'teacherId', e.target.value)}
                  >
                    <option value="">Vacant</option>
                    {activeTeachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start</label>
                  <input 
                    type="time"
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    value={entry?.startTime || '08:00'}
                    onChange={e => handleSave(period, 'startTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End</label>
                  <input 
                    type="time"
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    value={entry?.endTime || '09:00'}
                    onChange={e => handleSave(period, 'endTime', e.target.value)}
                  />
                </div>
                <div className="flex justify-end items-center space-x-3">
                   {entry && (
                     <button 
                       onClick={() => onClear(entry.id)}
                       className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                       title="Clear Period"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                     </button>
                   )}
                   {entry?.subject && entry?.teacherId ? (
                     <div className="flex items-center text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-xl">
                        Active
                     </div>
                   ) : (
                     <div className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">Pending</div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimetableEntryView;
