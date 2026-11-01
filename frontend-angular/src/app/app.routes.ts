import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeeListComponent } from './features/employees/employee-list.component';
import { EmployeeDetailComponent } from './features/employees/employee-detail.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { AuditLogsComponent } from './features/audit/audit-logs.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        pathMatch: 'full'
      },
      {
        path: 'employees',
        component: EmployeeListComponent
      },
      {
        path: 'employees/:id',
        component: EmployeeDetailComponent
      },
      {
        path: 'analytics',
        component: AnalyticsComponent
      },
      {
        path: 'audit',
        component: AuditLogsComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
