import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Plus } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([
    { name: 'Q2 ESG Summary', date: 'Today', type: 'PDF' },
    { name: 'Sustainability Report', date: 'May 2026', type: 'CSV' },
    { name: 'Scope 1 & 2 Emissions Audit Log', date: 'May 2026', type: 'PDF' }
  ]);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');

  const triggerGenerate = (type) => {
    setGenerating(true);
    setSuccess('');
    setTimeout(() => {
      setGenerating(false);
      setSuccess(`Successfully generated ${type} report!`);
      const newReport = {
        name: `ESG Custom ${type} Report`,
        date: 'Today',
        type: type
      };
      setReports(prev => [newReport, ...prev]);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Reports Workspace
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Generate submission-ready ESG and sustainability disclosure reports
        </p>
      </div>

      {/* Generate Card */}
      <div className="card" style={{ padding: '32px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
          Generate ESG Reports
        </h4>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', maxWidth: '600px', lineHeight: 1.6 }}>
          Compile organizational data into structured formats compliant with GHG Protocol, GRI, and SASB frameworks.
        </p>

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
            fontSize: '13px', color: '#10b981',
          }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => triggerGenerate('Summary')}
            disabled={generating}
            className="btn-primary"
            style={{ padding: '10px 20px' }}
          >
            {generating ? 'Compiling Summary...' : 'Generate Summary'}
          </button>

          <button
            onClick={() => triggerGenerate('PDF')}
            disabled={generating}
            className="btn-ghost"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}
          >
            <Download size={14} /> {generating ? 'Building PDF...' : 'Download PDF'}
          </button>

          <button
            onClick={() => triggerGenerate('CSV')}
            disabled={generating}
            className="btn-ghost"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}
          >
            <Download size={14} /> {generating ? 'Building CSV...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
          Recent Generated Reports
        </h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Generated</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="#64748b" />
                    {r.name}
                  </td>
                  <td style={{ fontSize: '12px' }}>{r.date}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '5px 10px', fontSize: '11px', gap: '4px', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.04)', fontWeight: 600 }}
                      onClick={() => alert(`Downloading ${r.name} as ${r.type}`)}
                    >
                      <Download size={11} /> {r.type}
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

export default Reports;
