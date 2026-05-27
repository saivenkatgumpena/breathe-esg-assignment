import React, { useState } from 'react';
import { ingestionService } from '../services/api';
import { FileSpreadsheet, FileJson, Database, Download, CheckCircle, AlertCircle, CloudUpload, X } from 'lucide-react';

const SOURCES = [
  {
    key: 'sap',
    label: 'SAP ERP',
    sublabel: 'CSV · Scope 1 & 3',
    icon: FileSpreadsheet,
    iconBg: 'rgba(52,211,153,0.1)',
    iconColor: '#34d399',
    accent: '#34d399',
    accentBg: 'rgba(52,211,153,0.08)',
    description: 'Fuel consumption (Scope 1) and raw material procurement (Scope 3). Parses PlantCode, Material, Fuel_Type, Quantity, Unit, and Date columns.',
    sampleType: 'sap',
    fileType: '.csv',
  },
  {
    key: 'utility',
    label: 'Utility Electricity',
    sublabel: 'CSV · Scope 2',
    icon: Database,
    iconBg: 'rgba(34,211,238,0.1)',
    iconColor: '#22d3ee',
    accent: '#22d3ee',
    accentBg: 'rgba(34,211,238,0.08)',
    description: 'Monthly electricity bills (Scope 2). Parses Meter_ID, Consumption_kWh, Billing_Start, Billing_End, and Tariff columns.',
    sampleType: 'utility',
    fileType: '.csv',
  },
  {
    key: 'travel',
    label: 'Corporate Travel',
    sublabel: 'JSON · Scope 3',
    icon: FileJson,
    iconBg: 'rgba(129,140,248,0.1)',
    iconColor: '#818cf8',
    accent: '#818cf8',
    accentBg: 'rgba(129,140,248,0.08)',
    description: 'Corporate flights, hotels, and taxi logs (Scope 3). JSON array with employee, type, from, to, quantity, unit, and date fields.',
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
  const [active, setActive]           = useState(null);
  const [file, setFile]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [successResult, setSuccessResult] = useState(null);

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
      setFile(null);
      document.getElementById('file-upload-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Ingestion failed. Check file format.');
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => { setActive(null); setFile(null); setError(''); setSuccessResult(null); };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Ingestion Hub</h1>
        <p style={{ fontSize: '13px', color: '#7a8599', margin: 0 }}>Upload files from SAP, utility portals, or corporate travel systems.</p>
      </div>

      {/* Source Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {SOURCES.map(s => {
          const Icon = s.icon;
          const isActive = active === s.key;
          return (
            <div
              key={s.key}
              style={{
                background: isActive ? s.accentBg : '#161b27',
                border: `1px solid ${isActive ? s.accent + '50' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '12px', padding: '20px',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
              onClick={() => { setActive(s.key); setFile(null); setError(''); setSuccessResult(null); }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={s.iconColor} />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); downloadSample(s.sampleType); }}
                  className="btn-ghost"
                  style={{ padding: '5px 10px', fontSize: '11px', gap: '4px' }}
                >
                  <Download size={11} /> Sample
                </button>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: s.iconColor, marginBottom: '10px', fontWeight: 500 }}>{s.sublabel}</div>
              <div style={{ fontSize: '12px', color: '#7a8599', lineHeight: 1.6 }}>{s.description}</div>
              <div style={{
                marginTop: '16px', fontSize: '12px', fontWeight: 600,
                color: isActive ? s.accent : '#4a5568',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? s.accent : '#4a5568' }} />
                {isActive ? 'Selected' : 'Click to select'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Workspace */}
      {active && source && (
        <div style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Workspace Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CloudUpload size={16} color={source.accent} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff' }}>
                Upload {source.label} file
              </span>
              <span style={{ fontSize: '11px', color: '#4a5568', background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '5px', padding: '2px 7px' }}>
                {source.fileType}
              </span>
            </div>
            <button onClick={cancel} className="btn-ghost" style={{ padding: '5px 8px', fontSize: '12px' }}>
              <X size={13} />
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            <form onSubmit={handleUpload}>
              {/* Drop Zone */}
              <label
                htmlFor="file-upload-input"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${file ? source.accent + '60' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px', padding: '40px 24px', cursor: 'pointer',
                  background: file ? source.accentBg : 'rgba(255,255,255,0.01)',
                  transition: 'all 0.18s', marginBottom: '16px',
                }}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept={active === 'travel' ? '.json,.txt' : '.csv'}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <CloudUpload size={28} color={file ? source.accent : '#4a5568'} style={{ marginBottom: '12px' }} />
                {file ? (
                  <>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', marginBottom: '4px' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: '#7a8599' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#7a8599', marginBottom: '4px' }}>
                      Drop your {source.fileType} file here or click to browse
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Accepts {source.fileType} files only</div>
                  </>
                )}
              </label>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: '8px', padding: '12px 14px', marginBottom: '14px',
                  fontSize: '13px', color: '#f87171',
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                  {error}
                </div>
              )}

              {/* Success */}
              {successResult && (
                <div style={{
                  background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)',
                  borderRadius: '10px', padding: '16px', marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <CheckCircle size={16} color="#34d399" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>File processed successfully!</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                    {[
                      { label: 'Total',      value: successResult.summary.total,      color: '#f0f4ff' },
                      { label: 'Imported',   value: successResult.summary.imported,   color: '#34d399' },
                      { label: 'Suspicious', value: successResult.summary.suspicious, color: '#fbbf24' },
                      { label: 'Failed',     value: successResult.summary.failed,     color: '#f87171' },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#0f1117', borderRadius: '8px', padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: '#4a5568', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7a8599', marginTop: '12px' }}>
                    Review imported records on the <strong style={{ color: '#f0f4ff' }}>Dashboard</strong> or validate issues in <strong style={{ color: '#f0f4ff' }}>Analyst Review</strong>.
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-ghost" onClick={cancel}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || !file} style={{ minWidth: '140px', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: '13px', height: '13px', borderTopColor: '#fff' }} /> Processing…</> : 'Ingest & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
