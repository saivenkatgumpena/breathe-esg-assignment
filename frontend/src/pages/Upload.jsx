import React, { useState } from 'react';
import { ingestionService } from '../services/api';
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  FileJson, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Database,
  ArrowRight
} from 'lucide-react';

const Upload = () => {
  const [activeUpload, setActiveUpload] = useState(null); // 'sap', 'utility', 'travel'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Sample files downloader
  const downloadSample = (type) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (type === 'sap') {
      content = 
`PlantCode,Material,Fuel_Type,Quantity,Unit,Date
PL001,Generator Diesel,Diesel,500,L,2026-05-01
PL002,Steel Rebar,,8,Ton,2026-05-03
PL001,Coal Purchase,Coal,2,Ton,2026-05-03
PL003,Motor Gasoline,Petrol,120,L,2026-05-05
PL001,High Quantity Diesel,Diesel,12000,L,2026-05-06
PL002,Raw Concrete,Procurement,-2,Ton,2026-05-07`;
      filename = 'sap_sample.csv';
      mimeType = 'text/csv';
    } else if (type === 'utility') {
      content = 
`Meter_ID,Consumption_kWh,Billing_Start,Billing_End,Tariff
M001,1500,2026-04-01,2026-04-30,Industrial
M002,65000,2026-04-01,2026-04-30,Commercial
M003,2400,2026-04-01,2026-06-01,Industrial
M004,-100,2026-04-01,2026-04-30,Industrial
M005,100,2026-04-30,2026-04-01,Industrial`;
      filename = 'utility_sample.csv';
      mimeType = 'text/csv';
    } else if (type === 'travel') {
      content = JSON.stringify([
        {
          "employee": "Sai",
          "type": "flight",
          "from": "HYD",
          "to": "DEL",
          "quantity": 1,
          "unit": "trip",
          "date": "2026-05-01"
        },
        {
          "employee": "Nihar",
          "type": "flight",
          "from": "BOM",
          "to": "BOM",
          "quantity": 1,
          "unit": "trip",
          "date": "2026-05-02"
        },
        {
          "employee": "Venkat",
          "type": "taxi",
          "from": "Office",
          "to": "Airport",
          "quantity": 15,
          "unit": "km",
          "date": "2026-05-03"
        },
        {
          "employee": "Rahul",
          "type": "",
          "from": "HYD",
          "to": "BLR",
          "quantity": 1,
          "date": "2026-05-04"
        }
      ], null, 2);
      filename = 'travel_sample.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccessResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessResult(null);

    try {
      let res;
      if (activeUpload === 'sap') {
        res = await ingestionService.uploadSAP(file);
      } else if (activeUpload === 'utility') {
        res = await ingestionService.uploadUtility(file);
      } else if (activeUpload === 'travel') {
        res = await ingestionService.uploadTravel(file);
      }
      setSuccessResult(res);
      setFile(null);
      // Reset input element
      document.getElementById('file-upload-input').value = '';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ingestion failed due to a server or data formatting error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans m-0">Ingestion Hub</h1>
        <p className="text-slate-400 text-sm mt-1">Upload files from various data sources. The engine parses, normalizes, and validates records dynamically.</p>
      </div>

      {/* Grid of upload sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SAP ERP Panel */}
        <div className={`glass-panel p-6 border transition-all ${activeUpload === 'sap' ? 'border-emerald-500/80 bg-emerald-500/[0.02] shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]' : 'border-slate-700/40 hover:border-slate-600'}`}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <button
              onClick={() => downloadSample('sap')}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700/60 rounded px-2 py-1 transition-all"
            >
              <Download className="w-3 h-3" />
              Sample CSV
            </button>
          </div>
          <h3 className="text-lg font-bold text-white mt-5 m-0">SAP ERP Data</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">Ingest fuel consumption (Scope 1) and raw material procurement (Scope 3) records. Evaluates Plant Code, Material categories, and German formatted headers.</p>
          <button
            onClick={() => { setActiveUpload('sap'); setFile(null); setError(''); setSuccessResult(null); }}
            className={`w-full mt-6 py-2 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${activeUpload === 'sap' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'}`}
          >
            Select SAP Source
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Utility Electricity Panel */}
        <div className={`glass-panel p-6 border transition-all ${activeUpload === 'utility' ? 'border-emerald-500/80 bg-emerald-500/[0.02] shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]' : 'border-slate-700/40 hover:border-slate-600'}`}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <button
              onClick={() => downloadSample('utility')}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700/60 rounded px-2 py-1 transition-all"
            >
              <Download className="w-3 h-3" />
              Sample CSV
            </button>
          </div>
          <h3 className="text-lg font-bold text-white mt-5 m-0">Utility Electricity</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">Ingest monthly electricity bills (Scope 2). Evaluates consumption in kWh and checks billing period variations (e.g. non-calendar cycles, billing durations).</p>
          <button
            onClick={() => { setActiveUpload('utility'); setFile(null); setError(''); setSuccessResult(null); }}
            className={`w-full mt-6 py-2 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${activeUpload === 'utility' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'}`}
          >
            Select Utility Source
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Corporate Travel Panel */}
        <div className={`glass-panel p-6 border transition-all ${activeUpload === 'travel' ? 'border-emerald-500/80 bg-emerald-500/[0.02] shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]' : 'border-slate-700/40 hover:border-slate-600'}`}>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <FileJson className="w-6 h-6" />
            </div>
            <button
              onClick={() => downloadSample('travel')}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700/60 rounded px-2 py-1 transition-all"
            >
              <Download className="w-3 h-3" />
              Sample JSON
            </button>
          </div>
          <h3 className="text-lg font-bold text-white mt-5 m-0">Corporate Travel</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">Ingest corporate flights, hotels, and taxi logs (Scope 3) in JSON formats. Evaluates travel routes, distances, duplicate airport locations, and employee bookings.</p>
          <button
            onClick={() => { setActiveUpload('travel'); setFile(null); setError(''); setSuccessResult(null); }}
            className={`w-full mt-6 py-2 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${activeUpload === 'travel' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'}`}
          >
            Select Travel Source
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Upload Source Workspace */}
      {activeUpload && (
        <div className="glass-panel p-6 border border-slate-700/40 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <UploadIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Upload Workspace: <span className="text-emerald-400">{activeUpload} file Ingestion</span>
            </h3>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-8 text-center bg-slate-900/20 transition-all relative">
              <input
                id="file-upload-input"
                type="file"
                accept={activeUpload === 'travel' ? '.json,.txt' : '.csv'}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-3 pointer-events-none">
                <div className="w-12 h-12 bg-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-800">
                  <UploadIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-sm text-slate-200 font-medium">
                  {file ? file.name : `Drag & drop or click to select your ${activeUpload.toUpperCase()} ${activeUpload === 'travel' ? 'JSON' : 'CSV'} file`}
                </div>
                <div className="text-xs text-slate-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : `File extension must be ${activeUpload === 'travel' ? '.json' : '.csv'}`}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setActiveUpload(null); setFile(null); setError(''); setSuccessResult(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-5 rounded-lg border border-slate-700/60 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing File...' : 'Ingest & Process Data'}
              </button>
            </div>
          </form>

          {/* Ingestion results feedback */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-300 text-xs leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>File uploaded and processed successfully!</span>
              </div>

              {/* Status breakdown grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Rows</p>
                  <p className="text-xl font-bold text-white mt-1">{successResult.summary.total}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-center">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Imported Rows</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{successResult.summary.imported}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-center">
                  <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">Suspicious Rows</p>
                  <p className="text-xl font-bold text-yellow-400 mt-1">{successResult.summary.suspicious}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-center">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Failed Rows</p>
                  <p className="text-xl font-bold text-red-400 mt-1">{successResult.summary.failed}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                You can review imported, suspicious, and failed records on the <strong className="text-emerald-400 font-medium">Dashboard</strong> or correct/validate issues directly on the <strong className="text-emerald-400 font-medium">Analyst Review</strong> tab.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
