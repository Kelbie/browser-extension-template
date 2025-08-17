// eslint-disable-next-line import/no-unassigned-import
import './options-storage.js';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
		await chrome.action.openPopup();
    
    setTimeout(() => {
			chrome.runtime.sendMessage({action: 'lnpay', params: message.params});
		}, 3000);
  }
});

