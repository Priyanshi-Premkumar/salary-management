import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { 
  LucideUsers, 
  LucideTrendingUp, 
  LucideUserCheck, 
  LucideUserX, 
  LucideArrowUpRight, 
  LucideDownload, 
  LucideCoins 
} from '@lucide/angular';
import { AnalyticsService } from '../../core/services/analytics.service';
import { EmployeeService } from '../../core/services/employee.service';
import { CurrencyFormatterPipe } from '../../shared/pipes/currency-formatter.pipe';
import { OrganizationalOverview, CountryDistribution, DepartmentCompensationStat } from '../../core/models';

const CHART_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    BaseChartDirective, 
    CurrencyFormatterPipe,
    LucideUsers, 
    LucideTrendingUp, 
    LucideUserCheck, 
    LucideUserX, 
    LucideArrowUpRight, 
    LucideDownload, 
    LucideCoins
  ],
  template: `
    <div class="space-y-8">
      <!-- Loading state -->
      <div *ngIf="loading" class="flex items-center justify-center min-h-[500px]">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-slate-500">Loading organizational overview...</p>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <ng-container *ngIf="!loading">
        <!-- Top Banner & Quick Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              Executive Compensation Overview
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              Real-time aggregate analytics across 10,000 employees in 5 countries.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="onExportCsv()"
              class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <svg lucideDownload class="w-3.5 h-3.5 text-slate-500"></svg>
              <span>Export CSV</span>
            </button>

            <a
              routerLink="/employees"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              <svg lucideUsers class="w-3.5 h-3.5"></svg>
              <span>Directory (10,000)</span>
            </a>
          </div>
        </div>

        <!-- Primary KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</p>
              <p class="text-2xl font-extrabold text-slate-900 mt-1">
                {{ (overview?.totalEmployees || 10000) | number }}
              </p>
              <p class="text-xs text-indigo-600 font-medium mt-1">100% deterministic seed</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <svg lucideUsers class="w-6 h-6"></svg>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
              <p class="text-2xl font-extrabold text-emerald-600 mt-1">
                {{ (overview?.activeEmployees || 0) | number }}
              </p>
              <p class="text-xs text-slate-400 mt-1">
                {{ retentionRate }}% retention rate
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <svg lucideUserCheck class="w-6 h-6"></svg>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historical Revisions</p>
              <p class="text-2xl font-extrabold text-slate-900 mt-1">
                {{ (overview?.totalRevisionsThisYear || 3000) | number }}+
              </p>
              <p class="text-xs text-slate-400 mt-1">Temporal effective dating</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <svg lucideTrendingUp class="w-6 h-6"></svg>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive / Resigned</p>
              <p class="text-2xl font-extrabold text-slate-600 mt-1">
                {{ (overview?.inactiveEmployees || 0) | number }}
              </p>
              <p class="text-xs text-slate-400 mt-1">Historical records preserved</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
              <svg lucideUserX class="w-6 h-6"></svg>
            </div>
          </div>
        </div>

        <!-- Multi-Currency Regional Breakdown Cards -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg lucideCoins class="w-4 h-4 text-indigo-600"></svg>
              <span>Multi-Currency Compensation by Region</span>
            </h2>
            <span class="text-xs text-slate-500">
              Isolated by currency (no un-converted cross-currency aggregations)
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div *ngFor="let c of countries" class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-slate-800">{{ c.country }}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {{ c.currency }}
                </span>
              </div>
              
              <div class="mt-3 space-y-1.5">
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Headcount:</span>
                  <span class="font-semibold text-slate-800">{{ c.employeeCount | number }}</span>
                </div>
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Median Base:</span>
                  <span class="font-semibold text-indigo-600">{{ c.medianBaseSalary | currencyFormat:c.currency:0 }}</span>
                </div>
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Average Base:</span>
                  <span class="font-medium text-slate-700">{{ c.avgBaseSalary | currencyFormat:c.currency:0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Analytics Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Department Median vs Average (USD) -->
          <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-sm text-slate-900">
                  Department Salary Distribution (USD)
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Comparing exact PostgreSQL median (50th percentile) vs mathematical mean
                </p>
              </div>
              <a
                routerLink="/analytics"
                class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Explore All Currencies</span>
                <svg lucideArrowUpRight class="w-3.5 h-3.5"></svg>
              </a>
            </div>

            <div class="h-72 w-full">
              <canvas
                *ngIf="deptBarChartData.labels?.length"
                baseChart
                [data]="deptBarChartData"
                [options]="deptBarChartOptions"
                [type]="'bar'"
              ></canvas>
            </div>
          </div>

          <!-- Global Headcount by Country -->
          <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-sm text-slate-900 mb-1">
                Global Headcount by Country
              </h3>
              <p class="text-xs text-slate-500 mb-4">
                10,000 employees distributed across 5 entities
              </p>

              <div class="h-52 w-full flex items-center justify-center">
                <canvas
                  *ngIf="countryDoughnutChartData.labels?.length"
                  baseChart
                  [data]="countryDoughnutChartData"
                  [options]="doughnutOptions"
                  [type]="'doughnut'"
                ></canvas>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
              <div *ngFor="let item of countryChartLegend; let idx = index" class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" [style.backgroundColor]="item.color"></span>
                <span class="text-slate-600 truncate">{{ item.name }}</span>
                <span class="font-semibold text-slate-800 ml-auto">{{ item.value | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  loading = true;
  overview: OrganizationalOverview | null = null;
  countries: CountryDistribution[] = [];
  deptStats: DepartmentCompensationStat[] = [];

  // Bar Chart Configuration
  deptBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  deptBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { boxWidth: 12, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 30 }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 10 },
          callback: (value) => `$${Number(value) / 1000}k`
        }
      }
    }
  };

  // Doughnut Chart Configuration
  countryDoughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Headcount: ${Number(ctx.raw).toLocaleString()} employees`
        }
      }
    }
  };

  countryChartLegend: Array<{ name: string; value: number; color: string }> = [];

  ngOnInit(): void {
    this.loadData();
  }

  get retentionRate(): string {
    if (!this.overview || !this.overview.totalEmployees) return '95.0';
    return ((this.overview.activeEmployees / this.overview.totalEmployees) * 100).toFixed(1);
  }

  loadData(): void {
    this.loading = true;

    this.analyticsService.getOverview().subscribe({
      next: (ov) => {
        this.overview = ov;
        this.checkComplete();
      },
      error: () => this.checkComplete()
    });

    this.analyticsService.getCountries().subscribe({
      next: (cnt) => {
        this.countries = cnt;
        this.setupCountryChart(cnt);
        this.checkComplete();
      },
      error: () => this.checkComplete()
    });

    this.analyticsService.getDepartments('USD').subscribe({
      next: (depts) => {
        this.deptStats = depts;
        this.setupDeptChart(depts);
        this.checkComplete();
      },
      error: () => this.checkComplete()
    });
  }

  private pendingRequests = 3;
  private checkComplete(): void {
    this.pendingRequests--;
    if (this.pendingRequests <= 0) {
      this.loading = false;
    }
  }

  private setupDeptChart(depts: DepartmentCompensationStat[]): void {
    const labels = depts.map((d) => d.department);
    const medians = depts.map((d) => d.medianBaseSalary);
    const averages = depts.map((d) => d.avgBaseSalary);

    this.deptBarChartData = {
      labels,
      datasets: [
        {
          data: medians,
          label: 'PostgreSQL Median',
          backgroundColor: '#6366f1',
          borderRadius: 4
        },
        {
          data: averages,
          label: 'Average Salary',
          backgroundColor: '#94a3b8',
          borderRadius: 4
        }
      ]
    };
  }

  private setupCountryChart(countries: CountryDistribution[]): void {
    const labels = countries.map((c) => c.country);
    const counts = countries.map((c) => c.employeeCount);
    const colors = countries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    this.countryDoughnutChartData = {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    this.countryChartLegend = countries.map((c, i) => ({
      name: c.country,
      value: c.employeeCount,
      color: colors[i]
    }));
  }

  onExportCsv(): void {
    this.employeeService.downloadCsv({}).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to export CSV: ' + err.message)
    });
  }
}
