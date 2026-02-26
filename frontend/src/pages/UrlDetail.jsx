import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import TrendChart from '../components/TrendChart.jsx';
import ViolationTable from '../components/ViolationTable.jsx';

export default function UrlDetail() {
  const { id } = useParams();
  const [urlInfo, setUrlInfo] = useState(null);
  const [violations, setViolations] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('violations');

  useEffect(() => {
    async function load() {
      const [urls, v, t] = await Promise.all([
        api.urls.list(),
        api.results.violations(id),
        api.results.trend(id),
      ]);
      setUrlInfo(urls.find((u) => String(u.id) === String(id)));
      setViolations(v);
      setTrend(t);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (!urlInfo) return <div className="text-center py-16 text-gray-400">URL not found.</div>;

  const totalByImpact = violations.reduce((acc, v) => {
    acc[v.impact] = (acc[v.impact] || 0) + v.nodes_count;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{urlInfo.name}</h1>
        <a href={urlInfo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
          {urlInfo.url}
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Critical', key: 'critical', bg: 'bg-red-50', text: 'text-red-700' },
          { label: 'Serious', key: 'serious', bg: 'bg-orange-50', text: 'text-orange-700' },
          { label: 'Moderate', key: 'moderate', bg: 'bg-yellow-50', text: 'text-yellow-700' },
          { label: 'Minor', key: 'minor', bg: 'bg-blue-50', text: 'text-blue-700' },
        ].map(({ label, key, bg, text }) => (
          <div key={key} className={`rounded-xl p-4 ${bg}`}>
            <div className={`text-3xl font-bold ${text}`}>{totalByImpact[key] ?? 0}</div>
            <div className={`text-sm ${text} mt-1`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['violations', 'trend'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'violations' ? `Violations (${violations.length})` : 'Trend'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'violations' && (
        <ViolationTable violations={violations} />
      )}

      {activeTab === 'trend' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Violations over time</h2>
          <TrendChart data={trend} />
        </div>
      )}
    </div>
  );
}
