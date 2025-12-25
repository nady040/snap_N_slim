
import React from 'react';
import { UserProfile, DayLog } from '../types';

interface DashboardProps {
  profile: UserProfile;
  log: DayLog;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, log }) => {
  const remaining = profile.dailyGoal - log.totalConsumed;
  const progressPercent = Math.min((log.totalConsumed / profile.dailyGoal) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg opacity-80">Daily Progress</h2>
            <div className="text-4xl font-bold">{log.totalConsumed} <span className="text-lg font-normal">/ {profile.dailyGoal} kcal</span></div>
          </div>
          <div className="text-right">
            <h2 className="text-lg opacity-80">Remaining</h2>
            <div className="text-2xl font-bold">{remaining > 0 ? remaining : 0} kcal</div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Current Goal</h3>
        <p className="text-3xl font-bold text-slate-800">Weight Loss</p>
        <p className="text-slate-500 mt-1">Target: {profile.dailyGoal} kcal/day</p>
      </div>
    </div>
  );
};

export default Dashboard;
