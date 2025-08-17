document.addEventListener("DOMContentLoaded", () => {
	console.log("💈 Popup DOMContentLoaded fired");

	// Listen for messages from background script
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		console.log("💈 Popup received message:", message);

		console.log("💈 Processing action:", message.action, "with params:", message.params);

		const iframe = document.getElementById("cashu-iframe");
		if (iframe && iframe.contentWindow) {
			console.log(
				"💈 Sending postMessage to cashu.me with action:",
				message.action,
				"and params:",
				message.params,
			);

			iframe.contentWindow.postMessage(
				{
					ext: "cashu",
					type: message.action,
					params: message.params,
					id: Date.now(),
				},
				"*",
			);
		} else {
			console.warn("💈 cashu-iframe not found or not loaded");
		}
	});
});
