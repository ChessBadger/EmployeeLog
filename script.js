// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3zqBVlxSK5XRt51OS1oyxL4eXRArsrjQ",
  authDomain: "employeelog-75e30.firebaseapp.com",
  databaseURL: "https://employeelog-75e30-default-rtdb.firebaseio.com",
  projectId: "employeelog-75e30",
  storageBucket: "employeelog-75e30.firebasestorage.app",
  messagingSenderId: "815734911458",
  appId: "1:815734911458:web:d10d9ada745d85581149bb",
  measurementId: "G-TCDJGB05ED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to save log to Firebase
function saveLog(log) {
  const timestamp = new Date().getTime(); // Use timestamp as a unique identifier
  const logRef = ref(database, 'logs/' + timestamp); // Reference the log path
  set(logRef, log)
    .then(() => console.log('Log saved successfully'))
    .catch((error) => console.error('Error saving log:', error));
}

// Function to delete a log from Firebase
// Function to delete a log from Firebase
function deleteLog(logId) {
  const logRef = ref(database, 'logs/' + logId);
  remove(logRef)
    .then(() => console.log(`Log ${logId} deleted successfully`))
    .catch((error) => console.error('Error deleting log:', error));
}

// Make the function globally accessible
window.deleteLog = deleteLog;


// Function to fetch and display logs from Firebase
function fetchLogs() {
  const logsRef = ref(database, 'logs'); // Reference the logs path
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const logs = data ? Object.entries(data) : []; // Convert Firebase data to an array of [key, value]
    displayLogs(logs); // Call your existing display function to show logs
  });
}

// Add event listener to the form for adding new log entries
document.getElementById('log-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const newLog = {
    date: document.getElementById('date').value,
    employee: document.getElementById('employee').value,
    interaction: document.getElementById('interaction').value,
    topics: document.getElementById('topics').value,
    feedback: document.getElementById('feedback').value,
    nextSteps: document.getElementById('next-steps').value,
  };

  saveLog(newLog); // Save the new log entry to Firebase
  e.target.reset(); // Reset the form
});

// Function to display logs in the log-display section
function displayLogs(logs) {
  const logDisplay = document.getElementById('log-display');
  logDisplay.innerHTML = ''; // Clear existing content

  // Sort logs by date in descending order
  logs.sort(([idA, logA], [idB, logB]) => {
    const dateA = new Date(logA.date);
    const dateB = new Date(logB.date);
    return dateB - dateA; // Most recent dates first
  });

  // Render each log as a card
  logs.forEach(([logId, log]) => {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-card');
    logEntry.innerHTML = `
      <h1><strong>${log.employee}</strong> </h1>
      <hr class="separator">
      <h3><strong>${formatDate(log.date)}</strong> </h3>
      <p><strong>Interaction:</strong> ${log.interaction}</p>
      <p><strong>Topics:</strong> ${log.topics}</p>
      <p><strong>Feedback:</strong> ${log.feedback}</p>
      <p><strong>Next Steps:</strong> ${log.nextSteps}</p>
      <hr class="separator">
      <button class="delete-btn" onclick="deleteLog('${logId}')">Delete</button>
    `;
    logDisplay.appendChild(logEntry);
  });
}


// Function to format the date to "Month Date, Year"
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

// Function to filter logs by time periods
function filterLogs(period) {
  const now = new Date(); // Current date and time

  // Normalize `now` to midnight (local time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Fetch logs dynamically from Firebase
  const logsRef = ref(database, 'logs');
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const logs = data ? Object.entries(data) : []; // Convert Firebase data to an array of [key, value]

    const filteredLogs = logs.filter(([logId, log]) => {
      const logDate = parseLocalDate(log.date); // Parse the log date

      // Normalize `logDate` to midnight (local time)
      const normalizedLogDate = new Date(
        logDate.getFullYear(),
        logDate.getMonth(),
        logDate.getDate()
      );

      if (period === 'day') {
        return normalizedLogDate.getTime() === today.getTime();
      } else if (period === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Sunday of this week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Saturday of this week

        return normalizedLogDate >= weekStart && normalizedLogDate <= weekEnd;
      } else if (period === 'month') {
        return (
          logDate.getFullYear() === now.getFullYear() &&
          logDate.getMonth() === now.getMonth()
        );
      }
    });

    // Display the filtered logs
    displayLogs(filteredLogs);
  });
}
window.filterLogs = filterLogs;

// Helper function to parse dates as local time
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Months are 0-indexed in JS
}

// Function to show all logs
function showAllLogs() {
  fetchLogs(); // Display all logs from Firebase
}
window.showAllLogs = showAllLogs;

// Fetch logs from Firebase on page load
window.onload = () => {
  fetchLogs();
};
