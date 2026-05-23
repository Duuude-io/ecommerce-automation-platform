console.log("Admin Dashboard Loaded")
const API_URL = "http://127.0.0.1:8000/automation/logs";

const tableBody = document.getElementById("logsTable");

const payloadPanel = document.getElementById("payloadPanel");
const payloadData = document.getElementById("payloadData");
const closePayload = document.getElementById("closePayload");

let allLogs = [];

let payloadStore = {};

// AUTO LOAD + AUTO REFRESH
fetchLogs();
setInterval(fetchLogs, 60000);

//  FETCH LOGS
async function fetchLogs() {
  try {
    const response = await fetch(API_URL);
    const logs = await response.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='6'>No logs found</td></tr>";
      return;
    }

    allLogs = logs;
    drawLogs(logs);
    updateMetrics(logs);

  } catch (error) {
    console.error("Error fetching logs:", error);
    tableBody.innerHTML = "<tr><td colspan='6'>Failed to load logs</td></tr>";
  }
}

// RENDER TABLE
function drawLogs(logs) {
  tableBody.innerHTML = "";

  logs
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((log, index) => {

      const row = document.createElement("tr");

      row.style.backgroundColor = getRowColor(log.event);

      // STORE PAYLOAD
      const payloadId = "payload_" + index;

      payloadStore[payloadId] = log.payload || {};

      row.innerHTML = `
        <td>${log.event || "-"}</td>
        <td>${log.handler || "-"}</td>
        <td>${formatStatus(log.status)}</td>
        <td>${log.name || "-"}</td>
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

function updateMetrics(logs) {

  const total = logs.length;

  const success = logs.filter(
    log => log.status === "success"
  ).length;

  const failed = logs.filter(
    log => log.status === "failed"
  ).length;

  const successRate = total
    ? ((success / total) * 100).toFixed(1)
    : 0;

  document.getElementById("totalEvents").textContent = total;

  document.getElementById("successEvents").textContent = success;

  document.getElementById("failedEvents").textContent = failed;

  document.getElementById("successRate").textContent =
    `${successRate}%`;
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
function getRowColor(event) {
  switch (event) {
    case "user_created":
      return "#a7db47"; // green

    case "user_fully_verified":
      return "#6fa7cf"; // blue

    case "order_created":
      return "#ecbe73"; // orange

    case "user_logged_in":
      return "#dc9ee6"; // purple

    default:
      return "#966060";
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
        <span><strong>Event:</strong> ${log.event}</span>
        <span><strong>Handler:</strong> ${log.handler}</span>
        <span><strong>Status:</strong> ${log.status}</span>
      </div>

      <pre class="payload-json">
    ${JSON.stringify(payload, null, 2)}
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
    updateMetrics(allLogs);
    return;
  }

  const filtered = allLogs.filter(
    log => log.status === status
  );

  drawLogs(filtered);
  updateMetrics(filtered);
}