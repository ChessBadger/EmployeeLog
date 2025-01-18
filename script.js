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

document.getElementById('toggle-form-btn').addEventListener('click', () => {
  const form = document.getElementById('log-form');
  const toggleBtn = document.getElementById('toggle-form-btn');
  
  if (form.style.display === 'none' || form.style.display === '') {
    form.style.display = 'flex'; // Show the form
    toggleBtn.textContent = 'Hide Entry Menu';
  } else {
    form.style.display = 'none'; // Hide the form
    toggleBtn.textContent = 'Show Entry Menu';
  }
});

// Set initial button text and form visibility on page load
window.onload = () => {
  document.getElementById('log-form').style.display = 'none'; // Ensure the form is hidden
  document.getElementById('toggle-form-btn').textContent = 'Show Entry Menu'; // Set button text
};

// Function to save log to Firebase
function saveLog(log) {
  const timestamp = new Date().getTime(); // Use timestamp as a unique identifier
  const logRef = ref(database, 'logs/' + timestamp); // Reference the log path
  set(logRef, log)
    .then(() => console.log('Log saved successfully'))
    .catch((error) => console.error('Error saving log:', error));
}

// Function to delete a log from Firebase
function deleteLog(logId) {
  const logRef = ref(database, 'logs/' + logId);
  remove(logRef)
    .then(() => console.log(`Log ${logId} deleted successfully`))
    .catch((error) => console.error('Error deleting log:', error));
}

// Make the function globally accessible
window.deleteLog = deleteLog;

// Add event listener to the form for adding new log entries
document.getElementById('log-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const newLog = {
    date: document.getElementById('date').value,
    employee: document.getElementById('employee').value,
    feedback: document.getElementById('feedback').value,
    nextSteps: document.getElementById('next-steps').value,
  };

  saveLog(newLog); // Save the new log entry to Firebase
  e.target.reset(); // Reset the form
});

// Function to display logs grouped by date
function displayLogsGroupedByDate(logs) {
  const logDisplay = document.getElementById('log-display');
  logDisplay.innerHTML = ''; // Clear existing content

  // Group logs by date
  const logsByDate = logs.reduce((acc, [logId, log]) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push({ logId, ...log });
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(logsByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Render grouped logs
  sortedDates.forEach((date) => {
    const dateGroup = document.createElement('div');
    dateGroup.classList.add('date-group');

    const formattedDate = formatDate(date); // Format the date
    dateGroup.innerHTML = `<h2>${formattedDate}</h2>`;

    logsByDate[date].forEach((log) => {
      const logEntry = document.createElement('div');
      logEntry.classList.add('log-card');
      logEntry.innerHTML = `
        <h3><strong>${log.employee}</strong></h3>
        <p><strong>Feedback:</strong> ${log.feedback}</p>
        <p><strong>Next Steps:</strong> ${log.nextSteps}</p>
        <hr class="seperator">
        <button class="delete-btn" onclick="deleteLog('${log.logId}')">Delete</button>
      `;
      dateGroup.appendChild(logEntry);
    });

    logDisplay.appendChild(dateGroup);
  });
}

// Fetch logs and display them grouped by date
function fetchLogs() {
  const logsRef = ref(database, 'logs'); // Reference the logs path
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const logs = data ? Object.entries(data) : []; // Convert Firebase data to an array of [key, value]
    displayLogsGroupedByDate(logs); // Call the grouped display function
  });
}

// Function to format the date to "Month Date, Year"
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

// Fetch logs from Firebase on page load
window.onload = () => {
  fetchLogs();
};
