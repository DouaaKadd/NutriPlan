export interface MealPlanItem {
  food_id: number;
  name: string;
  brand: string | null;
  grams: number;
}

export type MealPlanDay = Record<'breakfast' | 'lunch' | 'snack' | 'dinner', MealPlanItem[]>;

export interface MealPlan {
  id: number;
  user_id: number;
  week_start: string;
  generated_at: string;
  data: Record<string, MealPlanDay>;
}
