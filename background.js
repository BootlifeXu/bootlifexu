chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "automation-badge") {
    chrome.action.setBadgeText({ text: message.text ?? "" });
    chrome.action.setBadgeBackgroundColor({ color: message.color ?? "#4CAF50" });
    sendResponse({ ok: true });
  }
});
