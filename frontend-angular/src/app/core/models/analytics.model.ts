export interface CurrencySummary {
  employeeCount: number;
  totalBasePayroll: number;
  totalBonusPayroll: number;
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
  medianBaseSalary: number;
  avgBaseSalary: number;
  minBaseSalary: number;
  maxBaseSalary: number;
  avgTotalCompensation: number;
}

export interface CountrySalaryStats {
  country: string;
  currency: string;
  employeeCount: number;
  totalPayroll: number;
  avgBaseSalary: number;
  medianBaseSalary: number;
}

export interface SalaryBandBucket {
  label: string;
  minSalary: number;
  maxSalary: number;
  count: number;
}

export interface SalaryBandResponse {
  currency: string;
  totalEmployees: number;
  buckets: SalaryBandBucket[];
}

export interface ThresholdResponse {
  currency: string;
  threshold: number;
  countAboveThreshold: number;
  totalInCurrency: number;
  percentageAboveThreshold: number;
}
