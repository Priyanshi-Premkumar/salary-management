import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  LucideDownload, 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideShieldCheck, 
  LucideSearch, 
  LucideArrowRight, 
  LucideEye 
} from '@lucide/angular';
import { AuditService } from '../../core/services/audit.service';
import { CurrencyFormatterPipe } from '../../shared/pipes/currency-formatter.pipe';
import { AuditLogResponse, PageResponse } from '../../core/models';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    CurrencyFormatterPipe,
    LucideDownload, 
    LucideChevronLeft, 
    LucideChevronRight, 
    LucideShieldCheck, 
    LucideSearch, 
    LucideArrowRight, 
    LucideEye
  ],
  template: `
    <div class="space-y-6">
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <svg lucideShieldCheck class="w-6 h-6 text-indigo-600"></svg>
            <span>Immutable Salary Audit Trail</span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Complete append-only audit log recording every compensation change, authenticated actor, and reason.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="onExportCsv()"
            class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <svg lucideDownload class="w-3.5 h-3.5 text-slate-500"></svg>
            <span>Export Audit Log CSV</span>
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <form (ngSubmit)="onSearchSubmit()" class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px] max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg lucideSearch class="w-4 h-4"></svg>
            </div>
            <input
              type="text"
              name="employeeIdInput"
              [(ngModel)]="employeeIdInput"
              placeholder="Filter by numeric Employee ID..."
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            Filter
          </button>

          <button
            *ngIf="filterEmpId !== undefined"
            type="button"
            (click)="onClearFilter()"
            class="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            Clear Filter
          </button>
        </form>
      </div>

      <!-- Audit Log Table -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Audit Timestamp</th>
                <th class="py-3 px-4">Employee ID</th>
                <th class="py-3 px-4">Changed By</th>
                <th class="py-3 px-4">Salary Revision</th>
                <th class="py-3 px-4">Bonus Revision</th>
                <th class="py-3 px-4">Effective Date</th>
                <th class="py-3 px-4">Change Reason</th>
                <th class="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="loading">
                <td colspan="8" class="py-12 text-center text-slate-500">
                  <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <div>Loading audit logs...</div>
                </td>
              </tr>

              <ng-container *ngIf="!loading && auditPage?.content?.length">
                <tr *ngFor="let log of auditPage?.content" class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {{ log.changedAt | date:'medium' }}
                  </td>

                  <td class="py-3 px-4 font-mono font-semibold text-slate-800">
                    #{{ log.employeeId }}
                  </td>

                  <td class="py-3 px-4">
                    <span class="font-medium text-slate-700">{{ log.changedByEmail }}</span>
                    <div class="text-[10px] text-indigo-500">Backend Verified</div>
                  </td>

                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5">
                      <span class="text-slate-400 line-through">
                        {{ log.previousBaseSalary | currencyFormat:log.currency:0 }}
                      </span>
                      <svg lucideArrowRight class="w-3 h-3 text-slate-400"></svg>
                      <span class="font-bold text-slate-900">
                        {{ log.newBaseSalary | currencyFormat:log.currency:0 }}
                      </span>
                      <span
                        class="text-[10px] font-bold px-1.5 py-0.2 rounded"
                        [ngClass]="(log.newBaseSalary - log.previousBaseSalary) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                      >
                        {{ (log.newBaseSalary - log.previousBaseSalary) >= 0 ? '+' : '' }}
                        {{ (log.newBaseSalary - log.previousBaseSalary) | currencyFormat:log.currency:0 }}
                      </span>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-slate-600">
                    {{ log.previousBonus | currencyFormat:log.currency:0 }} &rarr; {{ log.newBonus | currencyFormat:log.currency:0 }}
                  </td>

                  <td class="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {{ log.effectiveDate }}
                  </td>

                  <td class="py-3 px-4 text-slate-800 italic max-w-xs truncate" [title]="log.changeReason">
                    "{{ log.changeReason }}"
                  </td>

                  <td class="py-3 px-4 text-right">
                    <a
                      [routerLink]="['/employees', log.employeeId]"
                      class="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <svg lucideEye class="w-3 h-3"></svg>
                      <span>View</span>
                    </a>
                  </td>
                </tr>
              </ng-container>

              <tr *ngIf="!loading && !auditPage?.content?.length">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  No audit logs matching query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing
            <span class="font-semibold text-slate-800">
              {{ auditPage ? page * pageSize + 1 : 0 }}
            </span>
            to
            <span class="font-semibold text-slate-800">
              {{ auditPage ? minElements : 0 }}
            </span>
            of
            <span class="font-semibold text-slate-800">
              {{ (auditPage?.totalElements || 0) | number }}
            </span>
            audit entries
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="onPreviousPage()"
              [disabled]="page === 0"
              class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <svg lucideChevronLeft class="w-3.5 h-3.5 inline mr-1"></svg>
              <span>Previous</span>
            </button>

            <span class="px-2 text-slate-500">
              Page {{ auditPage ? page + 1 : 0 }} of {{ auditPage?.totalPages || 0 }}
            </span>

            <button
              (click)="onNextPage()"
              [disabled]="auditPage?.last"
              class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <svg lucideChevronRight class="w-3.5 h-3.5 inline ml-1"></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly router = inject(Router);

  employeeIdInput = '';
  filterEmpId: number | undefined = undefined;
  page = 0;
  pageSize = 25;

  loading = true;
  auditPage: PageResponse<AuditLogResponse> | null = null;

  ngOnInit(): void {
    this.fetchAuditLogs();
  }

  get minElements(): number {
    if (!this.auditPage) return 0;
    return Math.min((this.page + 1) * this.pageSize, this.auditPage.totalElements);
  }

  onSearchSubmit(): void {
    const idNum = parseInt(this.employeeIdInput.trim(), 10);
    this.filterEmpId = isNaN(idNum) ? undefined : idNum;
    this.page = 0;
    this.fetchAuditLogs();
  }

  onClearFilter(): void {
    this.employeeIdInput = '';
    this.filterEmpId = undefined;
    this.page = 0;
    this.fetchAuditLogs();
  }

  onPreviousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchAuditLogs();
    }
  }

  onNextPage(): void {
    if (this.auditPage && !this.auditPage.last) {
      this.page++;
      this.fetchAuditLogs();
    }
  }

  fetchAuditLogs(): void {
    this.loading = true;
    this.auditService.list({
      employeeId: this.filterEmpId,
      page: this.page,
      size: this.pageSize
    }).subscribe({
      next: (res) => {
        this.auditPage = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onExportCsv(): void {
    this.auditService.downloadCsv(this.filterEmpId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Error downloading audit CSV: ' + err.message)
    });
  }
}
