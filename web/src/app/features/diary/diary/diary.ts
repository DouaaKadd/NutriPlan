import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiMeal } from '../../../core/services/api-meal';
import { ApiSummary } from '../../../core/services/api-summary';
import { DaySummary, Meal, MealItem, MealType } from '../../../core/models/meal.model';
import { MealCard } from '../../shared/meal-card/meal-card';
import { FoodPicker, FoodPick } from '../../shared/food-picker/food-picker';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

@Component({
  selector: 'app-diary',
  imports: [MealCard, FoodPicker],
  templateUrl: './diary.html',
  styleUrl: './diary.scss',
})
export class Diary implements OnInit {
  private readonly apiMeal = inject(ApiMeal);
  private readonly apiSummary = inject(ApiSummary);

  readonly mealTypes = MEAL_TYPES;
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly loading = signal(true);
  readonly meals = signal<Meal[]>([]);
  readonly summary = signal<DaySummary | null>(null);
  readonly pickerType = signal<MealType | null>(null);
  readonly busy = signal(false);

  readonly readableDate = computed(() => {
    const d = new Date(this.date() + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const d = this.date();
    this.loading.set(true);
    this.apiSummary.day(d).subscribe({ next: (s) => this.summary.set(s) });
    this.apiMeal.list(d).subscribe({
      next: (m) => {
        this.meals.set(m);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeDate(value: string): void {
    if (!value) return;
    this.date.set(value);
    this.refresh();
  }

  shiftDate(days: number): void {
    const d = new Date(this.date() + 'T00:00:00');
    d.setDate(d.getDate() + days);
    this.date.set(d.toISOString().slice(0, 10));
    this.refresh();
  }

  goToday(): void {
    this.date.set(new Date().toISOString().slice(0, 10));
    this.refresh();
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
    const existing = this.mealOf(type);
    if (existing) {
      this.apiMeal.addItem(existing.id, { food_id: pick.food.id!, grams: pick.grams }).subscribe({
        next: () => this.afterAdd(),
        error: () => this.busy.set(false),
      });
    } else {
      this.apiMeal.create({ date: this.date(), type }).subscribe({
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

  private afterAdd(): void {
    this.busy.set(false);
    this.closePicker();
    this.refresh();
  }
}
