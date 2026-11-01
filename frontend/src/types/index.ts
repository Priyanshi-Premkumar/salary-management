export type EmploymentStatus = 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'ON_LEAVE';

export interface User {
  id: number;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_HR_MANAGER' | 'ROLE_EXECUTIVE';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface EmployeeSummary {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  country: string;
  department: string;
  designation: string;
  employmentStatus: EmploymentStatus;
  joiningDate: string;
  currentBaseSalary?: number | null;
  currentBonus?: number | null;
  currency?: string | null;
  compensationEffectiveFrom?: string | null;
  currentCompensation?: CompensationSummary | null;
}

export interface CompensationSummary {
  id?: number;
  baseSalary: number;
  bonus: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  totalCompensation?: number;
}

export interface EmployeeDetail extends EmployeeSummary {
  currentCompensation?: CompensationSummary | null;
}

export interface CreateEmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  department: string;
  designation: string;
  joiningDate: string;
  baseSalary: number;
  bonus?: number;
  currency: string;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  department: string;
  designation: string;
  employmentStatus: EmploymentStatus;
}

export interface SalaryRevisionRequest {
  newBaseSalary: number;
  newBonus?: number;
  changeReason: string;
  effectiveDate: string;
}

export interface SalaryAuditLog {
  id: number;
  employeeId: number;
  employeeCode?: string;
  employeeName?: string;
  changedBy: number | null;
  changedByEmail: string;
  previousBaseSalary: number;
  newBaseSalary: number;
  previousBonus: number;
  newBonus: number;
  currency: string;
  changeReason: string;
  effectiveDate: string;
  changedAt: string;
}

export interface CurrencySummary {
  currency: string;
  employeeCount: number;
  totalBasePayroll: number;
  averageBaseSalary: number;
  medianBaseSalary: number;
}

export interface OverviewMetrics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalRevisionsThisYear: number;
  currencySummaries: Record<string, CurrencySummary>;
}

export interface DepartmentSalaryStats {
  department: string;
  currency: string;
  employeeCount: number;
  avgBaseSalary: number;
  medianBaseSalary: number;
  minBaseSalary: number;
  maxBaseSalary: number;
  avgBonus: number;
  avgTotalCompensation: number;
}

export interface CountrySalaryStats {
  country: string;
  currency: string;
  employeeCount: number;
  avgBaseSalary: number;
  medianBaseSalary: number;
  totalPayroll: number;
}

export interface SalaryBandBucket {
  label: string;
  min: number | null;
  max: number | null;
  count: number;
}

export interface SalaryBandResponse {
  currency: string;
  buckets: SalaryBandBucket[];
}

export interface ThresholdResponse {
  threshold: number;
  currency: string;
  countAboveThreshold: number;
  percentageAboveThreshold: number;
  totalInCurrency: number;
}
