import { CompensationSummary } from './compensation.model';

export type EmploymentStatus = 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'ON_LEAVE';

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

export interface EmployeeDetail extends EmployeeSummary {
  currentCompensation?: CompensationSummary | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface EmployeeSearchParams {
  search?: string;
  country?: string;
  department?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
