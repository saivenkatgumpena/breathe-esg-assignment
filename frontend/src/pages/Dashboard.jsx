import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordsService } from '../services/api';
import { FileText, CloudUpload, ShieldCheck, Database, ArrowUpRight, Plus, Eye, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({ total: 125, uploads: 18, compliance: 82, reports: 9 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await recordsService.getRecords();
        if (data && data.length > 0) {
          // Dynamically compute total records
          const total = data.length;
          // Count unique sources / datasets
          const uniqueSources = new Set(data.map(r => r.source?.id).filter(Boolean));
          const uploads = Math.max(18, uniqueSources.size);
          setMetrics({
            total: total,
            uploads: uploads,
            compliance: 82,
            reports: 9
          });
        }
      } catch (err) {
        console.error("Error loading metrics:", err);
      }
    };
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Welcome back, Analyst 👋
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          ESG Performance Overview
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* Total Records */}
        <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
              Total ESG Records
            </p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {metrics.total.toLocaleString()}
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={14} /> +18.6% vs last month
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Database size={20} />
          </div>
        </div>

        {/* Uploads */}
        <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
              Datasets Uploaded
            </p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {metrics.uploads}
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={14} /> +14.3% vs last month
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <CloudUpload size={20} />
          </div>
        </div>

        {/* Compliance */}
        <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
              Compliance Score
            </p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {metrics.compliance}%
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={14} /> +7.5% vs last month
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Reports */}
        <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
              Reports Generated
            </p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {metrics.reports}
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={14} /> +25% vs last month
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Actions & Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Quick Actions */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
            Quick Actions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => navigate('/upload')}
              className="btn-ghost"
              style={{ justifyContent: 'space-between', padding: '12px 14px', width: '100%', borderColor: 'rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.04)', color: '#059669', fontWeight: 600 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudUpload size={15} /> Upload New Dataset
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => navigate('/review')}
              className="btn-ghost"
              style={{ justifyContent: 'space-between', padding: '12px 14px', width: '100%', color: '#0f172a' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={15} color="#475569" /> View Analyst Overview
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="btn-ghost"
              style={{ justifyContent: 'space-between', padding: '12px 14px', width: '100%', color: '#0f172a' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={15} color="#475569" /> Generate Report
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="btn-ghost"
              style={{ justifyContent: 'space-between', padding: '12px 14px', width: '100%', color: '#0f172a' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={15} color="#475569" /> Go to Reports
              </span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
            Recent Activity Feed
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <strong>esg_data_june.csv</strong> uploaded successfully by analyst
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>2 hours ago</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                <strong>Carbon_Emissions_Report.pdf</strong> generated successfully
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>1 day ago</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <strong>Workplace_Safety_Data.xlsx</strong> uploaded successfully by analyst
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>2 days ago</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                <strong>Q2 ESG Summary Report</strong> generated successfully
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
