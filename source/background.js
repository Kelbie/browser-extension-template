// eslint-disable-next-line import/no-assigned-import
import "./options-storage.js";

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('💈 Background received message:', message);
  
  if (message.action === "openPopup") {
    console.log('💈 Opening popup with params:', message.params);
		await chrome.action.openPopup();

		setTimeout(() => {
      console.log('💈 Sending message to popup with action:', message.type, 'and params:', message.params);
			chrome.runtime.sendMessage({
				action: message.type,
				params: message.params
			});
		}, 2000);
	}

  // Forward frontend events coming back from the popup (cashu.me -> popup -> background)
  if (message.action === 'frontendEvent') {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0] && tabs[0].id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'frontendEvent',
          event: message.event,
          message: message.message,
          id: message.id,
        });
      }
    } catch (err) {
      console.warn('💈 Failed to forward frontendEvent to content script:', err);
    }
  }
});
