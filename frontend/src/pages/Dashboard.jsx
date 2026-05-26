import React, { useState, useEffect } from 'react';
import { recordsService } from '../services/api';
import { 
  BarChart3, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Filter, 
  RotateCcw, 
  Search,
  SlidersHorizontal
} from 'lucide-react';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    locked: 0,
    suspicious: 0,
    failed: 0,
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (scopeFilter) filters.scope = scopeFilter;
      if (sourceFilter) filters.source_type = sourceFilter;
      if (searchQuery) filters.search = searchQuery;

      const data = await recordsService.getRecords(filters);
      setRecords(data);

      // Compute general summary metrics based on ALL records for the company
      // (For accuracy, we'll fetch all unfiltered once or compute based on current list. Let's fetch all unfiltered for proper metrics, or just calculate on full database fetch)
      const allData = await recordsService.getRecords();
      const summary = allData.reduce((acc, curr) => {
        acc.total += 1;
        if (curr.status === 'PENDING') acc.pending += 1;
        else if (curr.status === 'APPROVED') acc.approved += 1;
        else if (curr.status === 'LOCKED') acc.locked += 1;
        else if (curr.status === 'SUSPICIOUS') acc.suspicious += 1;
        else if (curr.status === 'FAILED') acc.failed += 1;
        return acc;
      }, { total: 0, pending: 0, approved: 0, locked: 0, suspicious: 0, failed: 0 });

      setMetrics(summary);
    } catch (err) {
      console.error(err);
      setError('Failed to load ESG records. Please check API status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter, scopeFilter, sourceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const resetFilters = () => {
    setStatusFilter('');
    setScopeFilter('');
    setSourceFilter('');
    setSearchQuery('');
    // Clear field and refetch
    setTimeout(() => fetchRecords(), 50);
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">Pending</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Approved</span>;
      case 'LOCKED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">Locked</span>;
      case 'SUSPICIOUS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">Suspicious</span>;
      case 'FAILED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">Failed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-300">{status}</span>;
    }
  };

  // Helper for scope badge styling
  const getScopeBadge = (scope) => {
    switch (scope) {
      case 'Scope 1':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-500/10 border border-orange-500/20 text-orange-300">Scope 1 (Direct)</span>;
      case 'Scope 2':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Scope 2 (Indirect)</span>;
      case 'Scope 3':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Scope 3 (Travel/Other)</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-500/10 text-slate-300">{scope}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans m-0">ESG Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Review organizational ESG performance, imported data metrics, and auditing workflow status.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 relative overflow-hidden flex items-center gap-4 border border-slate-700/40">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">Pending Review</p>
            <h3 className="text-2xl font-bold text-white mt-1 m-0">{metrics.pending}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden flex items-center gap-4 border border-slate-700/40">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">Suspicious Rows</p>
            <h3 className="text-2xl font-bold text-white mt-1 m-0">{metrics.suspicious}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden flex items-center gap-4 border border-slate-700/40">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">Approved & Locked</p>
            <h3 className="text-2xl font-bold text-white mt-1 m-0">{metrics.approved + metrics.locked}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden flex items-center gap-4 border border-slate-700/40">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">Total Ingested</p>
            <h3 className="text-2xl font-bold text-white mt-1 m-0">{metrics.total}</h3>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="glass-panel p-5 border border-slate-700/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filter Ingested Records</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
            <input
              type="text"
              className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-2 pl-9 pr-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="Search category or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-semibold">Status</label>
            <select
              className="bg-slate-900/50 border border-slate-700/60 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="APPROVED">Approved</option>
              <option value="LOCKED">Locked</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Scope Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-semibold">Scope</label>
            <select
              className="bg-slate-900/50 border border-slate-700/60 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
            >
              <option value="">All Scopes</option>
              <option value="Scope 1">Scope 1 (Direct)</option>
              <option value="Scope 2">Scope 2 (Electricity)</option>
              <option value="Scope 3">Scope 3 (Travel / Procurement)</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-semibold">Data Source</label>
            <select
              className="bg-slate-900/50 border border-slate-700/60 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="SAP">SAP ERP (CSV)</option>
              <option value="UTILITY">Utility Portal (CSV)</option>
              <option value="TRAVEL">Corporate Travel (JSON)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 border border-slate-700/60 transition-all text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="glass-panel border border-slate-700/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="font-semibold text-sm text-white">ESG Records Registry</div>
          <div className="text-xs text-slate-400 font-medium">Showing {records.length} records</div>
        </div>

        {error && (
          <div className="p-6 text-center text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading ESG records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No records found. Adjust your filters or upload some data sources.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/30 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-4">Category / Item</th>
                  <th className="py-4 px-4">Source Type</th>
                  <th className="py-4 px-4">Scope</th>
                  <th className="py-4 px-4 text-right">Quantity</th>
                  <th className="py-4 px-4">Unit</th>
                  <th className="py-4 px-4">Activity Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-4 px-6 text-slate-500 font-mono font-bold">#{record.id}</td>
                    <td className="py-4 px-4 font-medium text-white max-w-xs truncate">
                      <div>{record.category}</div>
                      {record.notes && (
                        <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                          {record.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-400">{record.source?.source_type || 'Unknown'}</td>
                    <td className="py-4 px-4">{getScopeBadge(record.scope)}</td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      {record.quantity !== null ? parseFloat(record.quantity).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-medium">{record.normalized_unit || '-'}</td>
                    <td className="py-4 px-4 font-medium">{record.activity_date || 'N/A'}</td>
                    <td className="py-4 px-6">{getStatusBadge(record.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
