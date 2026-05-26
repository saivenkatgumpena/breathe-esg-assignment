import React, { useState, useEffect } from 'react';
import { recordsService, auditService } from '../services/api';
import { 
  Check, 
  X, 
  Lock, 
  Edit2, 
  History, 
  AlertTriangle, 
  ExternalLink,
  Save,
  MessageSquare
} from 'lucide-react';

const Review = () => {
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    category: '',
    scope: '',
    quantity: '',
    normalized_unit: '',
    activity_date: '',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const recordsData = await recordsService.getRecords();
      setRecords(recordsData);
      
      const logsData = await auditService.getAuditLogs();
      setAuditLogs(logsData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch review data or audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await recordsService.approveRecord(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve record.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this record?')) return;
    try {
      await recordsService.rejectRecord(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject record.');
    }
  };

  const handleLock = async (id) => {
    try {
      await recordsService.lockRecord(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to lock record.');
    }
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditForm({
      category: record.category || '',
      scope: record.scope || '',
      quantity: record.quantity !== null ? record.quantity : '',
      normalized_unit: record.normalized_unit || '',
      activity_date: record.activity_date || '',
      notes: record.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanData = {
        ...editForm,
        quantity: editForm.quantity !== '' ? parseFloat(editForm.quantity) : null
      };
      await recordsService.updateRecord(editingRecord.id, cleanData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update record.');
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">Pending</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Approved</span>;
      case 'LOCKED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">Locked</span>;
      case 'SUSPICIOUS':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">Suspicious</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 border border-red-500/20 text-red-300">Failed</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-500/10 border border-slate-500/20 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans m-0">Analyst Review Center</h1>
        <p className="text-slate-400 text-sm mt-1">Approve records for reporting, reject errors, or edit suspicious values. Every edit is tracked to an immutable audit trail.</p>
      </div>

      {/* Main Records Table */}
      <div className="glass-panel border border-slate-700/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="font-semibold text-sm text-white">Pending Approval & Verification Workspace</div>
        </div>

        {error && <div className="p-6 text-center text-red-400 text-xs">{error}</div>}

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading review registry...
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/30 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-4">Category / Item</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4 text-right">Quantity</th>
                  <th className="py-4 px-4">Unit</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-4 px-6 text-slate-500 font-mono font-bold">#{record.id}</td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-medium text-white truncate">{record.category}</div>
                      {record.notes && (
                        <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{record.notes}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-400">
                      <div>{record.source?.source_type || 'Unknown'}</div>
                      <div className="text-[9px] text-slate-500 font-normal truncate mt-0.5">{record.source?.file_name}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      {record.quantity !== null ? parseFloat(record.quantity).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-medium">{record.normalized_unit || '-'}</td>
                    <td className="py-4 px-4">{getStatusBadge(record.status)}</td>
                    <td className="py-4 px-6 text-right">
                      {record.status === 'LOCKED' ? (
                        <div className="inline-flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 font-semibold uppercase">
                          <Lock className="w-3 h-3" /> Locked
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded text-slate-300 hover:text-white transition-all"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5 pointer-events-none" />
                          </button>

                          {record.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApprove(record.id)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded text-emerald-400 hover:text-emerald-300 transition-all"
                              title="Approve Record"
                            >
                              <Check className="w-3.5 h-3.5 pointer-events-none" />
                            </button>
                          )}

                          {record.status === 'APPROVED' && (
                            <button
                              onClick={() => handleLock(record.id)}
                              className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded text-purple-400 hover:text-purple-300 transition-all font-semibold"
                              title="Lock for Audit"
                            >
                              <Lock className="w-3.5 h-3.5 pointer-events-none" />
                            </button>
                          )}

                          {record.status !== 'FAILED' && (
                            <button
                              onClick={() => handleReject(record.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400 hover:text-red-300 transition-all"
                              title="Reject Record"
                            >
                              <X className="w-3.5 h-3.5 pointer-events-none" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Audit Trail logs */}
      <div className="glass-panel border border-slate-700/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <div className="font-semibold text-sm text-white">Immutable Platform Audit Trail</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading audit logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No entries recorded in audit trail. Edits will show up here.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/30 text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-800">
                  <th className="py-4 px-6">Record ID</th>
                  <th className="py-4 px-4">Item Name</th>
                  <th className="py-4 px-4">Modified Field</th>
                  <th className="py-4 px-4 text-red-300">Old Value</th>
                  <th className="py-4 px-4 text-emerald-300">New Value</th>
                  <th className="py-4 px-4">Editor</th>
                  <th className="py-4 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-400 text-xs">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/10 transition-all">
                    <td className="py-3 px-6 font-mono text-slate-500 font-bold">#{log.record_id}</td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">{log.category}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.field_name}</td>
                    <td className="py-3 px-4 text-red-400 font-medium max-w-[120px] truncate">{log.old_value || <span className="text-slate-600">-</span>}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium max-w-[120px] truncate">{log.new_value || <span className="text-slate-600">-</span>}</td>
                    <td className="py-3 px-4 font-semibold text-slate-300">{log.edited_by}</td>
                    <td className="py-3 px-6 text-slate-500 text-[10px]">{new Date(log.edited_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Record Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Edit ESG Record <span className="text-emerald-400">#{editingRecord?.id}</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition-all text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-slate-400 text-xs font-semibold">Category / Item Name</label>
                  <input
                    type="text"
                    required
                    className="bg-slate-900 border border-slate-700/60 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Emissions Scope</label>
                  <select
                    className="bg-slate-900 border border-slate-700/60 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    value={editForm.scope}
                    onChange={(e) => setEditForm({ ...editForm, scope: e.target.value })}
                  >
                    <option value="Scope 1">Scope 1 (Direct)</option>
                    <option value="Scope 2">Scope 2 (Electricity)</option>
                    <option value="Scope 3">Scope 3 (Indirect)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Activity Date</label>
                  <input
                    type="date"
                    required
                    className="bg-slate-900 border border-slate-700/60 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    value={editForm.activity_date}
                    onChange={(e) => setEditForm({ ...editForm, activity_date: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Quantity</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="bg-slate-900 border border-slate-700/60 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Unit</label>
                  <input
                    type="text"
                    required
                    className="bg-slate-900 border border-slate-700/60 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    value={editForm.normalized_unit}
                    onChange={(e) => setEditForm({ ...editForm, normalized_unit: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-slate-400 text-xs font-semibold">Reviewer Notes / Correction Comments</label>
                  <textarea
                    rows="3"
                    className="bg-slate-900 border border-slate-700/60 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Enter reason for modification or flags..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-5 rounded-lg border border-slate-700/60 transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
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
