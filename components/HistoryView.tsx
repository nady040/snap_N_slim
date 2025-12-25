
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
    dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    shortDate: date.split('-').slice(1).join('/'),
    calories: history[date]?.totalConsumed || 0,
    isOver: (history[date]?.totalConsumed || 0) > profile.dailyGoal
  }));

  const maxCal = Math.max(...chartData.map(d => d.calories), profile.dailyGoal, 1000);
  const chartHeight = 160;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100 mb-8 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Weekly Trends</h3>
          <p className="text-xs text-slate-400 font-medium">Last 7 days calorie intake</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide bg-slate-50 p-2 rounded-xl">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
            <span className="text-slate-500">Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
            <span className="text-slate-500">Over</span>
          </div>
        </div>
      </div>

      <div className="relative h-[200px] flex items-end justify-between gap-3 px-2">
        {/* Goal line */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-slate-200 z-0 flex items-center pointer-events-none"
          style={{ bottom: `${(profile.dailyGoal / maxCal) * chartHeight}px` }}
        >
          <span className="bg-slate-100 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full ml-auto transform -translate-y-1/2 border border-slate-200">Goal: {profile.dailyGoal}</span>
        </div>

        {chartData.map((day, i) => {
          const barHeight = Math.max((day.calories / maxCal) * chartHeight, 4); // Min height visually
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative z-10">
              <div className="relative w-full flex justify-center items-end h-[160px]">
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-20">
                  <div className="bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap relative">
                    {day.calories} kcal
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                
                <div 
                  className={`w-full max-w-[28px] rounded-t-xl transition-all duration-700 ease-out hover:opacity-80 cursor-pointer ${
                    day.isOver ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-lg shadow-rose-200' : 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-lg shadow-blue-200'
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              <div className="text-center mt-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">{day.dayName}</span>
                <span className="text-[9px] font-medium text-slate-300 block">{day.shortDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
