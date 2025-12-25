
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <ProfileSetup onSave={handleProfileSave} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {showCamera && (
        <CameraCapture 
          onCapture={processImage} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">SnapSlim</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
              title="View Trends"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button 
              onClick={() => { if(confirm('Reset profile and history?')) { setProfile(null); localStorage.clear(); location.reload(); } }}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Dashboard profile={profile} log={currentLog} />

        {showHistory && <HistoryView history={history} profile={profile} />}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Today's Meals</h3>
          <button 
            onClick={fetchSuggestions}
            disabled={isSuggesting}
            className="text-blue-600 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            {isSuggesting ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Analyzing Progress...
              </span>
            ) : 'Daily Insights & Suggestions'}
          </button>
        </div>

        {suggestionData && (
          <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Daily Summary & Plan
              </h4>
              <button onClick={() => setSuggestionData(null)} className="text-blue-400 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-white/60 rounded-xl p-4 border border-blue-100 mb-6 text-blue-900 text-sm leading-relaxed">
              <p className="font-semibold mb-1">Nutritional Analysis:</p>
              {suggestionData.analysisSummary}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {suggestionData.recommendations.map((rec, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-slate-800">{rec.title}</h5>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">~{rec.estimatedCalories} kcal</span>
                  </div>
                  <p className="text-sm text-slate-600">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {currentLog.meals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <p className="text-slate-400 font-medium">No meals logged yet today.</p>
              <p className="text-sm text-slate-400 mt-1">Capture your first meal to start tracking!</p>
            </div>
          ) : (
            currentLog.meals.map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent flex justify-center items-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm flex gap-3">
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
            className={`flex-1 py-4 flex items-center justify-center gap-3 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 ${
              isAnalyzing 
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? (
              <div className="w-6 h-6 border-3 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Camera
              </>
            )}
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="p-4 bg-white text-slate-600 border border-slate-200 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
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
