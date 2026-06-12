export const domainConfig={
	client : 'Backend3',
	virtual_host:'https://backend.intouch.ovh/',
	domainApp : 'https://backend.intouch.ovh/',
	staticStorage:"static/storage/",
    apiPrefix : "api"
}

// Sentry error monitoring. Empty string = disabled. Frontend DSNs are public
// by design (they only allow submitting events, not reading them).
export const sentryDsn = 'https://72a95333232df72b32250adfe2f21a83@o4511554349039616.ingest.de.sentry.io/4511554374336592';