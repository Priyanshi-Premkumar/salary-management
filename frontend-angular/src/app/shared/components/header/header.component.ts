import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideShieldCheck, LucideDatabase, LucideGlobe2 } from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideShieldCheck, LucideDatabase, LucideGlobe2],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <!-- Left side info -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <svg lucideGlobe2 class="w-3.5 h-3.5 text-indigo-600"></svg>
          <span>Multi-Region Organization (5 Countries)</span>
        </div>

        <div class="hidden md:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium">10,000 Employees Synced</span>
        </div>
      </div>

      <!-- Right side controls -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2 text-xs text-slate-500">
          <svg lucideDatabase class="w-3.5 h-3.5 text-slate-400"></svg>
          <span class="hidden sm:inline">PostgreSQL 16 (Temporal btree_gist)</span>
        </div>

        <div class="h-4 w-px bg-slate-200"></div>

        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md">
            <svg lucideShieldCheck class="w-3.5 h-3.5"></svg>
            <span>{{ roleBadge }}</span>
          </span>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  get roleBadge(): string {
    const role = this.currentUser()?.role;
    return role ? role.replace('ROLE_', '') : 'GUEST';
  }
}
