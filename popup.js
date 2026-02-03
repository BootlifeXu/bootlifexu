const runButton = document.getElementById("run");
const stopButton = document.getElementById("stop");
const loadExampleButton = document.getElementById("load-example");
const stepsField = document.getElementById("steps");
const statusLog = document.getElementById("status-log");
const activeUrl = document.getElementById("active-url");
const loopCountField = document.getElementById("loop-count");
const csvFileField = document.getElementById("csv-file");
const csvSummary = document.getElementById("csv-summary");

const exampleSteps = [
  { action: "wait", ms: 1000 },
  { action: "highlight", selector: "input, textarea", durationMs: 800 },
  { action: "waitFor", selector: "input[type='search']", timeoutMs: 5000 },
  { action: "paste", selector: "input[type='search']", text: "{{value}}" },
  { action: "keySequence", keys: ["Enter"], delayMs: 150 },
  { action: "wait", ms: 500 },
  { action: "scroll", y: 600, behavior: "smooth" }
];

let csvRows = [];

function setStatus(text) {
  statusLog.textContent = text;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadSavedSteps() {
  const { savedSteps, savedLoopCount, savedCsvText } = await chrome.storage.local.get([
    "savedSteps",
    "savedLoopCount",
    "savedCsvText"
  ]);
  stepsField.value = savedSteps ?? JSON.stringify(exampleSteps, null, 2);
  loopCountField.value = savedLoopCount ?? 1;
  if (savedCsvText) {
    csvRows = parseCsv(savedCsvText);
    updateCsvSummary();
  }
}

function updateActiveUrl(tab) {
  activeUrl.textContent = tab?.url ? tab.url : "No active tab";
}

function updateCsvSummary() {
  if (!csvRows.length) {
    csvSummary.textContent = "No CSV loaded.";
    return;
  }
  const fields = Object.keys(csvRows[0] ?? {});
  csvSummary.textContent = `Loaded ${csvRows.length} row(s). Fields: ${fields.join(", ")}`;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function applyTemplate(value, rowContext) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\{\{\s*index\s*\}\}/g, String(rowContext.index))
    .replace(/\{\{\s*value\s*\}\}/g, String(rowContext.value ?? ""))
    .replace(/\{\{\s*row\.([\w-]+)\s*\}\}/g, (_, key) =>
      String(rowContext.row?.[key] ?? "")
    );
}

function expandSteps(steps, rowContext) {
  return steps.map((step) => {
    const expanded = {};
    Object.entries(step).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        expanded[key] = value.map((entry) => applyTemplate(entry, rowContext));
      } else if (value && typeof value === "object") {
        expanded[key] = JSON.parse(
          applyTemplate(JSON.stringify(value), rowContext)
        );
      } else {
        expanded[key] = applyTemplate(value, rowContext);
      }
    });
    return expanded;
  });
}

async function runAutomation() {
  try {
    const steps = JSON.parse(stepsField.value);
    const loopCount = Math.max(1, Number.parseInt(loopCountField.value, 10) || 1);

    await chrome.storage.local.set({
      savedSteps: stepsField.value,
      savedLoopCount: loopCount
    });

    const tab = await getActiveTab();
    if (!tab?.id) {
      setStatus("No active tab found.");
      return;
    }

    const rowsToUse = csvRows.length
      ? csvRows
      : [{ value: "", index: 1, row: {} }];

    const expandedSteps = [];

    rowsToUse.forEach((row, rowIndex) => {
      const rowContext = {
        row,
        value: Object.values(row)[0] ?? "",
        index: rowIndex + 1
      };
      const templatedSteps = expandSteps(steps, rowContext);
      for (let loopIndex = 0; loopIndex < loopCount; loopIndex += 1) {
        expandedSteps.push(...templatedSteps);
      }
    });

    setStatus("Starting automation...");
    await chrome.tabs.sendMessage(tab.id, {
      type: "run-automation",
      steps: expandedSteps
    });
  } catch (error) {
    setStatus(`Invalid JSON: ${error.message}`);
  }
}

async function stopAutomation() {
  const tab = await getActiveTab();
  if (!tab?.id) {
    setStatus("No active tab found.");
    return;
  }
  await chrome.tabs.sendMessage(tab.id, { type: "stop-automation" });
  setStatus("Stop request sent.");
}

csvFileField.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    csvRows = [];
    updateCsvSummary();
    await chrome.storage.local.remove("savedCsvText");
    return;
  }
  const text = await file.text();
  csvRows = parseCsv(text);
  updateCsvSummary();
  await chrome.storage.local.set({ savedCsvText: text });
});

runButton.addEventListener("click", runAutomation);
stopButton.addEventListener("click", stopAutomation);
loadExampleButton.addEventListener("click", () => {
  stepsField.value = JSON.stringify(exampleSteps, null, 2);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "automation-status") {
    setStatus(message.status);
  }
});

(async () => {
  const tab = await getActiveTab();
  updateActiveUrl(tab);
  await loadSavedSteps();
})();
