import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Meal, MealItem, MealType } from '../models/meal.model';

@Injectable({ providedIn: 'root' })
export class ApiMeal {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/meals`;

  list(date?: string): Observable<Meal[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<Meal[]>(this.base, { params });
  }

  create(payload: { date: string; type: MealType; notes?: string }): Observable<Meal> {
    return this.http.post<Meal>(this.base, payload);
  }

  destroy(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }

  addItem(mealId: number, payload: { food_id: number; grams: number }): Observable<MealItem> {
    return this.http.post<MealItem>(`${this.base}/${mealId}/items`, payload);
  }

  updateItem(mealId: number, itemId: number, grams: number): Observable<MealItem> {
    return this.http.put<MealItem>(`${this.base}/${mealId}/items/${itemId}`, { grams });
  }

  removeItem(mealId: number, itemId: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${mealId}/items/${itemId}`);
  }
}
