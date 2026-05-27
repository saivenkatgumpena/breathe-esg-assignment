import React, { useState, useEffect } from 'react';
import { recordsService } from '../services/api';
import { Clock, AlertTriangle, CheckCircle, Database, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

const S = {
  pageHeader: { marginBottom: '28px' },
  h1: { fontSize: '20px', fontWeight: 700, color: '#f0f4ff', margin: '0 0 4px', letterSpacing: '-0.3px' },
  sub: { fontSize: '13px', color: '#7a8599', margin: 0 },

  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  metricCard: { background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' },
  metricIcon: (bg, color) => ({ width: '38px', height: '38px', borderRadius: '9px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }),
  metricLabel: { fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' },
  metricValue: { fontSize: '24px', fontWeight: 700, color: '#f0f4ff', margin: 0, letterSpacing: '-0.5px' },

  filterBar: { background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  filterLabel: { fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' },

  tableWrap: { background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' },

  emptyState: { padding: '60px 24px', textAlign: 'center', color: '#4a5568', fontSize: '13px' },
  loadingState: { padding: '60px 24px', textAlign: 'center', color: '#7a8599', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },

  select: {
    background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px',
    color: '#f0f4ff', fontSize: '13px', padding: '7px 10px', outline: 'none',
    cursor: 'pointer', minWidth: '140px',
  },
};

const MetricCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div style={S.metricCard}>
    <div style={S.metricIcon(iconBg, iconColor)}><Icon size={18} /></div>
    <div>
      <p style={S.metricLabel}>{label}</p>
      <p style={S.metricValue}>{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:    ['badge badge-pending',    'Pending'],
    APPROVED:   ['badge badge-approved',   'Approved'],
    LOCKED:     ['badge badge-locked',     'Locked'],
    SUSPICIOUS: ['badge badge-suspicious', 'Suspicious'],
    FAILED:     ['badge badge-failed',     'Failed'],
  };
  const [cls, label] = map[status] || ['badge', status];
  return <span className={cls}>{label}</span>;
};

const ScopeBadge = ({ scope }) => {
  const map = {
    'Scope 1': ['badge badge-scope1', 'Scope 1'],
    'Scope 2': ['badge badge-scope2', 'Scope 2'],
    'Scope 3': ['badge badge-scope3', 'Scope 3'],
  };
  const [cls, label] = map[scope] || ['badge', scope];
  return <span className={cls}>{label}</span>;
};

const Dashboard = () => {
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter]   = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, approved: 0, locked: 0, suspicious: 0, failed: 0 });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status      = statusFilter;
      if (scopeFilter)  filters.scope       = scopeFilter;
      if (sourceFilter) filters.source_type = sourceFilter;
      if (searchQuery)  filters.search      = searchQuery;
      const data    = await recordsService.getRecords(filters);
      const allData = await recordsService.getRecords();
      setRecords(data);
      const summary = allData.reduce((acc, r) => {
        acc.total++;
        if (r.status === 'PENDING')    acc.pending++;
        if (r.status === 'APPROVED')   acc.approved++;
        if (r.status === 'LOCKED')     acc.locked++;
        if (r.status === 'SUSPICIOUS') acc.suspicious++;
        if (r.status === 'FAILED')     acc.failed++;
        return acc;
      }, { total: 0, pending: 0, approved: 0, locked: 0, suspicious: 0, failed: 0 });
      setMetrics(summary);
    } catch {
      setError('Failed to load ESG records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [statusFilter, scopeFilter, sourceFilter]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchRecords(); };
  const resetFilters = () => {
    setStatusFilter(''); setScopeFilter(''); setSourceFilter(''); setSearchQuery('');
    setTimeout(() => fetchRecords(), 50);
  };

  return (
    <div>
      <div style={S.pageHeader}>
        <h1 style={S.h1}>ESG Dashboard</h1>
        <p style={S.sub}>Monitor imported data, workflow status, and organizational ESG metrics.</p>
      </div>

      {/* Metric Cards */}
      <div style={S.metricsGrid}>
        <MetricCard icon={Clock}         iconBg="rgba(59,130,246,0.1)"  iconColor="#60a5fa" label="Pending Review"    value={metrics.pending} />
        <MetricCard icon={AlertTriangle} iconBg="rgba(251,191,36,0.1)"  iconColor="#fbbf24" label="Suspicious"        value={metrics.suspicious} />
        <MetricCard icon={CheckCircle}   iconBg="rgba(52,211,153,0.1)"  iconColor="#34d399" label="Approved & Locked" value={metrics.approved + metrics.locked} />
        <MetricCard icon={Database}      iconBg="rgba(129,140,248,0.1)" iconColor="#818cf8" label="Total Records"     value={metrics.total} />
      </div>

      {/* Filter Bar */}
      <div style={S.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <SlidersHorizontal size={14} color="#7a8599" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#7a8599' }}>Filters</span>

            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.07)', margin: '0 4px' }} />

            <div>
              <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPICIOUS">Suspicious</option>
                <option value="APPROVED">Approved</option>
                <option value="LOCKED">Locked</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div>
              <select style={S.select} value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
                <option value="">All Scopes</option>
                <option value="Scope 1">Scope 1 (Direct)</option>
                <option value="Scope 2">Scope 2 (Electricity)</option>
                <option value="Scope 3">Scope 3 (Travel/Procurement)</option>
              </select>
            </div>

            <div>
              <select style={S.select} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                <option value="">All Sources</option>
                <option value="SAP">SAP ERP</option>
                <option value="UTILITY">Utility Portal</option>
                <option value="TRAVEL">Corporate Travel</option>
              </select>
            </div>

            <button className="btn-ghost" onClick={resetFilters} style={{ padding: '7px 12px', fontSize: '12px' }}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#4a5568" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '30px', width: '220px', fontSize: '13px', padding: '7px 10px 7px 30px' }}
                placeholder="Search category or notes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>Search</button>
          </form>
        </div>
      </div>

      {/* Records Table */}
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff' }}>ESG Records</span>
          <span style={{ fontSize: '12px', color: '#4a5568' }}>{records.length} record{records.length !== 1 ? 's' : ''}</span>
        </div>

        {error && <div style={{ padding: '24px', textAlign: 'center', color: '#f87171', fontSize: '13px' }}>{error}</div>}

        {loading ? (
          <div style={S.loadingState}>
            <span className="spinner" />
            Loading records…
          </div>
        ) : records.length === 0 ? (
          <div style={S.emptyState}>No records found. Adjust filters or upload data.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Scope</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th>Unit</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4a5568' }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#f0f4ff', fontSize: '13px' }}>{r.category}</div>
                      {r.notes && <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>{r.notes}</div>}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 500 }}>{r.source?.source_type || '—'}</td>
                    <td><ScopeBadge scope={r.scope} /></td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#f0f4ff', fontSize: '13px' }}>
                      {r.quantity !== null ? parseFloat(r.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'}
                    </td>
                    <td style={{ fontSize: '12px' }}>{r.normalized_unit || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{r.activity_date || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
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
