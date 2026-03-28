// API base URL.
// Priority: VITE_API_BASE_URL (build env) -> Render backend URL fallback.
export const API_BASE =
	(import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
	?? 'https://amit-uqyv.onrender.com';
