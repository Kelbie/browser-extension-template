// Cashu.me specific content script
// This script runs only on cashu.me and handles lightning payment requests from the browser extension

console.log('💈 Cashu.me content script loaded');

// Helper function to get target origin for postMessage
function getTargetOrigin() {
	// Handle different origin types for postMessage
	if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
		return window.location.origin;
	}
	return '*'; // Use wildcard for local development
}

// Listen for postMessage responses from the webpage to forward back to the extension
window.addEventListener('message', (event) => {
	// Only handle messages from the same window
	if (event.source !== window) return;
	
	// Check if this is a response from our extension
	if (event.data && event.data.ext === 'cashu') {
		console.log('💈 Message received from webpage:', event.data);
		
		// Forward responses to the background script if needed
		if (event.data.response || event.data.type === 'frontendEvent') {
			chrome.runtime.sendMessage({
				action: 'frontendEvent',
				event: event.data.type,
				message: event.data.message,
				payload: event.data.payload || event.data.response,
				id: event.data.id
			}).catch(() => {
				// Ignore errors if background script is not available
			});
		}
	}
});

console.log('💈 Cashu.me content script ready to handle lightning payments');
