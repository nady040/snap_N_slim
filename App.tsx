
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DayLog, Meal, HistoryData } from './types';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import MealCard from './components/MealCard';
import CameraCapture from './components/CameraCapture';
import HistoryView from './components/HistoryView';
import { analyzeFoodImage, getDinnerRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('snapSlimProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [history, setHistory] = useState<HistoryData>(() => {
    const saved = localStorage.getItem('snapSlimHistory');
    return saved ? JSON.parse(saved) : {};
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestionData, setSuggestionData] = useState<{ analysisSummary: string, recommendations: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentLog = history[todayStr] || { date: todayStr, meals: [], totalConsumed: 0 };

  useEffect(() => {
    if (profile) localStorage.setItem('snapSlimProfile', JSON.stringify(profile));
    localStorage.setItem('snapSlimHistory', JSON.stringify(history));
  }, [profile, history]);

  const handleProfileSave = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const processImage = async (base64String: string, dataUrl?: string) => {
    if (!profile) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFoodImage(base64String, profile.dailyGoal);

      const newMeal: Meal = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: dataUrl || `data:image/jpeg;base64,${base64String}`,
        items: analysis.items,
        totalCalories: analysis.totalCalories,
        advice: analysis.advice,
        modifications: analysis.modifications
      };

      setHistory(prev => {
        const current = prev[todayStr] || { date: todayStr, meals: [], totalConsumed: 0 };
        return {
          ...prev,
          [todayStr]: {
            ...current,
            meals: [newMeal, ...current.meals],
            totalConsumed: current.totalConsumed + analysis.totalCalories
          }
        };
      });
      // Clear suggestions on new meal
      setSuggestionData(null);
    } catch (error) {
      console.error("Failed to analyze image:", error);
      alert("Something went wrong with the food analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      processImage(base64String, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const fetchSuggestions = async () => {
    if (!profile) return;
    setIsSuggesting(true);
    try {
      const remaining = profile.dailyGoal - currentLog.totalConsumed;
      
      const consumedNutrients = currentLog.meals.reduce((acc, meal) => {
        meal.items.forEach(item => {
          acc.protein += item.protein || 0;
          acc.carbs += item.carbs || 0;
          acc.fat += item.fat || 0;
        });
        return acc;
      }, { protein: 0, carbs: 0, fat: 0 });

      const mealNames = currentLog.meals.map(m => m.items.map(i => i.name).join(', ')).join('; ');
      const data = await getDinnerRecommendation(
        remaining, 
        profile.dailyGoal,
        consumedNutrients,
        mealNames || "No meals logged yet today."
      );
      setSuggestionData(data);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 flex items-center justify-center p-4">
        <ProfileSetup onSave={handleProfileSave} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-32 font-sans">
      {showCamera && (
        <CameraCapture 
          onCapture={processImage} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <header className="fixed top-0 left-0 right-0 glass border-b border-white/50 z-30 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">SnapSlim</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${showHistory ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
              title="View Trends"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button 
              onClick={() => { if(confirm('Reset profile and history?')) { setProfile(null); localStorage.clear(); location.reload(); } }}
              className="text-slate-400 hover:text-red-500 transition-colors p-2.5 rounded-xl hover:bg-red-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-24">
        <Dashboard profile={profile} log={currentLog} />

        {showHistory && <HistoryView history={history} profile={profile} />}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Today's Meals</h3>
          <button 
            onClick={fetchSuggestions}
            disabled={isSuggesting}
            className="text-blue-600 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isSuggesting ? (
              <>
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Planning...
              </>
            ) : (
              <>
                <span>Get Dinner Ideas</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>

        {suggestionData && (
          <div className="mb-8 p-6 bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border border-white shadow-xl shadow-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-slate-800 flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                Daily Plan
              </h4>
              <button onClick={() => setSuggestionData(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-100 mb-6 text-slate-700 text-sm leading-relaxed shadow-sm">
              <p className="font-bold text-blue-600 text-xs uppercase tracking-wider mb-2">Nutritional Analysis</p>
              {suggestionData.analysisSummary}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {suggestionData.recommendations.map((rec, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold text-slate-800">{rec.title}</h5>
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">~{rec.estimatedCalories} kcal</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {currentLog.meals.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h4 className="text-slate-900 font-bold text-lg">No meals logged yet</h4>
              <p className="text-slate-500 mt-2">Tap the camera button to start tracking</p>
            </div>
          ) : (
            currentLog.meals.map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-8 left-0 right-0 px-4 flex justify-center items-center pointer-events-none z-40">
        <div className="pointer-events-auto bg-white/90 glass p-2 rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-white/50 flex gap-2 w-full max-w-sm backdrop-blur-xl">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => setShowCamera(true)}
            disabled={isAnalyzing}
            className={`flex-1 py-4 px-6 flex items-center justify-center gap-3 rounded-[1.5rem] font-bold text-lg shadow-lg transition-all active:scale-95 ${
              isAnalyzing 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200 hover:shadow-blue-300'
            }`}
          >
            {isAnalyzing ? (
              <div className="w-6 h-6 border-3 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Snap Meal
              </>
            )}
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="w-16 h-16 flex items-center justify-center bg-white text-slate-600 rounded-[1.5rem] hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
