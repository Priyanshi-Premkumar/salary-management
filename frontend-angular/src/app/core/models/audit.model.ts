export interface SalaryAuditLog {
  id: number;
  employeeId: number;
  employeeCode?: string;
  employeeName?: string;
  previousBaseSalary: number;
  newBaseSalary: number;
  previousBonus: number;
  newBonus: number;
  salaryDelta?: number;
  percentageChange?: number;
  currency: string;
  effectiveDate: string;
  changeReason: string;
  changedByEmail: string;
  changedByUserId?: number;
  changedAt: string;
}

export type AuditLogResponse = SalaryAuditLog;

export interface AuditLogSearchParams {
  employeeId?: number;
  page?: number;
  size?: number;
}
