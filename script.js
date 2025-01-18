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
  if (!log.date || isNaN(new Date(log.date))) {
    console.error('Error: Invalid or missing date in log:', log);
    alert('Date is required. Please enter a valid date.');
    return; // Prevent saving logs with invalid dates
  }

  const timestamp = new Date().getTime(); // Use timestamp as a unique identifier
  const logRef = ref(database, 'logs/' + timestamp); // Reference the log path
  set(logRef, log)
    .then(() => console.log('Log saved successfully'))
    .catch((error) => console.error('Error saving log:', error));
}


function editLog(logId) {
  console.log(`Attempting to edit log with ID: ${logId}`);
  
  const logRef = ref(database, 'logs/' + logId);
  onValue(logRef, (snapshot) => {
    const log = snapshot.val();
    
    if (log) {
      console.log('Log data retrieved:', log);

      // Populate form fields
      document.getElementById('date').value = log.date;
      document.getElementById('employee').value = log.employee;
      document.getElementById('feedback').value = log.feedback;
      document.getElementById('next-steps').value = log.nextSteps?.trim() || "";

      // Ensure the form is visible
      const form = document.getElementById('log-form');
      form.style.display = 'flex';

      // Change button text
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = 'Submit Edit';
      submitButton.style.backgroundColor = '#4CAF50'; // Optional styling for clarity

      // Update the form submit handler
      form.onsubmit = (e) => {
        e.preventDefault();

        const updatedLog = {
          date: document.getElementById('date').value,
          employee: document.getElementById('employee').value,
          feedback: document.getElementById('feedback').value,
          nextSteps: document.getElementById('next-steps').value.trim() || "",
        };

        console.log('Updated log:', updatedLog);

        set(logRef, updatedLog)
          .then(() => {
            console.log('Log updated successfully');
            form.reset(); // Clear the form
            form.style.display = 'none'; // Optionally hide the form

            // Reset button text to "Add Entry" for new entries
            submitButton.textContent = 'Add Entry';
            submitButton.style.backgroundColor = ''; // Reset styling
            fetchLogs(); // Refresh the display
          })
          .catch((error) => console.error('Error updating log:', error));
      };
    } else {
      console.error('Log data not found for ID:', logId);
    }
  }, (error) => {
    console.error('Error fetching log:', error);
  });
}

window.editLog = editLog;


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
    nextSteps: document.getElementById('next-steps').value || "", // Allow empty Next Steps
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
    if (!log.date || isNaN(new Date(log.date))) {
      console.warn(`Skipping log with invalid date:`, log);
      return acc; // Skip invalid date logs
    }

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
        
        ${
          log.nextSteps?.trim()
            ? `<hr class="separator"> <p><strong>Next Steps:</strong> ${log.nextSteps}</p>`
            : ""
        }
        <hr class="separator">
        <button class="edit-btn" onclick="editLog('${log.logId}')">Edit</button>
        <button class="delete-btn" onclick="deleteLog('${log.logId}')">Delete</button>
      `;
      dateGroup.appendChild(logEntry);
    });

    logDisplay.appendChild(dateGroup);
  });
}



// Function to filter logs by period (day, week, month)
function filterLogs(period) {
  const now = new Date(); // Current date and time

  // Normalize `now` to midnight (local time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const logsRef = ref(database, 'logs');
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const logs = data ? Object.entries(data) : [];

    const filteredLogs = logs.filter(([logId, log]) => {
      const logDate = new Date(log.date);

      if (period === 'day') {
        return logDate.toDateString() === today.toDateString();
      } else if (period === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return logDate >= startOfWeek && logDate <= endOfWeek;
      } else if (period === 'month') {
        return (
          logDate.getFullYear() === now.getFullYear() &&
          logDate.getMonth() === now.getMonth()
        );
      }
    });

    displayLogsGroupedByDate(filteredLogs);
  });
}

// Function to filter logs with "Next Steps"
function filterLogsWithNextSteps(logs) {
  const filteredLogs = logs.filter(([logId, log]) => log.nextSteps && log.nextSteps.trim() !== "");
  displayLogsGroupedByDate(filteredLogs);
}

// Add filter buttons
function addFilterButtons() {
  const filtersContainer = document.querySelector('.filters');

  // Existing filter buttons
  const timeFilters = [
    { label: "Today", period: "day" },
    { label: "This Week", period: "week" },
    { label: "This Month", period: "month" },
  ];

  timeFilters.forEach(({ label, period }) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = () => filterLogs(period);
    filtersContainer.appendChild(button);
  });

  // "With Next Steps" filter button
  const nextStepsFilterButton = document.createElement('button');
  nextStepsFilterButton.textContent = "With Next Steps";
  nextStepsFilterButton.onclick = () => {
    const logsRef = ref(database, 'logs');
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      const logs = data ? Object.entries(data) : [];
      filterLogsWithNextSteps(logs);
    });
  };
  filtersContainer.appendChild(nextStepsFilterButton);

  // "Show All" filter button
  const showAllButton = document.createElement('button');
  showAllButton.textContent = "Show All";
  showAllButton.onclick = fetchLogs; // Show all logs without filtering
  filtersContainer.appendChild(showAllButton);
}

// Fetch logs and display them grouped by date
function fetchLogs() {
  const logsRef = ref(database, 'logs');
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const logs = data ? Object.entries(data) : [];

    logs.forEach(([logId, log]) => {
      if (!log.date || isNaN(new Date(log.date))) {
        console.warn(`Deleting log with invalid date:`, log);
        deleteLog(logId); // Call the deleteLog function to remove invalid entries
      }
    });

    // Filter out logs with invalid dates and display the rest
    const validLogs = logs.filter(([logId, log]) => log.date && !isNaN(new Date(log.date)));
    displayLogsGroupedByDate(validLogs);
  });
}


// Function to format the date to "Day, Month Date, Year"
function formatDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

const searchInput = document.getElementById('search-query');
const searchButton = document.getElementById('search-button');

// Function to perform search
function performSearch() {
  const query = searchInput.value.toLowerCase();
  const logsRef = ref(database, 'logs');

  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const logs = data ? Object.entries(data) : [];

    const filteredLogs = logs.filter(([logId, log]) => {
      const logDate = log.date.toLowerCase();
      const logEmployee = log.employee.toLowerCase();

      // Match query against date or employee name
      return logDate.includes(query) || logEmployee.includes(query);
    });

    displayLogsGroupedByDate(filteredLogs);
    searchInput.value = ''; // Clear the search field after the search
  });
}

// Add event listener for the search button
searchButton.addEventListener('click', performSearch);

// Add event listener for pressing "Enter" in the search input
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Prevent form submission if inside a form
    performSearch(); // Trigger the search
  }
});


// Add filter buttons and fetch logs on page load
window.onload = () => {
  addFilterButtons();
  fetchLogs();
};
