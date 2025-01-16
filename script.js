let logs = []; // Initialize logs array

// Fetch initial data from logs.json
fetch('logs.json')
  .then((response) => response.json())
  .then((data) => {
    logs = data; // Load logs from JSON file
    // Merge with localStorage logs if available
    const localLogs = JSON.parse(localStorage.getItem('logs')) || [];
    logs = [...logs, ...localLogs]; // Combine both sources
    displayLogs(logs); // Display the logs
  })
  .catch((error) => console.error('Error loading logs:', error));

// Add event listener to the form for adding new log entries
document.getElementById('log-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Get the date value and ensure it's correctly formatted
  const dateInput = document.getElementById('date').value;
  const localDate = new Date(dateInput); // Treat the selected date as local time

  const newLog = {
    date: localDate.toISOString().split('T')[0], // Store date in YYYY-MM-DD format
    employee: document.getElementById('employee').value,
    interaction: document.getElementById('interaction').value,
    topics: document.getElementById('topics').value,
    feedback: document.getElementById('feedback').value,
    nextSteps: document.getElementById('next-steps').value,
  };

  // Add the new log to the logs array
  logs.push(newLog);

  // Save new logs to localStorage
  localStorage.setItem('logs', JSON.stringify(logs));

  // Refresh the display
  displayLogs(logs);

  // Reset the form
  e.target.reset();
});

// Function to display logs in the log-display section
function displayLogs(filteredLogs) {
  const logDisplay = document.getElementById('log-display');
  logDisplay.innerHTML = ''; // Clear existing content

  // Render each log as a card
  filteredLogs.forEach((log) => {
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `
      <p><strong>Date:</strong> ${log.date}</p>
      <p><strong>Employee:</strong> ${log.employee}</p>
      <p><strong>Interaction:</strong> ${log.interaction}</p>
      <p><strong>Topics:</strong> ${log.topics}</p>
      <p><strong>Feedback:</strong> ${log.feedback}</p>
      <p><strong>Next Steps:</strong> ${log.nextSteps}</p>
      <hr>
    `;
    logDisplay.appendChild(logEntry);
  });
}

// Function to filter logs by time periods
function filterLogs(period) {
  const now = new Date(); // Current date and time

  // Normalize `now` to midnight (local time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const filteredLogs = logs.filter((log) => {
    const logDate = parseLocalDate(log.date); // Parse the log date

    // Normalize `logDate` to midnight (local time)
    const normalizedLogDate = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

    if (period === 'day') {
      // Compare normalized dates for "Today"
      return normalizedLogDate.getTime() === today.getTime();
    } else if (period === 'week') {
      // Start and end of the current week (normalized)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday of this week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Saturday of this week

      return normalizedLogDate >= weekStart && normalizedLogDate <= weekEnd;
    } else if (period === 'month') {
      // Match the year and month
      return (
        logDate.getFullYear() === now.getFullYear() &&
        logDate.getMonth() === now.getMonth()
      );
    }
  });

  displayLogs(filteredLogs); // Display the filtered logs
}

// Helper function to parse dates as local time
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Months are 0-indexed in JS
}


// Function to show all logs
function showAllLogs() {
  displayLogs(logs);
}

// Display all logs on page load
