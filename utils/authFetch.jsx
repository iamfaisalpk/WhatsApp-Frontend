import { logoutUser, setAuth } from '../src/assets/store/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

export const authFetch = async (url, options = {}) => {
  let { auth } = store.getState();
  let token = auth.token || localStorage.getItem('authToken');
  let refreshToken = localStorage.getItem('refreshToken');

  // 🧠 Skip setting Content-Type for FormData (browser will handle it)
  const isFormData = options.body instanceof FormData;

  const buildHeaders = (token) => {
    const baseHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // Add content-type only if not FormData
    if (!isFormData) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    return {
      ...options.headers,
      ...baseHeaders,
    };
  };

  // Initial request
  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(token),
  });

  // 🔄 If token expired
  if (response.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_URL}/api/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshData = await refreshRes.json();

      if (!refreshRes.ok || !refreshData.accessToken) {
        store.dispatch(logoutUser());
        return response; // Return old 401 response
      }

      // ✅ Save new token
      localStorage.setItem('authToken', refreshData.accessToken);
      store.dispatch(setAuth({
        token: refreshData.accessToken,
        user: auth.user,
      }));

      // 🔁 Retry original request with new token
      response = await fetch(url, {
        ...options,
        headers: buildHeaders(refreshData.accessToken),
      });
    } catch (err) {
      console.error("authFetch: Token refresh failed", err);
      store.dispatch(logoutUser());
    }
  }

  return response;
};
