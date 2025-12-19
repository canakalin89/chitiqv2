
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Evaluation, ExamSession, ClassRoom, Student } from '../types';
import { BackIcon } from '../icons/BackIcon';

interface ClassStat {
  id: string;
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
  const { t, i18n } = useTranslation();
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [reportClassId, setReportClassId] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const examData = useMemo(() => history.filter(h => 'isExam' in h && h.isExam) as ExamSession[], [history]);

  // Handle printing trigger after DOM update
  useEffect(() => {
    if (reportClassId && isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
        setTimeout(() => setReportClassId(null), 500);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [reportClassId, isPrinting]);

  const classStats = useMemo(() => {
    const stats: Record<string, ClassStat> = {};
    classes.forEach(c => {
      const classExams = examData.filter(e => e.studentInfo.classId === c.id || e.studentInfo.studentClass === c.name);
      if (classExams.length > 0) {
        const sum = classExams.reduce((acc, curr) => acc + curr.overallScore, 0);
        stats[c.id] = {
          id: c.id,
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

  const startPrintProcess = (classId: string) => {
    setReportClassId(classId);
    setIsPrinting(true);
  };

  const reportClass = classes.find(c => c.id === reportClassId);
  
  // Create a list of ALL students in the class and pair them with their best/latest exam if it exists
  const reportRows = useMemo(() => {
    if (!reportClass) return [];
    
    return [...reportClass.students]
      .sort((a, b) => {
        const noA = parseInt(a.studentNumber, 10) || 0;
        const noB = parseInt(b.studentNumber, 10) || 0;
        return noA - noB;
      })
      .map(student => {
        // Find the exam result for this student
        const studentExam = examData.find(e => 
          e.studentInfo.studentNumber === student.studentNumber || 
          (e.studentInfo.firstName.toLowerCase() === student.firstName.toLowerCase() && 
           e.studentInfo.lastName.toLowerCase() === student.lastName.toLowerCase())
        );
        return { student, exam: studentExam };
      });
  }, [reportClass, examData]);

  if (examData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4 animate-fade-in relative z-10">
        <button onClick={onBack} className="absolute top-8 left-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><BackIcon className="w-6 h-6" /></button>
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-500 opacity-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg></div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('analytics.noData')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in relative z-10 pb-20">
      <div className="space-y-10 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><BackIcon className="w-6 h-6" /></button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('analytics.title')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(classStats).map((stat: ClassStat) => (
            <div key={stat.id} className="glass p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col items-center text-center">
               <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">{stat.name}</span>
               <h2 className="text-4xl font-black text-slate-800 dark:text-white">{stat.avg}</h2>
               <p className="text-xs text-slate-400 font-bold uppercase mt-1">{t('analytics.averageScore')}</p>
               <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${stat.avg}%` }}></div></div>
               <button 
                 onClick={() => startPrintProcess(stat.id)} 
                 className="mt-6 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all w-full border border-indigo-100"
               >
                 {t('classes.classReport')}
               </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm space-y-6">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('analytics.classComparison')}</h3>
             <p className="text-sm text-slate-500">{t('analytics.selectClasses')}</p>
             <div className="space-y-2">
               {Object.entries(classStats).map(([id, stat]) => (
                  <label key={id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedClassIds.includes(id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                     <span className="font-bold text-slate-700 dark:text-slate-200">{(stat as ClassStat).name}</span>
                     <input type="checkbox" checked={selectedClassIds.includes(id)} onChange={() => handleToggleComparison(id)} className="w-5 h-5 text-indigo-600 rounded" />
                  </label>
               ))}
             </div>
          </div>
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

      {/* --- CLASS ACHIEVEMENT REPORT (PRINT ONLY) --- */}
      {reportClass && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 m-0 w-full h-full text-slate-900 overflow-visible">
           <style>{`
             @media print {
               body * { visibility: hidden; }
               .print-container, .print-container * { visibility: visible; }
               .print-container { position: absolute; left: 0; top: 0; width: 100%; }
               @page { size: A4; margin: 1cm; }
             }
           `}</style>
           
           <div className="print-container space-y-8 p-4">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
                 <div className="flex items-center gap-4">
                    <img 
                      src="https://azizsancaranadolu.meb.k12.tr/meb_iys_dosyalar/59/11/765062/dosyalar/2025_11/03215750_speaksmartaltlogo.png" 
                      alt="Logo" 
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                       <h2 className="text-2xl font-black uppercase text-slate-900 leading-tight">{t('analytics.classReportTitle')}</h2>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">ChitIQ Teacher Analytics Portal</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xl font-black text-indigo-600 leading-none">{reportClass.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Total Students: {reportClass.students.length}</p>
                 </div>
              </div>

              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-slate-100 border-y-2 border-slate-900">
                       <th className="border border-slate-300 p-2 text-center text-[10px] font-black uppercase text-slate-700 w-12">{t('analytics.studentNo')}</th>
                       <th className="border border-slate-300 p-2 text-left text-[10px] font-black uppercase text-slate-700">{t('analytics.studentName')}</th>
                       <th className="border border-slate-300 p-2 text-center text-[9px] font-bold uppercase text-slate-500">Rapport</th>
                       <th className="border border-slate-300 p-2 text-center text-[9px] font-bold uppercase text-slate-500">Org.</th>
                       <th className="border border-slate-300 p-2 text-center text-[9px] font-bold uppercase text-slate-500">Deliv.</th>
                       <th className="border border-slate-300 p-2 text-center text-[9px] font-bold uppercase text-slate-500">Lang.</th>
                       <th className="border border-slate-300 p-2 text-center text-[9px] font-bold uppercase text-slate-500">Creat.</th>
                       <th className="border border-slate-300 p-2 text-center text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 w-20">{t('analytics.total')}</th>
                       <th className="border border-slate-300 p-2 text-center text-[9px] font-bold uppercase text-slate-500 w-24">{t('exam.examDate')}</th>
                    </tr>
                 </thead>
                 <tbody>
                    {reportRows.map((row) => (
                       <tr key={row.student.id} className="border-b border-slate-200">
                          <td className="border border-slate-200 p-2 text-center text-[11px] font-bold text-slate-900 bg-slate-50/50">{row.student.studentNumber}</td>
                          <td className="border border-slate-200 p-2 text-[11px] font-bold text-slate-900">{row.student.firstName} {row.student.lastName}</td>
                          <td className="border border-slate-200 p-2 text-center text-[10px] text-slate-600">{row.exam?.scores.rapport ?? '-'}</td>
                          <td className="border border-slate-200 p-2 text-center text-[10px] text-slate-600">{row.exam?.scores.organisation ?? '-'}</td>
                          <td className="border border-slate-200 p-2 text-center text-[10px] text-slate-600">{row.exam?.scores.delivery ?? '-'}</td>
                          <td className="border border-slate-200 p-2 text-center text-[10px] text-slate-600">{row.exam?.scores.languageUse ?? '-'}</td>
                          <td className="border border-slate-200 p-2 text-center text-[10px] text-slate-600">{row.exam?.scores.creativity ?? '-'}</td>
                          <td className="border border-slate-200 p-2 text-center text-[12px] font-black text-indigo-700 bg-indigo-50/30">
                            {row.exam ? `%${row.exam.overallScore}` : '-'}
                          </td>
                          <td className="border border-slate-200 p-2 text-center text-[9px] text-slate-400 font-medium">
                             {row.exam ? new Date(row.exam.date).toLocaleDateString(i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US') : 'N/A'}
                          </td>
                       </tr>
                    ))}
                 </tbody>
                 <tfoot>
                    <tr className="bg-slate-900 text-white font-black border-t-2 border-slate-900">
                       <td colSpan={2} className="p-3 text-[11px] uppercase tracking-widest pl-4">CLASS AVERAGE PERFORMANCE</td>
                       <td className="p-3 text-center text-[11px]">{classStats[reportClass.id]?.metrics.rapport ?? '-'}</td>
                       <td className="p-3 text-center text-[11px]">{classStats[reportClass.id]?.metrics.organisation ?? '-'}</td>
                       <td className="p-3 text-center text-[11px]">{classStats[reportClass.id]?.metrics.delivery ?? '-'}</td>
                       <td className="p-3 text-center text-[11px]">{classStats[reportClass.id]?.metrics.languageUse ?? '-'}</td>
                       <td className="p-3 text-center text-[11px]">{classStats[reportClass.id]?.metrics.creativity ?? '-'}</td>
                       <td className="p-3 text-center text-[14px] bg-indigo-600">
                         {classStats[reportClass.id] ? `%${classStats[reportClass.id].avg}` : '-'}
                       </td>
                       <td className="p-3"></td>
                    </tr>
                 </tfoot>
              </table>

              <div className="flex justify-between items-end mt-16 pt-6 border-t border-slate-300">
                 <div className="w-1/2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-8">Official Assessment Notes</p>
                    <div className="border-b border-dashed border-slate-300 h-16 w-3/4"></div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-8">Authorized Instructor Signature</p>
                    <p className="border-t-2 border-slate-900 pt-2 font-black text-slate-900 text-[12px]">Can AKALIN</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
