import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DaySummary } from '../models/meal.model';

export interface WeekSummary {
  start: string;
  end: string;
  days: { date: string; totals: { kcal: number; proteins: number; carbs: number; fats: number } }[];
  goal: { kcal_target: number } | null;
}

@Injectable({ providedIn: 'root' })
export class ApiSummary {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/summary`;

  day(date?: string): Observable<DaySummary> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<DaySummary>(`${this.base}/day`, { params });
  }

  week(end?: string): Observable<WeekSummary> {
    let params = new HttpParams();
    if (end) params = params.set('end', end);
    return this.http.get<WeekSummary>(`${this.base}/week`, { params });
  }
}
