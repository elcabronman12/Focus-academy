
import React, { useState } from 'react';
import { AppState, SchoolClass, Lesson } from '../types';
import { CLASSES, Icons } from '../constants';

interface ReportsViewProps {
  state: AppState;
  onUpdateState: (updates: Partial<AppState>) => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ state, onUpdateState }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const filteredLessons = state.lessons.filter(l => {
    const dateMatch = l.date === selectedDate;
    const classMatch = selectedClass === 'All' || l.classId === selectedClass as SchoolClass;
    return dateMatch && classMatch;
  });

  const homeworkCount = state.homework.filter(h => {
     const dateMatch = h.date === selectedDate;
     const classMatch = selectedClass === 'All' || h.classId === selectedClass as SchoolClass;
     return dateMatch && classMatch;
  }).length;

  const handleShareLesson = async (lesson: Lesson, teacherName: string) => {
    const shareText = `🏫 *FOCUS ACADEMY - ARCHIVED LOG*
📅 *Date:* ${lesson.date}
👥 *Class:* ${lesson.classId}
📚 *Subject:* ${lesson.subject}
🕒 *Session:* Period ${lesson.periodNumber} (${lesson.timeTaught})
👨‍🏫 *Lead:* ${teacherName}

Whiteboard capture attached for review.`;

    const shareData: any = { title: 'Focus Academy Archive', text: shareText };

    try {
      if (lesson.whiteboardImage && navigator.canShare) {
        const response = await fetch(lesson.whiteboardImage);
        const blob = await response.blob();
        const file = new File([blob], `archive_${lesson.subject}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) { shareData.files = [file]; }
      }
      if (navigator.share) { await navigator.share(shareData); } 
      else { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank'); }
    } catch (e) {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `focus_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const handleGithubSync = async () => {
    if (!state.githubToken) {
      alert("Please provide a GitHub Personal Access Token first.");
      return;
    }
    setSyncStatus('syncing');
    try {
      // Create a copy without sensitive sync info to store in the Gist
      const { githubToken, githubGistId, ...dataToBackup } = state;
      const payload = {
        description: "Focus Academy - School Management Backup",
        public: false,
        files: { "focus_academy_data.json": { content: JSON.stringify(dataToBackup, null, 2) } }
      };

      let url = "https://api.github.com/gists";
      let method = "POST";
      if (state.githubGistId) {
        url = `https://api.github.com/gists/${state.githubGistId}`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `token ${state.githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || response.statusText);
      }
      
      const result = await response.json();
      if (!state.githubGistId) onUpdateState({ githubGistId: result.id });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handlePullFromCloud = async () => {
    if (!state.githubToken || !state.githubGistId) {
      alert("Requires both Token and Gist ID to restore.");
      return;
    }
    if (!window.confirm("This will overwrite your CURRENT local data with the version from the cloud. Proceed?")) return;

    setSyncStatus('syncing');
    try {
      const response = await fetch(`https://api.github.com/gists/${state.githubGistId}`, {
        headers: { "Authorization": `token ${state.githubToken}` }
      });
      if (!response.ok) throw new Error("Could not find Gist. Check your ID.");
      const result = await response.json();
      const content = result.files["focus_academy_data.json"]?.content;
      if (content) {
        const cloudData = JSON.parse(content);
        // Preserve current token and gistId while applying cloud data
        onUpdateState({ 
          ...cloudData, 
          githubToken: state.githubToken, 
          githubGistId: state.githubGistId 
        });
        setSyncStatus('success');
        alert("Cloud Restoration Successful! Your data is now synced.");
      }
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase brand-text">Sync & <span className="text-blue-600">Infrastructure</span></h1>
          <p className="text-slate-500 mt-1">Manage cloud synchronization and local data integrity.</p>
        </div>
        <div className="flex space-x-2 w-full md:w-auto">
          <button onClick={() => setShowGuide(!showGuide)} className="flex-1 md:flex-none bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold border border-blue-100 text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors">
            {showGuide ? 'Hide Guide' : 'Connection Guide'}
          </button>
          <button onClick={handleExportData} className="flex-1 md:flex-none bg-white text-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-200 shadow-sm text-xs uppercase tracking-widest hover:bg-slate-50">
            Manual Backup
          </button>
        </div>
      </header>

      {showGuide && (
        <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-xl animate-in slide-in-from-top duration-300">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            How to Connect Your Cloud
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-blue-700/50 p-5 rounded-2xl border border-blue-400/30">
              <span className="block text-2xl font-black mb-2 text-blue-200">01</span>
              <p className="font-bold">Create a Token</p>
              <p className="text-blue-100 mt-2 leading-relaxed">Go to GitHub Settings > Developer Settings > Tokens (Classic). Generate one with <span className="underline decoration-white underline-offset-4">gist</span> access.</p>
              <a href="https://github.com/settings/tokens/new" target="_blank" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest bg-white text-blue-600 px-3 py-1.5 rounded-lg">Go to GitHub →</a>
            </div>
            <div className="bg-blue-700/50 p-5 rounded-2xl border border-blue-400/30">
              <span className="block text-2xl font-black mb-2 text-blue-200">02</span>
              <p className="font-bold">Paste & Push</p>
              <p className="text-blue-100 mt-2 leading-relaxed">Paste the token in the field below. Leave "Gist ID" empty for the first time. Click <span className="font-black">PUSH TO CLOUD</span>.</p>
            </div>
            <div className="bg-blue-700/50 p-5 rounded-2xl border border-blue-400/30">
              <span className="block text-2xl font-black mb-2 text-blue-200">03</span>
              <p className="font-bold">Device Sync</p>
              <p className="text-blue-100 mt-2 leading-relaxed">On your second device, paste the <span className="font-black">same Token</span> and the <span className="font-black">Gist ID</span> generated. Click <span className="font-black">PULL FROM CLOUD</span>.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-2xl border transition-colors ${state.githubToken && state.githubGistId ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}`}>
              <Icons.Github />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-black uppercase tracking-tighter">GitHub Gist Sync</h2>
                {state.githubToken && state.githubGistId && (
                  <span className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Connected</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Store your database in your private GitHub account</p>
            </div>
          </div>
          {syncStatus !== 'idle' && (
            <div className={`text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest ${
              syncStatus === 'syncing' ? 'bg-blue-600 animate-pulse' : 
              syncStatus === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              Status: {syncStatus}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Access Token</label>
                <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Encrypted locally</span>
              </div>
              <input 
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-blue-300 transition-all"
                value={state.githubToken || ''}
                onChange={e => onUpdateState({ githubToken: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Active Gist ID (Your Database Reference)</label>
              <input 
                type="text"
                placeholder="Auto-generated on first push..."
                className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-blue-300 transition-all"
                value={state.githubGistId || ''}
                onChange={e => onUpdateState({ githubGistId: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-4">
            <button 
              disabled={syncStatus === 'syncing'}
              onClick={handleGithubSync}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <span>{state.githubGistId ? 'Push Update to Cloud' : 'Initialize Cloud Save'}</span>
            </button>
            <button 
              disabled={syncStatus === 'syncing' || !state.githubGistId}
              onClick={handlePullFromCloud}
              className="w-full py-5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-slate-700 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
              <span>Restore from Cloud (Pull)</span>
            </button>
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                 <p className="text-rose-400 text-[9px] font-black uppercase tracking-widest text-center">Sync Failed: {errorMessage}</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          <span>© 2025 FOCUS ACADEMY SYSTEM</span>
          <span className="flex items-center mt-2 md:mt-0">
             <svg className="w-3 h-3 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 11.37c1.13.932 2.583 1.25 3.886 1.145a3.14 3.14 0 013.846-1.01 4.991 4.991 0 005.115 1.058c.1.05.21.09.32.118a7.006 7.006 0 016.774-1.442 2 2 0 011.228 2.568 4.902 4.902 0 01-1.154 1.913c-.15.17-.35.31-.57.41a7.147 7.147 0 01-4.33 1.446 7.417 7.417 0 01-1.247-.103 4.045 4.045 0 01-3.154-3.174 2.992 2.992 0 01-2.986 2.036 5.154 5.154 0 01-4.731-3.39 4.92 4.92 0 01-2.17.374 2 2 0 01-2.02-2.315 4.902 4.902 0 011.154-1.913z" clipRule="evenodd"></path></svg>
             End-to-End Encrypted Data Storage
          </span>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Archive Query Engine</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Date</label>
            <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section</label>
            <select className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase text-xs" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="All">All Grades</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Tasks Found</span>
              <span className="text-2xl font-black text-blue-900">{homeworkCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map(lesson => {
          const teacher = state.teachers.find(t => t.id === lesson.teacherId);
          return (
            <div key={lesson.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                <img src={lesson.whiteboardImage} alt="Board" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <button 
                  onClick={() => handleShareLesson(lesson, teacher?.fullName || 'Staff')}
                  className="absolute bottom-3 right-3 p-3 bg-white text-orange-500 rounded-xl shadow-2xl hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-900 leading-tight uppercase tracking-tighter truncate">{lesson.subject}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[9px] font-black uppercase text-slate-400">{lesson.classId} — {lesson.timeTaught}</span>
                  <a href={lesson.whiteboardImage} download className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsView;
