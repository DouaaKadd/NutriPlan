import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiMealPlan } from '../../../core/services/api-meal-plan';
import { MealPlan, MealPlanDay } from '../../../core/models/meal-plan.model';

interface DayBlock {
  date: string;
  readable: string;
  breakfast: { food_id: number; name: string; brand: string | null; grams: number }[];
  lunch: { food_id: number; name: string; brand: string | null; grams: number }[];
  snack: { food_id: number; name: string; brand: string | null; grams: number }[];
  dinner: { food_id: number; name: string; brand: string | null; grams: number }[];
}

@Component({
  selector: 'app-plan',
  imports: [],
  templateUrl: './plan.html',
  styleUrl: './plan.scss',
})
export class Plan implements OnInit {
  private readonly api = inject(ApiMealPlan);

  readonly loading = signal(true);
  readonly generating = signal(false);
  readonly error = signal<string | null>(null);
  readonly plans = signal<MealPlan[]>([]);
  readonly current = signal<MealPlan | null>(null);

  readonly days = computed<DayBlock[]>(() => {
    const plan = this.current();
    if (!plan) return [];
    return Object.entries(plan.data).map(([date, meals]) => ({
      date,
      readable: this.formatDate(date),
      breakfast: meals.breakfast ?? [],
      lunch: meals.lunch ?? [],
      snack: meals.snack ?? [],
      dinner: meals.dinner ?? [],
    }));
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (list) => {
        this.plans.set(list);
        if (list.length > 0 && !this.current()) {
          this.current.set(list[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  generate(): void {
    if (this.generating()) return;
    this.generating.set(true);
    this.error.set(null);
    this.api.generate().subscribe({
      next: (plan) => {
        this.current.set(plan);
        this.generating.set(false);
        this.refresh();
      },
      error: (err) => {
        this.generating.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo generar el plan. Asegúrate de tener objetivos definidos y alimentos en tu biblioteca.');
      },
    });
  }

  select(plan: MealPlan): void {
    this.current.set(plan);
  }

  remove(plan: MealPlan): void {
    this.api.destroy(plan.id).subscribe({
      next: () => {
        if (this.current()?.id === plan.id) this.current.set(null);
        this.refresh();
      },
    });
  }

  private formatDate(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  }
}
