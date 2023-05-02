const calendar = document.getElementById('calendar');
const operationalDays = document.getElementById('operationalDays');
const outageDays = document.getElementById('outageDays');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let lastSelectedDay = null;
let shiftKeyPressed = false;

document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    shiftKeyPressed = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') {
    shiftKeyPressed = false;
  }
});

function generateCalendar() {
  for (let month = 0; month < 12; month++) {
    const monthElement = document.createElement('div');
    monthElement.className = 'month';

    const monthName = document.createElement('div');
    monthName.className = 'month-name';
    monthName.textContent = monthNames[month];
    monthElement.appendChild(monthName);

    const daysElement = document.createElement('div');
    daysElement.className = 'days';

    const firstDay = new Date(2023, month, 1).getDay();
    const lastDate = new Date(2023, month + 1, 0).getDate();

    for (let i = 1; i <= 42; i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'day';
      
      if (i > firstDay && i <= lastDate + firstDay) {
        const dayNumber = i - firstDay;
        dayElement.textContent = dayNumber;
        dayElement.dataset.date = `2023-${month + 1}-${dayNumber}`;
        
        dayElement.addEventListener('click', () => {
          if (shiftKeyPressed && lastSelectedDay) {
            selectRange(lastSelectedDay, dayElement);
          } else {
            dayElement.classList.toggle('outage');
          }
          if (!shiftKeyPressed) {
            lastSelectedDay = dayElement;
          }
          updateDaysCount();
          saveState();
        });
      } else {
        dayElement.style.visibility = 'hidden';
      }

      daysElement.appendChild(dayElement);
    }

    monthElement.appendChild(daysElement);
    calendar.appendChild(monthElement);
  }
}

function updateDaysCount() {
  const totalDays = document.querySelectorAll('.day[data-date]').length;
  const outageDaysCount = document.querySelectorAll('.day.outage').length;
  const operationalDaysCount = totalDays - outageDaysCount;

  operationalDays.textContent = operationalDaysCount;
  outageDays.textContent = outageDaysCount;
}

function saveState() {
  const outageDates = Array.from(document.querySelectorAll('.day.outage')).map(day => day.dataset.date);
  localStorage.setItem('outageDates', JSON.stringify(outageDates));
}

function loadState() {
  const outageDates = JSON.parse(localStorage.getItem('outageDates')) || [];
  outageDates.forEach(date => {
    const dayElement = document.querySelector(`.day[data-date="${date}"]`);
    if (dayElement) {
      dayElement.classList.add('outage');
    }
  });

  updateDaysCount();
}

function selectRange(start, end) {
  const allDays = Array.from(document.querySelectorAll('.day[data-date]'));
  const startIndex = allDays.indexOf(start);
  const endIndex = allDays.indexOf(end);

  if (startIndex < 0 || endIndex < 0) {
    return;
  }

  const rangeStart = Math.min(startIndex, endIndex);
  const rangeEnd = Math.max(startIndex, endIndex);
  const firstDayIsOutage = start.classList.contains('outage');

  for (let i = rangeStart; i <= rangeEnd; i++) {
    const dayElement = allDays[i];
    if (firstDayIsOutage) {
      dayElement.classList.remove('outage');
    } else {
      dayElement.classList.add('outage');
    }
  }
}

generateCalendar();
loadState();
