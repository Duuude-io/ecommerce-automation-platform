import { API_BASE_URL } from "../config.js";

console.log("Events Log Loaded")

const tableBody = document.getElementById("logsTable");
const payloadPanel = document.getElementById("payloadPanel");
const payloadData = document.getElementById("payloadData");
const closePayload = document.getElementById("closePayload");

const params = new URLSearchParams(window.location.search);
const eventFilter = params.get("event");
const statusFilter = params.get("status");

console.log(eventFilter);

let allLogs = [];

let payloadStore = {};

// AUTO LOAD + AUTO REFRESH
fetchLogs();
setInterval(fetchLogs, 60000);

//  FETCH LOGS
async function fetchLogs() {

  try {

    const response = await fetch(`${API_BASE_URL}/automation/logs`);
    const logs = await response.json();

    console.log("ALL LOGS:", logs);
    console.log("EVENT FILTER:", eventFilter);
    console.log(
      "MATCHES:",
      logs.filter(log => log.event === eventFilter)
    );

    if (!Array.isArray(logs) || logs.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='6'>No logs found</td></tr>";
      return;
    }

    let filteredLogs = logs;

    if (eventFilter) {

      filteredLogs = filteredLogs.filter(log =>
        log.event?.toUpperCase() ===
        eventFilter?.toUpperCase()
      );
    }

    if (statusFilter) {

      filteredLogs =
        filteredLogs.filter(
          log =>
            log.status === statusFilter
        );
    }

    allLogs = filteredLogs;

    drawLogs(filteredLogs);

  } catch (error) {
    console.error("Error fetching logs:", error);
    tableBody.innerHTML = "<tr><td colspan='6'>Failed to load logs</td></tr>";
  }
}

const pageTitle = document.getElementById("pageTitle");

if (eventFilter) {
  pageTitle.textContent = `${eventFilter} Logs`;
}

if (statusFilter) {
  pageTitle.textContent = `${statusFilter} Logs`;
}

// RENDER TABLE
function drawLogs(logs) {

  tableBody.innerHTML = "";

  logs.sort((a, b) => b.timestamp - a.timestamp).forEach((log, index) => {

    console.log(log);

    const row = document.createElement("tr");

    console.log("EVENT:", log.event);

    row.style.backgroundColor = getRowColor(log.event);

    // STORE PAYLOAD
    const payloadId = "payload_" + index;

    payloadStore[payloadId] = log.payload || {};

    row.innerHTML = `
      <td>${log.event || "-"}</td>
      <td>${log.handler || "-"}</td>
      <td>${formatStatus(log.status)}</td>
      <td>${log.user_name || log.name || "-"}</td>
      <td>${formatTime(log.timestamp)}</td>

      <td>
        <button class="payload-btn" onclick="viewPayload(${index})">
          View
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

}

// STATUS STYLING
function formatStatus(status) {
  if (status === "success") {
    return `<span style="color: green; font-weight: bold;">🫦 success</span>`;
  }

  if (status === "failed") {
    return `<span style="color: red; font-weight: bold;">♨️ failed</span>`;
  }

  return `<span style="color: gray;">${status || "-"}</span>`;
}

// TIME FORMAT
function formatTime(timestamp) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleString();
}

// ROW COLORS (EVENT TYPES)
function getRowColor(event = "") {

  const normalized = event
    .trim()
    .toLowerCase();

  switch (normalized) {

    case "user_created":
      return "#a7db47"; // green

    case "user_fully_verified":
      return "#ffb300"; // blue

    case "order_created":
      return "#1debde"; // orange

    case "user_logged_in":
      return "#af3dc0"; // purple

    default:
      return "#22e7e3";
  }
}

// EVENT ANALYTICS (DEBUG)

function groupByEvent(logs) {
  const grouped = {};

  logs.forEach(log => {
    grouped[log.event] = (grouped[log.event] || 0) + 1;
  });

  console.log("Event Stats:", grouped);
}

// global access
window.viewPayload = function (index) {
  const log = allLogs[index];

  let payload = log.payload || {};

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      console.error("Invalid payload JSON", e);
      payload = {};
    }
  }

  console.log(log.payload);
  console.log(typeof log.payload);

  payloadData.innerHTML = `
    <div class="payload-section">

      <div class="payload-meta">
        <span>
          <strong>Event:</strong> ${log.event}
        </span>
      </div>

      <div class="payload-meta">
        <span>
          <strong>Status:</strong> ${log.status}
        </span>
      </div>

      <pre class="payload-json">
        ${JSON.stringify(payload, null, 0.1)}
      </pre>

    </div>
  `;

  payloadPanel.classList.remove("hidden");
};

closePayload.addEventListener("click", () => {
  payloadPanel.classList.add("hidden");
  payloadData.textContent = "";
});

window.filterLogs = function (status) {

  if (status === "all") {
    drawLogs(allLogs);
    return;
  }

  const filtered = allLogs.filter(
    log => log.status === status
  );

  drawLogs(filtered);
}