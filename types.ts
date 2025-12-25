
export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface UserProfile {
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: Gender;
  dailyGoal: number; // calculated calories
}

export interface FoodItem {
  name: string;
  calories: number;
  portion: string;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface Modification {
  suggestion: string;
  reason: string;
  calorieSaving: number;
}

export interface Meal {
  id: string;
  timestamp: number;
  imageUrl: string;
  items: FoodItem[];
  totalCalories: number;
  advice: string;
  modifications: Modification[];
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  totalConsumed: number;
}

export type HistoryData = Record<string, DayLog>;
