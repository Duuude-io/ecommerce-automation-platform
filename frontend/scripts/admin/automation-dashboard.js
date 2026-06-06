console.log("Admin Dashboard Loaded")
const API_URL = "http://127.0.0.1:8000/automation/logs";

const tableBody = document.getElementById("logsTable");

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

function updateMetrics(logs) {

  const total = logs.length;
  const success = logs.filter(log => log.status === "success"
  ).length;
  const failed = logs.filter(log => log.status === "failed"
  ).length;
  const successRate = total
    ? ((success / total) * 100).toFixed(1)
    : 0;

  const ordersCreated = logs.filter(
    log => log.event?.toUpperCase() === "ORDER_CREATED").length;
  const usersCreated = logs.filter(
    log => log.event?.toUpperCase() === "USER_CREATED").length;
  const usersVerified = logs.filter(
    log => log.event?.toUpperCase() === "uSER_FULLY_VERIFIED").length;
  const ordersCancelled = logs.filter(
    log => log.event?.toUpperCase() === "ORDER_CANCELLED").length;
  const usersLoggedIn = logs.filter(
    log => log.event?.toUpperCase() === "USER_LOGGED_IN").length;

  console.log(logs[0]);

  document.getElementById("totalEvents").textContent = total;
  document.getElementById("successEvents").textContent = success;

  document.getElementById("failedEvents").textContent = failed;

  document.getElementById("successRate").textContent =
    `${successRate}%`;

  document.getElementById("orderCreated").textContent =
    logs.filter(
      log => log.event?.toUpperCase() === "ORDER_CREATED"
    ).length;

  document.getElementById("orderCancelled").textContent =
    logs.filter(
      log => log.event?.toUpperCase() === "ORDER_CANCELLED"
    ).length;

  document.getElementById("userCreated").textContent =
    logs.filter(
      log => log.event?.toUpperCase() === "USER_CREATED"
    ).length;

  document.getElementById("userVerified").textContent =
    logs.filter(
      log => log.event?.toUpperCase() === "USER_FULLY_VERIFIED"
    ).length;

  document.getElementById("userLoggedIn").textContent =
    logs.filter(
      log => log.event?.toUpperCase() === "USER_LOGGED_IN"
    ).length;

  document.getElementById("viewAllLogs").textContent =
    logs.length;
}

document.querySelectorAll(".metric-card").forEach(card => {
  card.addEventListener("click", () => {

    const event = card.dataset.event;
    const status = card.dataset.status;
    const viewLogs = card.dataset.view;

    if (viewLogs === "view_all_logs") {

      window.location.href = "autoeventlogs.html";

      return;
    }

    if (status) {
      window.location.href =
        `autoeventlogs.html?status=${status}`;

      return;
    }

    if (event) {
      window.location.href =
        `autoeventlogs.html?event=${event}`;

      return;
    }
  });
});