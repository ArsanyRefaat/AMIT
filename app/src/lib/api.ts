// API base URL.
// Priority: VITE_API_BASE_URL (build env) -> Render backend URL fallback.
export const API_BASE =
	(import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
	?? 'https://amit-uqyv.onrender.com';

/**
 * Public portfolio images may be stored as absolute API URLs or as paths like `/uploads/portfolio/...`.
 * Relative paths must use the API origin — otherwise the browser requests the marketing site and gets 404.
 * On HTTPS pages, upgrade `http://` asset URLs to `https://` so mobile browsers do not block mixed content.
 */
export function resolvePortfolioImageUrl(url: string | null | undefined): string | null {
	const s = url?.trim();
	if (!s) return null;
	let resolved = s.startsWith('/') ? `${API_BASE}${s}` : s;
	if (
		typeof window !== 'undefined' &&
		window.location.protocol === 'https:' &&
		resolved.startsWith('http://')
	) {
		resolved = `https://${resolved.slice('http://'.length)}`;
	}
	return resolved;
}

/** Headers for authenticated CRM requests (e.g. file upload). */
export function authHeaders(): Record<string, string> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
	return token ? { Authorization: `Bearer ${token}` } : {};
}
