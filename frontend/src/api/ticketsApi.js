function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return "/api";
}

const API_BASE_URL = resolveApiBaseUrl();

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return {};
  }
}

export async function fetchTicketsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.customerEmail) {
    query.set("customerEmail", params.customerEmail);
  }
  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const queryString = query.toString();
  const endpoint = queryString ? `${API_BASE_URL}/tickets?${queryString}` : `${API_BASE_URL}/tickets`;

  const response = await fetch(endpoint);
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || "Failed to load tickets");
  }

  return data.tickets || [];
}

export async function analyzeTicketApi(payload) {
  const response = await fetch(`${API_BASE_URL}/tickets/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to analyze ticket");
  }

  return data;
}

export async function loginApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data.session;
}

export async function updateTicketStatusApi(ticketId, status) {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || "Failed to update ticket status");
  }

  return data;
}
