import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Eye 
} from 'lucide-react';
import { api } from '../api/client';

export const AuditLogs: React.FC = () => {
  const navigate = useNavigate();
  const [employeeIdInput, setEmployeeIdInput] = useState<string>('');
  const [filterEmpId, setFilterEmpId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filterEmpId, page, pageSize],
    queryFn: () =>
      api.audit.list({
        employeeId: filterEmpId,
        page,
        size: pageSize,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = parseInt(employeeIdInput.trim(), 10);
    setFilterEmpId(isNaN(idNum) ? undefined : idNum);
    setPage(0);
  };

  const handleExportCsv = async () => {
    try {
      await api.audit.downloadCsv(filterEmpId);
    } catch (err: any) {
      alert('Error downloading audit CSV: ' + err.message);
    }
  };

  const formatMoney = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Immutable Salary Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete append-only audit log recording every compensation change, authenticated actor, and reason.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Log CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={employeeIdInput}
              onChange={(e) => setEmployeeIdInput(e.target.value)}
              placeholder="Filter by numeric Employee ID..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            Filter
          </button>

          {filterEmpId && (
            <button
              type="button"
              onClick={() => {
                setEmployeeIdInput('');
                setFilterEmpId(undefined);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Audit Timestamp</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Changed By</th>
                <th className="py-3 px-4">Salary Revision</th>
                <th className="py-3 px-4">Bonus Revision</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Change Reason</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading audit logs...</div>
                  </td>
                </tr>
              ) : data?.content && data.content.length > 0 ? (
                data.content.map((log) => {
                  const baseDelta = log.newBaseSalary - log.previousBaseSalary;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.changedAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        #{log.employeeId}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{log.changedByEmail}</span>
                        <div className="text-[10px] text-indigo-500">Backend Verified</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 line-through">
                            {formatMoney(log.previousBaseSalary, log.currency)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-900">
                            {formatMoney(log.newBaseSalary, log.currency)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              baseDelta >= 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {baseDelta >= 0 ? '+' : ''}
                            {formatMoney(baseDelta, log.currency)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {formatMoney(log.previousBonus, log.currency)} &rarr; {formatMoney(log.newBonus, log.currency)}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {log.effectiveDate}
                      </td>

                      <td className="py-3 px-4 text-slate-800 italic max-w-xs truncate" title={log.changeReason}>
                        "{log.changeReason}"
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/employees/${log.employeeId}`)}
                          className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No audit logs matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {data ? page * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {data ? Math.min((page + 1) * pageSize, data.totalElements) : 0}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800">
              {data?.totalElements?.toLocaleString() || 0}
            </span>{' '}
            audit entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
              <span>Previous</span>
            </button>

            <span className="px-2 text-slate-500">
              Page {data ? page + 1 : 0} of {data?.totalPages || 0}
            </span>

            <button
              onClick={() => setPage((p) => (data?.last ? p : p + 1))}
              disabled={data?.last}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
