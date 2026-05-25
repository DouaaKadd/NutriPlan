import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { ApiSummary } from '../../../core/services/api-summary';
import { ApiMeal } from '../../../core/services/api-meal';
import { DaySummary, Meal, MealItem, MealType } from '../../../core/models/meal.model';
import { FoodPicker, FoodPick } from '../../shared/food-picker/food-picker';
import { MealCard } from '../../shared/meal-card/meal-card';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

@Component({
  selector: 'app-dashboard',
  imports: [FoodPicker, MealCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly apiSummary = inject(ApiSummary);
  private readonly apiMeal = inject(ApiMeal);
  readonly auth = inject(Auth);

  readonly today = new Date().toISOString().slice(0, 10);
  readonly mealTypes = MEAL_TYPES;
  readonly loading = signal(true);
  readonly summary = signal<DaySummary | null>(null);
  readonly meals = signal<Meal[]>([]);
  readonly pickerType = signal<MealType | null>(null);
  readonly busy = signal(false);

  readonly remaining = computed(() => {
    const s = this.summary();
    if (!s?.goal) return null;
    return {
      kcal: Math.max(0, Math.round(s.goal.kcal_target - s.totals.kcal)),
      proteins: Math.max(0, Math.round(s.goal.proteins_g_target - s.totals.proteins)),
      carbs: Math.max(0, Math.round(s.goal.carbs_g_target - s.totals.carbs)),
      fats: Math.max(0, Math.round(s.goal.fats_g_target - s.totals.fats)),
    };
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.apiSummary.day(this.today).subscribe({
      next: (s) => this.summary.set(s),
    });
    this.apiMeal.list(this.today).subscribe({
      next: (m) => {
        this.meals.set(m);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  mealOf(type: MealType): Meal | null {
    return this.meals().find((m) => m.type === type) ?? null;
  }

  openPicker(type: MealType): void {
    this.pickerType.set(type);
  }

  closePicker(): void {
    this.pickerType.set(null);
  }

  onPicked(pick: FoodPick): void {
    const type = this.pickerType();
    if (!type || this.busy()) return;
    this.busy.set(true);

    const existingMeal = this.mealOf(type);
    if (existingMeal) {
      this.apiMeal.addItem(existingMeal.id, { food_id: pick.food.id!, grams: pick.grams }).subscribe({
        next: () => this.afterAdd(),
        error: () => this.busy.set(false),
      });
    } else {
      this.apiMeal.create({ date: this.today, type }).subscribe({
        next: (meal) => {
          this.apiMeal.addItem(meal.id, { food_id: pick.food.id!, grams: pick.grams }).subscribe({
            next: () => this.afterAdd(),
            error: () => this.busy.set(false),
          });
        },
        error: () => this.busy.set(false),
      });
    }
  }

  onRemoveItem(event: { meal: Meal; item: MealItem }): void {
    this.apiMeal.removeItem(event.meal.id, event.item.id).subscribe({
      next: () => this.refresh(),
    });
  }

  pct(n: number | null | undefined): number {
    if (n === null || n === undefined) return 0;
    return Math.min(100, Math.max(0, n));
  }

  private afterAdd(): void {
    this.busy.set(false);
    this.closePicker();
    this.refresh();
  }
}
