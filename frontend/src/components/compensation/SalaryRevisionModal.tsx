import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../../api/client';

interface SalaryRevisionModalProps {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  currentBase: number;
  currentBonus: number;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalaryRevisionModal: React.FC<SalaryRevisionModalProps> = ({
  employeeId,
  employeeName,
  employeeCode,
  currentBase,
  currentBonus,
  currency,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultEffectiveDate = tomorrow.toISOString().split('T')[0];

  const [effectiveDate, setEffectiveDate] = useState(defaultEffectiveDate);
  const [newBaseSalary, setNewBaseSalary] = useState<number>(Math.round(currentBase * 1.1));
  const [newBonus, setNewBonus] = useState<number>(currentBonus);
  const [changeReason, setChangeReason] = useState('Annual merit increase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseDelta = newBaseSalary - currentBase;
  const baseDeltaPct = currentBase > 0 ? (baseDelta / currentBase) * 100 : 0;

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newBaseSalary <= 0) {
      setError('Base salary must be greater than zero.');
      return;
    }

    if (!changeReason.trim()) {
      setError('A valid change reason is required for auditing.');
      return;
    }

    setLoading(true);
    try {
      await api.compensation.revise(employeeId, {
        newBaseSalary,
        newBonus,
        currency,
        changeReason,
        effectiveDate,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to revise compensation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Revise Salary & Compensation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {employeeName} &bull; <span className="font-mono text-indigo-300">{employeeCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs Proposed Live Delta Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Current Base Salary:</span>
              <span className="font-semibold text-slate-700">{formatMoney(currentBase)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Proposed Base Salary:</span>
              <span className="font-bold text-indigo-700">{formatMoney(newBaseSalary)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700">Salary Adjustment:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  baseDelta >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {baseDelta >= 0 ? '+' : ''}
                {formatMoney(baseDelta)} ({baseDelta >= 0 ? '+' : ''}
                {baseDeltaPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Base Salary ({currency}) *
              </label>
              <input
                type="number"
                min="1"
                step="500"
                required
                value={newBaseSalary}
                onChange={(e) => setNewBaseSalary(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Annual Bonus ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={newBonus}
                onChange={(e) => setNewBonus(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Effective Date *
            </label>
            <input
              type="date"
              required
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              PostgreSQL btree_gist ensures no overlapping dates will be committed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Revision Reason *
            </label>
            <select
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Annual merit increase">Annual merit increase</option>
              <option value="Promotion to Senior tier">Promotion to Senior tier</option>
              <option value="Market competitive adjustment">Market competitive adjustment</option>
              <option value="Performance bonus & raise">Performance bonus & raise</option>
              <option value="Departmental compensation alignment">Departmental compensation alignment</option>
              <option value="Role scope expansion">Role scope expansion</option>
            </select>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Revision</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
