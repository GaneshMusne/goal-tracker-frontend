const API_URL = 'https://goal-tracker-backend-dtcd.onrender.com/api/goals';
let goalDates = [];

const submitBtn = document.querySelector("button");
submitBtn.disabled = true;

const today = new Date();
const formattedToday = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

// Enable button only after 9 PM
if (today.getHours() >= 21) {
    submitBtn.disabled = false;
}

// Fetch data from API and process it
async function fetchGoals() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        goalDates = data.map(goal => goal.date);

        // Sort dates in ascending order
        goalDates.sort((a, b) => {
            const dateA = new Date(...a.split('/').reverse());
            const dateB = new Date(...b.split('/').reverse());
            return dateA - dateB;
        });

        // Disable button if today's date is already in the list
        if (goalDates.includes(formattedToday)) {
            submitBtn.disabled = true;
        }

        // Initialize the rest of the application
        initializeApp();
    } catch (error) {
        console.error('Error fetching goals:', error);
    }
}

// Initialize the calendar and counter
function initializeApp() {
    updateStreakCounter();
    renderCalendar();

    const navIcons = document.querySelectorAll(".icons span");
    navIcons.forEach(icon => {
        icon.addEventListener("click", handleMonthNavigation);
    });
}

// Update the streak counter based on consecutive days
function updateStreakCounter() {
    const streakCounter = document.querySelector(".counter-count");
    let streakCount = 0;

    for (let i = 0; i < goalDates.length - 1; i++) {
        const [currDay, currMonth] = goalDates[i].split('/').map(Number);
        const [nextDay, nextMonth] = goalDates[i + 1].split('/').map(Number);

        if (nextDay === currDay + 1 || (currDay === getLastDayOfMonth(currMonth) && nextDay === 1)) {
            streakCount += 1;
        } else {
            streakCount = 0;
        }
    }

    streakCounter.textContent = streakCount + 1;
}

// Render the calendar with goal dates marked
function renderCalendar() {
    const daysTag = document.querySelector(".days");
    const currentDate = document.querySelector(".current-date");

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayOfMonth = new Date(currentYear, currentMonth, lastDateOfMonth).getDay();

    let liTag = "";

    // Add previous month's days
    for (let i = firstDayOfMonth; i > 0; i--) {
        liTag += `<li class="inactive"></li>`;
    }

    // Add current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const currentDateStr = `${i}/${currentMonth + 1}/${currentYear}`;
        const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const isGoalAchieved = goalDates.includes(currentDateStr);
        const isPastUnachieved = !isGoalAchieved && new Date(currentYear, currentMonth, i) < today;

        liTag += `<li class="${isGoalAchieved ? "active" : ""} ${isToday && !isGoalAchieved ? "today" : ""} ${isPastUnachieved ? "not-achieved" : ""}">${isGoalAchieved ? "&#10004;" : i}</li>`;
    }

    // Add next month's days to fill the calendar
    for (let i = lastDayOfMonth; i < 6; i++) {
        liTag += `<li class="inactive"></li>`;
    }

    currentDate.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    daysTag.innerHTML = liTag;
}

// Handle month navigation in the calendar
function handleMonthNavigation() {
    currentMonth = this.id === "prev" ? currentMonth - 1 : currentMonth + 1;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
    }

    renderCalendar();
}

// Get the last day of the month
function getLastDayOfMonth(month) {
    return new Date(today.getFullYear(), month, 0).getDate();
}

// Get month name by index
function getMonthName(monthIndex) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
}

// Submit today's date as a goal
submitBtn.addEventListener("click", () => {
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formattedToday })
    })
        .then(response => response.json())
        .then(data => console.log('Goal submitted:', data))
        .catch(error => console.error('Error submitting goal:', error));
});

// Start by fetching the goals
initializeApp();
fetchGoals();
