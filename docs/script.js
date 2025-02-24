import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getApiKey, askChatBot } from './app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
  authDomain: "eventplanner-8daa7.firebaseapp.com",
  projectId: "eventplanner-8daa7",
  storageBucket: "eventplanner-8daa7.firebasestorage.app",
  messagingSenderId: "180139946253",
  appId: "1:180139946253:web:9b487c5b102dfeded9c044",
  measurementId: "G-NC4EPER0GW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

let nav = 0;
let clicked = null;
let events = []; // Global variable to store events

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const eventTimeInput = document.getElementById('eventTimeInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function fetchEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    events = []; // Clear the global events array
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() }); // Store the document ID and data
    });
    console.log("Events fetched:", events); // Debugging
    load(); // Render the calendar after fetching events
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}


function load() {
  const dt = new Date();
  if (nav !== 0) dt.setMonth(new Date().getMonth() + nav);

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const paddingDays = weekdays.indexOf(firstDayOfMonth.toLocaleDateString('en-us', { weekday: 'long' }));

  document.getElementById('monthDisplay').innerText =
    `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventsForDay = events.filter((e) => e.date === dayString);

      if (i - paddingDays === day && nav === 0) daySquare.id = 'currentDay';

      eventsForDay.forEach((event) => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.innerHTML = `<strong>${event.time} - ${event.title}</strong>`;
        if (event.description) {
          const descriptionDiv = document.createElement('div');
          descriptionDiv.classList.add('event-description');
          descriptionDiv.innerText = event.description;
          eventDiv.appendChild(descriptionDiv);
        }
        daySquare.appendChild(eventDiv);
      });

      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}

// Open modal for adding or viewing events
function openModal(date) {
  clicked = date;
  const eventsForDay = events.filter(e => e.date === clicked);

  if (eventsForDay.length > 0) {
    document.getElementById('eventText').innerHTML = eventsForDay
      .map((e, index) => `<div><strong>${index + 1}. ${e.time} - ${e.title}</strong>${e.description ? `<p>${e.description}</p>` : ''}</div>`)
      .join('');
    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }
  backDrop.style.display = 'block';
}

// Close modal
function closeModal() {
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  eventTimeInput.value = '';
  clicked = null;
  load();
}

// Save event to Firestore
async function saveEvent() {
  const eventTitle = eventTitleInput.value.trim();
  const eventTime = eventTimeInput.value;

  if (eventTitle && eventTime) {
    const eventData = {
      date: clicked,
      time: eventTime,
      title: eventTitle,
      description: document.getElementById('eventDescriptionInput').value.trim(),
    };

    try {
      await addDoc(collection(db, 'events'), eventData);
      events.push(eventData);
      closeModal();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  } else {
    if (!eventTitle) eventTitleInput.classList.add('error');
    if (!eventTime) eventTimeInput.classList.add('error');
  }
}

// Initialize buttons
function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => { nav++; load(); });
  document.getElementById('backButton').addEventListener('click', () => { nav--; load(); });
  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('closeButton').addEventListener('click', closeModal);
  document.getElementById('closeDeleteButton').addEventListener('click', closeModal);
  document.getElementById('addEventButton').addEventListener('click', () => {
    deleteEventModal.style.display = 'none';
    newEventModal.style.display = 'block';
  });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  fetchEvents();
  initButtons();
});


// aiButton.addEventListener('click', async () => {
//   const prompt = aiInput.value.trim().toLowerCase();
//   if (prompt) {
//     if (!ruleChatBot(prompt)) {
//       // If no rule matches, send the prompt to the AI
//       try {
//         const response = await askChatBot(prompt);
//         appendMessage(`AI: ${response}`); // Display the AI's response
//       } catch (error) {
//         console.error("Error asking chatbot: ", error);
//         appendMessage("Sorry, something went wrong. Please try again.");
//       }
//     }
//   } else {
//     appendMessage("Please enter a prompt.");
//   }
//   aiInput.value = ""; // Clear the input field
// });

