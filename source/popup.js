document.addEventListener("DOMContentLoaded", () => {
	console.log("💈 Popup DOMContentLoaded fired");

	// Listen for messages from iframe (cashu.me) and forward to background
	window.addEventListener("message", (event) => {
		const iframe = document.getElementById("cashu-iframe");
		if (!iframe || event.source !== iframe.contentWindow) return;

		const data = event.data;
		if (!data || data.ext !== "cashu") return;

		// Handle generic frontend events from cashu.me
		if (data.type === "frontendEvent" || data.event) {
			chrome.runtime.sendMessage({
				action: "frontendEvent",
				event: data.event || data.type,
				message: data.message,
				payload: data.payload,
				id: data.id,
			});
			return;
		}

		// Handle extension responses (results from iframe actions) - support both old and new formats
		if (data.type === "cashu.response" || data.type === "cashu.response") {
			console.log("💈 Popup received response from iframe:", data);
			console.log("💈 Response type:", data.type);
			
			// Forward the complete response data to background
			chrome.runtime.sendMessage({
				action: "cashu.response",
				responseData: data, // Forward the complete response
				id: data.id,
			});
			return;
		}
	});

	// Listen for messages from background script
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		console.log("💈 Popup received message:", message);

		// Only handle messages from our extension
		if (message.ext !== 'cashu') return;

		console.log("💈 Processing type:", message.type, "with params:", message.params);

		const iframe = document.getElementById("cashu-iframe");
		if (iframe && iframe.contentWindow) {
			console.log(
				"💈 Sending postMessage to cashu.me with type:",
				message.type,
				"and params:",
				message.params,
			);

			iframe.contentWindow.postMessage(
				{
					ext: "cashu",
					type: message.type,
					params: message.params,
					id: message.id || Date.now(),
				},
				"*",
			);
		} else {
			console.warn("💈 cashu-iframe not found or not loaded");
		}
	});
});
