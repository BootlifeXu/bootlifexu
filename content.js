let isRunning = false;
let stopRequested = false;

const statusUpdate = (status) => {
  chrome.runtime.sendMessage({ type: "automation-status", status });
};

const updateBadge = (text, color) => {
  chrome.runtime.sendMessage({ type: "automation-badge", text, color });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForElement = async (selector, timeoutMs = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(200);
  }
  throw new Error(`Timeout waiting for selector: ${selector}`);
};

const highlightElement = (element, durationMs = 800) => {
  const originalOutline = element.style.outline;
  element.style.outline = "3px solid #f97316";
  setTimeout(() => {
    element.style.outline = originalOutline;
  }, durationMs);
};

const ensureNotStopped = () => {
  if (stopRequested) {
    throw new Error("Automation stopped by user.");
  }
};

const pressKey = async (target, key, delayMs) => {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  target.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
  if (delayMs) {
    await sleep(delayMs);
  }
};

const setFieldValue = (element, value) => {
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
};

const stepHandlers = {
  wait: async ({ ms = 500 }) => {
    await sleep(ms);
  },
  waitFor: async ({ selector, timeoutMs }) => {
    if (!selector) throw new Error("waitFor requires selector");
    await waitForElement(selector, timeoutMs);
  },
  click: async ({ selector }) => {
    if (!selector) throw new Error("click requires selector");
    const element = await waitForElement(selector);
    element.click();
  },
  type: async ({ selector, text = "", clear = true }) => {
    if (!selector) throw new Error("type requires selector");
    const element = await waitForElement(selector);
    element.focus();
    if (clear) {
      setFieldValue(element, "");
    }
    setFieldValue(element, `${element.value ?? ""}${text}`);
  },
  paste: async ({ selector, text = "" }) => {
    if (!selector) throw new Error("paste requires selector");
    const element = await waitForElement(selector);
    element.focus();
    setFieldValue(element, text);
  },
  keySequence: async ({ selector, keys = [], delayMs = 100 }) => {
    if (!keys.length) throw new Error("keySequence requires keys");
    const target = selector ? await waitForElement(selector) : document.activeElement;
    if (!target) throw new Error("No active element to send keys to.");
    target.focus?.();
    for (const key of keys) {
      await pressKey(target, key, delayMs);
    }
  },
  scroll: async ({ x = 0, y = 0, behavior = "smooth" }) => {
    window.scrollBy({ top: y, left: x, behavior });
    await sleep(300);
  },
  focus: async ({ selector }) => {
    if (!selector) throw new Error("focus requires selector");
    const element = await waitForElement(selector);
    element.focus();
  },
  setValue: async ({ selector, value = "" }) => {
    if (!selector) throw new Error("setValue requires selector");
    const element = await waitForElement(selector);
    setFieldValue(element, value);
  },
  highlight: async ({ selector, durationMs = 800 }) => {
    if (!selector) throw new Error("highlight requires selector");
    const element = await waitForElement(selector);
    highlightElement(element, durationMs);
    await sleep(durationMs);
  }
};

const runSteps = async (steps = []) => {
  isRunning = true;
  stopRequested = false;
  updateBadge("RUN", "#16a34a");
  statusUpdate("Automation running...");

  try {
    for (let index = 0; index < steps.length; index += 1) {
      ensureNotStopped();
      const step = steps[index];
      const handler = stepHandlers[step.action];
      if (!handler) {
        throw new Error(`Unknown action: ${step.action}`);
      }
      statusUpdate(`Step ${index + 1}/${steps.length}: ${step.action}`);
      await handler(step);
    }
    statusUpdate("Automation completed.");
  } catch (error) {
    statusUpdate(`Error: ${error.message}`);
  } finally {
    isRunning = false;
    stopRequested = false;
    updateBadge("", "#4CAF50");
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "run-automation") {
    if (isRunning) {
      statusUpdate("Automation already running.");
      sendResponse({ ok: false, reason: "already_running" });
      return true;
    }
    runSteps(message.steps);
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "stop-automation") {
    stopRequested = true;
    statusUpdate("Stopping automation...");
    sendResponse({ ok: true });
    return true;
  }
});
