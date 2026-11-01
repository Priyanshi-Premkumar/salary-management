import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogSearchParams, PageResponse, SalaryAuditLog } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/audit-logs`;

  list(params: AuditLogSearchParams): Observable<PageResponse<SalaryAuditLog>> {
    let httpParams = new HttpParams();
    if (params.employeeId !== undefined && params.employeeId !== null) {
      httpParams = httpParams.set('employeeId', params.employeeId.toString());
    }
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<PageResponse<SalaryAuditLog>>(this.baseUrl, { params: httpParams }).pipe(
      catchError(() => of({
        content: [],
        page: params.page || 0,
        size: params.size || 25,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      }))
    );
  }

  downloadCsv(employeeId?: number): Observable<Blob> {
    let httpParams = new HttpParams();
    if (employeeId !== undefined && employeeId !== null) {
      httpParams = httpParams.set('employeeId', employeeId.toString());
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      tap((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
    );
  }
}
