import { authHeader } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload.data;
}

export async function fetchArtisans() {
  const data = await request('/artisans');
  return data.items || [];
}

export async function fetchArtisanDetails(id) {
  return request(`/artisan/${id}`);
}

export async function fetchProducts(page = 1, limit = 12) {
  return request(`/products?page=${page}&limit=${limit}`);
}

export async function fetchRatingsForArtisan(id) {
  return request(`/artisan/${id}/ratings`);
}

export async function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchMe() {
  return request('/auth/me', {
    headers: {
      ...authHeader()
    }
  });
}

export async function createProduct(payload) {
  return request('/products', {
    method: 'POST',
    headers: {
      ...authHeader()
    },
    body: JSON.stringify(payload)
  });
}

export async function fetchMyProducts() {
  return request('/products/mine', {
    headers: {
      ...authHeader()
    }
  });
}

export async function updateProduct(productId, payload) {
  return request(`/products/${productId}`, {
    method: 'PUT',
    headers: {
      ...authHeader()
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteProduct(productId) {
  return request(`/products/${productId}`, {
    method: 'DELETE',
    headers: {
      ...authHeader()
    }
  });
}

export async function fetchAdminArtisans(page = 1, limit = 10, search = '') {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) query.set('search', search.trim());

  return request(`/admin/artisans?${query.toString()}`, {
    headers: {
      ...authHeader()
    }
  });
}

export async function deleteAdminArtisan(artisanId) {
  return request(`/admin/artisan/${artisanId}`, {
    method: 'DELETE',
    headers: {
      ...authHeader()
    }
  });
}

export async function deleteAdminProduct(productId) {
  return request(`/admin/product/${productId}`, {
    method: 'DELETE',
    headers: {
      ...authHeader()
    }
  });
}
