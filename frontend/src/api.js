const API_BASE = '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchStats() {
  return request('/api/stats');
}

export async function fetchIncidents() {
  return request('/api/incidents');
}

export async function fetchIncident(id) {
  return request(`/api/incidents/${id}`);
}

export async function createIncident(payload) {
  return request('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateIncident(id, payload) {
  return request(`/api/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function fetchUsers() {
  return request('/api/users');
}

export async function advanceIncidentStatus(id, nextStatus, assignedTo) {
  return request(`/api/incidents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ nextStatus, assignedTo })
  });
}

export async function lookupPlaybooks(query) {
  const encoded = encodeURIComponent(query);
  return request(`/api/lookup?q=${encoded}`);
}

export async function fetchPlaybook(id) {
  return request(`/api/playbooks/${id}`);
}
