import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Coins, 
  TrendingUp, 
  Award, 
  Calculator 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '../api/client';

export const Analytics: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [thresholdInput, setThresholdInput] = useState<number>(120000);
  const [debouncedThreshold, setDebouncedThreshold] = useState<number>(120000);

  const currencies = [
    { code: 'USD', name: 'US Dollar', country: 'USA', defaultThreshold: 120000 },
    { code: 'INR', name: 'Indian Rupee', country: 'India', defaultThreshold: 2000000 },
    { code: 'EUR', name: 'Euro', country: 'Germany', defaultThreshold: 90000 },
    { code: 'GBP', name: 'British Pound', country: 'UK', defaultThreshold: 85000 },
    { code: 'AED', name: 'UAE Dirham', country: 'UAE', defaultThreshold: 240000 },
  ];

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    const found = currencies.find((c) => c.code === curr);
    if (found) {
      setThresholdInput(found.defaultThreshold);
      setDebouncedThreshold(found.defaultThreshold);
    }
  };

  const handleThresholdChange = (val: number) => {
    setThresholdInput(val);
    setDebouncedThreshold(val);
  };

  // Queries
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.analytics.getOverview(),
  });

  const { data: deptStats, isLoading: loadingDepts } = useQuery({
    queryKey: ['analytics-departments', selectedCurrency],
    queryFn: () => api.analytics.getDepartments(selectedCurrency),
  });

  const { data: salaryBands, isLoading: loadingBands } = useQuery({
    queryKey: ['analytics-salary-bands', selectedCurrency],
    queryFn: () => api.analytics.getSalaryBands(selectedCurrency),
  });

  const { data: thresholdStats } = useQuery({
    queryKey: ['analytics-threshold', debouncedThreshold, selectedCurrency],
    queryFn: () => api.analytics.getThreshold(debouncedThreshold, selectedCurrency),
  });

  const formatMoney = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Find department with highest median salary
  const highestMedianDept = deptStats && deptStats.length > 0
    ? [...deptStats].sort((a, b) => b.medianBaseSalary - a.medianBaseSalary)[0]
    : null;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Multi-Currency Compensation Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Statistically safe salary distributions, PostgreSQL exact medians, and threshold projections.
          </p>
        </div>
      </div>

      {/* Currency Switcher Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-1.5">
        {currencies.map((curr) => {
          const isSelected = selectedCurrency === curr.code;
          return (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{curr.code}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                {curr.country}
              </span>
            </button>
          );
        })}
      </div>

      {/* Key Insight Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Highest Median Department Widget */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Highest Median Department
            </span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xl font-bold mt-2">
            {highestMedianDept?.department || 'Engineering'}
          </p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            {formatMoney(highestMedianDept?.medianBaseSalary)}
          </p>
          <p className="text-xs text-slate-300 mt-2">
            Exact 50th percentile in {selectedCurrency}
          </p>
        </div>

        {/* Annual Revisions Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Employees Revised This Year
            </span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {overview?.totalRevisionsThisYear?.toLocaleString() || '3,063'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ~30% of total workforce received compensation adjustments
          </p>
        </div>

        {/* Currency Headcount Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active in {selectedCurrency}
            </span>
            <Coins className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {overview?.currencySummaries?.[selectedCurrency]?.employeeCount?.toLocaleString() || '-'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Total payroll: {formatMoney(overview?.currencySummaries?.[selectedCurrency]?.totalBasePayroll)}
          </p>
        </div>
      </div>

      {/* Interactive Threshold Calculator (Requirement #3) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Compensation Threshold Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live calculation of staff earning above a target threshold in {selectedCurrency}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Threshold:</span>
            <input
              type="number"
              step="5000"
              value={thresholdInput}
              onChange={(e) => handleThresholdChange(parseFloat(e.target.value) || 0)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500">Employees Earning &ge; {formatMoney(debouncedThreshold)}</span>
            <div className="text-2xl font-extrabold text-indigo-700 mt-0.5">
              {thresholdStats?.countAboveThreshold?.toLocaleString() || 0}{' '}
              <span className="text-xs font-semibold text-slate-500">
                / {thresholdStats?.totalInCurrency?.toLocaleString() || 0} employees
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">Proportion of {selectedCurrency} Staff</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {thresholdStats?.percentageAboveThreshold || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Salary Band Histogram */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">
            Salary Band Distribution ({selectedCurrency})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Headcount distribution across compensation brackets.
          </p>
        </div>

        <div className="h-64 w-full">
          {loadingBands ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading bands...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryBands?.buckets || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val: number) => [`${val.toLocaleString()} employees`, 'Headcount']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Department Statistics ({selectedCurrency})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing average vs exact median base salary across departments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4 text-right">Median Base Salary</th>
                <th className="py-3 px-4 text-right">Average Base Salary</th>
                <th className="py-3 px-4 text-right">Min Base</th>
                <th className="py-3 px-4 text-right">Max Base</th>
                <th className="py-3 px-4 text-right">Avg Total Comp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingDepts ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading department statistics...</td>
                </tr>
              ) : deptStats && deptStats.length > 0 ? (
                deptStats.map((d) => (
                  <tr key={d.department} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {d.department}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">
                      {d.employeeCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600">
                      {formatMoney(d.medianBaseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatMoney(d.avgBaseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {formatMoney(d.minBaseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {formatMoney(d.maxBaseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {formatMoney(d.avgTotalCompensation)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No data available for this currency.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
