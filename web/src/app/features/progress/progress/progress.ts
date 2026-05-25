import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiSummary, WeekSummary } from '../../../core/services/api-summary';
import { ApiWeightLog } from '../../../core/services/api-weight-log';
import { Auth } from '../../../core/services/auth';
import { WeightLog } from '../../../core/models/weight-log.model';
import { DaySummary } from '../../../core/models/meal.model';

@Component({
  selector: 'app-progress',
  imports: [ReactiveFormsModule, BaseChartDirective],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly apiSummary = inject(ApiSummary);
  private readonly apiWeight = inject(ApiWeightLog);
  readonly auth = inject(Auth);

  readonly today = new Date().toISOString().slice(0, 10);
  readonly loading = signal(true);
  readonly week = signal<WeekSummary | null>(null);
  readonly day = signal<DaySummary | null>(null);
  readonly weightLogs = signal<WeightLog[]>([]);
  readonly saving = signal(false);

  readonly weightForm = this.fb.nonNullable.group({
    date: [this.today, [Validators.required]],
    weight_kg: [70, [Validators.required, Validators.min(30), Validators.max(300)]],
  });

  readonly kcalChartData = computed<ChartData<'bar'>>(() => {
    const w = this.week();
    if (!w) return { labels: [], datasets: [] };
    const target = w.goal?.kcal_target ?? 2000;
    return {
      labels: w.days.map((d) => d.date.slice(5)),
      datasets: [
        {
          label: 'kcal',
          data: w.days.map((d) => d.totals.kcal),
          backgroundColor: '#2f6f4e',
          borderRadius: 6,
        },
        {
          label: 'objetivo',
          data: w.days.map(() => target),
          type: 'line' as const,
          borderColor: '#ff8d3d',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 0,
        } as any,
      ],
    };
  });

  readonly kcalChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  readonly macroChartData = computed<ChartData<'doughnut'>>(() => {
    const d = this.day();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: ['Proteínas', 'Hidratos', 'Grasas'],
      datasets: [
        {
          data: [d.totals.proteins * 4, d.totals.carbs * 4, d.totals.fats * 9],
          backgroundColor: ['#ff8d3d', '#fbbf24', '#fb7185'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly macroChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: { legend: { position: 'bottom' } },
  };

  readonly weightChartData = computed<ChartData<'line'>>(() => {
    const logs = this.weightLogs();
    return {
      labels: logs.map((l) => l.date.slice(5)),
      datasets: [
        {
          label: 'Peso (kg)',
          data: logs.map((l) => Number(l.weight_kg)),
          borderColor: '#2f6f4e',
          backgroundColor: 'rgba(47, 111, 78, 0.1)',
          tension: 0.25,
          fill: true,
          pointBackgroundColor: '#2f6f4e',
        },
      ],
    };
  });

  readonly weightChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } },
  };

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.apiSummary.week().subscribe({ next: (w) => this.week.set(w) });
    this.apiSummary.day(this.today).subscribe({ next: (d) => this.day.set(d) });
    this.apiWeight.list().subscribe({
      next: (logs) => {
        this.weightLogs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveWeight(): void {
    if (this.weightForm.invalid || this.saving()) return;
    this.saving.set(true);
    this.apiWeight.store(this.weightForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.apiWeight.list().subscribe({ next: (logs) => this.weightLogs.set(logs) });
      },
      error: () => this.saving.set(false),
    });
  }
}
