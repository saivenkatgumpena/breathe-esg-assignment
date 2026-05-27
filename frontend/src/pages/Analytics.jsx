import React from 'react';
import { Leaf, Users, ShieldAlert, BarChart2, TrendingDown, CheckCircle } from 'lucide-react';

const MetricSection = ({ title, icon: Icon, color, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>
      <Icon size={18} color={color} />
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
      {children}
    </div>
  </div>
);

const DetailCard = ({ title, value, change, label, trendDown }) => (
  <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{title}</span>
      <span style={{
        fontSize: '11px', fontWeight: 600,
        color: trendDown ? '#10b981' : '#3b82f6',
        background: trendDown ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
        padding: '3px 8px', borderRadius: '20px'
      }}>
        {change}
      </span>
    </div>
    <div>
      <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{value}</h4>
      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{label}</p>
    </div>
    {/* Micro-sparkline or progress bar */}
    <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
      <div style={{ width: '70%', height: '100%', background: trendDown ? '#10b981' : '#3b82f6', borderRadius: '2px' }} />
    </div>
  </div>
);

const Analytics = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Analytics & Insights
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Minimal charts and KPIs representing your organization's sustainability pillars
        </p>
      </div>

      {/* Grid containing E, S, G Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Environmental */}
        <MetricSection title="Environmental" icon={Leaf} color="#10b981">
          <DetailCard
            title="Carbon Emissions"
            value="8,456 tCO2e"
            change="↓ 12.4%"
            label="Scope 1, 2, 3 total emissions"
            trendDown={true}
          />
          <DetailCard
            title="Energy Usage"
            value="15,678 kWh"
            change="↓ 8.7%"
            label="Total facility power consumption"
            trendDown={true}
          />
          <DetailCard
            title="Waste Metrics"
            value="1,245 Tonnes"
            change="↓ 4.2%"
            label="Non-recyclable operational waste"
            trendDown={true}
          />
        </MetricSection>

        {/* Social */}
        <MetricSection title="Social" icon={Users} color="#3b82f6">
          <DetailCard
            title="Employee Diversity"
            value="42%"
            change="↑ 2.5%"
            label="Underrepresented groups in management"
            trendDown={false}
          />
          <DetailCard
            title="Workplace Safety"
            value="0 LTI"
            change="0 incidents"
            label="Lost time injuries recorded"
            trendDown={true}
          />
          <DetailCard
            title="Community Impact"
            value="$125,000"
            change="↑ 15%"
            label="Local CSR and community investments"
            trendDown={false}
          />
        </MetricSection>

        {/* Governance */}
        <MetricSection title="Governance" icon={CheckCircle} color="#8b5cf6">
          <DetailCard
            title="Compliance"
            value="100%"
            change="No breaches"
            label="Legal and environmental compliance rate"
            trendDown={true}
          />
          <DetailCard
            title="Risk Management"
            value="92%"
            change="Low Risk"
            label="Quarterly business audit score"
            trendDown={true}
          />
          <DetailCard
            title="Audit Readiness"
            value="95%"
            change="Ready"
            label="Third-party audit verification index"
            trendDown={true}
          />
        </MetricSection>
      </div>
    </div>
  );
};

export default Analytics;
