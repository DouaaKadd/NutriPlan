import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ApiFood } from '../../../core/services/api-food';
import { Food } from '../../../core/models/food.model';

export interface FoodPick {
  food: Food;
  grams: number;
}

@Component({
  selector: 'app-food-picker',
  imports: [ReactiveFormsModule],
  templateUrl: './food-picker.html',
  styleUrl: './food-picker.scss',
})
export class FoodPicker {
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly picked = new EventEmitter<FoodPick>();

  private readonly api = inject(ApiFood);

  readonly query = new FormControl('', { nonNullable: true });
  readonly grams = new FormControl(100, { nonNullable: true });

  readonly loading = signal(false);
  readonly local = signal<Food[]>([]);
  readonly remote = signal<Food[]>([]);
  readonly selected = signal<Food | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly preview = computed(() => {
    const f = this.selected();
    const g = Number(this.grams.value) || 0;
    if (!f) return null;
    const factor = g / 100;
    return {
      kcal: Math.round(f.kcal_per_100g * factor),
      proteins: +(f.proteins_per_100g * factor).toFixed(1),
      carbs: +(f.carbs_per_100g * factor).toFixed(1),
      fats: +(f.fats_per_100g * factor).toFixed(1),
    };
  });

  constructor() {
    this.query.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          const term = q.trim();
          if (term.length < 2) {
            this.local.set([]);
            this.remote.set([]);
            this.loading.set(false);
            return [];
          }
          this.loading.set(true);
          return this.api.search(term);
        }),
      )
      .subscribe({
        next: (res) => {
          this.local.set(res.local);
          this.remote.set(res.remote);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudo buscar.');
        },
      });
  }

  select(food: Food): void {
    this.selected.set(food);
    this.grams.setValue(100);
    this.error.set(null);
  }

  back(): void {
    this.selected.set(null);
  }

  confirm(): void {
    const f = this.selected();
    const g = Number(this.grams.value);
    if (!f || !g || g < 1 || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    if (f.id) {
      this.picked.emit({ food: f, grams: g });
      this.saving.set(false);
      return;
    }

    this.api.store(f).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.picked.emit({ food: saved, grams: g });
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo guardar el alimento.');
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
