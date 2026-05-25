import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MealPlan } from '../models/meal-plan.model';

@Injectable({ providedIn: 'root' })
export class ApiMealPlan {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/meal-plans`;

  list(): Observable<MealPlan[]> {
    return this.http.get<MealPlan[]>(this.base);
  }

  show(id: number): Observable<MealPlan> {
    return this.http.get<MealPlan>(`${this.base}/${id}`);
  }

  generate(weekStart?: string): Observable<MealPlan> {
    return this.http.post<MealPlan>(`${this.base}/generate`, weekStart ? { week_start: weekStart } : {});
  }

  destroy(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
