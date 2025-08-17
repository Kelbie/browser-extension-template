document.addEventListener("DOMContentLoaded", () => {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const iframe = document.getElementById("cashu-iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        ext: 'cashu',
        type: 'payLightningAddress',
        params: { addrOrLnurl: 'calle@npub.cash' },
        id: Date.now()
      }, "*");
    } else {
      console.warn("cashu-iframe not found or not loaded");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const openModalBtn = document.getElementById("open-modal");

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      const iframe = document.getElementById("cashu-iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          ext: 'cashu',
          type: 'payLightningAddress',
          params: { addrOrLnurl: 'calle@npub.cash' },
          id: Date.now()
        }, "*");
      } else {
        console.warn("cashu-iframe not found or not loaded");
      }
    });
  } else {
    console.warn("open-modal button not found");
  }
});