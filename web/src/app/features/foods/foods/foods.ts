import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiFood } from '../../../core/services/api-food';
import { Food } from '../../../core/models/food.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-foods',
  imports: [ReactiveFormsModule],
  templateUrl: './foods.html',
  styleUrl: './foods.scss',
})
export class Foods implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiFood);

  readonly query = new FormControl('', { nonNullable: true });
  readonly local = signal<Food[]>([]);
  readonly remote = signal<Food[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly savingExternalId = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    brand: [''],
    kcal_per_100g: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
    proteins_per_100g: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    carbs_per_100g: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    fats_per_100g: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.loadLocalOnly();
    this.query.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((q) => this.search(q));
  }

  loadLocalOnly(): void {
    this.loading.set(true);
    this.api.search('').subscribe({
      next: (res) => {
        this.local.set(res.local);
        this.remote.set([]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  search(q: string): void {
    const term = q.trim();
    if (term.length === 0) {
      this.loadLocalOnly();
      return;
    }
    if (term.length < 2) return;

    this.loading.set(true);
    this.api.search(term).subscribe({
      next: (res) => {
        this.local.set(res.local);
        this.remote.set(res.remote);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveToLibrary(food: Food): void {
    if (!food.external_id || this.savingExternalId()) return;
    this.savingExternalId.set(food.external_id);
    this.api.store(food).subscribe({
      next: (saved) => {
        this.savingExternalId.set(null);
        this.local.update((list) => [saved, ...list]);
        this.remote.update((list) => list.filter((r) => r.external_id !== food.external_id));
      },
      error: () => this.savingExternalId.set(null),
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.error.set(null);
    this.form.reset({
      name: '',
      brand: '',
      kcal_per_100g: 0,
      proteins_per_100g: 0,
      carbs_per_100g: 0,
      fats_per_100g: 0,
    });
  }

  create(): void {
    if (this.form.invalid || this.creating()) return;
    this.creating.set(true);
    this.error.set(null);

    const payload = { ...this.form.getRawValue(), source: 'manual' as const };
    this.api.store(payload).subscribe({
      next: (created) => {
        this.creating.set(false);
        this.showForm.set(false);
        this.local.update((list) => [created, ...list]);
      },
      error: () => {
        this.creating.set(false);
        this.error.set('No se pudo crear el alimento.');
      },
    });
  }
}
