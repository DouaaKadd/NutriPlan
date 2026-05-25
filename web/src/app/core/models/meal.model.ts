import { Food } from './food.model';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: number;
  meal_id: number;
  food_id: number;
  grams: number;
  food?: Food;
}

export interface Meal {
  id: number;
  user_id: number;
  date: string;
  type: MealType;
  notes: string | null;
  items: MealItem[];
}

export interface DaySummary {
  date: string;
  totals: { kcal: number; proteins: number; carbs: number; fats: number };
  goal: {
    kcal_target: number;
    proteins_g_target: number;
    carbs_g_target: number;
    fats_g_target: number;
  } | null;
  progress: {
    kcal: number | null;
    proteins: number | null;
    carbs: number | null;
    fats: number | null;
  } | null;
}
