
import React from 'react';
import { HistoryData, UserProfile } from '../types';

interface HistoryViewProps {
  history: HistoryData;
  profile: UserProfile;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, profile }) => {
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => ({
    date,
    shortDate: date.split('-').slice(1).join('/'),
    calories: history[date]?.totalConsumed || 0,
    isOver: (history[date]?.totalConsumed || 0) > profile.dailyGoal
  }));

  const maxCal = Math.max(...chartData.map(d => d.calories), profile.dailyGoal, 1000);
  const chartHeight = 160;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Weekly History
        </h3>
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-500">Under Goal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span className="text-slate-500">Over Goal</span>
          </div>
        </div>
      </div>

      <div className="relative h-[200px] mt-4 flex items-end justify-between gap-2 px-2">
        {/* Goal line */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-slate-200 z-0 flex items-center"
          style={{ bottom: `${(profile.dailyGoal / maxCal) * chartHeight}px` }}
        >
          <span className="bg-white text-[10px] font-bold text-slate-400 px-1 ml-auto">GOAL: {profile.dailyGoal}</span>
        </div>

        {chartData.map((day, i) => {
          const barHeight = (day.calories / maxCal) * chartHeight;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full flex justify-center items-end h-[160px]">
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap">
                    {day.calories} kcal
                  </div>
                </div>
                
                <div 
                  className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ease-out ${
                    day.isOver ? 'bg-rose-500' : 'bg-blue-500'
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              <span className="text-[10px] mt-2 font-medium text-slate-500">{day.shortDate}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
