import { useState } from 'react';
import { api } from '../api.js';

export default function UrlManager({ urls, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', url: '' });
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setForm({ name: '', url: '' });
    setError('');
    setShowForm(true);
  }

  function openEdit(urlObj) {
    setEditTarget(urlObj);
    setForm({ name: urlObj.name, url: urlObj.url });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editTarget) {
        await api.urls.update(editTarget.id, form);
      } else {
        await api.urls.create(form);
      }
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this URL from monitoring?')) return;
    await api.urls.remove(id);
    onRefresh();
  }

  async function handleToggle(urlObj) {
    await api.urls.update(urlObj.id, { active: !urlObj.active });
    onRefresh();
  }

  async function handleRunNow() {
    setRunning(true);
    try {
      await api.runs.trigger();
      alert('Test run started! Results will appear once complete.');
    } catch (err) {
      alert(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Monitored URLs</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRunNow}
            disabled={running}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {running ? 'Starting...' : 'Run Now'}
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add URL
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {urls.map((u) => (
          <div key={u.id} className={`flex items-center justify-between p-3 rounded-lg border ${u.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            <div>
              <p className="text-sm font-medium text-gray-800">{u.name}</p>
              <p className="text-xs text-gray-500">{u.url}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(u)}
                className={`text-xs px-2 py-1 rounded ${u.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {u.active ? 'Pause' : 'Enable'}
              </button>
              <button onClick={() => openEdit(u)} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
                Edit
              </button>
              <button onClick={() => handleDelete(u.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200">
                Delete
              </button>
            </div>
          </div>
        ))}
        {urls.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No URLs added yet.</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editTarget ? 'Edit URL' : 'Add URL'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="My Homepage"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  {editTarget ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
