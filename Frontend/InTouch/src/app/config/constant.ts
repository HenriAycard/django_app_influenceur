// The API host is compiled into dev/prod builds. E2E tests point the app at a
// local backend by setting window.__API_BASE__ before the app boots (see e2e/);
// normal dev/prod builds keep the deployed backend below.
const apiBase =
	(typeof window !== 'undefined' && (window as any).__API_BASE__) ||
	'https://backend.intouch.ovh/';

export const domainConfig={
	client : 'Backend3',
	virtual_host: apiBase,
	domainApp : apiBase,
	staticStorage:"static/storage/",
    apiPrefix : "api"
}