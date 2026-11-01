export interface CompensationSummary {
  id?: number;
  employeeId?: number;
  baseSalary: number;
  bonus: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  totalCompensation?: number;
  status?: 'CURRENT' | 'HISTORICAL' | 'FUTURE';
  active?: boolean;
  future?: boolean;
  historical?: boolean;
  deltaFromPrevious?: number | null;
  percentageChange?: number | null;
}

export interface ReviseCompensationRequest {
  newBaseSalary: number;
  newBonus?: number;
  currency: string;
  effectiveFrom: string;
  reason: string;
}

export interface CompensationHistoryItem {
  id: number;
  employeeId: number;
  baseSalary: number;
  bonus: number;
  totalCompensation: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status?: 'CURRENT' | 'HISTORICAL' | 'FUTURE';
  active?: boolean;
  future?: boolean;
  historical?: boolean;
  deltaFromPrevious?: number | null;
  percentageChange?: number | null;
}

export type CompensationRecord = CompensationHistoryItem;
