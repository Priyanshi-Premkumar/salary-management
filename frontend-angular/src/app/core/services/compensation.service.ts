import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompensationHistoryItem, CompensationSummary, ReviseCompensationRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompensationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getActiveCompensation(employeeId: number): Observable<CompensationSummary> {
    return this.http.get<CompensationSummary>(`${this.baseUrl}/employees/${employeeId}/compensation`);
  }

  revise(employeeId: number, req: ReviseCompensationRequest): Observable<CompensationSummary> {
    return this.http.post<CompensationSummary>(`${this.baseUrl}/employees/${employeeId}/compensation`, req);
  }

  reviseCompensation(
    employeeId: number, 
    data: { newBaseSalary: number; newBonus?: number; currency: string; changeReason: string; effectiveDate: string; }
  ): Observable<CompensationSummary> {
    const payload: ReviseCompensationRequest = {
      newBaseSalary: data.newBaseSalary,
      newBonus: data.newBonus || 0,
      currency: data.currency,
      effectiveFrom: data.effectiveDate,
      reason: data.changeReason
    };
    return this.revise(employeeId, payload);
  }

  getHistory(employeeId: number): Observable<CompensationHistoryItem[]> {
    return this.http.get<CompensationHistoryItem[]>(`${this.baseUrl}/employees/${employeeId}/salary-history`);
  }
}
