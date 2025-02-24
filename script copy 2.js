let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const eventTimeInput = document.getElementById('eventTimeInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


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


// document.addEventListener('DOMContentLoaded', () => {
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


document.addEventListener('DOMContentLoaded', () => {
  // Generate time options
  const timeOptions = generateTimeIntervals();

  // Initialize the Choices dropdown for event time
  const timeDropdown = new Choices('#eventTimeInput', {
    choices: timeOptions,
    placeholder: true,
    placeholderValue: 'Select time',
    searchEnabled: false,
    shouldSort: false,
    itemSelectText: '',
  });
});

  // const timeDropdown = new Choices('#eventTimeInput', {
  //   choices: timeOptions,
  //   placeholder: true,
  //   placeholderValue: 'Select time',
  //   searchEnabled: false,
  //   shouldSort: false,
  //   itemSelectText: '',
  // });


// });

// function showCustomPrompt(callback) {
//   const eventIndex = prompt("Enter the event number to delete:");  // Simple prompt to get event index
//   if (eventIndex !== null && eventIndex !== "") {
//     callback(eventIndex);  // Pass the input to the callback function
//   }
// }


function showCustomPrompt(callback) {
  // Show the modal
  const modal = document.getElementById('customPromptModal');
  const inputField = document.getElementById('eventNumberInput');
  
  // Display the modal
  modal.style.display = 'flex';

  // Handle the submit button click
  document.getElementById('submitEventNumber').addEventListener('click', function() {
    const eventIndex = inputField.value.trim();
    if (eventIndex !== "") {
      callback(eventIndex);  // Pass the event index to the callback
      modal.style.display = 'none';  // Close the modal after submission
    } else {
      alert("Please enter a valid event number.");
    }
  });

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


function deleteEvent() {
  // Show the custom prompt modal and pass the callback function for handling input
  showCustomPrompt(function (eventIndex) {
    const indexToDelete = parseInt(eventIndex) - 1; // Subtract 1 to convert to zero-based index
    const eventsForDay = events.filter(e => e.date === clicked); // Filter events for the selected day

    if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
      // Find the event to delete
      const eventToDelete = eventsForDay[indexToDelete];

      // Remove the event from the events array
      events = events.filter(e => !(e.date === clicked && e.time === eventToDelete.time && e.title === eventToDelete.title));

      // Save the updated events array to localStorage
      localStorage.setItem('events', JSON.stringify(events));

      // Show success alert
      showCustomAlert('Event Deleted', 'The event has been deleted successfully.');
    } else {
      // Show error alert
      showCustomAlert('Invalid Event', 'Invalid event number. Please try again.');
    }
  });
}

document.getElementById('cancelDeleteButton').addEventListener('click', closeModal); // This is missing


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

function closeModal() {
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  eventTimeInput.value = '';
  clicked = null;
  load();
}

function saveEvent() {
  const eventTitle = eventTitleInput.value.trim();
  const eventTime = eventTimeInput.value; // Get the selected time from the dropdown

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

    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));

    if (eventData.reminderTime) {
      setReminder(eventData);
    }

    closeModal();
  } else {
    if (!eventTitle) {
      eventTitleInput.classList.add('error');
    }
    if (!eventTime) {
      eventTimeInput.classList.add('error');
    }
  }
}

function initButtons() {
  // Button event listeners
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

  // Save event button
  document.getElementById('saveButton').addEventListener('click', saveEvent);

  // Close modal button
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('closeButton').addEventListener('click', closeModal);
  document.getElementById('closeDeleteButton').addEventListener('click', closeModal); // Close button for delete modal

  // Add New Event button
  document.getElementById('addEventButton').addEventListener('click', () => {
    deleteEventModal.style.display = 'none';
    newEventModal.style.display = 'block';
  });

}


// // Function to render the calendar and display events dynamically
// function renderCalendar() {
//   const calendar = document.getElementById('calendar');
//   calendar.innerHTML = ''; // Clear current events

//   // Get events from localStorage
//   const events = JSON.parse(localStorage.getItem('events')) || [];

//   // Loop through the events and display them on the calendar
//   events.forEach((event, index) => {
//     const eventElement = document.createElement('div');
//     eventElement.classList.add('event');
//     eventElement.innerHTML = `
//       <div class="event-time">${event.time}</div>
//       <div class="event-title">${event.title}</div>
//       <div class="event-description">${event.description}</div>
//       <button class="edit-event-button" onclick="openEditEventModal(${index})">Edit</button>
//     `;
//     calendar.appendChild(eventElement);
//   });
// }

// // Open the "Edit Event" modal and pre-fill it with existing event data
// function openEditEventModal(index) {
//   const events = JSON.parse(localStorage.getItem('events')) || [];
//   const event = events[index];
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventDescription').value = event.description;
//   document.getElementById('editEventTime').value = event.time;
//   document.getElementById('editEventModal').style.display = 'flex';

//   // Store the index of the event being edited in a hidden input
//   document.getElementById('editEventIndex').value = index;
// }

// // Close the "Edit Event" modal
// document.getElementById('closeEditModal').addEventListener('click', function () {
//   document.getElementById('editEventModal').style.display = 'none';
// });

// // Save changes to the event
// document.getElementById('submitEditEvent').addEventListener('click', function () {
//   const events = JSON.parse(localStorage.getItem('events')) || [];
//   const index = parseInt(document.getElementById('editEventIndex').value);
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value.trim();

//   if (updatedTitle === '' || updatedDescription === '') {
//     alert("Please fill in all fields!");
//     return;
//   }

//   // Update the event in the events array
//   events[index] = { title: updatedTitle, description: updatedDescription, time: updatedTime };

//   // Save the updated events array back to localStorage
//   saveEvents(events);

//   // Close the modal and re-render the calendar
//   document.getElementById('editEventModal').style.display = 'none';
//   renderCalendar();
// });

// // Cancel editing the event
// document.getElementById('cancelEditEvent').addEventListener('click', function () {
//   document.getElementById('editEventModal').style.display = 'none';
// });



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
//             <button class="editEventButton" onclick="openEditModal(${index})">Edit</button>
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


// function openEditModal(eventIndex) {
//   const event = events[eventIndex];

//   // Pre-fill the modal fields with event data
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventTime').value = event.time;
//   document.getElementById('editEventDescription').value = event.description;

//   // Show the modal
//   document.getElementById('editEventModal').style.display = 'block';

//   // Store the index of the event being edited
//   document.getElementById('saveEditButton').onclick = function () {
//     saveEditedEvent(eventIndex);
//   };
// }

// function saveEditedEvent(eventIndex) {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value.trim();
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   if (updatedTitle === '' || updatedTime === '' || updatedDescription === '') {
//     alert("Please fill in all fields!");
//     return;
//   }

//   // Update the event in the events array
//   events[eventIndex] = { ...events[eventIndex], title: updatedTitle, time: updatedTime, description: updatedDescription };

//   // Save the updated events array to localStorage
//   localStorage.setItem('events', JSON.stringify(events));

//   // Close the modal and re-render the calendar
//   document.getElementById('editEventModal').style.display = 'none';
//   load();  // Re-render the calendar with updated events
// }


// document.getElementById('cancelEditButton').addEventListener('click', function () {
//   document.getElementById('editEventModal').style.display = 'none';
// });


// function renderCalendar() {
//   const calendar = document.getElementById('calendar');
//   calendar.innerHTML = ''; // Clear current events

//   // Get events from localStorage
//   const events = JSON.parse(localStorage.getItem('events')) || [];

//   // Loop through the events and display them on the calendar
//   events.forEach((event, index) => {
//     const eventElement = document.createElement('div');
//     eventElement.classList.add('event');
//     eventElement.innerHTML = `
//       <div class="event-time">${event.time}</div>
//       <div class="event-title">${event.title}</div>
//       <div class="event-description">${event.description}</div>
//       <button class="edit-event-button" onclick="openEditEventModal(${index})">Edit</button>
//     `;
//     calendar.appendChild(eventElement);
//   });
// }

// // Open the "Edit Event" modal and pre-fill it with existing event data
// function openEditEventModal(index) {
//   const events = JSON.parse(localStorage.getItem('events')) || [];
//   const event = events[index];
  
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventDescription').value = event.description;
//   document.getElementById('editEventTime').value = event.time;

//   // Set the index of the event being edited
//   document.getElementById('editEventModal').style.display = 'flex';
//   document.getElementById('submitEditEvent').onclick = function () {
//     saveEditedEvent(index);
//   };
// }

// // Close the "Edit Event" modal
// document.getElementById('closeEditModal').addEventListener('click', function () {
//   document.getElementById('editEventModal').style.display = 'none';
// });

// // Save the changes to the event
// function saveEditedEvent(index) {
//   const events = JSON.parse(localStorage.getItem('events')) || [];
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value.trim();

//   if (updatedTitle === '' || updatedDescription === '') {
//     alert("Please fill in all fields!");
//     return;
//   }

//   // Update the event in the array
//   events[index] = { title: updatedTitle, description: updatedDescription, time: updatedTime };

//   // Save updated events back to localStorage
//   localStorage.setItem('events', JSON.stringify(events));

//   // Close the modal and re-render the calendar
//   document.getElementById('editEventModal').style.display = 'none';
//   renderCalendar();
// }

// // Cancel the editing
// document.getElementById('cancelEditEvent').addEventListener('click', function () {
//   document.getElementById('editEventModal').style.display = 'none';
// });


// // function load() {
// //   renderCalendar(); // Re-render the events on page load
// // }

// window.onload = load; // Ensure calendar is rendered when the page loads




// Assuming you already have the following global variable for events and the modal
// let events = JSON.parse(localStorage.getItem('events')) || [];


// Helper function to generate 30-minute time intervals
// function generateTimeIntervals() {
//   const timeOptions = [];
//   const startTime = 0; // Start at 12:00 AM (0 minutes)
//   const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
//   const interval = 30; // 30-minute intervals

//   for (let minutes = startTime; minutes < endTime; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const hour12 = hours % 12 === 0 ? 12 : hours % 12; // Handle 12:00 PM and 12:00 AM correctly
//     const timeString = `${String(hour12).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

//     timeOptions.push({ value: timeString, label: timeString });
//   }

//   return timeOptions;
// }





















// Function to generate 30-minute time intervals
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

// // Function to populate the edit time dropdown
// function populateEditTimeDropdown() {
//   const timeOptions = generateTimeIntervals();
//   const timeDropdown = document.getElementById('editEventTime');
  
//   timeDropdown.innerHTML = ''; // Clear previous options
//   timeOptions.forEach(option => {
//     const timeOption = document.createElement('option');
//     timeOption.value = option.value;
//     timeOption.textContent = option.label;
//     timeDropdown.appendChild(timeOption);
//   });
// }

// // Open Edit Modal for the selected event
// let editingEvent = null;  // To track the event being edited

// // function openEditEventModal(event) {
// //   editingEvent = event;  // Store the event to be edited
// //   document.getElementById('editEventTitle').value = event.title;
// //   document.getElementById('editEventDescription').value = event.description || '';

// //   // Populate the time dropdown and set the value in the dropdown
// //   populateEditTimeDropdown();
// //   document.getElementById('editEventTime').value = event.time;

// //   document.getElementById('editEventModal').style.display = 'block';
// // }


// function openEditEventModal(event) {
//   console.log('Opening modal for event:', event); // Log to ensure the event is passed correctly
//   editingEvent = event;
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventDescription').value = event.description || '';
//   populateEditTimeDropdown();
//   document.getElementById('editEventTime').value = event.time;
  
//   document.getElementById('editEventModal').style.display = 'block';
// }


// // Save the edited event
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   console.log('Save button clicked');  // Add this line to see if it's working
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   // Validate the data
//   if (updatedTitle && updatedTime) {
//     const eventIndex = events.findIndex(e => e === editingEvent);
//     if (eventIndex !== -1) {
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;
      
//       // Save to localStorage
//       localStorage.setItem('events', JSON.stringify(events));
      
//       // Close modal and refresh the events
//       closeEditModal();
//       load();  // Ensure this function reloads the events properly
//     }
//   } else {
//     alert('Please provide both a title and time for the event.');
//   }
// });



// // Close the edit modal without saving changes
// document.getElementById('cancelEditButton').addEventListener('click', closeEditModal);

// // Function to close the Edit Event Modal
// function closeEditModal() {
//   document.getElementById('editEventModal').style.display = 'none';
//   editingEvent = null;  // Clear the event data being edited
// }

// // Example of how to open the modal when an event is clicked
// function openModal(date) {
//   clicked = date;
//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // For each event, create a button to edit it
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .map((e, index) => {
//         return `
//           <div class="event-item">
//             <div class="event-details">
//               <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//               ${e.description ? `<p>${e.description}</p>` : ''}
//             </div>
//             <button class="edit-btn" data-event='${JSON.stringify(e)}'>Edit</button>
//           </div>
//         `;
//       })
//       .join('');

//     // Adding event listener to each "Edit" button
//     document.querySelectorAll('.edit-btn').forEach(button => {
//       button.addEventListener('click', function () {
//         const event = JSON.parse(this.getAttribute('data-event'));  // Retrieve the event data from the button
//         openEditEventModal(event);  // Open the edit modal with the correct event
//       });
//     });

//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }



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

// Function to populate the edit time dropdown
function populateEditTimeDropdown() {
  const timeOptions = generateTimeIntervals();
  const timeDropdown = document.getElementById('editEventTime');
  
  timeDropdown.innerHTML = ''; // Clear previous options
  timeOptions.forEach(option => {
    const timeOption = document.createElement('option');
    timeOption.value = option.value;
    timeOption.textContent = option.label;
    timeDropdown.appendChild(timeOption);
  });
}

// Open Edit Modal for the selected event
let editingEvent = null;  // To track the event being edited

function openEditEventModal(event) {
  editingEvent = event;  // Store the event to be edited
  document.getElementById('editEventTitle').value = event.title;
  document.getElementById('editEventDescription').value = event.description || '';

  // Populate the time dropdown and set the value in the dropdown
  populateEditTimeDropdown();
  document.getElementById('editEventTime').value = event.time;

  document.getElementById('editEventModal').style.display = 'block';
}

// Save the edited event
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   // Validate the data
//   if (updatedTitle && updatedTime) {
//     // Check if editingEvent exists and update it
//     const eventIndex = events.findIndex(e => e === editingEvent);
//     if (eventIndex !== -1) {
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;

//       // Save to localStorage
//       localStorage.setItem('events', JSON.stringify(events));

//       // console.log("Updated events:", events);  // Log the updated events to ensure it's working

//       // Close the modal and reload the calendar
//       closeEditModal();
//       load();  // Ensure this function reloads the events properly
//     }
//   } else {
//     alert('Please provide both a title and time for the event.');
//   }
// });


// // Function to show the custom alert
// function showCustomAlert2(title, message) {
//   // Set the title and message in the modal
//   document.getElementById('alertTitle').innerText = title;
//   document.getElementById('alertMessage').innerText = message;

//   // Display the modal by changing its display property to 'flex'
//   document.getElementById('customAlert').style.display = 'flex';
// }

// // Function to close the custom alert
// function closeAlert2() {
//   // Hide the alert by changing its display property back to 'none'
//   document.getElementById('customAlert').style.display = 'none';
// }

// // Example of how to use the custom alert in your save function
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   if (updatedTitle && updatedTime) {
//     const eventIndex = events.findIndex(e => 
//       e.date === editingEvent.date && e.time === editingEvent.time && e.title === editingEvent.title
//     );

//     if (eventIndex !== -1) {
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;
//       localStorage.setItem('events', JSON.stringify(events));

//       // Use the custom alert to show a success message
//       showCustomAlert2('Event Updated', 'The event has been successfully updated.');

//       closeEditModal();
//       load(); // Re-render the calendar

//       editingEvent = null;
//     } else {
//       // Use the custom alert to show an error message
//       showCustomAlert2('Error', 'Event not found.');
//     }
//   } else {
//     showCustomAlert2('Error', 'Please provide both a title and time for the event.');
//   }
// });












// THIS ONE WORKSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS!!!!!!!!!!!!

// // Function to show the new custom alert modal (customAlertModal2)
// function showCustomAlert2(title, message) {

//   document.getElementById('alertTitle2').innerText = title;
//   document.getElementById('alertMessage2').innerText = message;

//   // Display the modal
//   document.getElementById('customAlertModal2').style.display = 'flex';
// }

// // Close the new modal
// function closeAlert2() {
//   document.getElementById('customAlertModal2').style.display = 'none';
// }

// // Event listener for the close button of the new modal (closeAlertButton2)
// document.getElementById('closeAlertButton2').addEventListener('click', closeAlert2);

// // Event listener for the other close button (closeAlertButton3)
// document.getElementById('closeAlertButton3').addEventListener('click', closeAlert2);

// // Example usage in your save function (using the new modal)
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   if (updatedTitle && updatedTime) {
//     const eventIndex = events.findIndex(e => 
//       e.date === editingEvent.date && e.time === editingEvent.time && e.title === editingEvent.title
//     );

//     if (eventIndex !== -1) {
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;
//       localStorage.setItem('events', JSON.stringify(events));

//       // Trigger the success alert
//       showCustomAlert2('Event Updated', 'The event has been successfully updated.');

//       closeEditModal();
//       load(); // Re-render the calendar

//       editingEvent = null;
//     } else {
//       // Trigger error alert
//       showCustomAlert2('Error', 'Event not found.');
//     }
//   } else {
//     // Trigger error alert for missing title/time
//     showCustomAlert2('Error', 'Please provide both a title and time for the event.');
//   }
// });

// THIS ONE WORKSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS!!!!!!!!!!!!





// Function to show the custom alert modal (for success or error)
function showCustomAlert2(title, message) {
  document.getElementById('alertTitle2').innerText = title;
  document.getElementById('alertMessage2').innerText = message;

  // Display the modal
  document.getElementById('customAlertModal2').style.display = 'flex';
}

// Close the custom alert modal (when the user clicks close button)
function closeAlert2() {
  document.getElementById('customAlertModal2').style.display = 'none';
}

// Event listener for closing the alert modal
document.getElementById('closeAlertButton2').addEventListener('click', closeAlert2); // Close alert on close button click

// Event listener for closing the alert modal (alternative close button)
document.getElementById('closeAlertButton3').addEventListener('click', closeAlert2); // Close alert on second button click

// Save Changes button functionality
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   if (updatedTitle && updatedTime) {
//     const eventIndex = events.findIndex(e => 
//       e.date === editingEvent.date && e.time === editingEvent.time && e.title === editingEvent.title
//     );

//     if (eventIndex !== -1) {
//       // Update the event
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;
//       localStorage.setItem('events', JSON.stringify(events));

//       // Show success alert
//       showCustomAlert2('Event Updated', 'The event has been successfully updated.');

//       // Re-render the calendar
//       load();

//       // Optionally, keep the edit modal open for more changes
//       // Keep the editingEvent as is so user can continue editing if desired
//     } else {
//       // Show error alert if the event wasn't found
//       showCustomAlert2('Error', 'Event not found.');
//     }
//   } else {
//     // Show error alert for missing title or time
//     showCustomAlert2('Error', 'Please provide both a title and time for the event.');
//   }
// });








// Save Changes button functionality
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   if (updatedTitle && updatedTime) {
//     const eventIndex = events.findIndex(e => 
//       e.date === editingEvent.date && e.time === editingEvent.time && e.title === editingEvent.title
//     );

//     if (eventIndex !== -1) {
//       // Update the event
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;
//       localStorage.setItem('events', JSON.stringify(events));

//       // Update the modal fields with the updated event details
//       document.getElementById('editEventTitle').value = updatedTitle;
//       document.getElementById('editEventTime').value = updatedTime;
//       document.getElementById('editEventDescription').value = updatedDescription;

//       // Show success alert
//       showCustomAlert2('Event Updated', 'The event has been successfully updated.');

//       document.getElementById('editEventModal').style.display = 'none';

//       // Re-render the calendar
//       load();

//       // Optionally, close the edit modal if you want to force the user to reopen it

//       // If you want to keep the modal open with updated content, this will suffice
//       // No need to manually re-open the modal since it will already be updated

//       editingEvent = null;
//     } else {
//       // Show error alert if the event wasn't found
//       showCustomAlert2('Error', 'Event not found.');
//     }
//   } else {
//     // Show error alert for missing title or time
//     showCustomAlert2('Error', 'Please provide both a title and time for the event.');
//   }
// });



// Save Changes button functionality
document.getElementById('saveEditedEvent').addEventListener('click', () => {
  const updatedTitle = document.getElementById('editEventTitle').value.trim();
  const updatedTime = document.getElementById('editEventTime').value;
  const updatedDescription = document.getElementById('editEventDescription').value.trim();

  if (updatedTitle && updatedTime) {
    const eventIndex = events.findIndex(e => 
      e.date === editingEvent.date && e.time === editingEvent.time && e.title === editingEvent.title
    );

    if (eventIndex !== -1) {
      // Update the event
      events[eventIndex].title = updatedTitle;
      events[eventIndex].time = updatedTime;
      events[eventIndex].description = updatedDescription;
      localStorage.setItem('events', JSON.stringify(events));

      // Show success alert
      showCustomAlert2('Event Updated', 'The event has been successfully updated.');

      // Close the edit event modal after the success message
      document.getElementById('editEventModal').style.display = 'none';

      // Re-render the calendar with the updated event
      load();

      editingEvent = null;
    } else {
      // Show error alert if event was not found
      showCustomAlert2('Error', 'Sorry, you have likely just made a change to this event. Please reopen it in calendar view.');
    }
  } else {
    // Show error alert for missing title or time
    showCustomAlert2('Error', 'Please provide both a title and time for the event.');
  }
});















// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   // Validate the data
//   if (updatedTitle && updatedTime) {
//     // Check if editingEvent exists and update it
//     const eventIndex = events.findIndex(e => e.date === editingEvent.date && e.time === editingEvent.time && e.title === editingEvent.title);
//     if (eventIndex !== -1) {
//       // Update the event details
//       events[eventIndex].title = updatedTitle;
//       events[eventIndex].time = updatedTime;
//       events[eventIndex].description = updatedDescription;

//       // Save updated events to localStorage
//       localStorage.setItem('events', JSON.stringify(events));

//       // Show a confirmation alert (optional)
//       showCustomAlert('Event Updated', 'The event has been successfully updated.');

//       // Close the edit modal and reload the calendar with updated events
//       closeEditModal();
//       load();  // Re-render the calendar
//     } else {
//       alert('Sorry, you have just made a change to this event. \nPlease reopen it to make another change.');
//     }
//   } else {
//     alert('Please provide both a title and time for the event.');
//   }
// });





// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   // Validate the data
//   if (updatedTitle && updatedTime) {
//     // Ensure the editingEvent is still valid
//     if (editingEvent) {
//       // Update the event
//       editingEvent.title = updatedTitle;
//       editingEvent.time = updatedTime;
//       editingEvent.description = updatedDescription;

//       // Save to localStorage
//       localStorage.setItem('events', JSON.stringify(events));

//       // Close the modal and reload the calendar
//       closeEditModal();
//       load();  // Refresh the calendar with the updated event
//     } else {
//       alert('There was an issue updating the event.');
//     }
//   } else {
//     alert('Please provide both a title and time for the event.');
//   }
// });


// Close the edit modal without saving changes
document.getElementById('cancelEditButton').addEventListener('click', closeEditModal);

// Function to close the Edit Event Modal
function closeEditModal() {
  document.getElementById('editEventModal').style.display = 'none';
  editingEvent = null;  // Clear the event data being edited
}


function openEditEventModal(event) {
  editingEvent = event;  // Store the event to be edited
  document.getElementById('editEventTitle').value = event.title;
  document.getElementById('editEventDescription').value = event.description || '';

  // Populate the time dropdown and set the value in the dropdown
  populateEditTimeDropdown();
  document.getElementById('editEventTime').value = event.time;

  document.getElementById('editEventModal').style.display = 'block';
}


// Example of how to open the modal when an event is clicked
function openModal(date) {
  clicked = date;
  const eventsForDay = events.filter(e => e.date === clicked);

  if (eventsForDay.length > 0) {
    // For each event, create a button to edit it
    document.getElementById('eventText').innerHTML = eventsForDay
      .map((e, index) => {
        return `
          <div class="event-item">
            <div class="event-details">
              <strong>${index + 1}. ${e.time} - ${e.title}</strong>
              ${e.description ? `<p>${e.description}</p>` : ''}
            </div>
            <button class="edit-btn" data-event='${JSON.stringify(e)}'>Edit</button>
          </div>
        `;
      })
      .join('');

    // Adding event listener to each "Edit" button
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', function () {
        const event = JSON.parse(this.getAttribute('data-event'));  // Retrieve the event data from the button
        openEditEventModal(event);  // Open the edit modal with the correct event
      });
    });

    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}




// Function to populate the Edit Event Time dropdown with 30-minute intervals
// function populateEditTimeDropdown() {
//   const timeOptions = generateTimeIntervals();
//   const timeDropdown = document.getElementById('editEventTime');
  
//   timeDropdown.innerHTML = ''; // Clear previous options
//   timeOptions.forEach(option => {
//     const timeOption = document.createElement('option');
//     timeOption.value = option.value;
//     timeOption.textContent = option.label;
//     timeDropdown.appendChild(timeOption);
//   });
// }

// // Populate the dropdown when the modal is shown
// function openEditEventModal(event) {
//   editingEvent = event;  // Store the event to be edited
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventDescription').value = event.description || '';
  
//   // Set the time value in the dropdown
//   populateEditTimeDropdown();
//   document.getElementById('editEventTime').value = event.time;

//   document.getElementById('editEventModal').style.display = 'block';
// }



// let editingEvent = null;  // To track the event being edited

// // Open Edit Modal for the selected event
// function openEditEventModal(event) {
//   editingEvent = event;  // Store the event to be edited
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventTime').value = event.time;
//   document.getElementById('editEventDescription').value = event.description || '';
//   document.getElementById('editEventModal').style.display = 'block';
// }

// // Save the edited event
// document.getElementById('saveEditedEvent').addEventListener('click', () => {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value;
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();

//   // Validate the data
//   if (updatedTitle && updatedTime) {
//     // Update the event in the `events` array
//     editingEvent.title = updatedTitle;
//     editingEvent.time = updatedTime;
//     editingEvent.description = updatedDescription;

//     // Save the updated events list to localStorage
//     localStorage.setItem('events', JSON.stringify(events));

//     // Close the modal
//     closeEditModal();
//     load();  // Reload the calendar to reflect changes
//   } else {
//     alert('Please provide both a title and time for the event.');
//   }
// });

// // Close the edit modal without saving changes
// document.getElementById('cancelEditButton').addEventListener('click', closeEditModal);

// // Function to close the Edit Event Modal
// function closeEditModal() {
//   document.getElementById('editEventModal').style.display = 'none';
//   editingEvent = null;  // Clear the event data being edited
// }

// // Example of how to open the modal when an event is clicked
// function openModal(date) {
//   clicked = date;
//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // For each event, create a button to edit it
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .map((e, index) => {
//         return `
//           <div class="event-item">
//             <div class="event-details">
//               <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//               ${e.description ? `<p>${e.description}</p>` : ''}
//             </div>
//             <button class="edit-btn" data-event='${JSON.stringify(e)}'>Edit</button>
//           </div>
//         `;
//       })
//       .join('');

//     // Adding event listener to each "Edit" button
//     document.querySelectorAll('.edit-btn').forEach(button => {
//       button.addEventListener('click', function () {
//         const event = JSON.parse(this.getAttribute('data-event'));  // Retrieve the event data from the button
//         openEditEventModal(event);  // Open the edit modal with the correct event
//       });
//     });

//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }


























// function renderCalendar() {
//   const calendar = document.getElementById('calendar');
//   calendar.innerHTML = ''; // Clear current events

//   const monthDisplay = document.getElementById('monthDisplay');
//   const currentDate = new Date();
//   monthDisplay.innerHTML = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

//   // Loop through each day and render events for that day
//   for (let i = 1; i <= 31; i++) { // Assuming a simple 31-day calendar
//     const day = document.createElement('div');
//     day.classList.add('calendar-day');
//     day.innerHTML = `<span>${i}</span>`;
    
//     // Check if there are events for this day
//     const dayEvents = events.filter(event => new Date(event.date).getDate() === i);

//     if (dayEvents.length > 0) {
//       day.classList.add('has-events');
//       day.innerHTML += `<div class="event-count">${dayEvents.length} Event(s)</div>`;
//     }

//     // Click handler to show event details for a day
//     day.addEventListener('click', () => openDayDetails(i));

//     calendar.appendChild(day);
//   }
// }

// function openDayDetails(day) {
//   const dayEvents = events.filter(event => new Date(event.date).getDate() === day);
//   const eventDetailsContainer = document.getElementById('eventText');
  
//   if (dayEvents.length > 0) {
//     eventDetailsContainer.innerHTML = '';
//     dayEvents.forEach((event, index) => {
//       const eventDetail = document.createElement('div');
//       eventDetail.innerHTML = `
//         <strong>${event.time} - ${event.title}</strong>
//         <p>${event.description}</p>
//         <button class="editEventButton" onclick="openEditModal(${index})">Edit</button>
//       `;
//       eventDetailsContainer.appendChild(eventDetail);
//     });

//     document.getElementById('deleteEventModal').style.display = 'block';
//   } else {
//     eventDetailsContainer.innerHTML = 'No events for this day.';
//   }
// }

// function openEditModal(index) {
//   const event = events[index];
  
//   document.getElementById('editEventTitle').value = event.title;
//   document.getElementById('editEventDescription').value = event.description;
//   document.getElementById('editEventTime').value = event.time;
  
//   document.getElementById('submitEditEvent').onclick = function () {
//     saveEditedEvent(index);
//   };

//   document.getElementById('editEventModal').style.display = 'block';
// }

// function saveEditedEvent(index) {
//   const updatedTitle = document.getElementById('editEventTitle').value.trim();
//   const updatedDescription = document.getElementById('editEventDescription').value.trim();
//   const updatedTime = document.getElementById('editEventTime').value.trim();

//   if (updatedTitle === '' || updatedDescription === '') {
//     alert("Please fill in all fields!");
//     return;
//   }

//   // Update the event in the events array
//   events[index] = { title: updatedTitle, description: updatedDescription, time: updatedTime };

//   // Save updated events back to localStorage
//   localStorage.setItem('events', JSON.stringify(events));

//   // Close the modal and re-render the calendar
//   document.getElementById('editEventModal').style.display = 'none';
//   renderCalendar();
// }

// document.getElementById('cancelEditEvent').addEventListener('click', function () {
//   document.getElementById('editEventModal').style.display = 'none';
// });

// // This closes the delete event modal when clicking the close button
// document.getElementById('closeDeleteButton').addEventListener('click', function () {
//   document.getElementById('deleteEventModal').style.display = 'none';
// });

// // On page load, render the calendar
// window.onload = renderCalendar;


initButtons();
load();
