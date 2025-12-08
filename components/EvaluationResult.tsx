import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EvaluationResultData } from '../types';
import { BackIcon } from '../icons/BackIcon';
import { CRITERIA } from '../constants';

interface EvaluationResultProps {
  data: EvaluationResultData;
  audioBlob: Blob | null;
  onBack: () => void;
}

const EvaluationResult: React.FC<EvaluationResultProps> = ({ data, audioBlob, onBack }) => {
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

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.overallScore / 100) * circumference;

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';

  // --- Radar Chart Logic ---
  const renderRadarChart = () => {
    const size = 260;
    const center = size / 2;
    const chartRadius = 90; 
    const criteriaKeys = Object.keys(data.scores);
    const totalPoints = criteriaKeys.length;
    
    // Helper to calculate point coordinates
    const getPoint = (value: number, index: number, maxRadius: number) => {
      const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
      const r = (value / 100) * maxRadius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    // Generate path for the data polygon
    const dataPoints = criteriaKeys.map((key, i) => {
      // @ts-ignore
      const val = data.scores[key];
      return getPoint(val, i, chartRadius);
    });
    const dataPath = dataPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + ' Z';

    // Generate grid lines (concentric polygons)
    const levels = [20, 40, 60, 80, 100];
    
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid Circles/Polygons */}
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
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Lines */}
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
               className="text-slate-200 dark:text-slate-700"
               strokeWidth="1"
             />
          );
        })}

        {/* Data Polygon (Filled) */}
        <path
          d={dataPath}
          fill="currentColor"
          className="text-indigo-500/20 dark:text-indigo-400/20"
        />
        {/* Data Polygon (Stroke) */}
        <path
          d={dataPath}
          fill="transparent"
          stroke="currentColor"
          className="text-indigo-600 dark:text-indigo-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Data Points (Dots) */}
        {dataPoints.map((p, i) => (
           <circle
             key={i}
             cx={p.x}
             cy={p.y}
             r="4"
             className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 stroke-2"
           />
        ))}

        {/* Labels */}
        {criteriaKeys.map((key, i) => {
           // Push labels out slightly further than 100% radius
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
               className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-wider"
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
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white hover:shadow-sm dark:hover:bg-slate-800 transition-all font-medium"
        >
          <BackIcon className="w-5 h-5" />
          {t('common.goBack')}
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-xl text-center md:text-right">
          {data.topic}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scores & Visuals */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overall Score Card */}
          <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-8 border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">{t('evaluation.overallScore')}</h3>
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 192 192" className="w-full h-full drop-shadow-lg">
                {/* Background Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                {/* Progress Circle - Rotated independently to start from top */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${getScoreColor(data.overallScore)} transition-all duration-1000 ease-out origin-center -rotate-90`}
                />
                {/* Score Text - Centered via percentages and dominant-baseline */}
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  dy="0.3em" 
                  className={`text-6xl font-extrabold tracking-tighter ${getScoreColor(data.overallScore)} fill-current`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {data.overallScore}
                </text>
              </svg>
            </div>
          </div>

          {/* Radar Chart Card */}
          <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-6 border border-white/20 dark:border-slate-800 shadow-lg flex flex-col items-center">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Skill Breakdown</h3>
             <div className="w-full aspect-square max-w-[260px]">
                {renderRadarChart()}
             </div>
          </div>

          {/* Pronunciation Card */}
          <div className="glass bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                   <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.86 4.814 2.302 6.643.14.17.333.273.545.273H6.44c1.11 0 2.053.64 2.56 1.06l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.515 8.985a6 6 0 010 6.03m2.121-8.151a9 9 0 010 10.272" />
                 </svg>
               </div>
               <h3 className="font-bold text-slate-800 dark:text-slate-200">{t('evaluation.pronunciation')}</h3>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
               {data.feedback.pronunciation}
             </p>
          </div>
        </div>

        {/* Right Column: Feedback Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Audio Player (Moved to top of right col) */}
          {audioUrl && (
             <div className="glass bg-white dark:bg-slate-900 rounded-2xl p-4 border border-white/20 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M19.957 4.276a1.75 1.75 0 10-2.475-2.475L7.468 11.815a2.5 2.5 0 000 3.535l10.014 10.014a1.75 1.75 0 102.475-2.475l-1.414-1.414c.162-.162.3-.35.405-.558a2.502 2.502 0 00-2.435-3.553c-1.037.112-1.928-.542-1.928-1.579 0-1.037.891-1.69 1.928-1.58a2.502 2.502 0 002.435-3.552c-.105-.209-.243-.396-.405-.559l1.414-1.414zM4.75 8a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-6.5a.75.75 0 00-.75-.75h-2.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <audio controls src={audioUrl} className="w-full h-10" />
             </div>
          )}

          {/* Summary */}
          <div className="glass bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                    <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('common.summary')}</h3>
             </div>
             <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line">
                {data.feedback.summary}
             </p>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {Object.entries(data.scores).map(([key, score]) => (
               <div key={key} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
                 <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                     {/* @ts-ignore */}
                     {CRITERIA[langKey][key]}
                   </h4>
                   <span className={`font-bold px-3 py-1 rounded-full text-sm ${getScoreColor(score as number).replace('text-', 'bg-').replace('500', '100').replace('400', '900/30')} ${getScoreColor(score as number)}`}>
                     {score}
                   </span>
                 </div>
                 
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                   <div 
                     className={`h-2 rounded-full ${getProgressBarColor(score as number)} transition-all duration-1000 ease-out`} 
                     style={{ width: `${score}%` }}
                   ></div>
                 </div>

                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                   {/* @ts-ignore */}
                   {data.feedback[key]}
                 </p>
               </div>
             ))}
           </div>

           {/* Transcription Toggle (Details) */}
           <details className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                 <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('evaluation.transcription')}</h3>
                 <span className="transform group-open:rotate-180 transition-transform text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                 </span>
              </summary>
              <div className="px-6 pb-6 pt-0 border-t border-slate-100 dark:border-slate-800">
                 <p className="mt-4 font-mono text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {data.feedback.transcription}
                 </p>
              </div>
           </details>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResult;