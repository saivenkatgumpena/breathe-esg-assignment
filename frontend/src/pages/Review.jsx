import React, { useState, useEffect } from 'react';
import { recordsService, auditService } from '../services/api';
import { Check, X, Lock, Edit2, History, MessageSquare, Save } from 'lucide-react';

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
  background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px',
  color: '#f0f4ff', fontSize: '13px', padding: '8px 12px', width: '100%',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
};

const labelStyle = { fontSize: '11px', fontWeight: 600, color: '#7a8599', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };

const Review = () => {
  const [records, setRecords]   = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord]     = useState(null);
  const [editForm, setEditForm] = useState({ category: '', scope: '', quantity: '', normalized_unit: '', activity_date: '', notes: '' });

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

  const openEdit = (record) => {
    setEditingRecord(record);
    setEditForm({
      category: record.category || '', scope: record.scope || '',
      quantity: record.quantity !== null ? record.quantity : '',
      normalized_unit: record.normalized_unit || '',
      activity_date: record.activity_date || '', notes: record.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await recordsService.updateRecord(editingRecord.id, { ...editForm, quantity: editForm.quantity !== '' ? parseFloat(editForm.quantity) : null });
      setIsEditModalOpen(false); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to update.'); }
  };

  const tableWrap = { background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' };
  const tableHeader = { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Analyst Review</h1>
        <p style={{ fontSize: '13px', color: '#7a8599', margin: 0 }}>Approve, reject, or edit records. Every change is tracked in the immutable audit trail below.</p>
      </div>

      {/* Records Table */}
      <div style={tableWrap}>
        <div style={tableHeader}>
          <Edit2 size={14} color="#4f8ef7" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff' }}>Records Workspace</span>
        </div>

        {error && <div style={{ padding: '20px', color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#7a8599', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span className="spinner" /> Loading records…
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4a5568', fontSize: '13px' }}>No records to review.</div>
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
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4a5568' }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#f0f4ff', fontSize: '13px' }}>{r.category}</div>
                      {r.notes && (
                        <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={10} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>{r.notes}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#f0f4ff' }}>{r.source?.source_type || '—'}</div>
                      <div style={{ fontSize: '10px', color: '#4a5568', marginTop: '1px' }}>{r.source?.file_name}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#f0f4ff', fontSize: '13px' }}>
                      {r.quantity !== null ? parseFloat(r.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'}
                    </td>
                    <td style={{ fontSize: '12px' }}>{r.normalized_unit || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {r.status === 'LOCKED' ? (
                          <span style={{ fontSize: '11px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '5px', padding: '3px 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={10} /> Locked
                          </span>
                        ) : (
                          <>
                            <ActionBtn onClick={() => openEdit(r)} title="Edit" bg="rgba(255,255,255,0.04)" color="#7a8599">
                              <Edit2 size={12} />
                            </ActionBtn>
                            {r.status !== 'APPROVED' && (
                              <ActionBtn onClick={() => handleApprove(r.id)} title="Approve" bg="rgba(52,211,153,0.08)" color="#34d399">
                                <Check size={12} />
                              </ActionBtn>
                            )}
                            {r.status === 'APPROVED' && (
                              <ActionBtn onClick={() => handleLock(r.id)} title="Lock for Audit" bg="rgba(167,139,250,0.08)" color="#a78bfa">
                                <Lock size={12} />
                              </ActionBtn>
                            )}
                            {r.status !== 'FAILED' && (
                              <ActionBtn onClick={() => handleReject(r.id)} title="Reject" bg="rgba(248,113,113,0.08)" color="#f87171">
                                <X size={12} />
                              </ActionBtn>
                            )}
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

      {/* Audit Trail */}
      <div style={tableWrap}>
        <div style={tableHeader}>
          <History size={14} color="#34d399" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff' }}>Immutable Audit Trail</span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568', fontSize: '13px' }}>Loading audit logs…</div>
        ) : auditLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568', fontSize: '13px' }}>No audit entries yet. Edit a record to see changes tracked here.</div>
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
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4a5568' }}>#{log.record_id}</td>
                    <td style={{ fontSize: '13px', fontWeight: 500, color: '#f0f4ff' }}>{log.category}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#818cf8' }}>{log.field_name}</td>
                    <td style={{ fontSize: '12px', color: '#f87171' }}>{log.old_value || <span style={{ color: '#4a5568' }}>—</span>}</td>
                    <td style={{ fontSize: '12px', color: '#34d399' }}>{log.new_value || <span style={{ color: '#4a5568' }}>—</span>}</td>
                    <td style={{ fontSize: '12px', fontWeight: 500, color: '#f0f4ff' }}>{log.edited_by}</td>
                    <td style={{ fontSize: '11px', color: '#4a5568' }}>{new Date(log.edited_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '24px',
        }}>
          <div className="fade-up" style={{
            width: '100%', maxWidth: '480px',
            background: '#161b27', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={14} color="#4f8ef7" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff' }}>Edit Record <span style={{ color: '#4f8ef7' }}>#{editingRecord?.id}</span></span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#7a8599', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <input type="text" required style={inputStyle} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} />
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
                  <input type="text" required style={inputStyle} value={editForm.normalized_unit} onChange={e => setEditForm({ ...editForm, normalized_unit: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Reviewer Notes</label>
                <textarea
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Enter reason for modification…"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Save size={13} /> Save Changes
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
