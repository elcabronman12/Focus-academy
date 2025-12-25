
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Teacher, SchoolClass, AppState, Lesson, Homework, TimetableEntry } from './types';
import { Icons, CLASSES } from './constants';
import Dashboard from './views/Dashboard';
import TeachersView from './views/TeachersView';
import TimetableEntryView from './views/TimetableEntryView';
import DailyEntryView from './views/DailyEntryView';
import HomeworkView from './views/HomeworkView';
import ReportsView from './views/ReportsView';
import Login from './views/Login';

const STORAGE_KEY = 'focus_academy_system_data';

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
      <path d="M20 50 Q 50 20 80 50 L 80 85 Q 50 95 20 85 Z" fill="#f8fafc" />
      <path d="M30 55 L 50 45 L 70 55 L 70 80 L 50 85 L 30 80 Z" fill="#93c5fd" />
      <circle cx="50" cy="35" r="12" fill="#f97316" />
      <path d="M50 20 L 50 25 M 65 35 L 60 35 M 35 35 L 40 35 M 50 50 L 50 45" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      currentUser: null,
      teachers: [],
      timetable: [],
      lessons: [],
      homework: [],
    };
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (username: string) => {
    setState(prev => ({ ...prev, currentUser: username }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // ACTIONS
  const addTeacher = (teacher: Omit<Teacher, 'id' | 'isActive'>) => {
    const newTeacher: Teacher = { ...teacher, id: crypto.randomUUID(), isActive: true };
    setState(prev => ({ ...prev, teachers: [...prev.teachers, newTeacher] }));
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setState(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t)
    }));
  };

  const deleteTeacher = (id: string) => {
    if (!window.confirm("Are you sure? This will permanently remove this teacher record.")) return;
    setState(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== id),
      timetable: prev.timetable.map(entry => entry.teacherId === id ? { ...entry, teacherId: '' } : entry)
    }));
  };

  const toggleTeacherStatus = (id: string) => {
    setState(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => {
        if (t.id === id) {
          return {
            ...t,
            isActive: !t.isActive,
            yearEnded: !t.isActive ? undefined : new Date().getFullYear()
          };
        }
        return t;
      })
    }));
  };

  const updateTimetable = (entry: TimetableEntry) => {
    setState(prev => {
      const existing = prev.timetable.findIndex(e => e.day === entry.day && e.classId === entry.classId && e.periodNumber === entry.periodNumber);
      if (existing !== -1) {
        const newTimetable = [...prev.timetable];
        newTimetable[existing] = entry;
        return { ...prev, timetable: newTimetable };
      }
      return { ...prev, timetable: [...prev.timetable, entry] };
    });
  };

  const clearTimetableEntry = (id: string) => {
    setState(prev => ({
      ...prev,
      timetable: prev.timetable.filter(e => e.id !== id)
    }));
  };

  const addLesson = (lesson: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = { ...lesson, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, lessons: [...prev.lessons, newLesson] }));
  };

  const deleteLesson = (id: string) => {
    setState(prev => ({ ...prev, lessons: prev.lessons.filter(l => l.id !== id) }));
  };

  const addHomework = (hw: Omit<Homework, 'id'>) => {
    const newHw: Homework = { ...hw, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, homework: [...prev.homework, newHw] }));
  };

  const deleteHomework = (id: string) => {
    if (!window.confirm("Delete this homework entry?")) return;
    setState(prev => ({ ...prev, homework: prev.homework.filter(h => h.id !== id) }));
  };

  if (!state.currentUser) {
    return <Login onLogin={login} />;
  }

  const navLinks = (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      <SidebarLink to="/" icon={<Icons.Dashboard />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink to="/teachers" icon={<Icons.Teachers />} label="Faculty Records" onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink to="/timetable" icon={<Icons.Timetable />} label="Academic Calendar" onClick={() => setIsMobileMenuOpen(false)} />
      <div className="pt-6 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3">Daily Operations</div>
      <SidebarLink to="/daily-lessons" icon={<Icons.Lessons />} label="Lesson Logging" onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink to="/homework" icon={<Icons.Homework />} label="Homework Entry" onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink to="/reports" icon={<Icons.Reports />} label="Analytics & Sync" onClick={() => setIsMobileMenuOpen(false)} />
    </nav>
  );

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-[60] shadow-lg">
          <div className="flex items-center space-x-3">
            <Logo className="w-8 h-8" />
            <span className="font-black tracking-tighter text-sm">FOCUS <span className="text-orange-500">ACADEMY</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </button>
        </header>

        {/* MOBILE DRAWER OVERLAY */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR (Responsive) */}
        <aside className={`
          fixed md:sticky top-0 h-screen z-[58] w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="hidden md:flex p-6 border-b border-slate-800 bg-slate-900/50 flex-col items-center text-center">
            <Logo className="w-16 h-16 mb-3" />
            <h1 className="text-lg font-black tracking-tighter text-white uppercase brand-text">
              FOCUS <span className="text-orange-500">ACADEMY</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-[0.2em]">Management Hub</p>
          </div>
          
          {navLinks}

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button 
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group font-bold text-sm"
            >
              <Icons.Logout />
              <span className="ml-3">Logout Session</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto min-h-screen relative scroll-smooth">
          <div className="max-w-7xl mx-auto p-4 md:p-10">
            <Routes>
              <Route path="/" element={<Dashboard state={state} />} />
              <Route path="/teachers" element={<TeachersView teachers={state.teachers} onAdd={addTeacher} onToggle={toggleTeacherStatus} onDelete={deleteTeacher} onUpdate={updateTeacher} />} />
              <Route path="/timetable" element={<TimetableEntryView teachers={state.teachers} timetable={state.timetable} onUpdate={updateTimetable} onClear={clearTimetableEntry} />} />
              <Route path="/daily-lessons" element={<DailyEntryView teachers={state.teachers} timetable={state.timetable} lessons={state.lessons} onAddLesson={addLesson} onDeleteLesson={deleteLesson} />} />
              <Route path="/homework" element={<HomeworkView homework={state.homework} onAdd={addHomework} onDelete={deleteHomework} />} />
              <Route path="/reports" element={<ReportsView state={state} onUpdateState={updateState} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 font-bold translate-x-1' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:translate-x-1'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'}>{icon}</span>
      <span className="ml-3 text-sm">{label}</span>
    </Link>
  );
};

export default App;
