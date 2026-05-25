import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Food, FoodSearchResponse } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class ApiFood {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/foods`;

  search(q: string): Observable<FoodSearchResponse> {
    return this.http.get<FoodSearchResponse>(`${this.base}/search`, {
      params: new HttpParams().set('q', q),
    });
  }

  store(food: Partial<Food>): Observable<Food> {
    return this.http.post<Food>(this.base, food);
  }

  get(id: number): Observable<Food> {
    return this.http.get<Food>(`${this.base}/${id}`);
  }
}
