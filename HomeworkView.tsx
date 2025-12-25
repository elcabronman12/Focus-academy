
import React, { useState } from 'react';
import { Homework, SchoolClass } from '../types';
import { CLASSES } from '../constants';

interface HomeworkProps {
  homework: Homework[];
  onAdd: (hw: Omit<Homework, 'id'>) => void;
  onDelete: (id: string) => void;
}

const HomeworkView: React.FC<HomeworkProps> = ({ homework, onAdd, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(CLASSES[0] as SchoolClass);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    image: ''
  });

  const handleShare = async (hw: Homework) => {
    const formattedDate = new Date(hw.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const shareText = `📝 *FOCUS ACADEMY - HOMEWORK ALERT*
------------------------------
📅 *Assigned:* ${formattedDate}
👥 *Grade:* ${hw.classId}
📚 *Subject:* ${hw.subject}

📖 *Homework Instructions:*
${hw.description}

💡 *Note for Parents:* Please guide the student to finish this task before the next lesson. We appreciate your support in their academic journey.

_Focus Academy Academic Department_`;

    const shareData: any = {
      title: 'Focus Academy Homework Task',
      text: shareText,
    };

    try {
      if (hw.image && navigator.canShare) {
        const response = await fetch(hw.image);
        const blob = await response.blob();
        const file = new File([blob], `homework_${hw.subject}.png`, { type: 'image/png' });
        
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      date,
      classId: selectedClass
    });
    setFormData({ subject: '', description: '', image: '' });
    setIsAdding(false);
  };

  const homeworkToday = homework.filter(h => h.date === date && h.classId === selectedClass);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase brand-text">
            Homework <span className="text-amber-500">Portal</span>
          </h1>
          <p className="text-slate-500">Assign independent tasks and notify parents instantly.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'} w-full md:w-auto px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105`}
        >
          {isAdding ? 'Close Form' : '+ Issue Homework'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</label>
          <input 
            type="date"
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Section</label>
          <select 
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value as SchoolClass)}
          >
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border-2 border-amber-100 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                  placeholder="e.g. Science"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Instructions</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-medium text-sm"
                  placeholder="Task details..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Worksheet Image (Optional)</label>
              {formData.image ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-lg">X</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video w-full rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/20 hover:bg-amber-50 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Attach Worksheet</span>
                </label>
              )}
            </div>
          </div>
          <button type="submit" className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-amber-600 transition-all">
            Issue Assignment
          </button>
        </form>
      )}

      <div className="space-y-6">
        {homeworkToday.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {homeworkToday.map(hw => (
              <div key={hw.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:shadow-xl transition-all">
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{hw.subject}</h3>
                      <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{hw.classId} — Homework</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleShare(hw)}
                        className="text-orange-500 hover:bg-orange-50 p-3 rounded-2xl transition-all border border-orange-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                      </button>
                      <button 
                        onClick={() => onDelete(hw.id)}
                        className="text-rose-400 hover:text-rose-600 p-3 rounded-2xl transition-all border border-rose-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-xl text-slate-600 text-sm whitespace-pre-line font-medium border border-slate-100">
                    {hw.description}
                  </div>
                </div>
                
                {hw.image && (
                  <div className="lg:w-72 bg-slate-50/50 p-6 border-t lg:border-t-0 lg:border-l border-slate-100">
                    <img src={hw.image} alt="Homework" className="w-full aspect-square object-cover rounded-2xl shadow-lg border-2 border-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">No assignments for this selection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkView;
