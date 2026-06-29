import { auth } from "./auth/authStore.js";


export async function apiFetch(url, options = {}) {
  const token = auth.getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  if (response.status === 401) {
    auth.logout();
    window.location.href = "/login.html";
    return null;
  }

  return response;
}