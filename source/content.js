const script = document.createElement('script');
script.setAttribute('async', 'false');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.runtime.getURL('cashu-provider.js'));

// Try to inject into head first, fallback to document element
if (document.head) {
	document.head.appendChild(script);
} else {
	document.documentElement.appendChild(script);
}

// Listen for messages from the injected script
window.addEventListener('message', async (message) => {
	console.log('💈 Message event received:', message);
	console.log('💈 Message source:', message.source);
	console.log('💈 Message data:', message.data);
	// Only handle messages from the same window and with our extension identifier
	if (message.source !== window) return;
	if (!message.data) return;
	if (message.data.ext !== 'cashu') return;
	
	console.log('💈 Message received from webpage:', message.data);
	
	// Handle different message types
	if (message.data.type === 'openPopup') {
		try {
			// Send message to background script to open popup
			await chrome.runtime.sendMessage({ action: 'openPopup' });
			
			// Send success response back to webpage
			const targetOrigin = getTargetOrigin();
			window.postMessage({
				id: message.data.id,
				ext: 'cashu',
				response: { success: true }
			}, targetOrigin);
		} catch (error) {
			console.error('💈 Error opening popup:', error);
			
			// Send error response back to webpage
			const targetOrigin = getTargetOrigin();
			window.postMessage({
				id: message.data.id,
				ext: 'cashu',
				response: { error: error.message }
			}, targetOrigin);
		}
	} else if (message.data.type === 'payLightningAddress') {
		try {
			console.log('💈 Processing payment request for:', message.data.params.addrOrLnurl);
			
			// Send message to background script to handle payment
			const response = await chrome.runtime.sendMessage({ 
				action: 'payLightningAddress',
				addrOrLnurl: message.data.params.addrOrLnurl
			});
			
			// Send success response back to webpage
			const targetOrigin = getTargetOrigin();
			window.postMessage({
				id: message.data.id,
				ext: 'cashu',
				response: { success: true, result: response }
			}, targetOrigin);
		} catch (error) {
			console.error('💈 Error processing payment:', error);
			
			// Send error response back to webpage
			const targetOrigin = getTargetOrigin();
			window.postMessage({
				id: message.data.id,
				ext: 'cashu',
				response: { error: error.message }
			}, targetOrigin);
		}
	}
});

// Helper function to get target origin for postMessage
function getTargetOrigin() {
	// Handle different origin types for postMessage
	if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
		return window.location.origin;
	}
	return '*'; // Use wildcard for local development
}

// Listen for messages from iframes (for cross-origin communication)
window.addEventListener('message', async (event) => {
	// Handle messages from iframes that might contain lightning URLs
	if (event.source !== window && event.data) {
		console.log('💈 Message from iframe received:', event.data);
		
		// Check if this is a lightning payment request from an iframe
		if (event.data.type === 'lightningPayment' && event.data.lightningUrl) {
			try {
				console.log('💈 Processing iframe lightning payment:', event.data.lightningUrl);
				
				// Send to background script to open the lightning URL
				const response = await chrome.runtime.sendMessage({ 
					action: 'openLightningUrl',
					lightningUrl: event.data.lightningUrl,
					source: 'iframe'
				});
				
				// Send response back to iframe
				event.source.postMessage({
					id: event.data.id,
					type: 'lightningPaymentResponse',
					success: true,
					result: response
				}, event.origin);
			} catch (error) {
				console.error('💈 Error processing iframe payment:', error);
				
				// Send error back to iframe
				event.source.postMessage({
					id: event.data.id,
					type: 'lightningPaymentResponse',
					success: false,
					error: error.message
				}, event.origin);
			}
		}
	}
});