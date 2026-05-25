import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeightLog } from '../models/weight-log.model';

@Injectable({ providedIn: 'root' })
export class ApiWeightLog {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/weight-logs`;

  list(days = 90): Observable<WeightLog[]> {
    return this.http.get<WeightLog[]>(this.base, {
      params: new HttpParams().set('days', days),
    });
  }

  store(payload: { date: string; weight_kg: number }): Observable<WeightLog> {
    return this.http.post<WeightLog>(this.base, payload);
  }

  destroy(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
