
import React from 'react';
import { Meal } from '../types';
import { formatTime } from '../utils/calculations';

interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto overflow-hidden relative">
          <img src={meal.imageUrl} alt="Meal" className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold uppercase tracking-wider md:hidden">
            {formatTime(meal.timestamp)}
          </div>
        </div>
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-lg">
                Meal Summary
              </h4>
              <p className="text-sm text-slate-500">AI-Powered Breakdown</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold inline-block mb-1 shadow-sm border border-blue-100/50">
                {meal.totalCalories} kcal
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(meal.timestamp)}
              </span>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {meal.items.map((item, idx) => (
              <div key={idx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800">{item.name}</span>
                  <span className="text-xs font-medium text-slate-500">{item.portion} • {item.calories} kcal</span>
                </div>
                <div className="flex gap-4 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span className="text-slate-600">P: <span className="text-slate-900">{item.protein}g</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-slate-600">C: <span className="text-slate-900">{item.carbs}g</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <span className="text-slate-600">F: <span className="text-slate-900">{item.fat}g</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/30 rounded-xl p-3 border border-blue-100/50 mb-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-blue-600 mr-2 uppercase text-[10px] tracking-wider">Analysis:</span>
              {meal.advice}
            </p>
          </div>

          {meal.modifications && meal.modifications.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Smart Swaps
              </h5>
              <div className="grid gap-2">
                {meal.modifications.map((mod, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-amber-50/30 rounded-lg border border-amber-100/50">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-bold text-slate-800">{mod.suggestion}</span>
                        <span className="text-xs font-bold text-green-600">-{mod.calorieSaving} kcal</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{mod.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealCard;
