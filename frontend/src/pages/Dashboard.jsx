import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import UrlManager from '../components/UrlManager.jsx';
import ImpactBadge from '../components/ImpactBadge.jsx';

function ImpactCount({ label, count, color }) {
  if (!count) return null;
  return (
    <div className={`text-center px-3 py-1 rounded-lg ${color}`}>
      <div className="text-lg font-bold">{count}</div>
      <div className="text-xs capitalize">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);

  const load = useCallback(async () => {
    const [u, r] = await Promise.all([api.urls.list(), api.results.latest()]);
    setUrls(u);
    setResults(r);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function formatDate(str) {
    if (!str) return 'Never';
    return new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Accessibility issues per URL from the latest run</p>
        </div>
        <button
          onClick={() => setShowManager((v) => !v)}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          {showManager ? 'Hide Manager' : 'Manage URLs'}
        </button>
      </div>

      {showManager && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <UrlManager urls={urls} onRefresh={load} />
        </div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No results yet. Add URLs and run a test to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <Link
              key={r.id}
              to={`/url/${r.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 truncate">{r.name}</h3>
                <p className="text-xs text-gray-400 truncate">{r.url}</p>
                <p className="text-xs text-gray-400 mt-1">Last run: {formatDate(r.run_date)}</p>
              </div>

              {r.total_violations === 0 ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span className="text-green-500">✓</span> No violations
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <ImpactCount label="critical" count={r.critical} color="bg-red-50 text-red-700" />
                  <ImpactCount label="serious" count={r.serious} color="bg-orange-50 text-orange-700" />
                  <ImpactCount label="moderate" count={r.moderate} color="bg-yellow-50 text-yellow-700" />
                  <ImpactCount label="minor" count={r.minor} color="bg-blue-50 text-blue-700" />
                </div>
              )}

              <div className="mt-3 text-xs text-gray-400">
                {r.total_violations} total violation{r.total_violations !== 1 ? 's' : ''} →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
