// Shared helpers for admin dashboard

export function getAdminAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ibs-admin-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
