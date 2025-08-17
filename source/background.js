// eslint-disable-next-line import/no-unassigned-import
import "./options-storage.js";

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('💈 Background received message:', message);
  
  if (message.action === "openPopup") {
    console.log('💈 Opening popup with params:', message.params);
		await chrome.action.openPopup();

		setTimeout(() => {
      console.log('💈 Sending lnpay message to popup with params:', message.params);
			chrome.runtime.sendMessage({
				action: "lnpay",
				params: message.params
			});
		}, 2000);
	}
});
