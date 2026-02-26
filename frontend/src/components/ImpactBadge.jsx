const colors = {
  critical: 'bg-red-100 text-red-800',
  serious: 'bg-orange-100 text-orange-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  minor: 'bg-blue-100 text-blue-800',
};

export default function ImpactBadge({ impact }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[impact] ?? 'bg-gray-100 text-gray-800'}`}>
      {impact ?? 'unknown'}
    </span>
  );
}
