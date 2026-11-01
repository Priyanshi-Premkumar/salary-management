import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { 
  LucideSearch, 
  LucideDownload, 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideTrendingUp, 
  LucideEye, 
  LucideUsers, 
  LucideGlobe 
} from '@lucide/angular';
import { EmployeeService } from '../../core/services/employee.service';
import { SalaryRevisionModalComponent } from '../../shared/components/modal/salary-revision-modal.component';
import { EmployeeSummary, PageResponse } from '../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    SalaryRevisionModalComponent,
    LucideSearch, 
    LucideDownload, 
    LucideChevronLeft, 
    LucideChevronRight, 
    LucideTrendingUp, 
    LucideEye, 
    LucideUsers, 
    LucideGlobe
  ],
  template: `
    <div class="space-y-6">
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <svg lucideUsers class="w-6 h-6 text-indigo-600"></svg>
            <span>Employee Directory</span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Browse and manage 10,000 synthetic employees across international branches.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="onExportCsv()"
            class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <svg lucideDownload class="w-3.5 h-3.5 text-slate-500"></svg>
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      <!-- Filter and Search Bar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <!-- Search Box -->
          <div class="md:col-span-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg lucideSearch class="w-4 h-4"></svg>
            </div>
            <input
              type="text"
              [ngModel]="searchTerm"
              (ngModelChange)="onSearchInput($event)"
              placeholder="Search code, name, or email..."
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <!-- Country Dropdown -->
          <div>
            <select
              [(ngModel)]="selectedCountry"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Countries (5)</option>
              <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
            </select>
          </div>

          <!-- Department Dropdown -->
          <div>
            <select
              [(ngModel)]="selectedDept"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments (9)</option>
              <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
            </select>
          </div>

          <!-- Status Dropdown -->
          <div>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RESIGNED">RESIGNED</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Directory Table -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Employee</th>
                <th class="py-3 px-4">Country</th>
                <th class="py-3 px-4">Department & Role</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Joining Date</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngIf="loading">
                <td colspan="6" class="py-12 text-center text-slate-500">
                  <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <div>Loading employees...</div>
                </td>
              </tr>

              <ng-container *ngIf="!loading && employeesPage?.content?.length">
                <tr *ngFor="let emp of employeesPage?.content" class="hover:bg-slate-50/80 transition-colors">
                  <!-- Employee Code & Name -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100">
                        {{ emp.firstName.charAt(0) }}{{ emp.lastName.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-semibold text-slate-900">
                          {{ emp.firstName }} {{ emp.lastName }}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono">
                          {{ emp.employeeCode }} &bull; {{ emp.email }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Country -->
                  <td class="py-3.5 px-4 font-medium text-slate-700">
                    <span class="inline-flex items-center gap-1.5">
                      <svg lucideGlobe class="w-3.5 h-3.5 text-slate-400"></svg>
                      {{ emp.country }}
                    </span>
                  </td>

                  <!-- Department & Role -->
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-800">{{ emp.department }}</div>
                    <div class="text-[11px] text-slate-500">{{ emp.designation }}</div>
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      [ngClass]="emp.employmentStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
                    >
                      {{ emp.employmentStatus }}
                    </span>
                  </td>

                  <!-- Joining Date -->
                  <td class="py-3.5 px-4 text-slate-600">
                    {{ emp.joiningDate }}
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <a
                        [routerLink]="['/employees', emp.id]"
                        class="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded border border-slate-200 hover:border-indigo-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View Profile & Compensation"
                      >
                        <svg lucideEye class="w-3 h-3"></svg>
                        <span>View</span>
                      </a>

                      <button
                        (click)="openRevision(emp)"
                        class="px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                        title="Revise Compensation"
                      >
                        <svg lucideTrendingUp class="w-3 h-3"></svg>
                        <span>Revise</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </ng-container>

              <tr *ngIf="!loading && !employeesPage?.content?.length">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  No employees matching the current filters.
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
              {{ employeesPage ? page * pageSize + 1 : 0 }}
            </span>
            to
            <span class="font-semibold text-slate-800">
              {{ employeesPage ? minElements : 0 }}
            </span>
            of
            <span class="font-semibold text-slate-800">
              {{ (employeesPage?.totalElements || 0) | number }}
            </span>
            employees
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="onPreviousPage()"
              [disabled]="page === 0"
              class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white inline-flex items-center gap-1 cursor-pointer"
            >
              <svg lucideChevronLeft class="w-3.5 h-3.5"></svg>
              <span>Previous</span>
            </button>

            <span class="px-2 text-slate-500">
              Page {{ employeesPage ? page + 1 : 0 }} of {{ employeesPage?.totalPages || 0 }}
            </span>

            <button
              (click)="onNextPage()"
              [disabled]="employeesPage?.last"
              class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <svg lucideChevronRight class="w-3.5 h-3.5"></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Salary Revision Modal -->
      <app-salary-revision-modal
        *ngIf="selectedEmployee"
        [employeeId]="selectedEmployee.id"
        [employeeName]="selectedEmployee.firstName + ' ' + selectedEmployee.lastName"
        [employeeCode]="selectedEmployee.employeeCode"
        [currentBase]="revisionBase"
        [currentBonus]="revisionBonus"
        [currency]="revisionCurrency"
        [isOpen]="isRevisionModalOpen"
        (closeModal)="isRevisionModalOpen = false"
        (revisionSuccess)="onRevisionSuccess()"
      ></app-salary-revision-modal>
    </div>
  `
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  searchTerm = '';
  selectedCountry = '';
  selectedDept = '';
  selectedStatus = '';
  page = 0;
  pageSize = 20;

  loading = true;
  employeesPage: PageResponse<EmployeeSummary> | null = null;

  // Search debounce
  private searchSubject = new Subject<string>();

  // Revision Modal State
  selectedEmployee: EmployeeSummary | null = null;
  revisionBase = 70000;
  revisionBonus = 5000;
  revisionCurrency = 'USD';
  isRevisionModalOpen = false;

  countries = ['India', 'USA', 'Germany', 'United Kingdom', 'United Arab Emirates'];
  departments = [
    'Engineering',
    'Product',
    'Sales',
    'Marketing',
    'Customer Success',
    'Operations',
    'Finance',
    'Human Resources',
    'Legal',
  ];

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm = term;
      this.page = 0;
      this.fetchEmployees();
    });

    this.fetchEmployees();
  }

  get minElements(): number {
    if (!this.employeesPage) return 0;
    return Math.min((this.page + 1) * this.pageSize, this.employeesPage.totalElements);
  }

  onSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  onFilterChange(): void {
    this.page = 0;
    this.fetchEmployees();
  }

  onPreviousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchEmployees();
    }
  }

  onNextPage(): void {
    if (this.employeesPage && !this.employeesPage.last) {
      this.page++;
      this.fetchEmployees();
    }
  }

  fetchEmployees(): void {
    this.loading = true;
    this.employeeService.list({
      search: this.searchTerm || undefined,
      country: this.selectedCountry || undefined,
      department: this.selectedDept || undefined,
      status: this.selectedStatus || undefined,
      page: this.page,
      size: this.pageSize
    }).subscribe({
      next: (res: PageResponse<EmployeeSummary>) => {
        this.employeesPage = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openRevision(emp: EmployeeSummary): void {
    this.employeeService.getById(emp.id).subscribe({
      next: (detail) => {
        this.selectedEmployee = emp;
        this.revisionBase = Number(detail.currentCompensation?.baseSalary ?? detail.currentBaseSalary ?? 70000);
        this.revisionBonus = Number(detail.currentCompensation?.bonus ?? detail.currentBonus ?? 5000);
        this.revisionCurrency = detail.currentCompensation?.currency || detail.currency || (emp.country === 'India' ? 'INR' : 'USD');
        this.isRevisionModalOpen = true;
      },
      error: (err: any) => alert('Error loading compensation details: ' + err.message)
    });
  }

  onRevisionSuccess(): void {
    this.fetchEmployees();
  }

  onExportCsv(): void {
    this.employeeService.downloadCsv({
      search: this.searchTerm || undefined,
      country: this.selectedCountry || undefined,
      department: this.selectedDept || undefined,
      status: this.selectedStatus || undefined
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_filtered_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => alert('Error exporting CSV: ' + err.message)
    });
  }
}
