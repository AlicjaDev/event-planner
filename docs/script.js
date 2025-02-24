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
  // load();
  fetchEvents(); 
  const modal = document.getElementById('deleteModal');
  if (modal) {
    modal.style.display = 'none'; // Example of closing the modal
  }
}



function showCustomPrompt(callback) {
  // Show the modal
  const modal = document.getElementById('customPromptModal');
  const inputField = document.getElementById('eventNumberInput');
  
  // Display the modal
  modal.style.display = 'flex';

//   // Handle the submit button click


// In the showCustomPrompt function, update the submit handler:
document.getElementById('submitEventNumber').addEventListener('click', function() {
  const eventIndex = inputField.value.trim();
  if (eventIndex !== "" && !isNaN(eventIndex) && eventIndex > 0) {
    callback(parseInt(eventIndex));  // Ensure we pass a number
    modal.style.display = 'none';
    inputField.value = ''; // Clear input field
  } else {
    showCustomAlert('Invalid Input', 'Please enter a valid event number.');
  }
});

//   document.getElementById('submitEventNumber').addEventListener('click', function() {
//   //   const eventIndex = inputField.value.trim();
//   //   if (eventIndex !== "") {
//   //     callback(eventIndex);  // Pass the event index to the callback
//   //     modal.style.display = 'none';  // Close the modal after submission
//   //   } else {
//   //     alert("Please enter a valid event number.");
//   //   }
//   // });

//   const eventIndex = inputField.value.trim();
// if (eventIndex !== "" && !isNaN(eventIndex) && eventIndex > 0) {
//   callback(eventIndex);  // Pass the event index to the callback
//   modal.style.display = 'none';  // Close the modal after submission
// } else {
//   alert("Please enter a valid event number.");
// }
// });

  // Handle the cancel button click
  document.getElementById('cancelPromptModal').addEventListener('click', function() {
    modal.style.display = 'none';  // Close the modal without action
  });

  // Close the modal when clicking the "X" button
  document.getElementById('closePromptModal').addEventListener('click', function() {
    modal.style.display = 'none';  // Close the modal
  });

  // Close modal if the backdrop (area outside the modal) is clicked
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}


document.addEventListener("DOMContentLoaded", function() {
  // Your code here that interacts with DOM elements
  initButtons();
  fetchEvents();
  // Other code that needs the DOM ready
});


function showCustomAlert(title, message) {
  // Set the title and message of the alert
  document.getElementById('alertTitle').textContent = title;
  document.getElementById('alertMessage').textContent = message;
  
  // Show the alert modal and backdrop
  document.getElementById('customAlertModal').style.display = 'block';
  document.getElementById('modalBackdrop').style.display = 'block';

  // List of buttons that should close the modal
  const closeButtons = ['closeAlertButton2', 'closeAlertButton', 'modalBackdrop'];
  
  // Attach click event listener for each close button
  closeButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.onclick = closeCustomAlert;
    }
  });
}

// Close alert modal (success/incorrect)
document.getElementById('closeAlertButton').addEventListener('click', function() {
  document.getElementById('customAlertModal').style.display = 'none';
});
document.getElementById('closeAlertButton2').addEventListener('click', function() {
  document.getElementById('customAlertModal').style.display = 'none';
});

// Close delete event modal
document.getElementById('closeDeleteButton').addEventListener('click', function() {
  document.getElementById('deleteEventModal').style.display = 'none';
});

// Cancel button for delete modal
document.getElementById('cancelDeleteButton').addEventListener('click', function() {
  document.getElementById('deleteEventModal').style.display = 'none';
});

// Close new event modal
document.getElementById('closeButton').addEventListener('click', function() {
  document.getElementById('newEventModal').style.display = 'none';
});

// Close modal by clicking backdrop (optional but a nice touch)
document.getElementById('modalBackDrop').addEventListener('click', function() {
  document.getElementById('deleteEventModal').style.display = 'none';
  document.getElementById('newEventModal').style.display = 'none';
  document.getElementById('customAlertModal').style.display = 'none';
});


// Function to close the custom alert modal
function closeCustomAlert() {
  // Hide the modal and backdrop
  document.getElementById('customAlertModal').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}


// Add event listener to Delete button
document.getElementById('deleteButton').addEventListener('click', deleteEvent);
document.getElementById('closeDeleteButton').addEventListener('click', closeModal);
document.getElementById('cancelDeleteButton').addEventListener('click', closeModal);


// function deleteEvent() {
//   // Show the custom prompt modal and pass the callback function for handling input
//   showCustomPrompt(function (eventIndex) {
//     const indexToDelete = parseInt(eventIndex) - 1; // Subtract 1 to convert to zero-based index
//     const eventsForDay = events.filter(e => e.date === clicked); // Filter events for the selected day

//     if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
//       // Find the event to delete
//       const eventToDelete = eventsForDay[indexToDelete];

//       // Remove the event from the events array
//       events = events.filter(e => !(e.date === clicked && e.time === eventToDelete.time && e.title === eventToDelete.title));

//       // Save the updated events array to localStorage
//       localStorage.setItem('events', JSON.stringify(events));

//       // Show success alert
//       showCustomAlert('Event Deleted', 'The event has been deleted successfully.');
//     } else {
//       // Show error alert
//       showCustomAlert('Invalid Event', 'Invalid event number. Please try again.');
//     }
//   });
// }

function deleteEvent() {
  showCustomPrompt(async (eventIndex) => {
    const indexToDelete = parseInt(eventIndex) - 1;
    const eventsForDay = events.filter(e => e.date === clicked);

    if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
      const eventToDelete = eventsForDay[indexToDelete];
      
      try {
        // Delete from Firestore using document ID
        await deleteDoc(doc(db, 'events', eventToDelete.id));
        await fetchEvents(); // Refresh events from database
        showCustomAlert('Success', 'Event deleted successfully!');
      } catch (error) {
        console.error("Error deleting document: ", error);
        showCustomAlert('Error', 'Failed to delete event.');
      }
    } else {
      showCustomAlert('Error', 'Invalid event number.');
    }
    closeModal();
  });
}

document.getElementById('cancelDeleteButton').addEventListener('click', closeModal);


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
        // Sort the events by time using timeToMinutes function
        eventsForDay
          .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
          .forEach((event) => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerHTML = `<strong>${event.time} - ${event.title}</strong>`; // Time and title
            if (event.description) {
              // Show event description if it exists
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
    };

    try {
      // Save the event to Firestore
      await addDoc(collection(db, 'events'), eventData);

      // Re-fetch events from Firestore to include the new event
      await fetchEvents();

      closeModal();  // Close the modal after saving
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




function ruleChatBot(request) {
  if (request.startsWith("add event")) {
    let eventDetails = request.replace("add event", "").trim();
    if (eventDetails) {
      // Parse event details (title, date, time, description, etc.)
      let [title, date, time, description] = eventDetails.split(",").map(item => item.trim());
      if (title && date && time) {
        addEventToCalendar(title, date, time, description);
        appendMessage('Event ' + title + ' added!');
      } else {
        appendMessage("Please specify a title, date, and time for the event.");
      }
    } else {
      appendMessage("Please specify event details.");
    }
    return true;
  } else if (request.startsWith("remove event")) {
    let eventId = request.replace("remove event", "").trim();
    if (eventId) {
      if (removeEventFromCalendar(eventId)) {
        appendMessage('Event ' + eventId + ' removed!');
      } else {
        appendMessage("Event not found!");
      }
    } else {
      appendMessage("Please specify an event ID to remove.");
    }
    return true;
  } else if (request.startsWith("edit event")) {
    let eventDetails = request.replace("edit event", "").trim();
    if (eventDetails) {
      let [eventId, title, date, time, description] = eventDetails.split(",").map(item => item.trim());
      if (eventId && title && date && time) {
        editEventInCalendar(eventId, title, date, time, description);
        appendMessage('Event ' + title + ' updated!');
      } else {
        appendMessage("Please specify an event ID, title, date, and time for the event.");
      }
    } else {
      appendMessage("Please specify event details.");
    }
    return true;
  }

  return false;
}


aiButton.addEventListener('click', async () => {
  let prompt = aiInput.value.trim().toLowerCase();
  if (prompt) {
    if (!ruleChatBot(prompt)) {
      askChatBot(prompt);
    }
  } else {
    appendMessage("Please enter a prompt");
  }
});

function addEventToCalendar(title, date, time, description) {
  const newEventRef = firebase.database().ref('events').push();
  newEventRef.set({
    title: title,
    date: date,
    time: time,
    description: description || "",
    // email: "",
    // phone: "",
    // reminderTime: null
  }).then(() => {
    console.log("Event added successfully!");
  }).catch((error) => {
    console.error("Error adding event: ", error);
  });
}

function removeEventFromCalendar(eventId) {
  firebase.database().ref('events/' + eventId).remove()
    .then(() => {
      console.log("Event removed successfully!");
      return true;
    })
    .catch((error) => {
      console.error("Error removing event: ", error);
      return false;
    });
}

function editEventInCalendar(eventId, title, date, time, description) {
  firebase.database().ref('events/' + eventId).update({
    title: title,
    date: date,
    time: time,
    description: description || ""
  }).then(() => {
    console.log("Event updated successfully!");
  }).catch((error) => {
    console.error("Error updating event: ", error);
  });
}


function appendMessage(message) {
  let history = document.createElement("div");
  history.textContent = message;
  history.className = 'history';
  chatHistory.appendChild(history);
  aiInput.value = "";
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

// function load() {
//   console.log("Rendering calendar..."); // Debugging
//   console.log("Events:", events); // Debugging

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

//       console.log(`Events for ${dayString}:`, eventsForDay); // Debugging

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

// document.addEventListener('DOMContentLoaded', async () => {
//   await getApiKey(); // Initialize the chatbot API key and model
//   fetchEvents(); // Fetch events from Firestore
//   initButtons(); // Initialize buttons
// });

// // Initialize the calendar and month display
// document.addEventListener('DOMContentLoaded', () => {
//   initializeCalendar();
//   initializeMonthDisplay();
// });

// function initializeCalendar() {
//   const calendar = document.getElementById('calendar');
//   if (calendar) {
//     console.log('Calendar initialized');
//   } else {
//     console.error('Calendar element not found');
//   }
// }

// function initializeMonthDisplay() {
//   const monthDisplay = document.getElementById('monthDisplay');
//   if (monthDisplay) {
//     const today = new Date();
//     const month = today.toLocaleString('default', { month: 'long' });
//     const year = today.getFullYear();
//     monthDisplay.textContent = `${month} ${year}`;
//     console.log('Month display initialized');
//   } else {
//     console.error('Month display element not found');
//   }
// }
