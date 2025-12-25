
import React, { useState } from 'react';
import { Teacher, TimetableEntry, Lesson, SchoolClass } from '../types';
import { CLASSES, PERIODS, DAYS } from '../constants';

interface DailyEntryProps {
  teachers: Teacher[];
  timetable: TimetableEntry[];
  lessons: Lesson[];
  onAddLesson: (lesson: Omit<Lesson, 'id'>) => void;
  onDeleteLesson: (id: string) => void;
}

const DailyEntryView: React.FC<DailyEntryProps> = ({ teachers, timetable, lessons, onAddLesson, onDeleteLesson }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0]);

  const dateObj = new Date(selectedDate);
  const dayName = DAYS[(dateObj.getDay() + 6) % 7] || 'Monday';

  const getTimetableForDay = () => {
    return timetable.filter(e => e.day === dayName && e.classId === selectedClass as SchoolClass);
  };

  const getLoggedLesson = (period: number) => {
    return lessons.find(l => l.date === selectedDate && l.classId === selectedClass as SchoolClass && l.periodNumber === period);
  };

  const handleShare = async (lesson: Lesson, teacher: Teacher | undefined, schedule: TimetableEntry | undefined) => {
    const formattedDate = new Date(lesson.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const teacherName = teacher?.fullName || 'Academic Staff';
    const periodTime = schedule ? `${schedule.startTime} - ${schedule.endTime}` : lesson.timeTaught;

    const shareText = `🏫 *FOCUS ACADEMY - LESSON UPDATE*
------------------------------
📅 *Date:* ${formattedDate}
👥 *Class:* ${lesson.classId}
📚 *Subject:* ${lesson.subject}
🕒 *Period:* ${lesson.periodNumber} (${periodTime})
👨‍🏫 *Teacher:* ${teacherName}

📖 *Details:* Today we covered key concepts in ${lesson.subject}. Attached is the whiteboard capture for your review and to help with student study.

_Sent via Focus Academy Management Portal_`;

    const shareData: any = {
      title: 'Focus Academy Lesson Capture',
      text: shareText,
    };

    try {
      if (lesson.whiteboardImage && navigator.canShare) {
        const response = await fetch(lesson.whiteboardImage);
        const blob = await response.blob();
        const file = new File([blob], `focus_lesson_${lesson.subject}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleImageUpload = (period: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const timetableEntry = getTimetableForDay().find(t => t.periodNumber === period);
      if (!timetableEntry) {
        alert("Please set a subject for this period in the Timetable first!");
        return;
      }

      onAddLesson({
        classId: selectedClass as SchoolClass,
        subject: timetableEntry.subject,
        teacherId: timetableEntry.teacherId,
        date: selectedDate,
        periodNumber: period,
        whiteboardImage: event.target?.result as string,
        timeTaught: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase brand-text">
            Daily <span className="text-orange-500">Lesson Logger</span>
          </h1>
          <p className="text-slate-500">Capture and share whiteboard session notes with parents.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</label>
          <input 
            type="date"
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Section</label>
          <select 
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {PERIODS.map(period => {
          const schedule = getTimetableForDay().find(t => t.periodNumber === period);
          const logged = getLoggedLesson(period);
          const teacher = teachers.find(t => t.id === schedule?.teacherId);

          return (
            <div key={period} className={`group bg-white p-6 md:p-8 rounded-[2rem] border-2 transition-all ${logged ? 'border-emerald-100 shadow-emerald-500/5' : 'border-slate-50 hover:border-slate-100'} flex flex-col md:flex-row gap-6 items-center`}>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center space-x-4">
                   <span className="shrink-0 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl group-hover:bg-orange-500 transition-colors">P{period}</span>
                   <div className="overflow-hidden">
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter truncate">{schedule?.subject || 'Free Period'}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{schedule ? `${schedule.startTime} — ${schedule.endTime}` : 'No scheduled subject'}</p>
                   </div>
                </div>

                {schedule && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {teacher?.fullName || 'Unassigned Teacher'}
                    </p>
                    
                    {logged && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                          Logged at {logged.timeTaught}
                        </div>
                        <button 
                          onClick={() => handleShare(logged, teacher, schedule)}
                          className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                          Share to Parent
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-64 shrink-0">
                {logged ? (
                  <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group/img border-4 border-white ring-1 ring-slate-100">
                    <img src={logged.whiteboardImage} alt="Board" className="object-cover w-full h-full transition-transform duration-700 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <label className="cursor-pointer bg-white text-slate-900 p-2.5 rounded-xl shadow-xl hover:scale-110 transition-transform">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(period, e)} />
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      </label>
                      <button 
                        onClick={() => { if(window.confirm("Remove this board photo?")) onDeleteLesson(logged.id); }}
                        className="bg-rose-500 text-white p-2.5 rounded-xl shadow-xl hover:scale-110 transition-transform"
                        title="Delete Image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all ${schedule ? 'border-orange-200 bg-orange-50/20 cursor-pointer hover:border-orange-500 hover:bg-orange-50' : 'border-slate-100 bg-slate-50 opacity-40'}`}>
                    {schedule && (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group/label">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(period, e)} />
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover/label:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest text-center">Capture Board</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyEntryView;
