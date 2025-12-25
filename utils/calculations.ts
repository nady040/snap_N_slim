
import { Gender, UserProfile } from '../types';

export const calculateDailyCalories = (profile: Omit<UserProfile, 'dailyGoal'>): number => {
  const { weight, height, age, gender } = profile;
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === Gender.MALE) {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multiplier (assuming moderate activity 1.55 for a general weight loss user)
  // Standard weight loss deficit is ~500 calories
  const tdee = bmr * 1.55;
  return Math.round(tdee - 500);
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
