import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, Download, Search, Sprout, CloudSun, TrendingUp, ShieldAlert, Landmark, Calendar } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAdvisoryResult } from '../services/api';

export default function AdvisoryReport() {
  const { requestId: paramId } = useParams();
  const [searchId, setSearchId] = useState(paramId || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async (rid) => {
    if (!rid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdvisoryResult(rid);
      setReport(res.data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) fetchReport(paramId);
  }, [paramId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport(searchId.trim());
  };

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const margin = 15;
      let y = margin;

      doc.setFontSize(18);
      doc.setTextColor(21, 128, 61);
      doc.text('Agricultural Advisory Report', margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Request ID: ${report.request_id}`, margin, y);
      y += 5;
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor(0);

      if (report.summary) {
        doc.setFontSize(14);
        doc.text('Summary', margin, y);
        y += 7;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(report.summary, 180);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;
      }

      if (report.detailed_advisory) {
        doc.setFontSize(14);
        doc.text('Detailed Advisory', margin, y);
        y += 7;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(report.detailed_advisory, 180);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;
      }

      if (report.immediate_actions?.length) {
        if (y > 250) { doc.addPage(); y = margin; }
        doc.setFontSize(14);
        doc.text('Immediate Actions', margin, y);
        y += 7;
        doc.setFontSize(10);
        report.immediate_actions.forEach((a) => {
          const lines = doc.splitTextToSize(`• ${a}`, 170);
          doc.text(lines, margin + 5, y);
          y += lines.length * 5 + 2;
        });
        y += 3;
      }

      doc.save(`advisory_report_${report.request_id}.pdf`);
    } catch (err) {
      alert('PDF download failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">Advisory Report</h1>
      </div>

      {/* Search (if no paramId) */}
      {!paramId && (
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Request ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      )}

      {loading && <LoadingSpinner message="Loading report..." />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {report && report.status === 'completed' ? (
        <div className="space-y-5 print:space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-6 text-white shadow-lg no-print">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-80">Agricultural Advisory Control Room</span>
                </div>
                <h2 className="text-xl font-bold">Advisory Report</h2>
                <p className="text-sm mt-1 opacity-80 font-mono">{report.request_id}</p>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>

          {/* Summary */}
          {report.summary && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-green-600" /> Summary
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>
            </div>
          )}

          {/* Detailed advisory */}
          {report.detailed_advisory && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Detailed Advisory</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{report.detailed_advisory}</div>
            </div>
          )}

          {/* Immediate actions */}
          {report.immediate_actions?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" /> Immediate Actions
              </h3>
              <ul className="space-y-2">
                {report.immediate_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weekly plan */}
          {report.weekly_plan?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Weekly Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.weekly_plan.map((wp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs font-bold text-gray-700 mb-1.5">{wp.day}</p>
                    <ul className="space-y-1">
                      {(wp.actions || []).map((act, j) => (
                        <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market summary */}
          {report.market_summary && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" /> Market Summary
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Crop: </span>
                  <span className="font-medium">{report.market_summary.crop}</span>
                </div>
                <div>
                  <span className="text-gray-500">Price: </span>
                  <span className="font-bold text-green-700">₹{report.market_summary.avg_price}</span>
                  <span className="text-gray-400">/quintal</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  report.market_summary.recommendation === 'SELL' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.market_summary.recommendation}
                </span>
              </div>
              {report.market_summary.reason && (
                <p className="text-xs text-gray-500 mt-2">{report.market_summary.reason}</p>
              )}
            </div>
          )}

          {/* Risk summary */}
          {report.risk_summary?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Risk Warnings
              </h3>
              <div className="space-y-2">
                {report.risk_summary.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700">{r.title}</span>
                    <RiskBadge severity={r.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheme recommendations */}
          {report.scheme_recommendations?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" /> Recommended Schemes
              </h3>
              <div className="space-y-2">
                {report.scheme_recommendations.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence */}
          {report.confidence_score != null && (
            <div className="text-center text-xs text-gray-400 py-2">
              Confidence Score: {Math.round(report.confidence_score * 100)}% • Generated at {new Date().toLocaleString()}
            </div>
          )}
        </div>
      ) : report && report.status !== 'completed' ? (
        <EmptyState
          title="Advisory not ready"
          message={`Status: ${report.status}. The advisory pipeline is still running. Please wait.`}
          icon={ClipboardList}
        />
      ) : (
        !loading && !error && !paramId && (
          <EmptyState title="Enter a Request ID" message="Search or navigate from the Generate Advisory page." icon={ClipboardList} />
        )
      )}
    </div>
  );
}

