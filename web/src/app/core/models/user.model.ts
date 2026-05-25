export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface Goal {
  id: number;
  user_id: number;
  kcal_target: number;
  proteins_g_target: number;
  carbs_g_target: number;
  fats_g_target: number;
  water_ml_target: number | null;
  weight_kg_target: number | null;
  activity_level: ActivityLevel;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
  goal: Goal | null;
}
