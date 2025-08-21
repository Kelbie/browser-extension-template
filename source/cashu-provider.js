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

	// Add the popup method
	window._cashu.popup = function(options = {}) {
		const { action, params } = options || {};
		console.log('💈 Popup method called with action:', action, 'params:', params);
		// Send a message to the content script
		const message = {
			ext: 'cashu',
			type: action,
			params: params || {},
			id: Date.now()
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
	};

	// Add WebLN-like payment methods
	window._cashu.payln = async function(options = {}) {
		// Only accepts object parameter: { addrOrLnurl, amount?, comment? }
		const { addrOrLnurl, amount, comment } = options;
		
		if (!addrOrLnurl) {
			console.error('💈 payln: addrOrLnurl is required');
			return;
		}

		console.log('💈 payln called with:', addrOrLnurl, 'amount:', amount, 'comment:', comment);
		await window._cashu.popup({ action: 'lnpay', params: { addrOrLnurl, amount, comment } });
	};

  window._cashu.claimToken = async function(options = {}) {
		// Only accepts object parameter: { token }
		const { token } = options;
		
		if (!token) {
			console.error('💈 claimToken: token is required');
			return;
		}

    console.log('💈 claimToken called with:', token);
		await window._cashu.popup({ action: 'claimToken', params: { token } });
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
