document.addEventListener("DOMContentLoaded", () => {
	console.log('💈 Popup DOMContentLoaded fired');
	
	// Listen for messages from background script
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		console.log('💈 Popup received message:', message);
		
		if (message.action === 'lnpay') {
			console.log('💈 Processing lnpay action with params:', message.params);
			
			const iframe = document.getElementById("cashu-iframe");
			if (iframe && iframe.contentWindow) {
				console.log('💈 Sending postMessage to cashu.me with params:', message.params);
				
				iframe.contentWindow.postMessage(
					{
						ext: "cashu",
						type: "payLightningAddress",
						params: message.params,
						id: Date.now(),
					},
					"*",
				);
			} else {
				console.warn("💈 cashu-iframe not found or not loaded");
			}
		}
	});
});

document.addEventListener("DOMContentLoaded", () => {
	const openModalBtn = document.getElementById("open-modal");

	if (openModalBtn) {
		openModalBtn.addEventListener("click", () => {
			const iframe = document.getElementById("cashu-iframe");
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage(
					{
						ext: "cashu",
						type: "payLightningAddress",
						params: { addrOrLnurl: "calle@npub.cash" },
						id: Date.now(),
					},
					"*",
				);
			} else {
				console.warn("cashu-iframe not found or not loaded");
			}
		});
	} else {
		console.warn("open-modal button not found");
	}
});
