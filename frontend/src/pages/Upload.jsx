import React, { useState } from 'react';
import { ingestionService } from '../services/api';
import { FileSpreadsheet, FileJson, Database, Download, CheckCircle, AlertCircle, CloudUpload, X, Eye } from 'lucide-react';

const SOURCES = [
  {
    key: 'sap',
    label: 'SAP ERP',
    sublabel: 'CSV · Scope 1 & 3',
    icon: FileSpreadsheet,
    iconColor: '#10b981',
    description: 'Fuel consumption and material procurement data.',
    sampleType: 'sap',
    fileType: '.csv',
  },
  {
    key: 'utility',
    label: 'Utility Electricity',
    sublabel: 'CSV · Scope 2',
    icon: Database,
    iconColor: '#3b82f6',
    description: 'Monthly facility electricity consumption bills.',
    sampleType: 'utility',
    fileType: '.csv',
  },
  {
    key: 'travel',
    label: 'Corporate Travel',
    sublabel: 'JSON · Scope 3',
    icon: FileJson,
    iconColor: '#8b5cf6',
    description: 'Employee flight, hotel, and taxi logs.',
    sampleType: 'travel',
    fileType: '.json',
  },
];

const downloadSample = (type) => {
  let content = '', filename = '', mimeType = 'text/plain';
  if (type === 'sap') {
    content = `PlantCode,Material,Fuel_Type,Quantity,Unit,Date\nPL001,Generator Diesel,Diesel,500,L,2026-05-01\nPL002,Steel Rebar,,8,Ton,2026-05-03\nPL001,Coal Purchase,Coal,2,Ton,2026-05-03\nPL003,Motor Gasoline,Petrol,120,L,2026-05-05\nPL001,High Quantity Diesel,Diesel,12000,L,2026-05-06\nPL002,Raw Concrete,Procurement,-2,Ton,2026-05-07`;
    filename = 'sap_sample.csv'; mimeType = 'text/csv';
  } else if (type === 'utility') {
    content = `Meter_ID,Consumption_kWh,Billing_Start,Billing_End,Tariff\nM001,1500,2026-04-01,2026-04-30,Industrial\nM002,65000,2026-04-01,2026-04-30,Commercial\nM003,2400,2026-04-01,2026-06-01,Industrial\nM004,-100,2026-04-01,2026-04-30,Industrial\nM005,100,2026-04-30,2026-04-01,Industrial`;
    filename = 'utility_sample.csv'; mimeType = 'text/csv';
  } else if (type === 'travel') {
    content = JSON.stringify([
      { employee: 'Sai',   type: 'flight', from: 'HYD', to: 'DEL', quantity: 1,  unit: 'trip', date: '2026-05-01' },
      { employee: 'Nihar', type: 'flight', from: 'BOM', to: 'BOM', quantity: 1,  unit: 'trip', date: '2026-05-02' },
      { employee: 'Venkat',type: 'taxi',   from: 'Office', to: 'Airport', quantity: 15, unit: 'km', date: '2026-05-03' },
      { employee: 'Rahul', type: '',       from: 'HYD', to: 'BLR', quantity: 1,  date: '2026-05-04' },
    ], null, 2);
    filename = 'travel_sample.json'; mimeType = 'application/json';
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

const Upload = () => {
  const [active, setActive]           = useState('sap');
  const [file, setFile]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Preloaded mock upload history matching the screenshot
  const [history, setHistory] = useState([
    { name: 'esg_data_june.csv', type: 'CSV', records: '5,234', status: 'Success', date: 'Jun 10, 2026 10:30 AM' },
    { name: 'workplace_safety.xlsx', type: 'XLSX', records: '3,128', status: 'Success', date: 'Jun 9, 2026 04:15 PM' },
    { name: 'carbon_emissions.csv', type: 'CSV', records: '2,876', status: 'Success', date: 'Jun 8, 2026 11:20 AM' },
    { name: 'energy_usage.xlsx', type: 'XLSX', records: '1,220', status: 'Failed', date: 'Jun 7, 2026 09:10 AM' }
  ]);

  const source = SOURCES.find(s => s.key === active);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccessResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file.'); return; }
    setLoading(true); setError(''); setSuccessResult(null);
    try {
      let res;
      if (active === 'sap')     res = await ingestionService.uploadSAP(file);
      if (active === 'utility') res = await ingestionService.uploadUtility(file);
      if (active === 'travel')  res = await ingestionService.uploadTravel(file);
      setSuccessResult(res);

      // Add to upload history table
      const newHistoryItem = {
        name: file.name,
        type: file.name.split('.').pop().toUpperCase(),
        records: res.summary.imported,
        status: 'Success',
        date: 'Today'
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setFile(null);
      document.getElementById('file-upload-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Ingestion failed. Check file format.');
      // Log failed attempts
      const newFailedItem = {
        name: file.name,
        type: file.name.split('.').pop().toUpperCase(),
        records: '0',
        status: 'Failed',
        date: 'Today'
      };
      setHistory(prev => [newFailedItem, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Ingestion Hub
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Upload and manage your ESG datasets
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
        {SOURCES.map(s => {
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              onClick={() => { setActive(s.key); setFile(null); setError(''); setSuccessResult(null); }}
              style={{
                background: isActive ? '#10b981' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                border: 'none', borderRadius: '8px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Main Upload Box Card */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              Upload {source.label} Dataset
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              {source.description}
            </p>
          </div>
          <button
            onClick={() => downloadSample(source.sampleType)}
            className="btn-ghost"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={13} /> Download Sample File
          </button>
        </div>

        <form onSubmit={handleUpload}>
          {/* Dropzone area */}
          <label
            htmlFor="file-upload-input"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `2px dashed ${file ? '#10b981' : '#cbd5e1'}`,
              borderRadius: '12px', padding: '48px 24px', cursor: 'pointer',
              background: file ? 'rgba(16, 185, 129, 0.04)' : '#f8fafc',
              transition: 'all 0.15s', marginBottom: '20px',
            }}
          >
            <input
              id="file-upload-input"
              type="file"
              accept={active === 'travel' ? '.json,.txt' : '.csv'}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <CloudUpload size={36} color={file ? '#10b981' : '#64748b'} style={{ marginBottom: '12px' }} />
            {file ? (
              <>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB · Click to change file</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  Drag and drop your file here
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>or browse from computer</p>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                  Supported formats: {source.fileType.toUpperCase()} (Max: 20MB)
                </div>
              </>
            )}
          </label>

          {/* Error notifications */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
              fontSize: '13px', color: '#dc2626',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Success summary indicators */}
          {successResult && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: '12px', padding: '20px', marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>File processed successfully!</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Rows', value: successResult.summary.total, color: '#0f172a' },
                  { label: 'Imported', value: successResult.summary.imported, color: '#10b981' },
                  { label: 'Suspicious', value: successResult.summary.suspicious, color: '#f59e0b' },
                  { label: 'Failed', value: successResult.summary.failed, color: '#ef4444' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#ffffff', borderRadius: '8px', padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {file && (
              <button type="button" className="btn-ghost" onClick={() => setFile(null)}>
                Clear File
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !file}
              style={{ minWidth: '150px', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '13px', height: '13px', borderTopColor: '#fff' }} /> Uploading...
                </>
              ) : (
                'Upload Dataset'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Upload History Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
          Upload History
        </h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Records</th>
                <th>Status</th>
                <th>Uploaded On</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{h.name}</td>
                  <td style={{ fontSize: '12px', fontWeight: 500 }}>{h.type}</td>
                  <td style={{ fontFamily: 'monospace' }}>{h.records}</td>
                  <td>
                    <span className={h.status === 'Success' ? 'badge badge-approved' : 'badge badge-failed'}>
                      {h.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{h.date}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-ghost" style={{ padding: '6px', borderRadius: '6px' }} title="View details">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Upload;
