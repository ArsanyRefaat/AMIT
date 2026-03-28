// API base URL.
// Priority: VITE_API_BASE_URL (build env) -> Render backend URL fallback.
export const API_BASE =
	(import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
	?? 'https://amit-uqyv.onrender.com';

/** Headers for authenticated CRM requests (e.g. file upload). */
export function authHeaders(): Record<string, string> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
	return token ? { Authorization: `Bearer ${token}` } : {};
}
