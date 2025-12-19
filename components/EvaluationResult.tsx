
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

  const renderRadarChart = (chartRadius: number = 90, size: number = 260) => {
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
    const levels = [20, 40, 60, 80, 100];
    
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
        <path d={dataPath} fill="transparent" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400 print:text-indigo-600" strokeWidth="2.5" />
        {dataPoints.map((p, i) => (
           <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 stroke-2 print:fill-indigo-600 print:stroke-white" />
        ))}
        {criteriaKeys.map((key, i) => {
           const p = getPoint(115, i, chartRadius); 
           // @ts-ignore
           const label = CRITERIA[langKey][key].split(' ')[0]; 
           return (
             <text
               key={i}
               x={p.x}
               y={p.y}
               textAnchor="middle"
               dominantBaseline="middle"
               className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400 print:fill-gray-600 uppercase tracking-wider"
             >
               {label}
             </text>
           );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
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
           <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-xl text-center md:text-right">
            {data.topic}
           </h1>
        </div>
      </div>

      {/* --- EXAM REPORT HEADER (Visible only on Print) --- */}
      <div className="hidden print:block space-y-8 mb-12 border-b-2 border-slate-900 pb-8">
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               <img 
                 src="https://azizsancaranadolu.meb.k12.tr/meb_iys_dosyalar/59/11/765062/dosyalar/2025_11/03215750_speaksmartaltlogo.png" 
                 alt="Logo" 
                 className="w-16 h-16 object-contain"
               />
               <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('exam.reportTitle')}</h1>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">ChitIQ Powered by AI</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-sm font-bold text-slate-400 uppercase">{t('exam.examDate')}</p>
               <p className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString(i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US')}</p>
            </div>
         </div>

         <div className="grid grid-cols-3 gap-8 bg-slate-50 p-6 rounded-2xl">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('exam.firstName')}</p>
               <p className="text-xl font-bold text-slate-900">{studentInfo?.firstName || '-'}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('exam.lastName')}</p>
               <p className="text-xl font-bold text-slate-900">{studentInfo?.lastName || '-'}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('exam.class')}</p>
               <p className="text-xl font-bold text-slate-900">{studentInfo?.studentClass || '-'}</p>
            </div>
         </div>

         <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">{t('exam.selectedTopic')}</p>
            <p className="text-lg font-semibold text-slate-800 leading-tight italic">"{data.topic}"</p>
         </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1">
        
        <div className="lg:col-span-1 space-y-6 print:flex print:flex-row print:gap-8 print:items-start print:space-y-0">
          {/* Overall Score Card */}
          <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-8 border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center relative overflow-hidden print:shadow-none print:border-2 print:border-slate-100 print:w-1/2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 print:bg-indigo-600"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 print:text-indigo-600">{t('evaluation.overallScore')}</h3>
            <div className="relative w-48 h-48 print:w-40 print:h-40">
              <svg viewBox="0 0 192 192" className="w-full h-full drop-shadow-lg print:drop-shadow-none">
                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800 print:text-slate-50" />
                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`${getScoreColor(data.overallScore)} transition-all duration-1000 ease-out origin-center -rotate-90 print:text-indigo-600`} />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" dy="0.3em" className={`text-6xl font-extrabold tracking-tighter ${getScoreColor(data.overallScore)} fill-current print:text-indigo-600`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {data.overallScore}
                </text>
              </svg>
            </div>
          </div>

          {/* Radar Chart Card */}
          <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-6 border border-white/20 dark:border-slate-800 shadow-lg flex flex-col items-center print:shadow-none print:border-2 print:border-slate-100 print:w-1/2">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Skill Breakdown</h3>
             <div className="w-full aspect-square max-w-[260px] print:max-w-[200px]">
                {renderRadarChart()}
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 print:lg:col-span-1 print:space-y-8">
          
          {/* Audio (Hidden on print) */}
          {audioUrl && (
             <div className="glass bg-white dark:bg-slate-900 rounded-2xl p-4 border border-white/20 dark:border-slate-800 shadow-sm flex items-center gap-4 print:hidden">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M19.957 4.276a1.75 1.75 0 10-2.475-2.475L7.468 11.815a2.5 2.5 0 000 3.535l10.014 10.014a1.75 1.75 0 102.475-2.475l-1.414-1.414c.162-.162.3-.35.405-.558a2.502 2.502 0 00-2.435-3.553c-1.037.112-1.928-.542-1.928-1.579 0-1.037.891-1.69 1.928-1.58a2.502 2.502 0 002.435-3.552c-.105-.209-.243-.396-.405-.559l1.414-1.414zM4.75 8a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-6.5a.75.75 0 00-.75-.75h-2.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <audio controls src={audioUrl} className="w-full h-10" />
             </div>
          )}

          {/* Summary */}
          <div className="glass bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm print:bg-white print:border-2 print:border-slate-100 print:p-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 print:bg-slate-100 print:text-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white print:text-slate-900">{t('common.summary')}</h3>
             </div>
             <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line print:text-sm print:text-slate-700">
                {data.feedback.summary}
             </p>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2">
             {Object.entries(data.scores).map(([key, score]) => (
               <div key={key} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm print:p-4 print:border-slate-100 print:bg-white print:shadow-none">
                 <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-slate-700 dark:text-slate-200 print:text-slate-900">
                     {/* @ts-ignore */}
                     {CRITERIA[langKey][key]}
                   </h4>
                   <span className={`font-bold px-3 py-1 rounded-full text-sm ${getScoreColor(score as number).replace('text-', 'bg-').replace('500', '100').replace('400', '900/30')} ${getScoreColor(score as number)} print:bg-slate-100 print:text-slate-900`}>
                     {score}
                   </span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden print:bg-slate-50">
                   <div className={`h-2 rounded-full ${getProgressBarColor(score as number)} transition-all duration-1000 ease-out print:bg-indigo-600`} style={{ width: `${score}%` }}></div>
                 </div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line print:text-[11px] print:text-slate-600">
                   {/* @ts-ignore */}
                   {data.feedback[key]}
                 </p>
               </div>
             ))}
           </div>

           {/* Pronunciation Card (Inline for print) */}
           <div className="hidden print:block bg-slate-50 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-2">{t('evaluation.pronunciation')}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{data.feedback.pronunciation}</p>
           </div>

           {/* Transcription (Simplified for print) */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 print:border-slate-100 print:p-6 print:shadow-none">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 print:text-slate-900">{t('evaluation.transcription')}</h3>
              <p className="font-mono text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl print:bg-white print:p-0 print:border-none print:text-xs">
                 {data.feedback.transcription}
              </p>
           </div>
        </div>
      </div>

      {/* --- TEACHER SIGNATURE AREA (Only Print) --- */}
      <div className="hidden print:flex justify-between mt-12 pt-12 border-t border-slate-200">
         <div className="w-1/3">
            <p className="text-xs font-bold text-slate-400 uppercase mb-8">{t('exam.teacherNotes')}</p>
            <div className="h-24 border-b border-slate-200"></div>
         </div>
         <div className="w-1/3 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase mb-16">Teacher Signature</p>
            <p className="border-t border-slate-400 pt-2 font-bold text-slate-800">Can AKALIN</p>
         </div>
      </div>
    </div>
  );
};

export default EvaluationResult;
