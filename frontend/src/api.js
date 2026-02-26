const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  urls: {
    list: () => request('/urls'),
    create: (data) => request('/urls', { method: 'POST', body: data }),
    update: (id, data) => request(`/urls/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/urls/${id}`, { method: 'DELETE' }),
  },
  runs: {
    list: () => request('/runs'),
    trigger: () => request('/runs', { method: 'POST' }),
  },
  results: {
    latest: () => request('/results/latest'),
    trend: (urlId) => request(`/results/trend/${urlId}`),
    violations: (urlId) => request(`/results/violations/${urlId}`),
  },
};
