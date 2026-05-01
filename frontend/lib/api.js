const API_URL = "http://localhost:5000/api";

export const api = async (endpoint, method = "GET", body, token) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Request failed");
    error.payload = data;
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getApiError = (error, fallbackMessage) => {
  if (!error) {
    return fallbackMessage;
  }

  return error.payload?.message || error.payload?.error || error.message || fallbackMessage;
};
