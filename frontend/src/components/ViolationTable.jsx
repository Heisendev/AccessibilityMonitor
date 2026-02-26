import { useState } from 'react';
import ImpactBadge from './ImpactBadge.jsx';

const PAGE_SIZE = 20;

export default function ViolationTable({ violations }) {
  const [page, setPage] = useState(0);

  if (!violations || violations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No violations found for this URL in the latest run.
      </div>
    );
  }

  const totalPages = Math.ceil(violations.length / PAGE_SIZE);
  const pageData = violations.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nodes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Help</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {pageData.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">{v.violation_id}</td>
                <td className="px-4 py-3"><ImpactBadge impact={v.impact} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">{v.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-center">{v.nodes_count}</td>
                <td className="px-4 py-3 text-sm">
                  {v.help_url && (
                    <a href={v.help_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Docs
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>{violations.length} total violations</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
