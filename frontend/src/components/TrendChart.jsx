import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const IMPACT_COLORS = {
  critical: '#ef4444',
  serious: '#f97316',
  moderate: '#eab308',
  minor: '#3b82f6',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Not enough data for a trend chart yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.run_date),
    critical: d.critical,
    serious: d.serious,
    moderate: d.moderate,
    minor: d.minor,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        {Object.entries(IMPACT_COLORS).map(([impact, color]) => (
          <Line
            key={impact}
            type="monotone"
            dataKey={impact}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
