import React, { useState, useEffect } from 'react';
import { recordsService, auditService } from '../services/api';
import { Check, X, Lock, Edit2, History, MessageSquare, Save, Leaf, ShieldAlert, Droplet, Trash2, Plus } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:    'badge badge-pending',
    APPROVED:   'badge badge-approved',
    LOCKED:     'badge badge-locked',
    SUSPICIOUS: 'badge badge-suspicious',
    FAILED:     'badge badge-failed',
  };
  const labels = { PENDING: 'Pending', APPROVED: 'Approved', LOCKED: 'Locked', SUSPICIOUS: 'Suspicious', FAILED: 'Failed' };
  return <span className={map[status] || 'badge'}>{labels[status] || status}</span>;
};

const ActionBtn = ({ onClick, title, bg, color, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${color}30`,
      background: bg, color, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
    }}
    onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
  >
    {children}
  </button>
);

const inputStyle = {
  background: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px',
  color: 'var(--text-primary)', fontSize: '13px', padding: '8px 12px', width: '100%',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
};

const labelStyle = { fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };

const Review = () => {
  const [records, setRecords]   = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('environmental'); // environmental, social, governance

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode]       = useState(false);
  const [editingRecord, setEditingRecord]     = useState(null);
  const [editForm, setEditForm] = useState({ category: '', scope: 'Scope 1', quantity: '', normalized_unit: '', activity_date: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, l] = await Promise.all([recordsService.getRecords(), auditService.getAuditLogs()]);
      setRecords(r); setAuditLogs(l);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try { await recordsService.approveRecord(id); fetchData(); }
    catch (e) { alert(e.response?.data?.error || 'Failed to approve.'); }
  };
  
  const handleReject = async (id) => {
    if (!window.confirm('Reject this record?')) return;
    try { await recordsService.rejectRecord(id); fetchData(); }
    catch (e) { alert(e.response?.data?.error || 'Failed to reject.'); }
  };
  
  const handleLock = async (id) => {
    try { await recordsService.lockRecord(id); fetchData(); }
    catch (e) { alert(e.response?.data?.error || 'Failed to lock.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record? This action is permanent.')) return;
    try {
      await recordsService.deleteRecord(id);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete record.');
    }
  };

  const openAdd = () => {
    setIsCreateMode(true);
    setEditingRecord(null);
    setEditForm({
      category: '',
      scope: 'Scope 1',
      quantity: '',
      normalized_unit: '',
      activity_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsEditModalOpen(true);
  };

  const openEdit = (record) => {
    setIsCreateMode(false);
    setEditingRecord(record);
    setEditForm({
      category: record.category || '',
      scope: record.scope || 'Scope 1',
      quantity: record.quantity !== null ? record.quantity : '',
      normalized_unit: record.normalized_unit || '',
      activity_date: record.activity_date || '',
      notes: record.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...editForm,
      quantity: editForm.quantity !== '' ? parseFloat(editForm.quantity) : null
    };
    try {
      if (isCreateMode) {
        await recordsService.createRecord(payload);
      } else {
        await recordsService.updateRecord(editingRecord.id, payload);
      }
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit changes.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Analyst Overview
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Deep dive into ESG performance across key pillars
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
        <button
          onClick={() => setTab('environmental')}
          style={{
            background: tab === 'environmental' ? '#10b981' : 'transparent',
            color: tab === 'environmental' ? '#ffffff' : '#475569',
            border: 'none', borderRadius: '8px', padding: '8px 16px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          Environmental
        </button>
        <button
          onClick={() => setTab('social')}
          style={{
            background: tab === 'social' ? '#3b82f6' : 'transparent',
            color: tab === 'social' ? '#ffffff' : '#475569',
            border: 'none', borderRadius: '8px', padding: '8px 16px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          Social
        </button>
        <button
          onClick={() => setTab('governance')}
          style={{
            background: tab === 'governance' ? '#8b5cf6' : 'transparent',
            color: tab === 'governance' ? '#ffffff' : '#475569',
            border: 'none', borderRadius: '8px', padding: '8px 16px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          Governance
        </button>
      </div>

      {/* Environmental Tab View */}
      {tab === 'environmental' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Leaf size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 2px' }}>Carbon Emissions (tCO2e)</p>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>8,456</h4>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <ShieldAlert size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 2px' }}>Energy Consumption (kWh)</p>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>15,678</h4>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                <Droplet size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 2px' }}>Water Usage (kL)</p>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>6,234</h4>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Trash2 size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 2px' }}>Waste Generated (Tonnes)</p>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>1,245</h4>
              </div>
            </div>
          </div>

          {/* Graphics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Carbon Emissions Trend (tCO2e)</h4>
              <div style={{ height: '140px' }}>
                <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <path d="M10,100 Q100,75 200,60 T390,20" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  <circle cx="390" cy="20" r="3.5" fill="#10b981" />
                </svg>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Emissions by Source</h4>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1 }}>
                <svg viewBox="0 0 100 100" style={{ width: '70px', height: '70px' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="88 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="100 251" strokeDashoffset="-88" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="63 251" strokeDashoffset="-188" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                  <span style={{ color: '#10b981' }}>Scope 1: 35%</span>
                  <span style={{ color: '#3b82f6' }}>Scope 2: 40%</span>
                  <span style={{ color: '#8b5cf6' }}>Scope 3: 25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Tab View */}
      {tab === 'social' && (
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Social & Community Metrics Overview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Employee Diversity</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>42%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Workplace Safety (LTI)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>0</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Community Investment</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>$125k</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Training Hours (Avg)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>32h</div>
            </div>
          </div>
        </div>
      )}

      {/* Governance Tab View */}
      {tab === 'governance' && (
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Corporate Governance Metrics Overview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Board Independence</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>75%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Ethics Code Training</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>100%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Risk Management Score</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>92%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Data Audits Completed</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>2</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Key Insights</h4>
        <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>● Carbon emissions decreased by <strong>12.4%</strong> compared to last period.</li>
          <li>● Energy efficiency improved by <strong>8.7%</strong> across operations.</li>
          <li>● Focus area: Reduce Scope 3 emissions from supply chain.</li>
        </ul>
      </div>

      {/* Records Workspace Table Card */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={15} color="#10b981" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Records Workspace</span>
          </div>
          <button
            onClick={openAdd}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={13} /> Add Record
          </button>
        </div>

        {error && <div style={{ padding: '20px', color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span className="spinner" /> Loading records…
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No records to review.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{r.category}</div>
                      {r.notes && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={10} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>{r.notes}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{r.source?.source_type || '—'}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{r.source?.file_name}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                      {r.quantity !== null ? parseFloat(r.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'}
                    </td>
                    <td style={{ fontSize: '12px' }}>{r.normalized_unit || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {r.status === 'LOCKED' ? (
                          <span style={{ fontSize: '11px', color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: '5px', padding: '3px 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={10} /> Locked
                          </span>
                        ) : (
                          <>
                            <ActionBtn onClick={() => openEdit(r)} title="Edit" bg="#f1f5f9" color="#475569">
                              <Edit2 size={12} />
                            </ActionBtn>
                            {r.status !== 'APPROVED' && (
                              <ActionBtn onClick={() => handleApprove(r.id)} title="Approve" bg="rgba(16, 185, 129, 0.08)" color="#10b981">
                                <Check size={12} />
                              </ActionBtn>
                            )}
                            {r.status === 'APPROVED' && (
                              <ActionBtn onClick={() => handleLock(r.id)} title="Lock for Audit" bg="rgba(124, 58, 237, 0.08)" color="#7c3aed">
                                <Lock size={12} />
                              </ActionBtn>
                            )}
                            {r.status !== 'FAILED' && (
                              <ActionBtn onClick={() => handleReject(r.id)} title="Reject" bg="rgba(239, 68, 68, 0.08)" color="#ef4444">
                                <X size={12} />
                              </ActionBtn>
                            )}
                            <ActionBtn onClick={() => handleDelete(r.id)} title="Delete Record" bg="rgba(239, 68, 68, 0.08)" color="#ef4444">
                              <Trash2 size={12} />
                            </ActionBtn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Trail Card */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={15} color="#10b981" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Immutable Audit Trail</span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading audit logs…</div>
        ) : auditLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No audit entries yet. Edit a record to see changes tracked here.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Category</th>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Editor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>#{log.record_id}</td>
                    <td style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{log.category}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4f46e5' }}>{log.field_name}</td>
                    <td style={{ fontSize: '12px', color: '#dc2626' }}>{log.old_value || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td style={{ fontSize: '12px', color: '#059669' }}>{log.new_value || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{log.edited_by}</td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.edited_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '24px',
        }}>
          <div className="fade-up" style={{
            width: '100%', maxWidth: '480px',
            background: '#ffffff', border: '1px solid var(--border)',
            borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={14} color="#10b981" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {isCreateMode ? 'Create New Record' : `Edit Record #${editingRecord?.id}`}
                </span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <input type="text" required style={inputStyle} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="e.g. Diesel, Electricity" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Emissions Scope</label>
                  <select style={inputStyle} value={editForm.scope} onChange={e => setEditForm({ ...editForm, scope: e.target.value })}>
                    <option value="Scope 1">Scope 1 (Direct)</option>
                    <option value="Scope 2">Scope 2 (Electricity)</option>
                    <option value="Scope 3">Scope 3 (Indirect)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Activity Date</label>
                  <input type="date" required style={inputStyle} value={editForm.activity_date} onChange={e => setEditForm({ ...editForm, activity_date: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" step="0.0001" style={inputStyle} value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <input type="text" required style={inputStyle} value={editForm.normalized_unit} onChange={e => setEditForm({ ...editForm, normalized_unit: e.target.value })} placeholder="e.g. L, kg, kWh" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Reviewer Notes</label>
                <textarea
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Enter reason or comments for this record…"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Save size={13} /> {isCreateMode ? 'Create Record' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
