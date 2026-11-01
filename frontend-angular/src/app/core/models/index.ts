export * from './auth.model';
export * from './employee.model';
export * from './compensation.model';
export * from './analytics.model';
export * from './audit.model';

import { OverviewMetrics, DepartmentSalaryStats, CountrySalaryStats, SalaryBandResponse, ThresholdResponse } from './analytics.model';
import { CompensationHistoryItem } from './compensation.model';
import { SalaryAuditLog } from './audit.model';

export type OrganizationalOverview = OverviewMetrics;
export type DepartmentCompensationStat = DepartmentSalaryStats;
export type CountryDistribution = CountrySalaryStats;
export type SalaryBandHistogram = SalaryBandResponse;
export type ThresholdAnalysis = ThresholdResponse;
export type AuditLogResponse = SalaryAuditLog;
export type CompensationRecord = CompensationHistoryItem;
