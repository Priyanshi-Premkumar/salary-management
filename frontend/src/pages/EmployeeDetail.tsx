import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  ShieldCheck, 
  TrendingUp, 
  History, 
  CheckCircle 
} from 'lucide-react';
import { api } from '../api/client';
import { SalaryRevisionModal } from '../components/compensation/SalaryRevisionModal';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const empId = parseInt(id || '0', 10);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  const { data: employee, isLoading: loadingEmp } = useQuery({
    queryKey: ['employee', empId],
    queryFn: () => api.employees.getById(empId),
    enabled: empId > 0,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['compensation-history', empId],
    queryFn: () => api.compensation.getHistory(empId),
    enabled: empId > 0,
  });

  const { data: auditLogs, isLoading: loadingAudit } = useQuery({
    queryKey: ['audit-logs-employee', empId],
    queryFn: () => api.audit.list({ employeeId: empId, size: 50 }),
    enabled: empId > 0,
  });

  const formatMoney = (val?: number, curr: string = 'USD') => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loadingEmp || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading employee compensation profile...</p>
        </div>
      </div>
    );
  }

  const activeHistory = history?.find((h: any) => h.status === 'CURRENT') || 
                        history?.find((h: any) => !h.effectiveTo) ||
                        history?.[0];

  const curr = employee.currentCompensation?.currency || 
               employee.currency || 
               activeHistory?.currency || 
               (employee.country === 'India' ? 'INR' : 'USD');

  const baseSalary = Number(
    employee.currentCompensation?.baseSalary ?? 
    employee.currentBaseSalary ?? 
    activeHistory?.baseSalary ?? 
    0
  );

  const bonus = Number(
    employee.currentCompensation?.bonus ?? 
    employee.currentBonus ?? 
    activeHistory?.bonus ?? 
    0
  );

  const totalComp = baseSalary + bonus;

  const effectiveDate = employee.currentCompensation?.effectiveFrom || 
                        employee.compensationEffectiveFrom || 
                        activeHistory?.effectiveFrom || 
                        employee.joiningDate;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start md:items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {employee.employeeCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    employee.employmentStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {employee.employmentStatus}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-600 mt-1">
                {employee.designation} &bull; <span className="text-indigo-600">{employee.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {employee.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {employee.country}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {employee.joiningDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRevisionModalOpen(true)}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Revise Compensation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Active Compensation */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Active Compensation Package
            </span>
            <h2 className="text-xl font-bold mt-0.5">
              Current Effective Salary ({curr})
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Active Record</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white/5 backdrop-blur-xs p-5 rounded-xl border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Base Annual Salary</p>
            <p className="text-2xl font-bold text-white mt-1.5">
              {formatMoney(baseSalary, curr)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Contractual annual base</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-5 rounded-xl border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Annual Performance Bonus</p>
            <p className="text-2xl font-bold text-indigo-300 mt-1.5">
              {formatMoney(bonus, curr)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {baseSalary > 0 ? ((bonus / baseSalary) * 100).toFixed(1) : 0}% of base
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-5 rounded-xl border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Total On-Target Earnings</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1.5">
              {formatMoney(totalComp, curr)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Base + Target Bonus</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Effective from:{' '}
            <strong className="text-slate-200">
              {effectiveDate}
            </strong>{' '}
            to <strong className="text-slate-200">Present (Open-ended)</strong>
          </span>
          <span className="font-mono text-[11px] text-indigo-400">
            Protected by btree_gist exclusion constraint
          </span>
        </div>
      </div>

      {/* Historical Compensation Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Compensation Revision History & Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Full chronological progression of past, active, and future compensation records.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {history?.length || 1} Total Revisions
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading timeline...</div>
        ) : history && history.length > 0 ? (
          <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-8 py-2">
            {history.map((record, index) => {
              const isCurrent = record.effectiveTo === null;
              return (
                <div key={record.id || index} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-400 bg-slate-100'
                    }`}
                  />

                  {/* Card */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-indigo-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-slate-900">
                          {formatMoney(record.baseSalary, record.currency || curr)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          + {formatMoney(record.bonus, record.currency || curr)} bonus
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {isCurrent ? 'Current' : 'Historical'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {record.effectiveFrom} &rarr; {record.effectiveTo || 'Present'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600">
                      Total Compensation:{' '}
                      <strong className="text-slate-800">
                        {formatMoney((record.baseSalary || 0) + (record.bonus || 0), record.currency || curr)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4">No historical revisions recorded.</p>
        )}
      </div>

      {/* Salary Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Immutable Audit Trail for this Employee</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified append-only audit entries recording actor identity and salary deltas.
            </p>
          </div>
        </div>

        {loadingAudit ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : auditLogs?.content && auditLogs.content.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Changed By</th>
                  <th className="py-2.5 px-3">Previous Base &rarr; New Base</th>
                  <th className="py-2.5 px-3">Effective Date</th>
                  <th className="py-2.5 px-3">Change Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.content.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.changedAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {log.changedByEmail}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-400 line-through mr-1.5">
                        {formatMoney(log.previousBaseSalary, log.currency)}
                      </span>
                      &rarr;
                      <span className="font-semibold text-emerald-700 ml-1.5">
                        {formatMoney(log.newBaseSalary, log.currency)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.effectiveDate}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 italic">
                      "{log.changeReason}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">No audit logs recorded for this employee.</p>
        )}
      </div>

      {/* Salary Revision Modal */}
      <SalaryRevisionModal
        employeeId={empId}
        employeeName={`${employee.firstName} ${employee.lastName}`}
        employeeCode={employee.employeeCode}
        currentBase={baseSalary}
        currentBonus={bonus}
        currency={curr}
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['employee', empId] });
          queryClient.invalidateQueries({ queryKey: ['compensation-history', empId] });
          queryClient.invalidateQueries({ queryKey: ['audit-logs-employee', empId] });
        }}
      />
    </div>
  );
};
