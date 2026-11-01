import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  LucideBuilding2, 
  LucideLock, 
  LucideMail, 
  LucideArrowRight, 
  LucideAlertCircle, 
  LucideSparkles 
} from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideBuilding2, 
    LucideLock, 
    LucideMail, 
    LucideArrowRight, 
    LucideAlertCircle, 
    LucideSparkles
  ],
  template: `
    <div class="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background glow effects -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="flex justify-center mb-4">
          <div class="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 border border-indigo-400/30">
            <svg lucideBuilding2 class="w-8 h-8"></svg>
          </div>
        </div>
        <h2 class="text-center text-2xl font-bold tracking-tight text-white">
          ACME CompensationOS
        </h2>
        <p class="mt-1 text-center text-sm text-slate-400">
          Global Enterprise Compensation & Salary Management
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div class="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-10">
          <form class="space-y-5" (ngSubmit)="onSubmit()">
            <div *ngIf="errorMessage" class="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <svg lucideAlertCircle class="w-4 h-4 flex-shrink-0"></svg>
              <span>{{ errorMessage }}</span>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg lucideMail class="w-4 h-4"></svg>
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  [(ngModel)]="email"
                  class="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="name@acme.com"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg lucideLock class="w-4 h-4"></svg>
                </div>
                <input
                  type="password"
                  required
                  name="password"
                  [(ngModel)]="password"
                  class="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span *ngIf="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              <ng-container *ngIf="!loading">
                <span>Sign In to Dashboard</span>
                <svg lucideArrowRight class="w-4 h-4"></svg>
              </ng-container>
            </button>
          </form>

          <!-- Quick Demo Credentials -->
          <div class="mt-6 pt-6 border-t border-slate-700/80">
            <p class="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5">
              <svg lucideSparkles class="w-3.5 h-3.5 text-indigo-400"></svg>
              <span>Select Demo Account:</span>
            </p>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="fillDemo('hrmanager@acme.com', 'Manager@123')"
                class="text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-xs group cursor-pointer"
              >
                <div class="font-semibold text-slate-200 group-hover:text-indigo-300">HR Manager</div>
                <div class="text-[11px] text-slate-400">hrmanager&#64;acme.com</div>
              </button>

              <button
                type="button"
                (click)="fillDemo('admin@acme.com', 'Admin@123')"
                class="text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-xs group cursor-pointer"
              >
                <div class="font-semibold text-slate-200 group-hover:text-indigo-300">Administrator</div>
                <div class="text-[11px] text-slate-400">admin&#64;acme.com</div>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center text-xs text-slate-500">
          ACME CompensationOS &bull; Microservice-Ready Architecture &bull; PostgreSQL 16
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = 'hrmanager@acme.com';
  password = 'Manager@123';
  loading = false;
  errorMessage: string | null = null;

  fillDemo(demoEmail: string, demoPass: string): void {
    this.email = demoEmail;
    this.password = demoPass;
    this.errorMessage = null;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.message || 'Invalid email or password';
      }
    });
  }
}
