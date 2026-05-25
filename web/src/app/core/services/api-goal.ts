import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Goal } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiGoal {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/goal`;

  get(): Observable<Goal> {
    return this.http.get<Goal>(this.base);
  }

  update(payload: Partial<Goal>): Observable<Goal> {
    return this.http.put<Goal>(this.base, payload);
  }
}
