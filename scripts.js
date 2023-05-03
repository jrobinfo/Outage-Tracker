import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login');
const signupBtn = document.getElementById('signup');
const logoutBtn = document.getElementById('logout');
const loginForm = document.getElementById('login-form');

// Sign up
signupBtn.addEventListener('click', async () => {
  try {
    const email = emailInput.value;
    const password = passwordInput.value;
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

// Login
loginBtn.addEventListener('click', async () => {
  try {
    const email = emailInput.value;
    const password = passwordInput.value;
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    alert(error.message);
  }
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    loginForm.style.display = 'none';
    logoutBtn.style.display = 'block';
  } else {
    // User is signed out
    loginForm.style.display = 'block';
    logoutBtn.style.display = 'none';
  }
});

const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const addOutageBtn = document.getElementById("add-outage");
const outageData = document.getElementById("outage-data");

addOutageBtn.addEventListener('click', async () => {
  const start = new Date(startInput.value);
  const end = new Date(endInput.value);

  if (start >= end) {
    alert('Start time must be before end time.');
    return;
  }

  await addDoc(collection(db, 'outages'), { start, end });
  updateOutageData();
  updateCalendar();
});
const outagesRef = collection(db, 'outages');
onSnapshot(outagesRef, () => {
  updateOutageData();
  updateCalendar();
});

async function updateOutageData() {
  const querySnapshot = await getDocs(collection(db, 'outages'));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  let html = "<table><tr><th>Start</th><th>End</th></tr>";
  data.forEach((outage) => {
    const start = new Date(outage.start);
    const end = new Date(outage.end);
    html += `<tr><td>${start.toLocaleString()}</td><td>${end.toLocaleString()}</td></tr>`;
  });
  html += "</table>";
  outageData.innerHTML = html;
}

const calendar = document.getElementById("calendar");

function generateCalendar() {
  let html = "";

  const firstDay = new Date(2023, 0, 1);
  const lastDay = new Date(2023, 11, 31);

  for (let date = firstDay; date <= lastDay; ) {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (day === 1) {
      html += `<h2>${date.toLocaleString("en-US", { month: "long" })} ${year}</h2>`;
      html += "<table><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>";
    }

    for (let i = 0; i < date.getDay(); i++) {
      if (day === 1) {
        html += "<td></td>";
      }
    }

    html += `<td id="day-${year}-${month}-${day}" class="day">${day}</td>`;

    if (date.getDay() === 6) {
      html += "</tr>";
      if (day + 1 <= new Date(year, month + 1, 0).getDate()) {
        html += "<tr>";
      }
    }

    date.setDate(day + 1);

    if (day === new Date(year, month + 1, 0).getDate()) {
      html += "</tr></table>";
    }
  }

  calendar.innerHTML = html;
  attachDayClickListeners();
}

generateCalendar();

function attachDayClickListeners() {
  const days = document.getElementsByClassName("day");

  for (const day of days) {
    day.addEventListener("click", (event) => {
      if (event.shiftKey && lastClickedDay) {
        const startId = lastClickedDay.id;
        const endId = event.target.id;
        const [startYear, startMonth, startDay] = startId.split("-").slice(1).map(Number);
        const [endYear, endMonth, endDay] = endId.split("-").slice(1).map(Number);

        let startDate = new Date(startYear, startMonth, startDay);
        const endDate = new Date(endYear, endMonth, endDay);

        while (startDate <= endDate) {
          const dayElement = document.getElementById(`day-${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`);
          dayElement.classList.toggle("outage");
          startDate.setDate(startDate.getDate() + 1);
        }
      } else {
        event.target.classList.toggle("outage");
      }

      lastClickedDay = event.target;
    });
  }
}

let lastClickedDay = null
