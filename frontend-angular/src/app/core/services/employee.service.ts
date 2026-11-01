import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployeeDetail, EmployeeSearchParams, EmployeeSummary, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  search(params: EmployeeSearchParams): Observable<PageResponse<EmployeeSummary>> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get<PageResponse<EmployeeSummary>>(this.baseUrl, { params: httpParams });
  }

  list(params: EmployeeSearchParams): Observable<PageResponse<EmployeeSummary>> {
    return this.search(params);
  }

  getById(id: number): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.baseUrl}/${id}`);
  }

  downloadCsv(params: EmployeeSearchParams): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      tap((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
    );
  }
}
