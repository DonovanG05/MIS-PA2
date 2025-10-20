// Student Portal JavaScript

// Global variables
let studentProfile = {};
let currentUserId = null;
let myLessons = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Load user data from database
async function loadUserData() {
  try {
    // For now, we'll use a simple approach - get user from URL params or localStorage
    // In a real app, you'd get this from the session/token
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id') || localStorage.getItem('current_user_id');
    
    if (!userId) {
      // If no user ID, redirect to homepage
      window.location.href = 'homepage.html';
      return;
    }
    
    currentUserId = userId;
    
    // Fetch user data from API
    const response = await fetch(`/api/student/${userId}/profile`);
    const result = await response.json();
    
    if (result.success) {
      studentProfile = result.student;
      populateProfileForm();
      loadMyLessons();
    } else {
      console.error('Failed to load user data:', result.message);
      showAlert('Failed to load your profile data.', 'danger');
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showAlert('Error loading your profile data.', 'danger');
  }
}

// Populate the profile form with user data
function populateProfileForm() {
  if (!studentProfile) return;
  
  // Populate form fields
  document.getElementById('studentName').value = studentProfile.name || '';
  document.getElementById('studentEmail').value = studentProfile.email || '';
  document.getElementById('studentPhone').value = studentProfile.phone || '';
  document.getElementById('studentLocation').value = studentProfile.location || '';
  document.getElementById('studentInstrument').value = studentProfile.primary_instrument || '';
  document.getElementById('studentLevel').value = studentProfile.skill_level || '';
  document.getElementById('studentGoals').value = studentProfile.learning_goals || '';
  
  // Update profile photo if available
  if (studentProfile.photo_url) {
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview) {
      photoPreview.src = studentProfile.photo_url;
      photoPreview.style.display = 'block';
    }
  }
}

// Helper function to convert file to base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Load user's lessons from database
async function loadMyLessons() {
  if (!currentUserId) return;
  
  try {
    const response = await fetch(`/api/student/${currentUserId}/lessons`);
    const result = await response.json();
    
    if (result.success) {
      myLessons = result.lessons;
      displayMyLessons();
    } else {
      console.error('Failed to load lessons:', result.message);
    }
  } catch (error) {
    console.error('Error loading lessons:', error);
  }
}

// Sample availability data
const sampleAvailability = [
  {
    id: 1,
    teacher: "Jane Smith",
    instrument: "piano",
    date: "2024-01-15",
    time: "10:00 AM",
    duration: 60,
    rate: 60,
    type: "virtual"
  },
  {
    id: 2,
    teacher: "Mike Johnson",
    instrument: "guitar",
    date: "2024-01-16",
    time: "2:00 PM",
    duration: 60,
    rate: 50,
    type: "in-person"
  },
  {
    id: 3,
    teacher: "Sarah Wilson",
    instrument: "piano",
    date: "2024-01-17",
    time: "3:00 PM",
    duration: 90,
    rate: 70,
    type: "virtual"
  }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadStudentData();
  renderCalendar();
  loadMyLessons();
});

function loadStudentData() {
  // Load student profile data from localStorage or API
  const savedProfile = localStorage.getItem('studentProfile');
  if (savedProfile) {
    studentProfile = JSON.parse(savedProfile);
  }
  
  // Always populate forms with current data
  populateProfileForm();
}

function populateProfileForm() {
  document.getElementById('studentName').value = studentProfile.name || '';
  document.getElementById('studentEmail').value = studentProfile.email || '';
  document.getElementById('studentPhone').value = studentProfile.phone || '';
  document.getElementById('studentLocation').value = studentProfile.location || '';
  document.getElementById('studentInstrument').value = studentProfile.instrument || '';
  document.getElementById('studentLevel').value = studentProfile.level || '';
  document.getElementById('studentGoals').value = studentProfile.goals || '';
  document.getElementById('studentPhotoPreview').src = studentProfile.photo || 'https://via.placeholder.com/150';
}

function previewStudentPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('studentPhotoPreview').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function updateStudentProfile() {
  const form = document.getElementById('studentProfileForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  if (!currentUserId) {
    showAlert('User not authenticated. Please sign in again.', 'danger');
    return;
  }
  
  // Get form data
  const profileData = {
    name: document.getElementById('studentName').value,
    email: document.getElementById('studentEmail').value,
    phone: document.getElementById('studentPhone').value,
    location: document.getElementById('studentLocation').value,
    primary_instrument: document.getElementById('studentInstrument').value,
    skill_level: document.getElementById('studentLevel').value,
    learning_goals: document.getElementById('studentGoals').value
  };
  
  // Handle photo upload if there's a file
  const photoFile = document.getElementById('studentPhoto').files[0];
  if (photoFile) {
    try {
      const photoBase64 = await convertToBase64(photoFile);
      profileData.photo_url = photoBase64;
    } catch (error) {
      console.error('Error converting photo:', error);
      showAlert('Error processing photo. Please try again.', 'danger');
      return;
    }
  }
  
  try {
    // Update profile via API
    const response = await fetch(`/api/student/${currentUserId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update local profile
      studentProfile = { ...studentProfile, ...profileData };
      showAlert('Profile updated successfully!', 'success');
    } else {
      showAlert(result.message || 'Failed to update profile.', 'danger');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showAlert('Failed to update profile. Please try again.', 'danger');
  }
}

function searchAvailability() {
  const instrument = document.getElementById('searchInstrument').value;
  const lessonType = document.getElementById('lessonType').value;
  
  if (!instrument || !lessonType) {
    showAlert('Please select both instrument and lesson type.', 'warning');
    return;
  }
  
  // Filter availability based on search criteria
  const filteredAvailability = sampleAvailability.filter(slot => 
    slot.instrument === instrument && slot.type === lessonType
  );
  
  renderAvailabilityTable(filteredAvailability);
}

function renderAvailabilityTable(availability) {
  const tbody = document.querySelector('#availabilityTable tbody');
  
  if (availability.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No availability found for selected criteria</td></tr>';
    return;
  }
  
  tbody.innerHTML = availability.map(slot => `
    <tr>
      <td>${formatDate(slot.date)}</td>
      <td>${slot.time}</td>
      <td>${slot.teacher}</td>
      <td>${capitalizeFirst(slot.instrument)}</td>
      <td>${slot.duration} min</td>
      <td>$${slot.rate}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openBookingModal(${slot.id})">
          Book
        </button>
      </td>
    </tr>
  `).join('');
}

function openBookingModal(slotId) {
  const slot = sampleAvailability.find(s => s.id === slotId);
  if (!slot) return;
  
  // Populate modal with slot data
  document.getElementById('bookingTeacher').value = slot.teacher;
  document.getElementById('bookingInstrument').value = capitalizeFirst(slot.instrument);
  document.getElementById('bookingDate').value = formatDate(slot.date);
  document.getElementById('bookingTime').value = slot.time;
  document.getElementById('bookingDuration').value = slot.duration;
  document.getElementById('bookingType').value = slot.type;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
  modal.show();
}

function toggleRecurringOptions() {
  const recurringCheckbox = document.getElementById('recurringLessons');
  const recurringOptions = document.getElementById('recurringOptions');
  const recurringCount = document.getElementById('recurringCount');
  
  if (recurringCheckbox.checked) {
    recurringOptions.style.display = 'block';
    recurringCount.style.display = 'block';
  } else {
    recurringOptions.style.display = 'none';
    recurringCount.style.display = 'none';
  }
}

function confirmBooking() {
  const form = document.getElementById('bookingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Get booking data
  const bookingData = {
    id: Date.now(),
    teacher: document.getElementById('bookingTeacher').value,
    instrument: document.getElementById('bookingInstrument').value,
    date: document.getElementById('bookingDate').value,
    time: document.getElementById('bookingTime').value,
    duration: document.getElementById('bookingDuration').value,
    type: document.getElementById('bookingType').value,
    recurring: document.getElementById('recurringLessons').checked,
    interval: document.getElementById('recurringInterval').value,
    count: document.getElementById('recurringCount').value,
    notes: document.getElementById('bookingNotes').value,
    status: 'upcoming'
  };
  
  // Add to lessons
  myLessons.push(bookingData);
  
  // Handle recurring lessons
  if (bookingData.recurring) {
    const interval = bookingData.interval;
    const count = parseInt(bookingData.count);
    const baseDate = new Date(bookingData.date);
    
    for (let i = 1; i < count; i++) {
      const nextDate = new Date(baseDate);
      
      if (interval === 'weekly') {
        nextDate.setDate(baseDate.getDate() + (i * 7));
      } else if (interval === 'biweekly') {
        nextDate.setDate(baseDate.getDate() + (i * 14));
      } else if (interval === 'monthly') {
        nextDate.setMonth(baseDate.getMonth() + i);
      }
      
      const recurringLesson = {
        ...bookingData,
        id: Date.now() + i,
        date: nextDate.toISOString().split('T')[0],
        status: 'upcoming'
      };
      
      myLessons.push(recurringLesson);
    }
  }
  
  // Save to localStorage
  localStorage.setItem('studentLessons', JSON.stringify(myLessons));
  
  // Close modal and refresh
  const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
  modal.hide();
  
  showAlert('Lesson(s) booked successfully!', 'success');
  loadMyLessons();
}

function renderCalendar() {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  const calendarGrid = document.getElementById('calendarGrid');
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  let html = '<div class="calendar-header d-flex justify-content-between mb-2">';
  html += '<div class="fw-bold">Sun</div><div class="fw-bold">Mon</div><div class="fw-bold">Tue</div>';
  html += '<div class="fw-bold">Wed</div><div class="fw-bold">Thu</div><div class="fw-bold">Fri</div><div class="fw-bold">Sat</div>';
  html += '</div><div class="calendar-days">';
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasAvailability = sampleAvailability.some(slot => slot.date === dateStr);
    
    html += `<div class="calendar-day ${hasAvailability ? 'has-availability' : ''}" onclick="showDayAvailability('${dateStr}')">${day}</div>`;
  }
  
  html += '</div>';
  calendarGrid.innerHTML = html;
}

function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function currentMonth() {
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  renderCalendar();
}

function showDayAvailability(date) {
  const dayAvailability = sampleAvailability.filter(slot => slot.date === date);
  
  if (dayAvailability.length === 0) {
    showAlert('No availability for this date', 'info');
    return;
  }
  
  // Show availability in a simple format
  const availabilityText = dayAvailability.map(slot => 
    `${slot.time} - ${slot.teacher} (${slot.instrument}) - $${slot.rate}`
  ).join('\n');
  
  alert(`Availability for ${formatDate(date)}:\n\n${availabilityText}`);
}

function loadMyLessons() {
  const savedLessons = localStorage.getItem('studentLessons');
  if (savedLessons) {
    myLessons = JSON.parse(savedLessons);
  }
  
  renderLessonsTable();
}

function renderLessonsTable() {
  const tbody = document.querySelector('#lessonsTableBody');
  
  if (myLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No lessons found</td></tr>';
    return;
  }
  
  tbody.innerHTML = myLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.date)} ${lesson.time}</td>
      <td>${lesson.teacher}</td>
      <td>${capitalizeFirst(lesson.instrument)}</td>
      <td>${capitalizeFirst(lesson.type)}</td>
      <td>${lesson.duration} min</td>
      <td><span class="badge bg-${getStatusColor(lesson.status)}">${capitalizeFirst(lesson.status)}</span></td>
      <td>
        <button class="btn btn-outline-danger btn-sm" onclick="cancelLesson(${lesson.id})">
          Cancel
        </button>
      </td>
    </tr>
  `).join('');
}

function filterLessons(filter) {
  // Update active button
  document.querySelectorAll('.btn-group .btn').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('btn-outline-primary');
  });
  
  event.target.classList.add('active');
  event.target.classList.remove('btn-outline-primary');
  
  // Filter lessons based on status
  let filteredLessons = myLessons;
  if (filter !== 'all') {
    filteredLessons = myLessons.filter(lesson => lesson.status === filter);
  }
  
  // Re-render table with filtered data
  const tbody = document.querySelector('#lessonsTableBody');
  
  if (filteredLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No lessons found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.date)} ${lesson.time}</td>
      <td>${lesson.teacher}</td>
      <td>${capitalizeFirst(lesson.instrument)}</td>
      <td>${capitalizeFirst(lesson.type)}</td>
      <td>${lesson.duration} min</td>
      <td><span class="badge bg-${getStatusColor(lesson.status)}">${capitalizeFirst(lesson.status)}</span></td>
      <td>
        <button class="btn btn-outline-danger btn-sm" onclick="cancelLesson(${lesson.id})">
          Cancel
        </button>
      </td>
    </tr>
  `).join('');
}

function cancelLesson(lessonId) {
  if (confirm('Are you sure you want to cancel this lesson?')) {
    myLessons = myLessons.filter(lesson => lesson.id !== lessonId);
    localStorage.setItem('studentLessons', JSON.stringify(myLessons));
    loadMyLessons();
    showAlert('Lesson cancelled successfully!', 'success');
  }
}

// Utility functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusColor(status) {
  switch (status) {
    case 'upcoming': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 3000);
}

// Initialize the portal when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadUserData();
});
