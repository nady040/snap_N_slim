
import React from 'react';
import { Meal } from '../types';
import { formatTime } from '../utils/calculations';

interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-100 border border-slate-100 hover:shadow-xl transition-all duration-300 group">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-56 h-56 md:h-auto overflow-hidden relative">
          <img src={meal.imageUrl} alt="Meal" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>
          <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-xs text-white font-bold uppercase tracking-wider md:hidden flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(meal.timestamp)}
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-lg md:text-xl">
                Meal Analysis
              </h4>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">AI Nutrition Breakdown</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-extrabold shadow-sm border border-blue-100">
                {meal.totalCalories} kcal
              </span>
              <span className="hidden md:flex text-xs font-bold text-slate-400 uppercase tracking-widest items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(meal.timestamp)}
              </span>
            </div>
          </div>
          
          <div className="space-y-3 mb-5">
            {meal.items.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 transition-colors hover:border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800">{item.name}</span>
                  <span className="text-xs font-bold text-slate-400">{item.portion} • {item.calories} kcal</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center justify-center gap-1 bg-blue-100/50 py-1 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-blue-700">{item.protein}g P</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1 bg-emerald-100/50 py-1 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-700">{item.carbs}g C</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1 bg-amber-100/50 py-1 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-bold text-amber-700">{item.fat}g F</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider mr-2 align-middle">Insight</span>
              {meal.advice}
            </p>
          </div>

          {meal.modifications && meal.modifications.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Suggested Swaps
              </h5>
              <div className="grid gap-2">
                {meal.modifications.map((mod, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50/50 hover:bg-amber-50 rounded-xl border border-amber-100 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block mb-0.5">{mod.suggestion}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{mod.reason}</span>
                    </div>
                    <span className="self-start sm:self-center text-xs font-extrabold text-amber-600 bg-amber-100/50 px-2 py-1 rounded-lg whitespace-nowrap">
                      -{mod.calorieSaving} kcal
                    </span>
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
