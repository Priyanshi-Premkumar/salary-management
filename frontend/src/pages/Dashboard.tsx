import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  ArrowUpRight, 
  Download, 
  Coins 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { api } from '../api/client';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.analytics.getOverview(),
  });

  const { data: countries, isLoading: loadingCountries } = useQuery({
    queryKey: ['analytics-countries'],
    queryFn: () => api.analytics.getCountries(),
  });

  const { data: deptStats } = useQuery({
    queryKey: ['analytics-departments', 'USD'],
    queryFn: () => api.analytics.getDepartments('USD'),
  });

  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCsv = async () => {
    try {
      await api.employees.downloadCsv({});
    } catch (err: any) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  if (loadingOverview || loadingCountries) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading organizational overview...</p>
        </div>
      </div>
    );
  }

  const countryChartData = countries?.map((c) => ({
    name: c.country,
    value: c.employeeCount,
    currency: c.currency,
    payroll: c.totalPayroll,
  })) || [];

  const deptChartData = deptStats?.map((d) => ({
    name: d.department,
    median: d.medianBaseSalary,
    average: d.avgBaseSalary,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Compensation Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time aggregate analytics across 10,000 employees in 5 countries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/employees')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Directory (10,000)</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.totalEmployees?.toLocaleString() || '10,000'}
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-1">100% deterministic seed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {overview?.activeEmployees?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {overview ? ((overview.activeEmployees / overview.totalEmployees) * 100).toFixed(1) : 95}% retention rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historical Revisions</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.totalRevisionsThisYear?.toLocaleString() || '3,000+'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Temporal effective dating</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive / Resigned</p>
            <p className="text-2xl font-extrabold text-slate-600 mt-1">
              {overview?.inactiveEmployees?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Historical records preserved</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Multi-Currency Regional Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-600" />
            <span>Multi-Currency Compensation by Region</span>
          </h2>
          <span className="text-xs text-slate-500">
            Isolated by currency (no un-converted cross-currency aggregations)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {countries?.map((c) => (
            <div key={c.country} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">{c.country}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {c.currency}
                </span>
              </div>
              
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Headcount:</span>
                  <span className="font-semibold text-slate-800">{c.employeeCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Median Base:</span>
                  <span className="font-semibold text-indigo-600">{formatCurrency(c.medianBaseSalary, c.currency)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Average Base:</span>
                  <span className="font-medium text-slate-700">{formatCurrency(c.avgBaseSalary, c.currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Median vs Average (USD) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Department Salary Distribution (USD)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing exact PostgreSQL median (50th percentile) vs mathematical mean
              </p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore All Currencies</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip 
                  formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="median" name="PostgreSQL Median" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" name="Average Salary" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Headcount by Country */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Global Headcount by Country
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              10,000 employees distributed across 5 entities
            </p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {countryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val.toLocaleString()} employees`, 'Headcount']}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            {countryChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-semibold text-slate-800 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
