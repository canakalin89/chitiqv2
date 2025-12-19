
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EvaluationResultData, StudentInfo } from '../types';
import { BackIcon } from '../icons/BackIcon';
import { CRITERIA } from '../constants';

interface EvaluationResultProps {
  data: EvaluationResultData;
  audioBlob: Blob | null;
  onBack: () => void;
  isExam?: boolean;
  studentInfo?: StudentInfo | null;
}

const EvaluationResult: React.FC<EvaluationResultProps> = ({ 
  data, 
  audioBlob, 
  onBack,
  isExam = false,
  studentInfo = null
}) => {
  const { t, i18n } = useTranslation();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handlePrint = () => {
    window.print();
  };

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.overallScore / 100) * circumference;

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';

  const renderRadarChart = (chartRadius: number = 85, size: number = 240) => {
    const center = size / 2;
    const criteriaKeys = Object.keys(data.scores);
    const totalPoints = criteriaKeys.length;
    
    const getPoint = (value: number, index: number, maxRadius: number) => {
      const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
      const r = (value / 100) * maxRadius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    const dataPoints = criteriaKeys.map((key, i) => {
      // @ts-ignore
      const val = data.scores[key];
      return getPoint(val, i, chartRadius);
    });
    const dataPath = dataPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + ' Z';
    const levels = [25, 50, 75, 100];
    
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {levels.map((level, i) => {
          const points = criteriaKeys.map((_, idx) => {
             const p = getPoint(level, idx, chartRadius);
             return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={i}
              points={points}
              fill="transparent"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700 print:text-gray-300"
              strokeWidth="1"
            />
          );
        })}
        {criteriaKeys.map((_, i) => {
          const p = getPoint(100, i, chartRadius);
          return (
             <line
               key={i}
               x1={center}
               y1={center}
               x2={p.x}
               y2={p.y}
               stroke="currentColor"
               className="text-slate-200 dark:text-slate-700 print:text-gray-300"
               strokeWidth="1"
             />
          );
        })}
        <path d={dataPath} fill="currentColor" className="text-indigo-500/20 dark:text-indigo-400/20 print:text-indigo-100" />
        <path d={dataPath} fill="transparent" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400 print:text-indigo-600" strokeWidth="2" />
        {dataPoints.map((p, i) => (
           <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 stroke-2 print:fill-indigo-600 print:stroke-white" />
        ))}
        {criteriaKeys.map((key, i) => {
           const p = getPoint(110, i, chartRadius); 
           // @ts-ignore
           const label = CRITERIA[langKey][key].split(' ')[0]; 
           return (
             <text
               key={i}
               x={p.x}
               y={p.y}
               textAnchor="middle"
               dominantBaseline="middle"
               className="text-[9px] font-bold fill-slate-500 dark:fill-slate-400 print:fill-gray-600 uppercase tracking-wider"
             >
               {label}
             </text>
           );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto print:p-0 print:space-y-4">
      {/* Navigation & Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white hover:shadow-sm dark:hover:bg-slate-800 transition-all font-medium"
        >
          <BackIcon className="w-5 h-5" />
          {t('common.goBack')}
        </button>
        <div className="flex items-center gap-4">
           {isExam && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.618 0-1.113-.493-1.12-1.112L5.882 18m11.778 0H5.882M6.72 13.829l1.41-5.64m1.41 5.64H14.25m5.341-3.172l-1.41-5.64m1.41 5.64l.842 3.368a1.125 1.125 0 01-1.12 1.405h-1.076M14.25 13.829v-1.125c0-.621.504-1.125 1.125-1.125h1.275m-4.5 1.125v-1.125c0-.621.504-1.125 1.125-1.125H14.25m-2.625 0H12m-2.625 0H9m-2.625 0H6M4.5 9h15M10.125 1.5h3.75a1.125 1.125 0 011.125 1.125v2.625h-6V2.625a1.125 1.125 0 011.125-1.125z" />
                </svg>
                {t('common.print')}
              </button>
           )}
           <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-md text-center md:text-right">
            {data.topic}
           </h1>
        </div>
      </div>

      {/* --- EXAM REPORT HEADER (Visible only on Print) --- */}
      <div className="hidden print:block space-y-4 mb-6 border-b border-slate-300 pb-4">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <img 
                 src="https://azizsancaranadolu.meb.k12.tr/meb_iys_dosyalar/59/11/765062/dosyalar/2025_11/03215750_speaksmartaltlogo.png" 
                 alt="Logo" 
                 className="w-12 h-12 object-contain"
               />
               <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{t('exam.reportTitle')}</h1>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-[9px]">ChitIQ AI Speaking Analytics</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{t('exam.examDate')}</p>
               <p className="text-sm font-bold text-slate-900 leading-none">{new Date().toLocaleDateString(i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US')}</p>
            </div>
         </div>

         <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
            <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.firstName')}</p>
               <p className="text-sm font-bold text-slate-900">{studentInfo?.firstName || '-'}</p>
            </div>
            <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.lastName')}</p>
               <p className="text-sm font-bold text-slate-900">{studentInfo?.lastName || '-'}</p>
            </div>
            <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.class')}</p>
               <p className="text-sm font-bold text-slate-900">{studentInfo?.studentClass || '-'}</p>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t('evaluation.overallScore')}</p>
                <p className="text-2xl font-black text-indigo-600">%{data.overallScore}</p>
            </div>
         </div>

         <div className="flex gap-2 items-baseline">
            <p className="text-[9px] font-bold text-slate-400 uppercase flex-shrink-0">{t('exam.selectedTopic')}:</p>
            <p className="text-xs font-semibold text-slate-700 italic truncate">"{data.topic}"</p>
         </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1 print:gap-4">
        
        <div className="lg:col-span-1 space-y-6 print:flex print:flex-row print:gap-6 print:items-start print:space-y-0">
          {/* Overall Score Card (Hidden on print if we use the header) */}
          <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-8 border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center relative overflow-hidden print:hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">{t('evaluation.overallScore')}</h3>
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 192 192" className="w-full h-full drop-shadow-lg">
                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`${getScoreColor(data.overallScore)} transition-all duration-1000 ease-out origin-center -rotate-90`} />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" dy="0.3em" className={`text-6xl font-extrabold tracking-tighter ${getScoreColor(data.overallScore)} fill-current`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {data.overallScore}
                </text>
              </svg>
            </div>
          </div>

          {/* Radar Chart Card */}
          <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-6 border border-white/20 dark:border-slate-800 shadow-lg flex flex-col items-center print:shadow-none print:border print:border-slate-100 print:w-1/3 print:p-3 print:rounded-xl">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 print:text-[8px] print:mb-1">Skill Chart</h3>
             <div className="w-full aspect-square max-w-[260px] print:max-w-[140px]">
                {renderRadarChart()}
             </div>
          </div>

          {/* Summary Card for Print (Compact) */}
          <div className="hidden print:block flex-1 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-indigo-100 rounded-md text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" /></svg>
                </div>
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">{t('common.summary')}</h3>
             </div>
             <p className="text-[10px] text-slate-700 leading-normal italic line-clamp-6">
                {data.feedback.summary}
             </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 print:lg:col-span-1 print:space-y-4">
          
          {/* Audio (Hidden on print) */}
          {audioUrl && (
             <div className="glass bg-white dark:bg-slate-900 rounded-2xl p-4 border border-white/20 dark:border-slate-800 shadow-sm flex items-center gap-4 print:hidden">
                <audio controls src={audioUrl} className="w-full h-10" />
             </div>
          )}

          {/* Summary (Hidden on print here because it's in the side box) */}
          <div className="glass bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm print:hidden">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('common.summary')}</h3>
             </div>
             <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line">
                {data.feedback.summary}
             </p>
          </div>

          {/* Criteria Grid (Optimized for Print) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-3 print:gap-2">
             {Object.entries(data.scores).map(([key, score]) => (
               <div key={key} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm print:p-3 print:border print:border-slate-100 print:bg-white print:rounded-xl">
                 <div className="flex justify-between items-center mb-3 print:mb-1">
                   <h4 className="font-bold text-slate-700 dark:text-slate-200 print:text-indigo-700 print:text-[8px] uppercase tracking-tighter">
                     {/* @ts-ignore */}
                     {CRITERIA[langKey][key]}
                   </h4>
                   <span className={`font-bold px-2.5 py-0.5 rounded-full text-sm ${getScoreColor(score as number).replace('text-', 'bg-').replace('500', '100').replace('400', '900/30')} ${getScoreColor(score as number)} print:bg-transparent print:p-0 print:text-[10px]`}>
                     {score}
                   </span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden print:mb-1.5 print:h-1">
                   <div className={`h-full rounded-full ${getProgressBarColor(score as number)} transition-all duration-1000 ease-out print:bg-indigo-600`} style={{ width: `${score}%` }}></div>
                 </div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line print:text-[8px] print:leading-tight print:text-slate-600 line-clamp-4">
                   {/* @ts-ignore */}
                   {data.feedback[key]}
                 </p>
               </div>
             ))}
           </div>

           {/* Pronunciation & Transcription (Print optimization: two columns) */}
           <div className="grid grid-cols-1 gap-6 print:grid-cols-2 print:gap-4">
               {/* Pronunciation */}
               <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 print:p-3 print:rounded-xl">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 print:text-[9px] print:text-indigo-600 uppercase tracking-widest">{t('evaluation.pronunciation')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed print:text-[8px] print:leading-tight">{data.feedback.pronunciation}</p>
               </div>

               {/* Transcription */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 print:p-3 print:rounded-xl print:border-slate-100 print:shadow-none">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 print:text-[9px] print:text-indigo-600 uppercase tracking-widest">{t('evaluation.transcription')}</h3>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl print:bg-transparent print:p-0 print:text-[7px] print:leading-tight print:max-h-24 print:overflow-hidden line-clamp-[10]">
                     {data.feedback.transcription}
                  </div>
               </div>
           </div>
        </div>
      </div>

      {/* --- TEACHER SIGNATURE AREA (Only Print) --- */}
      <div className="hidden print:flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
         <div className="w-1/2">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">{t('exam.teacherNotes')}</p>
            <div className="h-10 border-b border-dashed border-slate-300"></div>
         </div>
         <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-6">Instructor Signature</p>
            <p className="border-t border-slate-400 pt-1 font-bold text-slate-800 text-[10px]">Can AKALIN</p>
         </div>
      </div>
    </div>
  );
};

export default EvaluationResult;
