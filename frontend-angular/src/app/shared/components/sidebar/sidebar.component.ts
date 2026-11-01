import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  LucideLayoutDashboard, 
  LucideUsers, 
  LucideBarChart3, 
  LucideHistory, 
  LucideLogOut, 
  LucideBuilding2, 
  LucideShieldCheck 
} from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive,
    LucideLayoutDashboard, 
    LucideUsers, 
    LucideBarChart3, 
    LucideHistory, 
    LucideLogOut, 
    LucideBuilding2, 
    LucideShieldCheck
  ],
  template: `
    <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-30">
      <!-- Brand Header -->
      <div class="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div class="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <svg lucideBuilding2 class="w-5 h-5"></svg>
        </div>
        <div>
          <h1 class="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            ACME <span class="text-indigo-400 font-medium text-xs px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60">OS</span>
          </h1>
          <p class="text-xs text-slate-400">Compensation Platform</p>
        </div>
      </div>

      <!-- Nav Menu -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Platform Menu
        </div>

        <a
          routerLink="/"
          [routerLinkActiveOptions]="{ exact: true }"
          routerLinkActive="bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
          [class]="'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:bg-slate-800/80 hover:text-white'"
        >
          <svg lucideLayoutDashboard class="w-4 h-4 flex-shrink-0"></svg>
          <span>Overview</span>
        </a>

        <a
          routerLink="/employees"
          routerLinkActive="bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
          [class]="'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:bg-slate-800/80 hover:text-white'"
        >
          <svg lucideUsers class="w-4 h-4 flex-shrink-0"></svg>
          <span>Employees</span>
        </a>

        <a
          routerLink="/analytics"
          routerLinkActive="bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
          [class]="'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:bg-slate-800/80 hover:text-white'"
        >
          <svg lucideBarChart3 class="w-4 h-4 flex-shrink-0"></svg>
          <span>Compensation Analytics</span>
        </a>

        <a
          routerLink="/audit"
          routerLinkActive="bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
          [class]="'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:bg-slate-800/80 hover:text-white'"
        >
          <svg lucideHistory class="w-4 h-4 flex-shrink-0"></svg>
          <span>Audit Trail</span>
        </a>
      </nav>

      <!-- System Status / User Card -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/50">
        <div class="flex items-center space-x-3 mb-3">
          <div class="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold text-sm">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-200 truncate">{{ currentUser()?.email }}</p>
            <p class="text-[11px] text-indigo-400 flex items-center gap-1">
              <svg lucideShieldCheck class="w-3 h-3 inline"></svg>
              <span>{{ roleLabel }}</span>
            </p>
          </div>
        </div>

        <button
          (click)="onLogout()"
          class="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-md border border-slate-800 hover:border-rose-900/50 transition-colors cursor-pointer"
        >
          <svg lucideLogOut class="w-3.5 h-3.5"></svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  get userInitial(): string {
    const email = this.currentUser()?.email;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  get roleLabel(): string {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'ROLE_ADMIN':
        return 'System Administrator';
      case 'ROLE_HR_MANAGER':
        return 'HR Manager';
      case 'ROLE_EXECUTIVE':
        return 'Executive Director';
      default:
        return 'User';
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
