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

// Also listen for postMessage responses from the webpage to forward back to the extension
window.addEventListener('message', (event) => {
	// Only handle messages from the same window
	if (event.source !== window) return;
	
	// Check if this is a response to our payment request
	if (event.data && event.data.ext === 'cashu' && event.data.response) {
		console.log('💈 Payment response received from webpage:', event.data);
		
		// Forward the response to the background script if needed
		// This could be useful for logging or other purposes
		chrome.runtime.sendMessage({
			action: 'paymentResponse',
			response: event.data.response,
			requestId: event.data.id
		}).catch(() => {
			// Ignore errors if background script is not available
		});
	}
});

console.log('💈 Cashu.me content script ready to handle lightning payments');
