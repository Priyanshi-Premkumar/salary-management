import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideX, LucideTrendingUp, LucideAlertTriangle, LucideCheckCircle2 } from '@lucide/angular';
import { CompensationService } from '../../../core/services/compensation.service';
import { CurrencyFormatterPipe } from '../../pipes/currency-formatter.pipe';

@Component({
  selector: 'app-salary-revision-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CurrencyFormatterPipe,
    LucideX, 
    LucideTrendingUp, 
    LucideAlertTriangle, 
    LucideCheckCircle2
  ],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <!-- Header -->
        <div class="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base flex items-center gap-2">
              <svg lucideTrendingUp class="w-5 h-5 text-indigo-400"></svg>
              <span>Revise Salary & Compensation</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ employeeName }} &bull; <span class="font-mono text-indigo-300">{{ employeeCode }}</span>
            </p>
          </div>
          <button
            type="button"
            (click)="onClose()"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg lucideX class="w-5 h-5"></svg>
          </button>
        </div>

        <!-- Content -->
        <form (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <div *ngIf="errorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <svg lucideAlertTriangle class="w-4 h-4 flex-shrink-0"></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Current vs Proposed Live Delta Banner -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-medium">Current Base Salary:</span>
              <span class="font-semibold text-slate-700">{{ currentBase | currencyFormat:currency:0 }}</span>
            </div>

            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-medium">Proposed Base Salary:</span>
              <span class="font-bold text-indigo-700">{{ newBaseSalary | currencyFormat:currency:0 }}</span>
            </div>

            <div class="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-700">Salary Adjustment:</span>
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                [ngClass]="baseDelta >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
              >
                {{ baseDelta >= 0 ? '+' : '' }}{{ baseDelta | currencyFormat:currency:0 }} 
                ({{ baseDelta >= 0 ? '+' : '' }}{{ baseDeltaPct | number:'1.1-1' }}%)
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                New Base Salary ({{ currency }}) *
              </label>
              <input
                type="number"
                min="1"
                step="500"
                required
                name="newBaseSalary"
                [(ngModel)]="newBaseSalary"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                New Annual Bonus ({{ currency }})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                name="newBonus"
                [(ngModel)]="newBonus"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Effective Date *
            </label>
            <input
              type="date"
              required
              name="effectiveDate"
              [(ngModel)]="effectiveDate"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p class="text-[11px] text-slate-400 mt-1">
              PostgreSQL btree_gist ensures no overlapping dates will be committed.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Revision Reason *
            </label>
            <select
              name="changeReason"
              [(ngModel)]="changeReason"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Annual merit increase">Annual merit increase</option>
              <option value="Promotion to Senior tier">Promotion to Senior tier</option>
              <option value="Market competitive adjustment">Market competitive adjustment</option>
              <option value="Performance bonus & raise">Performance bonus & raise</option>
              <option value="Departmental compensation alignment">Departmental compensation alignment</option>
              <option value="Role scope expansion">Role scope expansion</option>
            </select>
          </div>

          <!-- Footer Action -->
          <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="loading"
              class="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="loading"
              class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span *ngIf="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <ng-container *ngIf="!loading">
                <svg lucideCheckCircle2 class="w-4 h-4"></svg>
                <span>Commit Revision</span>
              </ng-container>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SalaryRevisionModalComponent {
  @Input() employeeId!: number;
  @Input() employeeName: string = '';
  @Input() employeeCode: string = '';
  @Input() currentBase: number = 0;
  @Input() currentBonus: number = 0;
  @Input() currency: string = 'USD';
  @Input() isOpen: boolean = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() revisionSuccess = new EventEmitter<void>();

  private readonly compensationService = inject(CompensationService);

  newBaseSalary: number = 0;
  newBonus: number = 0;
  effectiveDate: string = '';
  changeReason: string = 'Annual merit increase';
  loading: boolean = false;
  errorMessage: string | null = null;

  ngOnChanges(): void {
    if (this.isOpen) {
      this.newBaseSalary = Math.round(this.currentBase * 1.1) || 75000;
      this.newBonus = this.currentBonus || 5000;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.effectiveDate = tomorrow.toISOString().split('T')[0];
      this.errorMessage = null;
    }
  }

  get baseDelta(): number {
    return this.newBaseSalary - this.currentBase;
  }

  get baseDeltaPct(): number {
    return this.currentBase > 0 ? (this.baseDelta / this.currentBase) * 100 : 0;
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.newBaseSalary <= 0) {
      this.errorMessage = 'Base salary must be greater than zero.';
      return;
    }

    if (!this.changeReason.trim()) {
      this.errorMessage = 'A valid change reason is required for auditing.';
      return;
    }

    this.loading = true;
    this.compensationService.reviseCompensation(this.employeeId, {
      newBaseSalary: this.newBaseSalary,
      newBonus: this.newBonus,
      currency: this.currency,
      changeReason: this.changeReason,
      effectiveDate: this.effectiveDate
    }).subscribe({
      next: () => {
        this.loading = false;
        this.revisionSuccess.emit();
        this.onClose();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.message || 'Failed to revise compensation';
      }
    });
  }
}
