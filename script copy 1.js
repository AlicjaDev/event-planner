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



// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // Display all events for the day in the delete modal
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
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









// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // Display all events for the day in the delete modal
//     document.getElementById('eventText').innerText = eventsForDay
//       .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
//       .map((e, index) => `${index + 1}. ${e.time} - ${e.title}`)
//       .join('\n');
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }



document.addEventListener('DOMContentLoaded', () => {
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

  const timeDropdown = new Choices('#eventTimeInput', {
    choices: timeOptions,
    placeholder: true,
    placeholderValue: 'Select time',
    searchEnabled: false,
    shouldSort: false,
    itemSelectText: '',
  });
});

// document.addEventListener('DOMContentLoaded', () => {
//   const timeOptions = [];
//   const startTime = 0; // Start at 12:00 AM (0 minutes)
//   const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
//   const interval = 30; // 30-minute intervals

//   for (let minutes = startTime; minutes < endTime; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const timeString = `${String(hours % 12 || 12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
//     timeOptions.push({ value: timeString, label: timeString });
//   }

//   const timeDropdown = new Choices('#eventTimeInput', {
//     choices: timeOptions,
//     placeholder: true,
//     placeholderValue: 'Select time',
//     searchEnabled: false,
//     shouldSort: false,
//     itemSelectText: '',
//   });

  // Customize dropdown height
  // const dropdown = document.querySelector('.choices__list--dropdown');
  // if (dropdown) {
  //   dropdown.style.maxHeight = '200px';
  //   dropdown.style.overflowY = 'auto';
  // }


// Update the deleteEvent function to delete the selected event
// function deleteEvent() {
//   const eventIndex = prompt('Enter the number of the event you want to delete:');
//   if (eventIndex !== null && !isNaN(eventIndex)) {
//     const indexToDelete = parseInt(eventIndex) - 1; // Subtract 1 to get correct index (since array is zero-indexed)
//     const eventsForDay = events.filter(e => e.date === clicked);
//     if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
//       // Filter out the event that needs to be deleted
//       events = events.filter((e, index) => {
//         return e.date !== clicked || index !== indexToDelete;
//       });
//       localStorage.setItem('events', JSON.stringify(events)); // Save updated events to local storage
//       closeModal(); // Close the modal after deleting the event
//     } else {
//       alert('Invalid event number.');
//     }
//   }
// }



// function deleteEvent() {
//   const eventIndex = prompt('Enter the number of the event you want to delete:');
//   if (eventIndex !== null && !isNaN(eventIndex)) {
//     const indexToDelete = parseInt(eventIndex) - 1; // Subtract 1 to convert to zero-based index
//     const eventsForDay = events.filter(e => e.date === clicked); // Filter events for the selected day

//     console.log('Events for the day:', eventsForDay); // Debugging log

//     if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
//       // Find the event to delete
//       const eventToDelete = eventsForDay[indexToDelete];

//       console.log('Event to delete:', eventToDelete); // Debugging log

//       // Remove the event from the events array
//       events = events.filter(e => !(e.date === clicked && e.time === eventToDelete.time && e.title === eventToDelete.title));

//       console.log('Updated events:', events); // Debugging log

//       // Save the updated events array to localStorage
//       localStorage.setItem('events', JSON.stringify(events));

//       // Close the modal and refresh the calendar
//       closeModal();
//     } else {
//       alert('Invalid event number.');
//     }
//   }
// }


// Function to display the custom prompt modal
// Function to display the custom prompt modal
// function showCustomPrompt(callback) {
//   // Show the prompt modal and backdrop
//   document.getElementById('customPromptModal').style.display = 'block';
//   document.getElementById('modalBackdrop').style.display = 'block';

//   // Close the prompt modal when clicking the "X" button
//   document.getElementById('closePromptButton').onclick = function () {
//     closeCustomPrompt();
//   };

//   // Close the prompt modal when clicking the "Cancel" button
//   document.getElementById('cancelPromptButton').onclick = function () {
//     closeCustomPrompt();
//   };

//   // Handle the input and confirm button
//   document.getElementById('confirmPromptButton').onclick = function () {
//     const eventIndex = document.getElementById('promptInput').value;
//     if (eventIndex !== '' && !isNaN(eventIndex)) {
//       callback(eventIndex);  // Pass the input to the callback function
//       closeCustomPrompt();  // Close the modal after the event number is confirmed
//     } else {
//       alert("Please enter a valid event number.");
//     }
//   };
// }

// // Function to close the custom prompt modal
// function closeCustomPrompt() {
//   document.getElementById('customPromptModal').style.display = 'none';
//   document.getElementById('modalBackdrop').style.display = 'none';
// }


// // Example of using the custom prompt in the deleteEvent function
// function deleteEvent() {
//   showCustomPrompt(function (eventIndex) {
//     const indexToDelete = parseInt(eventIndex) - 1; // Subtract 1 to convert to zero-based index
//     const eventsForDay = events.filter(e => e.date === clicked); // Filter events for the selected day

//     console.log('Events for the day:', eventsForDay); // Debugging log

//     if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
//       // Find the event to delete
//       const eventToDelete = eventsForDay[indexToDelete];

//       console.log('Event to delete:', eventToDelete); // Debugging log

//       // Remove the event from the events array
//       events = events.filter(e => !(e.date === clicked && e.time === eventToDelete.time && e.title === eventToDelete.title));

//       console.log('Updated events:', events); // Debugging log

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

// Function to show custom alert
function showCustomAlert(title, message) {
  document.getElementById('alertTitle').textContent = title;
  document.getElementById('alertMessage').textContent = message;
  document.getElementById('customAlertModal').style.display = 'block';
  document.getElementById('modalBackdrop').style.display = 'block';

  // Close the alert when the user clicks "Close"
  document.getElementById('closeAlertButton2').onclick = function () {
    closeCustomAlert();
  };

  // Close the alert when the user clicks the "X" button
  document.getElementById('closeAlertButton').onclick = function () {
    closeCustomAlert();
  };

  // Close the alert when the user clicks on the backdrop
  document.getElementById('modalBackdrop').onclick = function () {
    closeCustomAlert();
  };
}

// Function to close the custom alert
function closeCustomAlert() {
  document.getElementById('customAlertModal').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}

// Add event listener to Delete button
document.getElementById('deleteButton').addEventListener('click', deleteEvent);

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


// document.addEventListener('DOMContentLoaded', () => {
//   const timeOptions = [];
//   const startTime = 0; // Start at 12:00 AM (0 minutes)
//   const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
//   const interval = 30; // 30-minute intervals

//   for (let minutes = startTime; minutes < endTime; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const timeString = `${String(hours % 12 || 12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
//     timeOptions.push({ value: timeString, label: timeString });
//   }

//   const timeDropdown = new Choices('#eventTimeInput', {
//     choices: timeOptions,
//     placeholder: true,
//     placeholderValue: 'Select time',
//     searchEnabled: false,
//     shouldSort: false,
//     itemSelectText: '',
//   });

//   // Customize dropdown height
//   const dropdown = document.querySelector('.choices__list--dropdown');
//   if (dropdown) {
//     dropdown.style.maxHeight = '150px';
//     dropdown.style.overflowY = 'auto';
//   }
// });

// Function to populate the time dropdown with 30-minute intervals
// function populateTimeDropdown() {
//   const timeDropdown = document.getElementById('eventTimeInput');
//   const startTime = 0; // Start at 12:00 AM (0 minutes)
//   const endTime = 1440; // End at 12:00 AM (1440 minutes = 24 hours)
//   const interval = 30; // 30-minute intervals

//   for (let minutes = startTime; minutes < endTime; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const timeString = `${String(hours % 12 || 12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
    
//     const option = document.createElement('option');
//     option.value = timeString;
//     option.text = timeString;
//     timeDropdown.appendChild(option);
//   }
// }

// Call this function when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//   populateTimeDropdown();
// });







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

//   for(let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventsForDay = events.filter(e => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventsForDay.length > 0) {
//         eventsForDay
//           .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
//           .forEach(event => {
//             const eventDiv = document.createElement('div');
//             eventDiv.classList.add('event');
//             eventDiv.innerText = `${event.time} - ${event.title}`;
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

//   for(let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventsForDay = events.filter(e => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventsForDay.length > 0) {
//         // Add 'multi-events' class if there are 3 or more events
//         if (eventsForDay.length >= 3) {
//           daySquare.classList.add('multi-events');
//         }

//         eventsForDay
//           .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
//           .forEach(event => {
//             const eventDiv = document.createElement('div');
//             eventDiv.classList.add('event');
//             eventDiv.innerHTML = `<strong>${event.time} - ${event.title}</strong>`; // Time and title
//             if (event.description) {
//               // Show event description if it exists
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


function closeModal() {
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  eventTimeInput.value = '';
  clicked = null;
  load();
}


// function closeModal() {
//   eventTitleInput.classList.remove('error');
//   newEventModal.style.display = 'none';
//   deleteEventModal.style.display = 'none';
//   backDrop.style.display = 'none';
//   eventTitleInput.value = '';
//   eventTimeInput.value = '';
//   clicked = null;
//   load();
// }

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


// function deleteEvent() {
//   const eventIndex = prompt('Enter the number of the event you want to delete:');
//   if (eventIndex !== null && !isNaN(eventIndex)) {
//     const indexToDelete = parseInt(eventIndex) - 1;
//     events = events.filter((e, index) => {
//       return e.date !== clicked || index !== indexToDelete;
//     });
//     localStorage.setItem('events', JSON.stringify(events));
//     closeModal();
//   }
// }


// function deleteEvent() {
//   const eventIndex = prompt('Enter the number of the event you want to delete:');
//   if (eventIndex !== null && !isNaN(eventIndex)) {
//     const indexToDelete = parseInt(eventIndex) - 1;
//     const eventsForDay = events.filter(e => e.date === clicked);
//     if (indexToDelete >= 0 && indexToDelete < eventsForDay.length) {
//       events = events.filter((e, index) => {
//         return e.date !== clicked || index !== indexToDelete;
//       });
//       localStorage.setItem('events', JSON.stringify(events));
//       closeModal();
//     } else {
//       alert('Invalid event number.');
//     }
//   }
// }


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

  // Delete Event button
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
}


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
//   document.getElementById('deleteButton').addEventListener('click', deleteEvent);
//   document.getElementById('closeButton').addEventListener('click', closeModal);

//   // Add event listener for the "Add New Event" button in the delete modal
//   document.getElementById('addEventButton').addEventListener('click', () => {
//     deleteEventModal.style.display = 'none';
//     newEventModal.style.display = 'block';
//   });
// }

initButtons();
load();


























// let nav = 0;
// let clicked = null;
// let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

// const calendar = document.getElementById('calendar');
// const newEventModal = document.getElementById('newEventModal');
// const deleteEventModal = document.getElementById('deleteEventModal');
// const backDrop = document.getElementById('modalBackDrop');
// const eventTitleInput = document.getElementById('eventTitleInput');
// const eventTimeInput = document.getElementById('eventTimeInput');
// const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// function openModal(date) {
//   clicked = date;


//   if (eventsForDay.length > 0) {
//     // Display all events for the day
//     document.getElementById('eventText').innerText = eventsForDay
//       .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
//       .map(e => `${e.time} - ${e.title}`)
//       .join('\n');
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }

// //   const eventForDay = events.find(e => e.date === clicked);

// //   if (eventForDay) {
// //     document.getElementById('eventText').innerText = eventForDay.title;
// //     deleteEventModal.style.display = 'block';
// //   } else {
// //     newEventModal.style.display = 'block';
// //   }

// //   backDrop.style.display = 'block';
// // }

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

//   for(let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventForDay = events.find(e => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventForDay) {
//         const eventDiv = document.createElement('div');
//         eventDiv.classList.add('event');
//         eventDiv.innerText = eventForDay.title;
//         daySquare.appendChild(eventDiv);
//       }

//       daySquare.addEventListener('click', () => openModal(dayString));
//     } else {
//       daySquare.classList.add('padding');
//     }

//     calendar.appendChild(daySquare);    
//   }
// }

// function closeModal() {
//   eventTitleInput.classList.remove('error');
//   newEventModal.style.display = 'none';
//   deleteEventModal.style.display = 'none';
//   backDrop.style.display = 'none';
//   eventTitleInput.value = '';
//   clicked = null;
//   load();
// }

// function saveEvent() {
//   if (eventTitleInput.value) {
//     eventTitleInput.classList.remove('error');

//     events.push({
//       date: clicked,
//       title: eventTitleInput.value,
//     });

//     localStorage.setItem('events', JSON.stringify(events));
//     closeModal();
//   } else {
//     eventTitleInput.classList.add('error');
//   }
// }

// function deleteEvent() {
//   events = events.filter(e => e.date !== clicked);
//   localStorage.setItem('events', JSON.stringify(events));
//   closeModal();
// }

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
//   document.getElementById('deleteButton').addEventListener('click', deleteEvent);
//   document.getElementById('closeButton').addEventListener('click', closeModal);
// }

// initButtons();
// load();



// function saveEvent() {
//     const eventTitle = eventTitleInput.value;
//     const eventDescription = document.getElementById('eventDescriptionInput').value;
//     const reminderTime = document.getElementById('reminderTimeInput').value;
//     const email = document.getElementById('emailInput').value;
//     const phone = document.getElementById('phoneInput').value;
  
//     if (eventTitle) {
//       eventTitleInput.classList.remove('error');
  
//       const eventData = {
//         date: clicked,
//         title: eventTitle,
//         description: eventDescription,
//         reminderTime: reminderTime ? parseInt(reminderTime) : null, // Reminder time in minutes
//         email: email,
//         phone: phone,
//       };
  
//       events.push(eventData);
//       localStorage.setItem('events', JSON.stringify(events));
  
//       // Set up reminders after saving event
//       if (eventData.reminderTime) {
//         setReminder(eventData);
//       }
  
//       closeModal();
//     } else {
//       eventTitleInput.classList.add('error');
//     }
//   }
  
//   function setReminder(eventData) {
//     const eventDate = new Date(eventData.date);
//     const reminderTime = eventData.reminderTime * 60000; // Convert minutes to milliseconds
  
//     const reminderTimeMs = eventDate.getTime() - reminderTime;
  
//     if (reminderTimeMs > Date.now()) {
//       setTimeout(() => {
//         sendReminder(eventData);
//       }, reminderTimeMs - Date.now());
//     }
//   }
  
//   function sendReminder(eventData) {
//     // If we want to send an email reminder (Backend logic would be needed)
//     if (eventData.email) {
//       sendEmailReminder(eventData);
//     }
  
//     // If we want to send an SMS reminder (Backend logic would be needed)
//     if (eventData.phone) {
//       sendSMSReminder(eventData);
//     }
  
//     // Push notification reminder
//     if (Notification.permission === 'granted') {
//       sendPushNotification(eventData);
//     } else {
//       alert('Push notifications are not enabled.');
//     }
//   }
  
//   function sendEmailReminder(eventData) {
//     // Example API call to a backend service for sending an email
//     console.log(`Sending email to ${eventData.email}: "${eventData.title}" is coming up!`);
  
//     // Call your email sending API here
//   }
  
//   function sendSMSReminder(eventData) {
//     // Example API call to a backend service for sending SMS
//     console.log(`Sending SMS to ${eventData.phone}: "${eventData.title}" is coming up!`);
  
//     // Call your SMS sending API here
//   }
  
//   function sendPushNotification(eventData) {
//     // Use the Push API to send a push notification
//     new Notification('Event Reminder', {
//       body: `${eventData.title} is coming up!`,
//       icon: '/icon.png',
//     });
//   }
  
//   function requestPushNotificationPermission() {
//     if ('Notification' in window) {
//       Notification.requestPermission().then(permission => {
//         if (permission === 'granted') {
//           console.log('Push notifications enabled.');
//         }
//       });
//     }
//   }
  
//   // Call this on page load to ask for permission to send push notifications
//   requestPushNotificationPermission();
  





//   self.addEventListener('push', function(event) {
//     const options = {
//       body: event.data.text(),
//       icon: '/icon.png',
//       badge: '/badge.png',
//     };
  
//     event.waitUntil(
//       self.registration.showNotification('Event Reminder', options)
//     );
//   });
  


//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js').then(registration => {
//       registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: '<YOUR_VAPID_PUBLIC_KEY>'
//       }).then(subscription => {
//         console.log('Push subscription:', subscription);
//       });
//     });
//   }
  