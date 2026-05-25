export interface Food {
  id?: number;
  external_id?: string | null;
  name: string;
  brand?: string | null;
  kcal_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number | null;
  sugar_per_100g?: number | null;
  image_url?: string | null;
  source: 'off' | 'manual';
}

export interface FoodSearchResponse {
  local: Food[];
  remote: Food[];
}
