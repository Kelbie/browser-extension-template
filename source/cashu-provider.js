// Cashu Extension Provider Script
// This script runs in the webpage's context and provides the window._cashu API

(function() {
	'use strict';

	// Prevent multiple executions
	if (window._cashu && window._cashu._initialized) {
		return;
	}

	// Create the global _cashu object if it doesn't exist
	if (typeof window._cashu === 'undefined') {
		window._cashu = {};
	}

	// Store pending promises for async responses
	const pendingRequests = new Map();

	// Add the popup method
	window._cashu.popup = function(options = {}) {
		const { action, params } = options || {};
		console.log('💈 Popup method called with action:', action, 'params:', params);
		
		const messageId = Math.random().toString(36).substring(2, 15); // More unique ID
		console.log('💈 Generated message ID:', messageId);
		
		// Create a promise that resolves when we get a response
		const promise = new Promise((resolve, reject) => {
			// Store the resolve/reject functions
			pendingRequests.set(messageId, { resolve, reject });
			
			// Set a timeout to reject if no response in 30 seconds
			setTimeout(() => {
				if (pendingRequests.has(messageId)) {
					pendingRequests.delete(messageId);
					reject(new Error('Request timeout'));
				}
			}, 30000);
		});

		// Send a message to the content script
		const message = {
			ext: 'cashu',
			type: action || 'openExtension', // Default to 'openExtension' if no action provided
			params: params || {},
			id: messageId
		};
		console.log('💈 Sending message:', message);
		
		// Handle different origin types for postMessage
		let targetOrigin = '*';
		if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
			targetOrigin = window.location.origin;
		}
		
		console.log('💈 Using target origin:', targetOrigin);
		window.postMessage(message, targetOrigin);
		console.log('💈 Message sent via postMessage');
		
		// Return an object with both the promise and the messageId
		return {
			promise: promise,
			messageId: messageId,
			// Make it thenable so it can be awaited directly
			then: promise.then.bind(promise),
			catch: promise.catch.bind(promise),
			finally: promise.finally.bind(promise)
		};
	};

	// Add WebLN-like payment methods
	window._cashu.payln = function(options = {}) {
		// Only accepts object parameter: { addrOrLnurl, amount?, comment? }
		const { addrOrLnurl, amount, comment } = options;
		
		if (!addrOrLnurl) {
			console.error('💈 payln: addrOrLnurl is required');
			return Promise.reject(new Error('addrOrLnurl is required'));
		}

		console.log('💈 payln called with:', addrOrLnurl, 'amount:', amount, 'comment:', comment);
		return window._cashu.popup({ action: 'lnpay', params: { addrOrLnurl, amount, comment } });
	};

  	window._cashu.claimToken = function(options = {}) {
		// Only accepts object parameter: { token }
		const { token } = options;
		
		if (!token) {
			console.error('💈 claimToken: token is required');
			return Promise.reject(new Error('token is required'));
		}

    console.log('💈 claimToken called with:', token);
		return window._cashu.popup({ action: 'claimToken', params: { token } });
	};

	// Add enable method for WebLN compatibility
	window._cashu.enable = async function() {
		console.log('💈 Enable method called');
		return Promise.resolve();
	};

	// Add WebLN compatibility layer
	if (typeof window.webln === 'undefined') {
		window.webln = {
			enable: window._cashu.enable,
			lnurl: window._cashu.payLightningAddress,
			// Add other WebLN methods as needed
			version: '1.0.0'
		};
		console.log('💈 WebLN compatibility layer added');
	}

	// Add extension information
	window._cashu.name = 'Cashu.me';
	window._cashu.version = '0.0.11';

	// Listen for responses from the extension/iframe
	window.addEventListener('message', (event) => {
		// Only handle messages from the same window
		if (event.source !== window) return;
		
		// Log all cashu messages to debug
		if (event.data && event.data.ext === 'cashu') {
			console.log('💈 Received cashu message:', event.data);
			console.log('💈 Message type:', event.data.type);
		}
		
		// Check if this is a response to our request (handle both old and new formats)
		const isOldFormat = event.data.type === 'cashu.response';
		const isNewFormat = event.data.type === 'cashu.response';
		
		if (event.data && event.data.ext === 'cashu' && (isOldFormat || isNewFormat)) {
			console.log('💈 Received response:', event.data);
			console.log('💈 Response keys:', Object.keys(event.data));
			console.log('💈 Response format:', isNewFormat ? 'new' : 'old');
			
			let id, success, result, error;
			
			if (isNewFormat) {
				// New format: {status: 'success'/'error'/'pending'/'cancelled', payload: {...}, error: {...}}
				id = event.data.id;
				const status = event.data.status;
				success = true; // All responses from iframe are considered successful communication
				result = {
					...event.data.payload,
					status: status,
					action: event.data.action,
					error: event.data.error // Include error object in result for access
				};
				error = null; // Don't reject promise for status errors, handle them in the result
				
				console.log('💈 New format - status:', event.data.status);
				console.log('💈 New format - payload:', event.data.payload);
				console.log('💈 New format - error:', event.data.error);
				console.log('💈 New format - computed success:', success);
			} else {
				// Old format: {success: true/false, result: {...}, error: '...'}
				id = event.data.id;
				success = event.data.success;
				result = event.data.result;
				error = event.data.error;
				
				console.log('💈 Old format - success:', event.data.success);
				console.log('💈 Old format - result:', event.data.result);
				console.log('💈 Old format - error:', event.data.error);
			}
			
			console.log('💈 Parsed - id:', id, 'success:', success, 'result:', result, 'error:', error);
			
			if (pendingRequests.has(id)) {
				const { resolve, reject } = pendingRequests.get(id);
				console.log('💈 Found pending request for ID:', id);
				pendingRequests.delete(id);
				
				console.log('💈 About to resolve/reject promise for ID:', id);
				console.log('💈 Success:', success);
				console.log('💈 Raw result:', result);
				console.log('💈 Result type:', typeof result);
				
				if (success) {
					// Include the message ID in the result for tracking
					const finalResult = result ? { ...result, messageId: id } : { messageId: id };
					console.log('💈 Resolving promise with:', finalResult);
					resolve(finalResult);
				} else {
					const errorObj = new Error(error || 'Unknown error');
					errorObj.messageId = id;
					reject(errorObj);
				}
			} else {
				console.log('💈 No pending request found for ID:', id, 'Available IDs:', Array.from(pendingRequests.keys()));
			}
		}
	});

	// Mark as initialized
	window._cashu._initialized = true;
	
	// Add a test method to verify the script is working
	window._cashu.test = function() {
		console.log('💈 Test method called - provider script is working!');
		return 'Provider script is working!';
	};
	
	console.log('💈 Cashu extension API injected into webpage context:', window._cashu);
	console.log('💈 Available methods:', Object.keys(window._cashu));
})();
