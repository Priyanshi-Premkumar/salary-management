import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Eye, 
  Users, 
  Globe 
} from 'lucide-react';
import { api } from '../api/client';
import type { EmployeeSummary } from '../types';
import { SalaryRevisionModal } from '../components/compensation/SalaryRevisionModal';

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  // Salary Revision Modal State
  const [revisionEmployee, setRevisionEmployee] = useState<EmployeeSummary | null>(null);
  const [revisionComp, setRevisionComp] = useState<{ base: number; bonus: number; curr: string } | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['employees', debouncedSearch, selectedCountry, selectedDept, selectedStatus, page, pageSize],
    queryFn: () =>
      api.employees.list({
        search: debouncedSearch || undefined,
        country: selectedCountry || undefined,
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
        page,
        size: pageSize,
      }),
  });

  const handleExportCsv = async () => {
    try {
      await api.employees.downloadCsv({
        search: debouncedSearch || undefined,
        country: selectedCountry || undefined,
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
      });
    } catch (err: any) {
      alert('Error exporting CSV: ' + err.message);
    }
  };

  const handleOpenRevision = async (emp: EmployeeSummary) => {
    try {
      const detail = await api.employees.getById(emp.id);
      setRevisionEmployee(emp);
      setRevisionComp({
        base: Number(detail.currentCompensation?.baseSalary ?? detail.currentBaseSalary ?? 70000),
        bonus: Number(detail.currentCompensation?.bonus ?? detail.currentBonus ?? 5000),
        curr: detail.currentCompensation?.currency || detail.currency || (emp.country === 'India' ? 'INR' : 'USD'),
      });
      setIsRevisionModalOpen(true);
    } catch (err: any) {
      alert('Error loading compensation details: ' + err.message);
    }
  };

  const countries = ['India', 'USA', 'Germany', 'United Kingdom', 'United Arab Emirates'];
  const departments = [
    'Engineering',
    'Product',
    'Sales',
    'Marketing',
    'Customer Success',
    'Operations',
    'Finance',
    'Human Resources',
    'Legal',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage 10,000 synthetic employees across international branches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, name, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Country Dropdown */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Countries (5)</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments (9)</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RESIGNED">RESIGNED</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading employees...</div>
                  </td>
                </tr>
              ) : data?.content && data.content.length > 0 ? (
                data.content.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee Code & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeCode} &bull; {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {emp.country}
                      </span>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{emp.department}</div>
                      <div className="text-[11px] text-slate-500">{emp.designation}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          emp.employmentStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {emp.joiningDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded border border-slate-200 hover:border-indigo-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="View Profile & Compensation"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleOpenRevision(emp)}
                          className="px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                          title="Revise Compensation"
                        >
                          <TrendingUp className="w-3 h-3" />
                          <span>Revise</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No employees matching the current filters.
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
            employees {isFetching && <span className="text-indigo-600 ml-1 animate-pulse">(updating...)</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 text-slate-500">
              Page {data ? page + 1 : 0} of {data?.totalPages || 0}
            </span>

            <button
              onClick={() => setPage((p) => (data?.last ? p : p + 1))}
              disabled={data?.last}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Salary Revision Modal */}
      {revisionEmployee && revisionComp && (
        <SalaryRevisionModal
          employeeId={revisionEmployee.id}
          employeeName={`${revisionEmployee.firstName} ${revisionEmployee.lastName}`}
          employeeCode={revisionEmployee.employeeCode}
          currentBase={revisionComp.base}
          currentBonus={revisionComp.bonus}
          currency={revisionComp.curr}
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
          }}
        />
      )}
    </div>
  );
};
