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
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
let model;

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
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

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

// Fetch events from Firestore
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

// Render the calendar
function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

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

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventsForDay.length > 0) {
        eventsForDay
          .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
          .forEach((event) => {
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
      }

      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}

// Helper function to convert time to minutes past midnight
function timeToMinutes(time) {
  const [hourMin, period] = time.split(' ');
  let [hours, minutes] = hourMin.split(':').map(num => parseInt(num, 10));

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes; // Convert to total minutes since midnight
}

// Function to generate 30-minute time intervals
function generateTimeIntervals() {
  const timeOptions = [];
  const startTime = 0; // Start at 12:00 AM (0 minutes)
  const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
  const interval = 30; // 30-minute intervals

  for (let minutes = startTime; minutes < endTime; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hour12 = hours % 12 === 0 ? 12 : hours % 12; // Handle 12:00 PM and 12:00 AM correctly
    const timeString = `${String(hour12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
    timeOptions.push({ value: timeString, label: timeString });
  }

  return timeOptions;
}

// Initialize the Choices dropdown for event time
document.addEventListener('DOMContentLoaded', () => {
  const timeOptions = generateTimeIntervals();
  const timeDropdown = new Choices('#eventTimeInput', {
    choices: timeOptions,
    placeholder: true,
    placeholderValue: 'Select time',
    searchEnabled: false,
    shouldSort: false,
    itemSelectText: '',
  });
});

// Function to open the modal
function openModal(date) {
  clicked = date;

  const eventsForDay = events.filter(e => e.date === clicked);

  if (eventsForDay.length > 0) {
    // Sort events based on time in minutes
    document.getElementById('eventText').innerHTML = eventsForDay
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
      .map((e, index) => {
        return `
          <div>
            <strong>${index + 1}. ${e.time} - ${e.title}</strong>
            ${e.description ? `<p>${e.description}</p>` : ''}
          </div>
        `;
      })
      .join('');
    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  eventTimeInput.value = '';
  clicked = null;
  load();
}

// Function to save an event
async function saveEvent() {
  const eventTitle = eventTitleInput.value.trim();
  const eventTime = eventTimeInput.value;

  if (eventTitle && eventTime) {
    eventTitleInput.classList.remove('error');
    eventTimeInput.classList.remove('error');

    const eventData = {
      date: clicked,
      time: eventTime,
      title: eventTitle,
      description: document.getElementById('eventDescriptionInput').value.trim(),
      reminderTime: document.getElementById('reminderTimeInput').value ? parseInt(document.getElementById('reminderTimeInput').value) : null,
      email: document.getElementById('emailInput').value.trim(),
      phone: document.getElementById('phoneInput').value.trim(),
    };

    try {
      await addDoc(collection(db, 'events'), eventData);
      events.push(eventData); // Add the new event to the global array
      closeModal();
      load(); // Reload the calendar
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  } else {
    if (!eventTitle) {
      eventTitleInput.classList.add('error');
    }
    if (!eventTime) {
      eventTimeInput.classList.add('error');
    }
  }
}

// Initialize buttons
function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

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
document.addEventListener('DOMContentLoaded', async () => {
  await getApiKey(); // Initialize the chatbot API key and model
  fetchEvents(); // Fetch events from Firestore
  initButtons(); // Initialize buttons
});

// Function to append messages to the chat history
function appendMessage(message) {
  const chatHistory = document.getElementById('chat-history');
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = 'chat-message';
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the latest message
}

// Chatbot elements
const aiButton = document.getElementById('aiButton');
const aiInput = document.getElementById('aiInput');
const chatHistory = document.getElementById('chat-history');

// Rule-based chatbot logic
function ruleChatBot(request) {
  // Add Event
  if (request.startsWith("add event")) {
    const eventDetails = request.replace("add event", "").trim();
    const [title, date, time] = parseEventDetails(eventDetails);
    if (title && date && time) {
      addEvent(title, date, time);
      appendMessage(`Event "${title}" added on ${date} at ${time}.`);
    } else {
      appendMessage("Please specify a valid event title, date, and time.");
    }
    return true;
  }

  // Edit Event
  else if (request.startsWith("edit event")) {
    const editDetails = request.replace("edit event", "").trim();
    const [oldTitle, date, newTitle, newTime] = parseEditDetails(editDetails);
    if (oldTitle && date && newTitle && newTime) {
      editEvent(oldTitle, date, newTitle, newTime);
      appendMessage(`Event "${oldTitle}" on ${date} updated to "${newTitle}" at ${newTime}.`);
    } else {
      appendMessage("Please specify a valid event title, date, new title, and new time.");
    }
    return true;
  }

  // Remove Event
  else if (request.startsWith("remove event")) {
    const removeDetails = request.replace("remove event", "").trim();
    const [title, date] = parseRemoveDetails(removeDetails);
    if (title && date) {
      removeEvent(title, date);
      appendMessage(`Event "${title}" on ${date} removed.`);
    } else {
      appendMessage("Please specify a valid event title and date.");
    }
    return true;
  }

  // If no rule matches, return false
  return false;
}

// Function to add an event
async function addEvent(title, date, time, description = '') {
  const formattedDate = convertDateFormat(date); // Convert date format
  const formattedTime = convertTimeFormat(time); // Convert time format

  const eventData = {
    date: formattedDate,
    time: formattedTime,
    title: title,
    description: description,
  };

  try {
    await addDoc(collection(db, 'events'), eventData);
    events.push(eventData); // Add the new event to the global array
    load(); // Refresh the calendar
    console.log(`Event "${title}" added on ${formattedDate} at ${formattedTime}.`);
  } catch (error) {
    console.error("Error adding event: ", error);
  }
}

// Chatbot event listener
// document.getElementById('aiButton').addEventListener('click', async () => {
//   const prompt = document.getElementById('aiInput').value.trim().toLowerCase();
//   if (prompt) {
//     try {
//       const response = await askChatBot(prompt);
//       console.log("AI Response:", response);

//       // Parse the AI's response to extract event details
//       if (response.includes("add event")) {
//         const eventDetails = response.replace("add event", "").trim();
//         const [title, date, time] = parseEventDetails(eventDetails);
//         if (title && date && time) {
//           await addEvent(title, date, time);
//         } else {
//           console.log("Invalid event details.");
//         }
//       } else if (response.includes("remove event")) {
//         const eventDetails = response.replace("remove event", "").trim();
//         const [title, date] = parseRemoveDetails(eventDetails);
//         if (title && date) {
//           await removeEvent(title, date);
//         } else {
//           console.log("Invalid event details.");
//         }
//       }
//     } catch (error) {
//       console.error("Error asking chatbot: ", error);
//     }
//   } else {
//     console.log("Please enter a prompt.");
//   }
// });


// Chatbot event listener
document.getElementById('aiButton').addEventListener('click', async () => {
  const prompt = document.getElementById('aiInput').value.trim().toLowerCase();
  if (prompt) {
    try {
      const response = await askChatBot(prompt);
      console.log("AI Response:", response);

      // Parse the AI's response to extract event details
      if (response.includes("add event")) {
        const eventDetails = response.replace("add event", "").trim();
        const [title, date, time] = parseEventDetails(eventDetails);
        if (title && date && time) {
          await addEvent(title, date, time);
        } else {
          console.log("Invalid event details.");
        }
      } else if (response.includes("remove event")) {
        const eventDetails = response.replace("remove event", "").trim();
        const [title, date] = parseRemoveDetails(eventDetails);
        if (title && date) {
          await removeEvent(title, date);
        } else {
          console.log("Invalid event details.");
        }
      }
    } catch (error) {
      console.error("Error asking chatbot: ", error);
    }
  } else {
    console.log("Please enter a prompt.");
  }
});

// Helper function to parse event details
// function parseEventDetails(eventDetails) {
//   const parts = eventDetails.split(" on ");
//   const title = parts[0].trim();
//   const dateTime = parts[1] ? parts[1].split(" at ") : [];
//   const date = dateTime[0] ? dateTime[0].trim() : null;
//   const time = dateTime[1] ? dateTime[1].trim() : null;
//   return [title, date, time];
// }

// Helper function to parse event details
function parseEventDetails(eventDetails) {
  const parts = eventDetails.split(" on ");
  const title = parts[0].trim();
  const dateTime = parts[1] ? parts[1].split(" at ") : [];
  const date = dateTime[0] ? dateTime[0].trim() : null;
  const time = dateTime[1] ? dateTime[1].trim() : null;
  return [title, date, time];
}

// Helper function to parse edit details
function parseEditDetails(editDetails) {
  const parts = editDetails.split(" on ");
  const oldTitle = parts[0].trim();
  const dateNewDetails = parts[1] ? parts[1].split(" to ") : [];
  const date = dateNewDetails[0] ? dateNewDetails[0].trim() : null;
  const newTitleTime = dateNewDetails[1] ? dateNewDetails[1].split(" at ") : [];
  const newTitle = newTitleTime[0] ? newTitleTime[0].trim() : null;
  const newTime = newTitleTime[1] ? newTitleTime[1].trim() : null;
  return [oldTitle, date, newTitle, newTime];
}

// Helper function to parse remove details
function parseRemoveDetails(removeDetails) {
  const parts = removeDetails.split(" on ");
  const title = parts[0].trim();
  const date = parts[1] ? parts[1].trim() : null;
  return [title, date];
}

// Helper function to convert date format (e.g., "february 19 2025" -> "2/19/2025")
function convertDateFormat(dateString) {
  const months = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };

  const parts = dateString.toLowerCase().split(' ');
  const month = months[parts[0]];
  const day = parts[1];
  const year = parts[2];

  return `${month}/${day}/${year}`;
}

// Helper function to convert time format (e.g., "10:00 am" -> "10:00 AM")
function convertTimeFormat(timeString) {
  const [time, period] = timeString.split(' ');
  return `${time} ${period.toUpperCase()}`;
}

// Function to add an event
async function addEvent(title, date, time, description = '') {
  const formattedDate = convertDateFormat(date); // Convert date format
  const formattedTime = convertTimeFormat(time); // Convert time format

  const eventData = {
    date: formattedDate, // Use the converted date format
    time: formattedTime, // Use the converted time format
    title: title,
    description: description,
    email: "", // Add default values for optional fields
    phone: "",
    reminderTime: null,
  };

  try {
    await addDoc(collection(db, 'events'), eventData);
    events.push(eventData); // Add the new event to the global array
    load(); // Refresh the calendar
    console.log(`Event "${title}" added on ${formattedDate} at ${formattedTime}.`);
  } catch (error) {
    console.error("Error adding event: ", error);
  }
}

// // Helper function to convert date format (e.g., "february 19 2025" -> "2/19/2025")
// function convertDateFormat(dateString) {
//   const months = {
//     january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
//     july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
//   };

//   const parts = dateString.toLowerCase().split(' ');
//   const month = months[parts[0]];
//   const day = parts[1];
//   const year = parts[2];

//   return `${month}/${day}/${year}`;
// }

// // Helper function to convert time format (e.g., "10:00 am" -> "10:00 AM")
// function convertTimeFormat(timeString) {
//   const [time, period] = timeString.split(' ');
//   return `${time} ${period.toUpperCase()}`;
// }

// Toggle chatbot visibility
const toggleButton = document.getElementById('toggle-chatbot');
const chatbotContent = document.getElementById('chatbot-content');

toggleButton.addEventListener('click', () => {
  chatbotContent.classList.toggle('open');
});

// Initialize the calendar and month display
document.addEventListener('DOMContentLoaded', () => {
  initializeCalendar();
  initializeMonthDisplay();
});

function initializeCalendar() {
  const calendar = document.getElementById('calendar');
  if (calendar) {
    console.log('Calendar initialized');
  } else {
    console.error('Calendar element not found');
  }
}

function initializeMonthDisplay() {
  const monthDisplay = document.getElementById('monthDisplay');
  if (monthDisplay) {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    monthDisplay.textContent = `${month} ${year}`;
    console.log('Month display initialized');
  } else {
    console.error('Month display element not found');
  }
}






















// import { initializeApp } from "firebase/app";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import { getApiKey, askChatBot } from './app.js';
// import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { GoogleGenerativeAI } from '@google/generative-ai';


// let genAI;
// let model;

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
//   authDomain: "eventplanner-8daa7.firebaseapp.com",
//   projectId: "eventplanner-8daa7",
//   storageBucket: "eventplanner-8daa7.firebasestorage.app",
//   messagingSenderId: "180139946253",
//   appId: "1:180139946253:web:9b487c5b102dfeded9c044",
//   measurementId: "G-NC4EPER0GW"
// };

// // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const db = getFirestore(app); // Initialize Firestore
// // export const auth = getAuth();
// // export const provider = new GoogleAuthProvider();

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth();
// const provider = new GoogleAuthProvider();

// let nav = 0;
// let clicked = null;
// let events = []; // Global variable to store events

// const calendar = document.getElementById('calendar');
// const newEventModal = document.getElementById('newEventModal');
// const deleteEventModal = document.getElementById('deleteEventModal');
// const backDrop = document.getElementById('modalBackDrop');
// const eventTitleInput = document.getElementById('eventTitleInput');
// const eventTimeInput = document.getElementById('eventTimeInput');
// const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// // Fetch events from Firestore
// async function fetchEvents() {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'events'));
//     events = []; // Clear the global events array
//     querySnapshot.forEach((doc) => {
//       events.push({ id: doc.id, ...doc.data() }); // Store the document ID and data
//     });
//     console.log("Events fetched:", events); // Debugging
//     load(); // Render the calendar after fetching events
//   } catch (error) {
//     console.error("Error fetching events:", error);
//   }
// }

// // Render the calendar
// function load() {
//   const dt = new Date();

//   if (nav !== 0) {
//     dt.setMonth(new Date().getMonth() + nav);
//   }

//   const day = dt.getDate();
//   const month = dt.getMonth();
//   const year = dt.getFullYear();

//   const firstDayOfMonth = new Date(year, month, 1);
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//   });
//   const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

//   document.getElementById('monthDisplay').innerText =
//     `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

//   calendar.innerHTML = '';

//   for (let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventsForDay = events.filter((e) => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventsForDay.length > 0) {
//         eventsForDay
//           .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
//           .forEach((event) => {
//             const eventDiv = document.createElement('div');
//             eventDiv.classList.add('event');
//             eventDiv.innerHTML = `<strong>${event.time} - ${event.title}</strong>`;
//             if (event.description) {
//               const descriptionDiv = document.createElement('div');
//               descriptionDiv.classList.add('event-description');
//               descriptionDiv.innerText = event.description;
//               eventDiv.appendChild(descriptionDiv);
//             }
//             daySquare.appendChild(eventDiv);
//           });
//       }

//       daySquare.addEventListener('click', () => openModal(dayString));
//     } else {
//       daySquare.classList.add('padding');
//     }

//     calendar.appendChild(daySquare);
//   }
// }

// // Helper function to convert time to minutes past midnight
// function timeToMinutes(time) {
//   const [hourMin, period] = time.split(' ');
//   let [hours, minutes] = hourMin.split(':').map(num => parseInt(num, 10));

//   if (period === 'PM' && hours !== 12) {
//     hours += 12;
//   } else if (period === 'AM' && hours === 12) {
//     hours = 0;
//   }

//   return hours * 60 + minutes; // Convert to total minutes since midnight
// }

// // Function to generate 30-minute time intervals
// function generateTimeIntervals() {
//   const timeOptions = [];
//   const startTime = 0; // Start at 12:00 AM (0 minutes)
//   const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
//   const interval = 30; // 30-minute intervals

//   for (let minutes = startTime; minutes < endTime; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const hour12 = hours % 12 === 0 ? 12 : hours % 12; // Handle 12:00 PM and 12:00 AM correctly
//     const timeString = `${String(hour12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
//     timeOptions.push({ value: timeString, label: timeString });
//   }

//   return timeOptions;
// }

// // Initialize the Choices dropdown for event time
// document.addEventListener('DOMContentLoaded', () => {
//   const timeOptions = generateTimeIntervals();
//   const timeDropdown = new Choices('#eventTimeInput', {
//     choices: timeOptions,
//     placeholder: true,
//     placeholderValue: 'Select time',
//     searchEnabled: false,
//     shouldSort: false,
//     itemSelectText: '',
//   });
// });

// // Function to open the modal
// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // Sort events based on time in minutes
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
//       .map((e, index) => {
//         return `
//           <div>
//             <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//             ${e.description ? `<p>${e.description}</p>` : ''}
//           </div>
//         `;
//       })
//       .join('');
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }

// // Function to close the modal
// function closeModal() {
//   newEventModal.style.display = 'none';
//   deleteEventModal.style.display = 'none';
//   backDrop.style.display = 'none';
//   eventTitleInput.value = '';
//   eventTimeInput.value = '';
//   clicked = null;
//   load();
// }

// // Function to save an event
// async function saveEvent() {
//   const eventTitle = eventTitleInput.value.trim();
//   const eventTime = eventTimeInput.value;

//   if (eventTitle && eventTime) {
//     eventTitleInput.classList.remove('error');
//     eventTimeInput.classList.remove('error');

//     const eventData = {
//       date: clicked,
//       time: eventTime,
//       title: eventTitle,
//       description: document.getElementById('eventDescriptionInput').value.trim(),
//       reminderTime: document.getElementById('reminderTimeInput').value ? parseInt(document.getElementById('reminderTimeInput').value) : null,
//       email: document.getElementById('emailInput').value.trim(),
//       phone: document.getElementById('phoneInput').value.trim(),
//     };

//     try {
//       await addDoc(collection(db, 'events'), eventData);
//       events.push(eventData); // Add the new event to the global array
//       closeModal();
//       load(); // Reload the calendar
//     } catch (error) {
//       console.error("Error adding document: ", error);
//     }
//   } else {
//     if (!eventTitle) {
//       eventTitleInput.classList.add('error');
//     }
//     if (!eventTime) {
//       eventTimeInput.classList.add('error');
//     }
//   }
// }

// // Initialize buttons
// function initButtons() {
//   document.getElementById('nextButton').addEventListener('click', () => {
//     nav++;
//     load();
//   });

//   document.getElementById('backButton').addEventListener('click', () => {
//     nav--;
//     load();
//   });

//   document.getElementById('saveButton').addEventListener('click', saveEvent);

//   document.getElementById('cancelButton').addEventListener('click', closeModal);
//   document.getElementById('closeButton').addEventListener('click', closeModal);
//   document.getElementById('closeDeleteButton').addEventListener('click', closeModal);

//   document.getElementById('addEventButton').addEventListener('click', () => {
//     deleteEventModal.style.display = 'none';
//     newEventModal.style.display = 'block';
//   });
// }

// // Initialize the app
// document.addEventListener('DOMContentLoaded', async () => {
//   await getApiKey(); // Initialize the chatbot API key and model
//   fetchEvents(); // Fetch events from Firestore
//   initButtons(); // Initialize buttons
// });

// // Function to append messages to the chat history
// function appendMessage(message) {
//   const chatHistory = document.getElementById('chat-history');
//   const messageDiv = document.createElement('div');
//   messageDiv.textContent = message;
//   messageDiv.className = 'chat-message';
//   chatHistory.appendChild(messageDiv);
//   chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the latest message
// }

// // Chatbot elements
// const aiButton = document.getElementById('aiButton');
// const aiInput = document.getElementById('aiInput');
// const chatHistory = document.getElementById('chat-history');

// // Rule-based chatbot logic
// function ruleChatBot(request) {
//   // Add Event
//   if (request.startsWith("add event")) {
//     const eventDetails = request.replace("add event", "").trim();
//     const [title, date, time] = parseEventDetails(eventDetails);
//     if (title && date && time) {
//       addEvent(title, date, time);
//       appendMessage(`Event "${title}" added on ${date} at ${time}.`);
//     } else {
//       appendMessage("Please specify a valid event title, date, and time.");
//     }
//     return true;
//   }

//   // Edit Event
//   else if (request.startsWith("edit event")) {
//     const editDetails = request.replace("edit event", "").trim();
//     const [oldTitle, date, newTitle, newTime] = parseEditDetails(editDetails);
//     if (oldTitle && date && newTitle && newTime) {
//       editEvent(oldTitle, date, newTitle, newTime);
//       appendMessage(`Event "${oldTitle}" on ${date} updated to "${newTitle}" at ${newTime}.`);
//     } else {
//       appendMessage("Please specify a valid event title, date, new title, and new time.");
//     }
//     return true;
//   }

//   // Remove Event
//   else if (request.startsWith("remove event")) {
//     const removeDetails = request.replace("remove event", "").trim();
//     const [title, date] = parseRemoveDetails(removeDetails);
//     if (title && date) {
//       removeEvent(title, date);
//       appendMessage(`Event "${title}" on ${date} removed.`);
//     } else {
//       appendMessage("Please specify a valid event title and date.");
//     }
//     return true;
//   }

//   // If no rule matches, return false
//   return false;
// }

// // Function to add an event
// async function addEvent(title, date, time, description = '') {
//   const formattedDate = convertDateFormat(date); // Convert date format
//   const formattedTime = convertTimeFormat(time); // Convert time format

//   const eventData = {
//     date: formattedDate,
//     time: formattedTime,
//     title: title,
//     description: description,
//   };

//   try {
//     await addDoc(collection(db, 'events'), eventData);
//     events.push(eventData); // Add the new event to the global array
//     load(); // Refresh the calendar
//     console.log(`Event "${title}" added on ${formattedDate} at ${formattedTime}.`);
//   } catch (error) {
//     console.error("Error adding event: ", error);
//   }
// }

// // Chatbot event listener
// document.getElementById('aiButton').addEventListener('click', async () => {
//   const prompt = document.getElementById('aiInput').value.trim().toLowerCase();
//   if (prompt) {
//     try {
//       const response = await askChatBot(prompt);
//       console.log("AI Response:", response);

//       // Parse the AI's response to extract event details
//       if (response.includes("add event")) {
//         const eventDetails = response.replace("add event", "").trim();
//         const [title, date, time] = parseEventDetails(eventDetails);
//         if (title && date && time) {
//           await addEvent(title, date, time);
//         } else {
//           console.log("Invalid event details.");
//         }
//       } else if (response.includes("remove event")) {
//         const eventDetails = response.replace("remove event", "").trim();
//         const [title, date] = parseRemoveDetails(eventDetails);
//         if (title && date) {
//           await removeEvent(title, date);
//         } else {
//           console.log("Invalid event details.");
//         }
//       }
//     } catch (error) {
//       console.error("Error asking chatbot: ", error);
//     }
//   } else {
//     console.log("Please enter a prompt.");
//   }
// });

// // Helper function to parse event details
// function parseEventDetails(eventDetails) {
//   const parts = eventDetails.split(" on ");
//   const title = parts[0].trim();
//   const dateTime = parts[1] ? parts[1].split(" at ") : [];
//   const date = dateTime[0] ? dateTime[0].trim() : null;
//   const time = dateTime[1] ? dateTime[1].trim() : null;
//   return [title, date, time];
// }

// // Helper function to parse edit details
// function parseEditDetails(editDetails) {
//   const parts = editDetails.split(" on ");
//   const oldTitle = parts[0].trim();
//   const dateNewDetails = parts[1] ? parts[1].split(" to ") : [];
//   const date = dateNewDetails[0] ? dateNewDetails[0].trim() : null;
//   const newTitleTime = dateNewDetails[1] ? dateNewDetails[1].split(" at ") : [];
//   const newTitle = newTitleTime[0] ? newTitleTime[0].trim() : null;
//   const newTime = newTitleTime[1] ? newTitleTime[1].trim() : null;
//   return [oldTitle, date, newTitle, newTime];
// }

// // Helper function to parse remove details
// function parseRemoveDetails(removeDetails) {
//   const parts = removeDetails.split(" on ");
//   const title = parts[0].trim();
//   const date = parts[1] ? parts[1].trim() : null;
//   return [title, date];
// }

// // Function to add an event
// function addEvent(title, date, time) {
//   const eventData = {
//     date: date,
//     time: time,
//     title: title,
//     description: "", // Optional: Add description if needed
//   };

//   // Save to Firestore
//   addDoc(collection(db, 'events'), eventData)
//     .then(() => {
//       events.push(eventData); // Add the new event to the global array
//       load(); // Refresh the calendar
//     })
//     .catch((error) => {
//       console.error("Error adding event: ", error);
//     });
// }

// // Function to edit an event
// async function editEvent(oldTitle, date, newTitle, newTime) {
//   const eventIndex = events.findIndex(
//     (e) => e.title === oldTitle && e.date === date
//   );

//   if (eventIndex !== -1) {
//     const eventId = events[eventIndex].id; // Use the stored document ID
//     try {
//       await updateDoc(doc(db, 'events', eventId), {
//         title: newTitle,
//         time: newTime,
//       });
//       events[eventIndex].title = newTitle;
//       events[eventIndex].time = newTime;
//       load(); // Refresh the calendar
//     } catch (error) {
//       console.error("Error updating event: ", error);
//     }
//   } else {
//     appendMessage("Event not found.");
//   }
// }

// // Function to remove an event
// async function removeEvent(title, date) {
//   const eventIndex = events.findIndex(
//     (e) => e.title === title && e.date === date
//   );

//   if (eventIndex !== -1) {
//     const eventId = events[eventIndex].id; // Use the stored document ID
//     try {
//       await deleteDoc(doc(db, 'events', eventId));
//       events.splice(eventIndex, 1); // Remove the event from the global array
//       load(); // Refresh the calendar
//     } catch (error) {
//       console.error("Error removing event: ", error);
//     }
//   } else {
//     appendMessage("Event not found.");
//   }
// }

// // Chatbot event listener
// // aiButton.addEventListener('click', async () => {
// //   const prompt = aiInput.value.trim().toLowerCase();
// //   if (prompt) {
// //     if (!ruleChatBot(prompt)) {
// //       // If no rule matches, send the prompt to the AI
// //       try {
// //         const response = await askChatBot(prompt);
// //         appendMessage(`AI: ${response}`); // Display the AI's response
// //       } catch (error) {
// //         console.error("Error asking chatbot: ", error);
// //         appendMessage("Sorry, something went wrong. Please try again.");
// //       }
// //     }
// //   } else {
// //     appendMessage("Please enter a prompt.");
// //   }
// //   aiInput.value = ""; // Clear the input field
// // });


// document.getElementById('aiButton').addEventListener('click', async () => {
//   const prompt = document.getElementById('aiInput').value.trim().toLowerCase();
//   if (prompt) {
//     try {
//       const response = await askChatBot(prompt);
//       console.log("AI Response:", response);

//       // Parse the AI's response to extract event details
//       if (response.includes("add event")) {
//         const eventDetails = response.replace("add event", "").trim();
//         const [title, date, time] = parseEventDetails(eventDetails);
//         if (title && date && time) {
//           await addEvent(title, date, time);
//         } else {
//           console.log("Invalid event details.");
//         }
//       } else if (response.includes("remove event")) {
//         const eventDetails = response.replace("remove event", "").trim();
//         const [title, date] = parseRemoveDetails(eventDetails);
//         if (title && date) {
//           await removeEvent(title, date);
//         } else {
//           console.log("Invalid event details.");
//         }
//       }
//     } catch (error) {
//       console.error("Error asking chatbot: ", error);
//     }
//   } else {
//     console.log("Please enter a prompt.");
//   }
// });

// // Helper function to convert date format (e.g., "february 19 2025" -> "2/19/2025")
// function convertDateFormat(dateString) {
//   const months = {
//     january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
//     july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
//   };

//   const parts = dateString.toLowerCase().split(' ');
//   const month = months[parts[0]];
//   const day = parts[1];
//   const year = parts[2];

//   return `${month}/${day}/${year}`;
// }

// // Helper function to convert time format (e.g., "10:00 am" -> "10:00 AM")
// function convertTimeFormat(timeString) {
//   const [time, period] = timeString.split(' ');
//   return `${time} ${period.toUpperCase()}`;
// }





// // async function getApiKey() {
// //   try {
// //     const snapshot = await getDoc(doc(db, "apiKeys", "googleGenerativeAI"));
// //     if (snapshot.exists()) {
// //       const apiKey = snapshot.data().key;
// //       genAI = new GoogleGenerativeAI(apiKey);
// //       model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// //       console.log("Gemini AI initialized successfully.");
// //     } else {
// //       console.error("API key document not found in Firestore.");
// //       throw new Error("API key document not found in Firestore.");
// //     }
// //   } catch (error) {
// //     console.error("Error fetching API key from Firestore:", error);
// //     throw error;
// //   }
// // }

// // async function askChatBot(request) {
// //   try {
// //     const result = await model.generateContent(request);
// //     const response = await result.response;
// //     return response.text();
// //   } catch (error) {
// //     console.error("Error asking chatbot: ", error);
// //     throw error;
// //   }
// // }



// const toggleButton = document.getElementById('toggle-chatbot');
// const chatbotContent = document.getElementById('chatbot-content');

// toggleButton.addEventListener('click', () => {
//   chatbotContent.classList.toggle('open');
// });



// document.addEventListener('DOMContentLoaded', () => {
//   // Initialize the calendar and monthDisplay here
//   initializeCalendar();
//   initializeMonthDisplay();
// });


// function initializeCalendar() {
//   const calendar = document.getElementById('calendar');
//   if (calendar) {
//     // Render the calendar here
//     console.log('Calendar initialized');
//   } else {
//     console.error('Calendar element not found');
//   }
// }

// function initializeMonthDisplay() {
//   const monthDisplay = document.getElementById('monthDisplay');
//   if (monthDisplay) {
//     // Render the month display here
//     const today = new Date();
//     const month = today.toLocaleString('default', { month: 'long' });
//     const year = today.getFullYear();
//     monthDisplay.textContent = `${month} ${year}`;
//     console.log('Month display initialized');
//   } else {
//     console.error('Month display element not found');
//   }
// }


















































// OLD HERE

// // Biometric Authentication
// const biometricSignInButton = document.getElementById('biometricSignIn');

// biometricSignInButton.addEventListener('click', async () => {
//   try {
//     // Check if WebAuthn is supported
//     if (!window.PublicKeyCredential) {
//       alert("Biometric authentication is not supported in this browser.");
//       return;
//     }

//     // Fetch challenge from server (mock for now)
//     const challenge = new Uint8Array(32);
//     window.crypto.getRandomValues(challenge);

//     // Create options for WebAuthn
//     const options = {
//       challenge: challenge,
//       rp: {
//         name: "Event Planter",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "user@example.com",
//         displayName: "User",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     // Create a new credential (register user)
//     const credential = await navigator.credentials.create({
//       publicKey: options,
//     });

//     console.log("Biometric credential created:", credential);

//     // Simulate successful authentication
//     localStorage.setItem("email", "user@example.com");
//     window.location.href = "index.html";
//   } catch (error) {
//     console.error("Biometric authentication failed:", error);
//     alert("Biometric authentication failed. Please try again.");
//   }
// });


// // Generate QR Code
// document.addEventListener('DOMContentLoaded', () => {
//   const qrCodeContainer = document.getElementById('qr-code');
//   const url = "https://alicjadev.github.io/event-planner/"; // Link to your app

//   QRCode.toCanvas(qrCodeContainer, url, (error) => {
//     if (error) {
//       console.error("Error generating QR code:", error);
//     } else {
//       console.log("QR code generated successfully.");
//     }
//   });
// });



// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   doc,
//   deleteDoc,
// } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// import { getApiKey, askChatBot } from './app.js';

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
//   authDomain: "eventplanner-8daa7.firebaseapp.com",
//   projectId: "eventplanner-8daa7",
//   storageBucket: "eventplanner-8daa7.firebasestorage.app",
//   messagingSenderId: "180139946253",
//   appId: "1:180139946253:web:9b487c5b102dfeded9c044",
//   measurementId: "G-NC4EPER0GW"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app); // Initialize Firestore

// let nav = 0;
// let clicked = null;
// let events = []; // Global variable to store events

// const calendar = document.getElementById('calendar');
// const newEventModal = document.getElementById('newEventModal');
// const deleteEventModal = document.getElementById('deleteEventModal');
// const backDrop = document.getElementById('modalBackDrop');
// const eventTitleInput = document.getElementById('eventTitleInput');
// const eventTimeInput = document.getElementById('eventTimeInput');
// const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// // Fetch events from Firestore
// async function fetchEvents() {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'events'));
//     events = []; // Clear the global events array
//     querySnapshot.forEach((doc) => {
//       events.push({ id: doc.id, ...doc.data() }); // Store the document ID and data
//     });
//     console.log("Events fetched:", events); // Debugging
//     load(); // Render the calendar after fetching events
//   } catch (error) {
//     console.error("Error fetching events:", error);
//   }
// }

// // Render the calendar
// function load() {
//   const dt = new Date();

//   if (nav !== 0) {
//     dt.setMonth(new Date().getMonth() + nav);
//   }

//   const day = dt.getDate();
//   const month = dt.getMonth();
//   const year = dt.getFullYear();

//   const firstDayOfMonth = new Date(year, month, 1);
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//   });
//   const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

//   document.getElementById('monthDisplay').innerText =
//     `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

//   calendar.innerHTML = '';

//   for (let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventsForDay = events.filter((e) => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventsForDay.length > 0) {
//         eventsForDay
//           .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
//           .forEach((event) => {
//             const eventDiv = document.createElement('div');
//             eventDiv.classList.add('event');
//             eventDiv.innerHTML = `<strong>${event.time} - ${event.title}</strong>`;
//             if (event.description) {
//               const descriptionDiv = document.createElement('div');
//               descriptionDiv.classList.add('event-description');
//               descriptionDiv.innerText = event.description;
//               eventDiv.appendChild(descriptionDiv);
//             }
//             daySquare.appendChild(eventDiv);
//           });
//       }

//       daySquare.addEventListener('click', () => openModal(dayString));
//     } else {
//       daySquare.classList.add('padding');
//     }

//     calendar.appendChild(daySquare);
//   }
// }

// // Helper function to convert time to minutes past midnight
// function timeToMinutes(time) {
//   const [hourMin, period] = time.split(' ');
//   let [hours, minutes] = hourMin.split(':').map(num => parseInt(num, 10));

//   if (period === 'PM' && hours !== 12) {
//     hours += 12;
//   } else if (period === 'AM' && hours === 12) {
//     hours = 0;
//   }

//   return hours * 60 + minutes; // Convert to total minutes since midnight
// }

// // Function to generate 30-minute time intervals
// function generateTimeIntervals() {
//   const timeOptions = [];
//   const startTime = 0; // Start at 12:00 AM (0 minutes)
//   const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
//   const interval = 30; // 30-minute intervals

//   for (let minutes = startTime; minutes < endTime; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const hour12 = hours % 12 === 0 ? 12 : hours % 12; // Handle 12:00 PM and 12:00 AM correctly
//     const timeString = `${String(hour12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
//     timeOptions.push({ value: timeString, label: timeString });
//   }

//   return timeOptions;
// }

// // Initialize the Choices dropdown for event time
// document.addEventListener('DOMContentLoaded', () => {
//   const timeOptions = generateTimeIntervals();
//   const timeDropdown = new Choices('#eventTimeInput', {
//     choices: timeOptions,
//     placeholder: true,
//     placeholderValue: 'Select time',
//     searchEnabled: false,
//     shouldSort: false,
//     itemSelectText: '',
//   });
// });

// // Function to open the modal
// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // Sort events based on time in minutes
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
//       .map((e, index) => {
//         return `
//           <div>
//             <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//             ${e.description ? `<p>${e.description}</p>` : ''}
//           </div>
//         `;
//       })
//       .join('');
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }

// // Function to close the modal
// function closeModal() {
//   newEventModal.style.display = 'none';
//   deleteEventModal.style.display = 'none';
//   backDrop.style.display = 'none';
//   eventTitleInput.value = '';
//   eventTimeInput.value = '';
//   clicked = null;
//   load();
// }

// // Function to save an event
// async function saveEvent() {
//   const eventTitle = eventTitleInput.value.trim();
//   const eventTime = eventTimeInput.value;

//   if (eventTitle && eventTime) {
//     eventTitleInput.classList.remove('error');
//     eventTimeInput.classList.remove('error');

//     const eventData = {
//       date: clicked,
//       time: eventTime,
//       title: eventTitle,
//       description: document.getElementById('eventDescriptionInput').value.trim(),
//       reminderTime: document.getElementById('reminderTimeInput').value ? parseInt(document.getElementById('reminderTimeInput').value) : null,
//       email: document.getElementById('emailInput').value.trim(),
//       phone: document.getElementById('phoneInput').value.trim(),
//     };

//     try {
//       await addDoc(collection(db, 'events'), eventData);
//       events.push(eventData); // Add the new event to the global array
//       closeModal();
//       load(); // Reload the calendar
//     } catch (error) {
//       console.error("Error adding document: ", error);
//     }
//   } else {
//     if (!eventTitle) {
//       eventTitleInput.classList.add('error');
//     }
//     if (!eventTime) {
//       eventTimeInput.classList.add('error');
//     }
//   }
// }

// // Initialize buttons
// function initButtons() {
//   document.getElementById('nextButton').addEventListener('click', () => {
//     nav++;
//     load();
//   });

//   document.getElementById('backButton').addEventListener('click', () => {
//     nav--;
//     load();
//   });

//   document.getElementById('saveButton').addEventListener('click', saveEvent);

//   document.getElementById('cancelButton').addEventListener('click', closeModal);
//   document.getElementById('closeButton').addEventListener('click', closeModal);
//   document.getElementById('closeDeleteButton').addEventListener('click', closeModal);

//   document.getElementById('addEventButton').addEventListener('click', () => {
//     deleteEventModal.style.display = 'none';
//     newEventModal.style.display = 'block';
//   });
// }

// // Initialize the app
// document.addEventListener('DOMContentLoaded', async () => {
//   await getApiKey(); // Initialize the chatbot API key and model
//   fetchEvents(); // Fetch events from Firestore
//   initButtons(); // Initialize buttons
// });

// // Function to append messages to the chat history
// function appendMessage(message) {
//   const chatHistory = document.getElementById('chat-history');
//   const messageDiv = document.createElement('div');
//   messageDiv.textContent = message;
//   messageDiv.className = 'chat-message';
//   chatHistory.appendChild(messageDiv);
//   chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the latest message
// }

// // Chatbot elements
// const aiButton = document.getElementById('aiButton');
// const aiInput = document.getElementById('aiInput');
// const chatHistory = document.getElementById('chat-history');

// // Rule-based chatbot logic
// function ruleChatBot(request) {
//   // Add Event
//   if (request.startsWith("add event")) {
//     const eventDetails = request.replace("add event", "").trim();
//     const [title, date, time] = parseEventDetails(eventDetails);
//     if (title && date && time) {
//       addEvent(title, date, time);
//       appendMessage(`Event "${title}" added on ${date} at ${time}.`);
//     } else {
//       appendMessage("Please specify a valid event title, date, and time.");
//     }
//     return true;
//   }

//   // Edit Event
//   else if (request.startsWith("edit event")) {
//     const editDetails = request.replace("edit event", "").trim();
//     const [oldTitle, date, newTitle, newTime] = parseEditDetails(editDetails);
//     if (oldTitle && date && newTitle && newTime) {
//       editEvent(oldTitle, date, newTitle, newTime);
//       appendMessage(`Event "${oldTitle}" on ${date} updated to "${newTitle}" at ${newTime}.`);
//     } else {
//       appendMessage("Please specify a valid event title, date, new title, and new time.");
//     }
//     return true;
//   }

//   // Remove Event
//   else if (request.startsWith("remove event")) {
//     const removeDetails = request.replace("remove event", "").trim();
//     const [title, date] = parseRemoveDetails(removeDetails);
//     if (title && date) {
//       removeEvent(title, date);
//       appendMessage(`Event "${title}" on ${date} removed.`);
//     } else {
//       appendMessage("Please specify a valid event title and date.");
//     }
//     return true;
//   }

//   // If no rule matches, return false
//   return false;
// }

// // Helper function to parse event details
// function parseEventDetails(eventDetails) {
//   const parts = eventDetails.split(" on ");
//   const title = parts[0].trim();
//   const dateTime = parts[1] ? parts[1].split(" at ") : [];
//   const date = dateTime[0] ? dateTime[0].trim() : null;
//   const time = dateTime[1] ? dateTime[1].trim() : null;
//   return [title, date, time];
// }

// // Helper function to parse edit details
// function parseEditDetails(editDetails) {
//   const parts = editDetails.split(" on ");
//   const oldTitle = parts[0].trim();
//   const dateNewDetails = parts[1] ? parts[1].split(" to ") : [];
//   const date = dateNewDetails[0] ? dateNewDetails[0].trim() : null;
//   const newTitleTime = dateNewDetails[1] ? dateNewDetails[1].split(" at ") : [];
//   const newTitle = newTitleTime[0] ? newTitleTime[0].trim() : null;
//   const newTime = newTitleTime[1] ? newTitleTime[1].trim() : null;
//   return [oldTitle, date, newTitle, newTime];
// }

// // Helper function to parse remove details
// function parseRemoveDetails(removeDetails) {
//   const parts = removeDetails.split(" on ");
//   const title = parts[0].trim();
//   const date = parts[1] ? parts[1].trim() : null;
//   return [title, date];
// }

// // Function to add an event
// function addEvent(title, date, time) {
//   const eventData = {
//     date: date,
//     time: time,
//     title: title,
//     description: "", // Optional: Add description if needed
//   };

//   // Save to Firestore
//   addDoc(collection(db, 'events'), eventData)
//     .then(() => {
//       events.push(eventData); // Add the new event to the global array
//       load(); // Refresh the calendar
//     })
//     .catch((error) => {
//       console.error("Error adding event: ", error);
//     });
// }

// // Function to edit an event
// async function editEvent(oldTitle, date, newTitle, newTime) {
//   const eventIndex = events.findIndex(
//     (e) => e.title === oldTitle && e.date === date
//   );

//   if (eventIndex !== -1) {
//     const eventId = events[eventIndex].id; // Use the stored document ID
//     try {
//       await updateDoc(doc(db, 'events', eventId), {
//         title: newTitle,
//         time: newTime,
//       });
//       events[eventIndex].title = newTitle;
//       events[eventIndex].time = newTime;
//       load(); // Refresh the calendar
//     } catch (error) {
//       console.error("Error updating event: ", error);
//     }
//   } else {
//     appendMessage("Event not found.");
//   }
// }

// // Function to remove an event
// async function removeEvent(title, date) {
//   const eventIndex = events.findIndex(
//     (e) => e.title === title && e.date === date
//   );

//   if (eventIndex !== -1) {
//     const eventId = events[eventIndex].id; // Use the stored document ID
//     try {
//       await deleteDoc(doc(db, 'events', eventId));
//       events.splice(eventIndex, 1); // Remove the event from the global array
//       load(); // Refresh the calendar
//     } catch (error) {
//       console.error("Error removing event: ", error);
//     }
//   } else {
//     appendMessage("Event not found.");
//   }
// }

// // Chatbot event listener
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