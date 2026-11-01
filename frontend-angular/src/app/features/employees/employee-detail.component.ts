import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { 
  LucideArrowLeft, 
  LucideCalendar, 
  LucideGlobe, 
  LucideMail, 
  LucidePhone, 
  LucideShieldCheck, 
  LucideTrendingUp, 
  LucideHistory, 
  LucideCheckCircle 
} from '@lucide/angular';
import { EmployeeService } from '../../core/services/employee.service';
import { CompensationService } from '../../core/services/compensation.service';
import { AuditService } from '../../core/services/audit.service';
import { CurrencyFormatterPipe } from '../../shared/pipes/currency-formatter.pipe';
import { SalaryRevisionModalComponent } from '../../shared/components/modal/salary-revision-modal.component';
import { EmployeeDetail, CompensationRecord, AuditLogResponse, PageResponse } from '../../core/models';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    CurrencyFormatterPipe,
    SalaryRevisionModalComponent,
    LucideArrowLeft, 
    LucideCalendar, 
    LucideGlobe, 
    LucideMail, 
    LucidePhone, 
    LucideShieldCheck, 
    LucideTrendingUp, 
    LucideHistory, 
    LucideCheckCircle
  ],
  template: `
    <div class="space-y-8">
      <!-- Back button -->
      <div>
        <a
          routerLink="/employees"
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <svg lucideArrowLeft class="w-4 h-4"></svg>
          <span>Back to Employee Directory</span>
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-slate-500">Loading employee compensation profile...</p>
        </div>
      </div>

      <!-- Profile View -->
      <ng-container *ngIf="!loading && employee">
        <!-- Profile Header Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div class="flex items-start md:items-center space-x-5">
              <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
              </div>

              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                    {{ employee.firstName }} {{ employee.lastName }}
                  </h1>
                  <span class="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {{ employee.employeeCode }}
                  </span>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    [ngClass]="employee.employmentStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
                  >
                    {{ employee.employmentStatus }}
                  </span>
                </div>

                <p class="text-sm font-medium text-slate-600 mt-1">
                  {{ employee.designation }} &bull; <span class="text-indigo-600">{{ employee.department }}</span>
                </p>

                <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                  <span class="inline-flex items-center gap-1.5">
                    <svg lucideMail class="w-3.5 h-3.5 text-slate-400"></svg>
                    {{ employee.email }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <svg lucideGlobe class="w-3.5 h-3.5 text-slate-400"></svg>
                    {{ employee.country }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <svg lucidePhone class="w-3.5 h-3.5 text-slate-400"></svg>
                    {{ employee.phone }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <svg lucideCalendar class="w-3.5 h-3.5 text-slate-400"></svg>
                    Joined {{ employee.joiningDate }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                (click)="isRevisionModalOpen = true"
                class="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <svg lucideTrendingUp class="w-4 h-4"></svg>
                <span>Revise Compensation</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Current Active Compensation -->
        <div class="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div class="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Active Compensation Package
              </span>
              <h2 class="text-xl font-bold mt-0.5">
                Current Effective Salary ({{ activeCurrency }})
              </h2>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <svg lucideCheckCircle class="w-3.5 h-3.5"></svg>
              <span>Active Record</span>
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div class="bg-white/5 backdrop-blur-xs p-5 rounded-xl border border-white/10">
              <p class="text-xs text-slate-400 font-medium">Base Annual Salary</p>
              <p class="text-2xl font-bold text-white mt-1.5">
                {{ baseSalary | currencyFormat:activeCurrency:0 }}
              </p>
              <p class="text-[11px] text-slate-400 mt-1">Contractual annual base</p>
            </div>

            <div class="bg-white/5 backdrop-blur-xs p-5 rounded-xl border border-white/10">
              <p class="text-xs text-slate-400 font-medium">Annual Performance Bonus</p>
              <p class="text-2xl font-bold text-indigo-300 mt-1.5">
                {{ bonus | currencyFormat:activeCurrency:0 }}
              </p>
              <p class="text-[11px] text-slate-400 mt-1">
                {{ bonusPct }}% of base
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-xs p-5 rounded-xl border border-white/10">
              <p class="text-xs text-slate-400 font-medium">Total On-Target Earnings</p>
              <p class="text-2xl font-bold text-emerald-400 mt-1.5">
                {{ totalComp | currencyFormat:activeCurrency:0 }}
              </p>
              <p class="text-[11px] text-slate-400 mt-1">Base + Target Bonus</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>
              Effective from:
              <strong class="text-slate-200">
                {{ effectiveDate }}
              </strong>
              to <strong class="text-slate-200">Present (Open-ended)</strong>
            </span>
            <span class="font-mono text-[11px] text-indigo-400">
              Protected by btree_gist exclusion constraint
            </span>
          </div>
        </div>

        <!-- Historical Compensation Timeline -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg lucideHistory class="w-5 h-5 text-indigo-600"></svg>
                <span>Compensation Revision History & Timeline</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Full chronological progression of past, active, and future compensation records.
              </p>
            </div>
            <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {{ history.length || 1 }} Total Revisions
            </span>
          </div>

          <div *ngIf="loadingHistory" class="py-8 text-center text-xs text-slate-400">Loading timeline...</div>

          <div *ngIf="!loadingHistory && history.length" class="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-8 py-2">
            <div *ngFor="let record of history; let index = index" class="relative group">
              <!-- Dot -->
              <div
                class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white"
                [ngClass]="record.effectiveTo === null ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400 bg-slate-100'"
              ></div>

              <!-- Card -->
              <div class="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-sm text-slate-900">
                      {{ record.baseSalary | currencyFormat:(record.currency || activeCurrency):0 }}
                    </span>
                    <span class="text-xs text-slate-500 font-medium">
                      + {{ record.bonus | currencyFormat:(record.currency || activeCurrency):0 }} bonus
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      [ngClass]="record.effectiveTo === null ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200/80 text-slate-600'"
                    >
                      {{ record.effectiveTo === null ? 'Current' : 'Historical' }}
                    </span>
                  </div>

                  <div class="text-xs text-slate-500 flex items-center gap-1.5">
                    <svg lucideCalendar class="w-3.5 h-3.5 text-slate-400"></svg>
                    <span>
                      {{ record.effectiveFrom }} &rarr; {{ record.effectiveTo || 'Present' }}
                    </span>
                  </div>
                </div>

                <div class="mt-3 text-xs text-slate-600">
                  Total Compensation:
                  <strong class="text-slate-800">
                    {{ (record.baseSalary + (record.bonus || 0)) | currencyFormat:(record.currency || activeCurrency):0 }}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <p *ngIf="!loadingHistory && !history.length" class="text-xs text-slate-400 py-4">
            No historical revisions recorded.
          </p>
        </div>

        <!-- Salary Audit Log Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg lucideShieldCheck class="w-5 h-5 text-indigo-600"></svg>
                <span>Immutable Audit Trail for this Employee</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Verified append-only audit entries recording actor identity and salary deltas.
              </p>
            </div>
          </div>

          <div *ngIf="loadingAudit" class="py-6 text-center text-xs text-slate-400">Loading audit trail...</div>

          <div *ngIf="!loadingAudit && auditLogs?.content?.length" class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th class="py-2.5 px-3">Timestamp</th>
                  <th class="py-2.5 px-3">Changed By</th>
                  <th class="py-2.5 px-3">Previous Base &rarr; New Base</th>
                  <th class="py-2.5 px-3">Effective Date</th>
                  <th class="py-2.5 px-3">Change Reason</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let log of auditLogs?.content" class="hover:bg-slate-50">
                  <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {{ log.changedAt | date:'medium' }}
                  </td>
                  <td class="py-2.5 px-3 font-medium text-slate-700">
                    {{ log.changedByEmail }}
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="text-slate-400 line-through mr-1.5">
                      {{ log.previousBaseSalary | currencyFormat:log.currency:0 }}
                    </span>
                    &rarr;
                    <span class="font-semibold text-emerald-700 ml-1.5">
                      {{ log.newBaseSalary | currencyFormat:log.currency:0 }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-600">
                    {{ log.effectiveDate }}
                  </td>
                  <td class="py-2.5 px-3 text-slate-800 italic">
                    "{{ log.changeReason }}"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p *ngIf="!loadingAudit && !auditLogs?.content?.length" class="text-xs text-slate-400 py-3">
            No audit logs recorded for this employee.
          </p>
        </div>

        <!-- Salary Revision Modal -->
        <app-salary-revision-modal
          [employeeId]="empId"
          [employeeName]="employee.firstName + ' ' + employee.lastName"
          [employeeCode]="employee.employeeCode"
          [currentBase]="baseSalary"
          [currentBonus]="bonus"
          [currency]="activeCurrency"
          [isOpen]="isRevisionModalOpen"
          (closeModal)="isRevisionModalOpen = false"
          (revisionSuccess)="onRevisionSuccess()"
        ></app-salary-revision-modal>
      </ng-container>
    </div>
  `
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly compensationService = inject(CompensationService);
  private readonly auditService = inject(AuditService);

  empId: number = 0;
  employee: EmployeeDetail | null = null;
  history: CompensationRecord[] = [];
  auditLogs: PageResponse<AuditLogResponse> | null = null;

  loading = true;
  loadingHistory = true;
  loadingAudit = true;
  isRevisionModalOpen = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.empId = id ? parseInt(id, 10) : 0;
      if (this.empId > 0) {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.loading = true;
    this.loadingHistory = true;
    this.loadingAudit = true;

    this.employeeService.getById(this.empId).subscribe({
      next: (emp) => {
        this.employee = emp;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.compensationService.getHistory(this.empId).subscribe({
      next: (h) => {
        this.history = h;
        this.loadingHistory = false;
      },
      error: () => this.loadingHistory = false
    });

    this.auditService.list({ employeeId: this.empId, size: 50 }).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loadingAudit = false;
      },
      error: () => this.loadingAudit = false
    });
  }

  get activeHistory(): CompensationRecord | undefined {
    return this.history.find((h) => h.status === 'CURRENT') ||
           this.history.find((h) => !h.effectiveTo) ||
           this.history[0];
  }

  get activeCurrency(): string {
    return this.employee?.currentCompensation?.currency ||
           this.employee?.currency ||
           this.activeHistory?.currency ||
           (this.employee?.country === 'India' ? 'INR' : 'USD');
  }

  get baseSalary(): number {
    return Number(
      this.employee?.currentCompensation?.baseSalary ??
      this.employee?.currentBaseSalary ??
      this.activeHistory?.baseSalary ??
      0
    );
  }

  get bonus(): number {
    return Number(
      this.employee?.currentCompensation?.bonus ??
      this.employee?.currentBonus ??
      this.activeHistory?.bonus ??
      0
    );
  }

  get totalComp(): number {
    return this.baseSalary + this.bonus;
  }

  get bonusPct(): string {
    return this.baseSalary > 0 ? ((this.bonus / this.baseSalary) * 100).toFixed(1) : '0';
  }

  get effectiveDate(): string {
    return this.employee?.currentCompensation?.effectiveFrom ||
           this.employee?.compensationEffectiveFrom ||
           this.activeHistory?.effectiveFrom ||
           this.employee?.joiningDate ||
           '';
  }

  onRevisionSuccess(): void {
    this.loadAll();
  }
}
