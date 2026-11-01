import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  CountrySalaryStats, 
  DepartmentSalaryStats, 
  OverviewMetrics, 
  SalaryBandResponse, 
  ThresholdResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  getOverview(asOfDate?: string): Observable<OverviewMetrics> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<OverviewMetrics>(`${this.baseUrl}/overview`, { params });
  }

  getDepartments(currency?: string, asOfDate?: string): Observable<DepartmentSalaryStats[]> {
    let params = new HttpParams();
    if (currency) params = params.set('currency', currency);
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<DepartmentSalaryStats[]>(`${this.baseUrl}/departments`, { params });
  }

  getCountries(asOfDate?: string): Observable<CountrySalaryStats[]> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<CountrySalaryStats[]>(`${this.baseUrl}/countries`, { params });
  }

  getSalaryBands(currency: string, asOfDate?: string): Observable<SalaryBandResponse> {
    let params = new HttpParams().set('currency', currency);
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<SalaryBandResponse>(`${this.baseUrl}/salary-bands`, { params });
  }

  getThreshold(threshold: number, currency: string, asOfDate?: string): Observable<ThresholdResponse> {
    let params = new HttpParams()
      .set('threshold', threshold.toString())
      .set('currency', currency);
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<ThresholdResponse>(`${this.baseUrl}/threshold`, { params });
  }
}
