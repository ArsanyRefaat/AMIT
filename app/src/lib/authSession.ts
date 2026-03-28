/** Clears CRM login state (same keys as App session handling). */
export function clearStoredAuth(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('authEmail');
  localStorage.removeItem('authUserId');
  localStorage.removeItem('authRoles');
  localStorage.removeItem('authLastActivity');
}
