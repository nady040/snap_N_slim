
import React from 'react';
import { UserProfile, DayLog } from '../types';

interface DashboardProps {
  profile: UserProfile;
  log: DayLog;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, log }) => {
  const remaining = profile.dailyGoal - log.totalConsumed;
  const progressPercent = Math.min((log.totalConsumed / profile.dailyGoal) * 100, 100);
  const isOverLimit = log.totalConsumed > profile.dailyGoal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className={`md:col-span-2 relative overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all duration-500 ${isOverLimit ? 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-rose-200' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-200'}`}>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black opacity-10 blur-xl"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-blue-100 font-medium tracking-wide text-sm uppercase mb-1">Daily Intake</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">{log.totalConsumed}</span>
                <span className="text-lg opacity-80 font-medium">/ {profile.dailyGoal} kcal</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider">{isOverLimit ? 'Over Limit' : 'Remaining'}</span>
              </div>
              <div className="text-2xl font-bold mt-2">{Math.abs(remaining)} <span className="text-sm font-normal opacity-80">kcal</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium opacity-80">
              <span>0%</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverLimit ? 'bg-white' : 'bg-white'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-100 flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Current Goal</h3>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
             </div>
             <p className="text-xl font-bold text-slate-800">Weight Loss</p>
          </div>
          <p className="text-slate-500 text-sm pl-13">Daily Target: <span className="font-semibold text-slate-800">{profile.dailyGoal}</span> kcal</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
