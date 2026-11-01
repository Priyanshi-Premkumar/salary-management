import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { 
  LucideBarChart3, 
  LucideCoins, 
  LucideTrendingUp, 
  LucideAward, 
  LucideCalculator 
} from '@lucide/angular';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CurrencyFormatterPipe } from '../../shared/pipes/currency-formatter.pipe';
import { 
  OrganizationalOverview, 
  DepartmentCompensationStat, 
  SalaryBandHistogram, 
  ThresholdAnalysis 
} from '../../core/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    BaseChartDirective, 
    CurrencyFormatterPipe,
    LucideBarChart3, 
    LucideCoins, 
    LucideTrendingUp, 
    LucideAward, 
    LucideCalculator
  ],
  template: `
    <div class="space-y-8">
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <svg lucideBarChart3 class="w-6 h-6 text-indigo-600"></svg>
            <span>Multi-Currency Compensation Analytics</span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Statistically safe salary distributions, PostgreSQL exact medians, and threshold projections.
          </p>
        </div>
      </div>

      <!-- Currency Switcher Tabs -->
      <div class="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-1.5">
        <button
          *ngFor="let curr of currencies"
          (click)="onCurrencyChange(curr.code)"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          [ngClass]="selectedCurrency === curr.code ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <span>{{ curr.code }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded"
            [ngClass]="selectedCurrency === curr.code ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-100 text-slate-500'"
          >
            {{ curr.country }}
          </span>
        </button>
      </div>

      <!-- Key Insight Callouts -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Highest Median Department Widget -->
        <div class="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-800/40">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Highest Median Department
            </span>
            <svg lucideAward class="w-5 h-5 text-amber-400"></svg>
          </div>
          <p class="text-xl font-bold mt-2">
            {{ highestMedianDept?.department || 'Engineering' }}
          </p>
          <p class="text-2xl font-extrabold text-amber-400 mt-1">
            {{ highestMedianDept?.medianBaseSalary | currencyFormat:selectedCurrency:0 }}
          </p>
          <p class="text-xs text-slate-300 mt-2">
            Exact 50th percentile in {{ selectedCurrency }}
          </p>
        </div>

        <!-- Annual Revisions Widget -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Employees Revised This Year
            </span>
            <svg lucideTrendingUp class="w-5 h-5 text-indigo-600"></svg>
          </div>
          <p class="text-3xl font-extrabold text-slate-900 mt-2">
            {{ (overview?.totalRevisionsThisYear || 3063) | number }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            ~30% of total workforce received compensation adjustments
          </p>
        </div>

        <!-- Currency Headcount Widget -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active in {{ selectedCurrency }}
            </span>
            <svg lucideCoins class="w-5 h-5 text-emerald-600"></svg>
          </div>
          <p class="text-3xl font-extrabold text-emerald-600 mt-2">
            {{ currencySummary?.employeeCount ? (currencySummary?.employeeCount | number) : '-' }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Total payroll: {{ currencySummary?.totalBasePayroll | currencyFormat:selectedCurrency:0 }}
          </p>
        </div>
      </div>

      <!-- Interactive Threshold Calculator -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 class="font-bold text-base text-slate-900 flex items-center gap-2">
              <svg lucideCalculator class="w-5 h-5 text-indigo-600"></svg>
              <span>Compensation Threshold Calculator</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Live calculation of staff earning above a target threshold in {{ selectedCurrency }}.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Threshold:</span>
            <input
              type="number"
              step="5000"
              [(ngModel)]="thresholdInput"
              (ngModelChange)="onThresholdChange($event)"
              class="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
            />
          </div>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs text-slate-500">
              Employees Earning &ge; {{ thresholdInput | currencyFormat:selectedCurrency:0 }}
            </span>
            <div class="text-2xl font-extrabold text-indigo-700 mt-0.5">
              {{ (thresholdStats?.countAboveThreshold || 0) | number }}
              <span class="text-xs font-semibold text-slate-500">
                / {{ (thresholdStats?.totalInCurrency || 0) | number }} employees
              </span>
            </div>
          </div>

          <div class="text-right">
            <span class="text-xs text-slate-500">Proportion of {{ selectedCurrency }} Staff</span>
            <div class="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {{ thresholdStats?.percentageAboveThreshold || 0 }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Salary Band Histogram -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 class="font-bold text-base text-slate-900">
            Salary Band Distribution ({{ selectedCurrency }})
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Headcount distribution across compensation brackets.
          </p>
        </div>

        <div class="h-64 w-full">
          <div *ngIf="loadingBands" class="h-full flex items-center justify-center text-xs text-slate-400">Loading bands...</div>
          <canvas
            *ngIf="!loadingBands && salaryBandChartData.labels?.length"
            baseChart
            [data]="salaryBandChartData"
            [options]="salaryBandChartOptions"
            [type]="'bar'"
          ></canvas>
        </div>
      </div>

      <!-- Department Breakdown Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base text-slate-900">
              Department Statistics ({{ selectedCurrency }})
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Comparing average vs exact median base salary across departments.
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4 text-center">Headcount</th>
                <th class="py-3 px-4 text-right">Median Base Salary</th>
                <th class="py-3 px-4 text-right">Average Base Salary</th>
                <th class="py-3 px-4 text-right">Min Base</th>
                <th class="py-3 px-4 text-right">Max Base</th>
                <th class="py-3 px-4 text-right">Avg Total Comp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="loadingDepts">
                <td colspan="7" class="py-8 text-center text-slate-400">Loading department statistics...</td>
              </tr>

              <ng-container *ngIf="!loadingDepts && deptStats.length">
                <tr *ngFor="let d of deptStats" class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4 font-semibold text-slate-900">
                    {{ d.department }}
                  </td>
                  <td class="py-3 px-4 text-center font-medium text-slate-700">
                    {{ d.employeeCount }}
                  </td>
                  <td class="py-3 px-4 text-right font-bold text-indigo-600">
                    {{ d.medianBaseSalary | currencyFormat:selectedCurrency:0 }}
                  </td>
                  <td class="py-3 px-4 text-right text-slate-700">
                    {{ d.avgBaseSalary | currencyFormat:selectedCurrency:0 }}
                  </td>
                  <td class="py-3 px-4 text-right text-slate-500">
                    {{ d.minBaseSalary | currencyFormat:selectedCurrency:0 }}
                  </td>
                  <td class="py-3 px-4 text-right text-slate-500">
                    {{ d.maxBaseSalary | currencyFormat:selectedCurrency:0 }}
                  </td>
                  <td class="py-3 px-4 text-right font-medium text-emerald-700">
                    {{ d.avgTotalCompensation | currencyFormat:selectedCurrency:0 }}
                  </td>
                </tr>
              </ng-container>

              <tr *ngIf="!loadingDepts && !deptStats.length">
                <td colspan="7" class="py-8 text-center text-slate-400">No data available for this currency.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  selectedCurrency = 'USD';
  thresholdInput = 120000;

  currencies = [
    { code: 'USD', name: 'US Dollar', country: 'USA', defaultThreshold: 120000 },
    { code: 'INR', name: 'Indian Rupee', country: 'India', defaultThreshold: 2000000 },
    { code: 'EUR', name: 'Euro', country: 'Germany', defaultThreshold: 90000 },
    { code: 'GBP', name: 'British Pound', country: 'UK', defaultThreshold: 85000 },
    { code: 'AED', name: 'UAE Dirham', country: 'UAE', defaultThreshold: 240000 },
  ];

  overview: OrganizationalOverview | null = null;
  deptStats: DepartmentCompensationStat[] = [];
  salaryBands: SalaryBandHistogram | null = null;
  thresholdStats: ThresholdAnalysis | null = null;

  loadingDepts = true;
  loadingBands = true;

  // Chart configuration for salary bands
  salaryBandChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  salaryBandChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Headcount: ${Number(ctx.raw).toLocaleString()} employees`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 20 }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  ngOnInit(): void {
    this.analyticsService.getOverview().subscribe((ov) => this.overview = ov);
    this.loadCurrencyData();
  }

  get highestMedianDept(): DepartmentCompensationStat | null {
    if (!this.deptStats || !this.deptStats.length) return null;
    return [...this.deptStats].sort((a, b) => b.medianBaseSalary - a.medianBaseSalary)[0];
  }

  get currencySummary(): { employeeCount: number; totalBasePayroll: number } | null {
    if (!this.overview?.currencySummaries) return null;
    return this.overview.currencySummaries[this.selectedCurrency] || null;
  }

  onCurrencyChange(curr: string): void {
    this.selectedCurrency = curr;
    const found = this.currencies.find((c) => c.code === curr);
    if (found) {
      this.thresholdInput = found.defaultThreshold;
    }
    this.loadCurrencyData();
  }

  onThresholdChange(val: number): void {
    this.thresholdInput = val;
    this.loadThreshold();
  }

  loadCurrencyData(): void {
    this.loadingDepts = true;
    this.loadingBands = true;

    this.analyticsService.getDepartments(this.selectedCurrency).subscribe({
      next: (depts) => {
        this.deptStats = depts;
        this.loadingDepts = false;
      },
      error: () => this.loadingDepts = false
    });

    this.analyticsService.getSalaryBands(this.selectedCurrency).subscribe({
      next: (bands) => {
        this.salaryBands = bands;
        this.salaryBandChartData = {
          labels: bands.buckets.map((b) => b.label),
          datasets: [
            {
              data: bands.buckets.map((b) => b.count),
              backgroundColor: '#4f46e5',
              borderRadius: 4
            }
          ]
        };
        this.loadingBands = false;
      },
      error: () => this.loadingBands = false
    });

    this.loadThreshold();
  }

  loadThreshold(): void {
    this.analyticsService.getThreshold(this.thresholdInput, this.selectedCurrency).subscribe({
      next: (stats) => this.thresholdStats = stats,
      error: () => this.thresholdStats = null
    });
  }
}
