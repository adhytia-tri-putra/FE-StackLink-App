const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const getApiUrl = (endpoint: string) => {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) return normalizedEndpoint;
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}${normalizedEndpoint}`;
};

export const apiRequest = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem("stacklink_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = getApiUrl(endpoint);
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new Error(`Gagal terhubung ke server: ${message}`);
  }

  let payload: any = null;

  try {
    payload = await response.json();
  } catch (error) {
    if (!response.ok) {
      payload = null;
    } else {
      const message = error instanceof Error ? error.message : "Invalid JSON response";
      throw new Error(`Gagal memproses response server: ${message}`);
    }
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText || "Request error";
    throw new Error(message);
  }

  return payload;
};
