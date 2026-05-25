import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiGoal } from '../../../core/services/api-goal';
import { Auth } from '../../../core/services/auth';
import { ActivityLevel } from '../../../core/models/user.model';

interface ActivityOption {
  value: ActivityLevel;
  label: string;
  multiplier: number;
}

@Component({
  selector: 'app-goals',
  imports: [ReactiveFormsModule],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class Goals implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiGoal);
  private readonly auth = inject(Auth);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);

  readonly activityOptions: ActivityOption[] = [
    { value: 'sedentary', label: 'Sedentario (poco o nada)', multiplier: 1.2 },
    { value: 'light', label: 'Ligero (1-3 días/semana)', multiplier: 1.375 },
    { value: 'moderate', label: 'Moderado (3-5 días)', multiplier: 1.55 },
    { value: 'active', label: 'Activo (6-7 días)', multiplier: 1.725 },
    { value: 'very_active', label: 'Muy activo (entrenos intensos)', multiplier: 1.9 },
  ];

  readonly form = this.fb.nonNullable.group({
    kcal_target: [2000, [Validators.required, Validators.min(800), Validators.max(6000)]],
    proteins_g_target: [120, [Validators.required, Validators.min(20), Validators.max(400)]],
    carbs_g_target: [250, [Validators.required, Validators.min(20), Validators.max(800)]],
    fats_g_target: [70, [Validators.required, Validators.min(10), Validators.max(300)]],
    water_ml_target: [2000, [Validators.min(500), Validators.max(8000)]],
    weight_kg_target: [null as number | null],
    activity_level: ['moderate' as ActivityLevel, [Validators.required]],
  });

  ngOnInit(): void {
    this.api.get().subscribe({
      next: (g) => {
        this.form.patchValue({
          kcal_target: g.kcal_target,
          proteins_g_target: g.proteins_g_target,
          carbs_g_target: g.carbs_g_target,
          fats_g_target: g.fats_g_target,
          water_ml_target: g.water_ml_target ?? 2000,
          weight_kg_target: g.weight_kg_target,
          activity_level: g.activity_level,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applySuggestion(split: '30-40-30' | '40-30-30' | '25-50-25'): void {
    const kcal = this.form.controls.kcal_target.value;
    const [p, c, f] = split.split('-').map(Number);
    this.form.patchValue({
      proteins_g_target: Math.round((kcal * (p / 100)) / 4),
      carbs_g_target: Math.round((kcal * (c / 100)) / 4),
      fats_g_target: Math.round((kcal * (f / 100)) / 9),
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);

    const payload = this.form.getRawValue();
    this.api.update(payload as any).subscribe({
      next: (g) => {
        this.auth.setGoal(g);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        this.saving.set(false);
        const first = err?.error?.errors ? (Object.values(err.error.errors)[0] as string[])[0] : null;
        this.error.set(first ?? 'No se pudo guardar.');
      },
    });
  }

  get macroKcal(): { p: number; c: number; f: number; total: number } {
    const v = this.form.getRawValue();
    const p = (v.proteins_g_target ?? 0) * 4;
    const c = (v.carbs_g_target ?? 0) * 4;
    const f = (v.fats_g_target ?? 0) * 9;
    return { p, c, f, total: p + c + f };
  }
}
