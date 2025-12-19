
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Evaluation, ExamSession, ClassRoom } from '../types';
import { BackIcon } from '../icons/BackIcon';

// Define the interface for class statistics to ensure proper typing in loops
interface ClassStat {
  name: string;
  count: number;
  avg: number;
  metrics: {
    rapport: number;
    organisation: number;
    delivery: number;
    languageUse: number;
    creativity: number;
  };
}

interface AnalyticsDashboardProps {
  history: (Evaluation | ExamSession)[];
  classes: ClassRoom[];
  onBack: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history, classes, onBack }) => {
  const { t } = useTranslation();
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const examData = useMemo(() => history.filter(h => 'isExam' in h && h.isExam) as ExamSession[], [history]);

  // Use the ClassStat interface for the stats record to help TypeScript inference
  const classStats = useMemo(() => {
    const stats: Record<string, ClassStat> = {};
    classes.forEach(c => {
      const classExams = examData.filter(e => e.studentInfo.classId === c.id || e.studentInfo.studentClass === c.name);
      if (classExams.length > 0) {
        const sum = classExams.reduce((acc, curr) => acc + curr.overallScore, 0);
        stats[c.id] = {
          name: c.name,
          count: classExams.length,
          avg: Math.round(sum / classExams.length),
          metrics: {
             rapport: Math.round(classExams.reduce((a, b) => a + b.scores.rapport, 0) / classExams.length),
             organisation: Math.round(classExams.reduce((a, b) => a + b.scores.organisation, 0) / classExams.length),
             delivery: Math.round(classExams.reduce((a, b) => a + b.scores.delivery, 0) / classExams.length),
             languageUse: Math.round(classExams.reduce((a, b) => a + b.scores.languageUse, 0) / classExams.length),
             creativity: Math.round(classExams.reduce((a, b) => a + b.scores.creativity, 0) / classExams.length),
          }
        };
      }
    });
    return stats;
  }, [examData, classes]);

  const handleToggleComparison = (id: string) => {
    setSelectedClassIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (examData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4 animate-fade-in">
        <button onClick={onBack} className="absolute top-8 left-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><BackIcon className="w-6 h-6" /></button>
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-500 opacity-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg></div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('analytics.noData')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in relative z-10 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><BackIcon className="w-6 h-6" /></button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('analytics.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Explicitly type stat as ClassStat to resolve 'unknown' errors */}
        {Object.values(classStats).map((stat: ClassStat) => (
          <div key={stat.name} className="glass p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col items-center text-center">
             <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">{stat.name}</span>
             <h2 className="text-4xl font-black text-slate-800 dark:text-white">{stat.avg}</h2>
             <p className="text-xs text-slate-400 font-bold uppercase mt-1">{t('analytics.averageScore')}</p>
             <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${stat.avg}%` }}></div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Selector for Comparison */}
        <div className="lg:col-span-1 glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm space-y-6">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('analytics.classComparison')}</h3>
           <p className="text-sm text-slate-500">{t('analytics.selectClasses')}</p>
           <div className="space-y-2">
             {Object.entries(classStats).map(([id, stat]) => (
                /* Use type casting for stat in Object.entries to resolve 'unknown' errors */
                <label key={id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedClassIds.includes(id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                   <span className="font-bold text-slate-700 dark:text-slate-200">{(stat as ClassStat).name}</span>
                   <input type="checkbox" checked={selectedClassIds.includes(id)} onChange={() => handleToggleComparison(id)} className="w-5 h-5 text-indigo-600 rounded" />
                </label>
             ))}
           </div>
        </div>

        {/* Comparison Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl overflow-hidden min-h-[400px]">
           <div className="h-full flex flex-col">
              <div className="flex-1 flex items-end justify-around gap-4 pt-10">
                 {selectedClassIds.length === 0 ? (
                    <div className="flex flex-col items-center text-slate-300 opacity-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg><p className="font-bold text-xs uppercase tracking-widest">Select classes to see comparison</p></div>
                 ) : (
                    selectedClassIds.map(id => {
                       const stat = classStats[id];
                       return (
                          <div key={id} className="flex flex-col items-center w-full max-w-[80px] group">
                             <div className="relative w-full bg-indigo-500 rounded-t-xl transition-all duration-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20" style={{ height: `${stat.avg * 3}px` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">{stat.avg}</div>
                             </div>
                             <span className="mt-4 text-xs font-bold text-slate-500 uppercase rotate-45 md:rotate-0 whitespace-nowrap">{stat.name}</span>
                          </div>
                       );
                    })
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
