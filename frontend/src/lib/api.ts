const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.append(key, value);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Public API ───

export async function getConfig() {
  return apiFetch<any>('/config');
}

export async function getCategories() {
  return apiFetch<any>('/categories');
}

export async function getCategory(slug: string) {
  return apiFetch<any>(`/categories/${slug}`);
}

export async function getProducts(params: Record<string, string> = {}) {
  return apiFetch<any>('/products', { params });
}

export async function getFeaturedProducts() {
  return apiFetch<any>('/products/featured');
}

export async function getProduct(slug: string) {
  return apiFetch<any>(`/products/${slug}`);
}

// ─── Admin API ───

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(email: string, password: string) {
  return apiFetch<any>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getDashboard(token: string) {
  return apiFetch<any>('/admin/dashboard', { headers: authHeaders(token) });
}

export async function getAdminProducts(token: string, params: Record<string, string> = {}) {
  return apiFetch<any>('/admin/products', { params, headers: authHeaders(token) });
}

export async function createProduct(token: string, data: any) {
  return apiFetch<any>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: authHeaders(token),
  });
}

export async function updateProduct(token: string, id: string, data: any) {
  return apiFetch<any>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: authHeaders(token),
  });
}

export async function deleteProduct(token: string, id: string) {
  return apiFetch<any>(`/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function getAdminCategories(token: string) {
  return apiFetch<any>('/admin/categories', { headers: authHeaders(token) });
}

export async function createCategory(token: string, data: any) {
  return apiFetch<any>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: authHeaders(token),
  });
}

export async function updateCategory(token: string, id: string, data: any) {
  return apiFetch<any>(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: authHeaders(token),
  });
}

export async function deleteCategory(token: string, id: string) {
  return apiFetch<any>(`/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function runImport(token: string, source: string) {
  return apiFetch<any>('/admin/import', {
    method: 'POST',
    body: JSON.stringify({ source }),
    headers: authHeaders(token),
  });
}

export async function runSync(token: string, source: string) {
  return apiFetch<any>('/admin/sync', {
    method: 'POST',
    body: JSON.stringify({ source }),
    headers: authHeaders(token),
  });
}

export async function getSyncLogs(token: string) {
  return apiFetch<any>('/admin/sync-logs', { headers: authHeaders(token) });
}

export async function getSettings(token: string) {
  return apiFetch<any>('/admin/settings', { headers: authHeaders(token) });
}

export async function updateSettings(token: string, data: any) {
  return apiFetch<any>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: authHeaders(token),
  });
}
