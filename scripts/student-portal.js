// Student Portal JavaScript

// Global variables
let studentProfile = {};
let currentUserId = null;
let myLessons = [];
let currentMonth = new Date().getMonth(); // Current month (0-indexed)
let currentYear = new Date().getFullYear(); // Current year

// Load user data from database
async function loadUserData() {
  try {
    // For now, we'll use a simple approach - get user from URL params or localStorage
    // In a real app, you'd get this from the session/token
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id') || localStorage.getItem('current_user_id');
    
    console.log('Student portal loading with URL:', window.location.href);
    console.log('User ID from URL:', userId);
    
    if (!userId) {
      // If no user ID, show error message but don't redirect immediately
      console.log('No user ID found in URL parameters');
      showAlert('No user session found. Please sign in again.', 'warning');
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
    const photoPreview = document.getElementById('studentPhotoPreview');
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
    // Get student ID from user ID
    const student = await getStudentByUserId(currentUserId);
    if (!student) {
      console.error('Student profile not found');
      return;
    }
    
    const response = await fetch(`/api/student/${student.studentID}/lessons`);
    const result = await response.json();
    
    if (result.success) {
      myLessons = result.lessons;
      renderLessonsTable();
    } else {
      console.error('Failed to load lessons:', result.message);
    }
  } catch (error) {
    console.error('Error loading lessons:', error);
  }
}

// Available lessons data (loaded from database)
let availableLessons = [];

// Load available lessons from database
async function loadAvailableLessons() {
  try {
    const response = await fetch('/api/lessons/available?instrument=piano&lessonType=virtual');
    const result = await response.json();
    
    if (result.success) {
      availableLessons = result.lessons;
      console.log('Loaded available lessons:', availableLessons);
      // Re-render calendar after loading availability data
      renderCalendar();
    } else {
      console.error('Failed to load available lessons:', result.message);
    }
  } catch (error) {
    console.error('Error loading available lessons:', error);
  }
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

async function searchAvailability() {
  const instrument = document.getElementById('searchInstrument').value;
  const lessonType = document.getElementById('lessonType').value;
  
  if (!instrument || !lessonType) {
    showAlert('Please select both instrument and lesson type.', 'warning');
    return;
  }
  
  try {
    // Fetch availability from database
    const response = await fetch(`/api/lessons/available?instrument=${instrument}&lessonType=${lessonType}`);
    const result = await response.json();
    
    if (result.success) {
      availableLessons = result.lessons;
      renderAvailabilityTable(availableLessons);
    } else {
      showAlert('Failed to load availability data.', 'danger');
    }
  } catch (error) {
    console.error('Error searching availability:', error);
    showAlert('Error loading availability data.', 'danger');
  }
}

function renderAvailabilityTable(availability) {
  const tbody = document.querySelector('#availabilityTable tbody');
  
  if (availability.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No availability found for selected criteria</td></tr>';
    return;
  }
  
  tbody.innerHTML = availability.map(slot => `
    <tr>
      <td>${formatDate(slot.available_date)}</td>
      <td>${slot.start_time}</td>
      <td>${slot.teacher_name}</td>
      <td>
        ${slot.instruments && slot.instruments.length > 0 
          ? slot.instruments.map(inst => capitalizeFirst(inst)).join(', ')
          : 'Multiple Available'
        }
      </td>
      <td>60 min</td>
      <td>$${slot.rate_per_hour}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openBookingModal(${slot.id})">
          Book
        </button>
      </td>
    </tr>
  `).join('');
}

function openBookingModal(slotId) {
  const slot = availableLessons.find(s => s.id === slotId);
  if (!slot) return;
  
  // Store slot ID in form data
  document.getElementById('bookingForm').dataset.slotId = slotId;
  
  // Populate modal with slot data
  document.getElementById('bookingTeacher').value = slot.teacher_name;
  document.getElementById('bookingDate').value = slot.available_date;
  document.getElementById('bookingTime').value = slot.start_time;
  document.getElementById('bookingDuration').value = 60;
  document.getElementById('bookingType').value = slot.lesson_type;
  
  // Populate instrument dropdown with available instruments
  const instrumentSelect = document.getElementById('bookingInstrument');
  instrumentSelect.innerHTML = '<option value="">Select instrument</option>';
  
  if (slot.instruments && slot.instruments.length > 0) {
    slot.instruments.forEach(instrument => {
      const option = document.createElement('option');
      option.value = instrument;
      option.textContent = capitalizeFirst(instrument);
      instrumentSelect.appendChild(option);
    });
  } else {
    // Fallback for old data without instruments
    const option = document.createElement('option');
    option.value = 'general';
    option.textContent = 'General Music Lesson';
    instrumentSelect.appendChild(option);
  }
  
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

async function confirmBooking() {
  const form = document.getElementById('bookingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Get the selected availability slot
  const slotId = document.getElementById('bookingForm').dataset.slotId;
  const slot = availableLessons.find(s => s.id == slotId);
  if (!slot) {
    showAlert('Selected time slot not found.', 'danger');
    return;
  }
  
  // Get student ID from user ID
  console.log('Getting student for user ID:', currentUserId);
  const student = await getStudentByUserId(currentUserId);
  console.log('Student data:', student);
  if (!student) {
    showAlert('Student profile not found.', 'danger');
    return;
  }
  
  // Check if student has a payment method
  const paymentMethods = await getStudentPaymentMethods(currentUserId);
  if (!paymentMethods || paymentMethods.length === 0) {
    showAlert('You must add a credit card before booking lessons. Please go to the Payment Methods tab to add a credit card.', 'warning');
    return;
  }
  
  // Get booking data
  const bookingData = {
    teacher_id: slot.teacher_id,
    student_id: student.studentID,
    instrument: document.getElementById('bookingInstrument').value,
    lesson_date: document.getElementById('bookingDate').value,
    lesson_time: document.getElementById('bookingTime').value,
    duration: parseInt(document.getElementById('bookingDuration').value),
    lesson_type: document.getElementById('bookingType').value,
    notes: document.getElementById('bookingNotes').value,
    status: 'upcoming'
  };
  
  // Handle file uploads
  const sheetMusicFiles = document.getElementById('sheetMusic').files;
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add booking data
    Object.keys(bookingData).forEach(key => {
      formData.append(key, bookingData[key]);
    });
    
    // Add sheet music files
    if (sheetMusicFiles && sheetMusicFiles.length > 0) {
      Array.from(sheetMusicFiles).forEach(file => {
        formData.append('sheetMusic', file);
      });
    }
    
    // Book lesson via API with file upload
    const response = await fetch('/api/lessons/book', {
      method: 'POST',
      body: formData // Don't set Content-Type header, let browser set it with boundary
    });
    
    const result = await response.json();
    
    if (result.success) {
      let message = 'Lesson booked successfully!';
      if (result.uploaded_files > 0) {
        message += ` ${result.uploaded_files} sheet music file(s) uploaded.`;
      }
      showAlert(message, 'success');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
      modal.hide();
      
      // Refresh lessons and availability
      loadMyLessons();
      searchAvailability();
    } else {
      showAlert(result.message || 'Failed to book lesson.', 'danger');
    }
  } catch (error) {
    console.error('Error booking lesson:', error);
    showAlert('Error booking lesson. Please try again.', 'danger');
  }
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
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  
  let html = '';
  
  // Day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasAvailability = availableLessons.some(slot => slot.available_date === dateStr);
    const isToday = isCurrentMonth && day === today.getDate();
    
    let dayClasses = 'calendar-day';
    if (isToday) dayClasses += ' today';
    else if (hasAvailability) dayClasses += ' has-availability';
    
    html += `
      <div class="${dayClasses}" onclick="showDayAvailability('${dateStr}')">
        <div class="calendar-day-number">${day}</div>
        ${hasAvailability ? '<div class="availability-indicator"></div>' : ''}
      </div>
    `;
  }
  
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

function goToCurrentMonth() {
  currentMonth = new Date().getMonth(); // Current month (0-indexed)
  currentYear = new Date().getFullYear(); // Current year
  renderCalendar();
}

function showDayAvailability(date) {
  const dayAvailability = availableLessons.filter(slot => slot.available_date === date);
  
  if (dayAvailability.length === 0) {
    showAlert('No availability for this date', 'info');
    return;
  }
  
  // Show availability in a simple format
  const availabilityText = dayAvailability.map(slot => {
    const instruments = slot.instruments && slot.instruments.length > 0 
      ? slot.instruments.map(inst => capitalizeFirst(inst)).join(', ')
      : 'Multiple Available';
    return `${slot.start_time} - ${slot.teacher_name} (${instruments}) - $${slot.rate_per_hour}`;
  }).join('\n');
  
  alert(`Availability for ${formatDate(date)}:\n\n${availabilityText}`);
}

// loadMyLessons is already defined above and loads from database

function renderLessonsTable() {
  const tbody = document.querySelector('#lessonsTableBody');
  
  if (myLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No lessons found</td></tr>';
    return;
  }
  
  tbody.innerHTML = myLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.lesson_date)} ${lesson.lesson_time}</td>
      <td>${lesson.teacher_name}</td>
      <td>${capitalizeFirst(lesson.instrument)}</td>
      <td>${capitalizeFirst(lesson.lesson_type)}</td>
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
      <td>${formatDate(lesson.lesson_date)} ${lesson.lesson_time}</td>
      <td>${lesson.teacher_name}</td>
      <td>${capitalizeFirst(lesson.instrument)}</td>
      <td>${capitalizeFirst(lesson.lesson_type)}</td>
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
    // In a real app, you'd make an API call to cancel the lesson
    myLessons = myLessons.filter(lesson => lesson.id !== lessonId);
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

// PAYMENT METHODS FUNCTIONS

// Setup payment method form (students only use credit cards)
function setupPaymentMethodToggle() {
  // Students only use credit cards, no toggle needed
  const creditCardFields = document.getElementById('creditCardFields');
  if (creditCardFields) {
    creditCardFields.style.display = 'block';
  }
}

// Load payment methods
async function loadPaymentMethods() {
  if (!currentUserId) return;

  try {
    const response = await fetch(`/api/payment-methods/${currentUserId}`);
    const result = await response.json();
    
    if (result.success) {
      renderPaymentMethods(result.payment_methods);
    } else {
      console.error('Failed to load payment methods:', result.message);
    }
  } catch (error) {
    console.error('Error loading payment methods:', error);
  }
}

// Render payment methods list
function renderPaymentMethods(paymentMethods) {
  const container = document.getElementById('paymentMethodsList');
  
  if (!paymentMethods || paymentMethods.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-credit-card fs-1 d-block mb-3"></i>
        <p>No payment methods added yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = paymentMethods.map(method => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center">
              <i class="bi bi-${method.method_type === 'credit_card' ? 'credit-card' : 'bank'} fs-4 me-3"></i>
              <div>
                <h6 class="mb-1">
                  ${method.method_type === 'credit_card' ? 'Credit Card' : 'Bank Account'}
                  ${method.is_primary ? '<span class="badge bg-primary ms-2">Primary</span>' : ''}
                </h6>
                <p class="text-muted mb-0">
                  ${method.method_type === 'credit_card' 
                    ? `**** **** **** ${method.last_four_digits} • Expires ${method.expiry_month}/${method.expiry_year}`
                    : `${method.bank_name} • ****${method.last_four_account}`
                  }
                </p>
                <small class="text-muted">Added ${new Date(method.created_at).toLocaleDateString()}</small>
              </div>
            </div>
          </div>
          <div class="col-md-4 text-end">
            <div class="btn-group" role="group">
              ${!method.is_primary ? `
                <button class="btn btn-outline-primary btn-sm" onclick="setPrimaryPaymentMethod(${method.id})">
                  <i class="bi bi-star me-1"></i>Set Primary
                </button>
              ` : ''}
              <button class="btn btn-outline-danger btn-sm" onclick="deletePaymentMethod(${method.id})">
                <i class="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Add payment method (students only use credit cards)
async function addPaymentMethod() {
  if (!currentUserId) return;

  const isPrimary = document.getElementById('isPrimary').checked;

  const paymentData = {
    user_id: parseInt(currentUserId),
    method_type: 'credit_card',
    is_primary: isPrimary,
    card_number: document.getElementById('cardNumber').value.replace(/\D/g, ''),
    card_holder_name: document.getElementById('cardHolderName').value,
    expiry_month: parseInt(document.getElementById('expiryMonth').value),
    expiry_year: parseInt(document.getElementById('expiryYear').value),
    cvv: document.getElementById('cvv').value
  };

  try {
    const response = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.success) {
      // Close modal and refresh list
      bootstrap.Modal.getInstance(document.getElementById('addPaymentModal')).hide();
      document.getElementById('paymentMethodForm').reset();
      loadPaymentMethods();
      showNotification('Payment method added successfully!', 'success');
    } else {
      showNotification(result.message || 'Failed to add payment method', 'danger');
    }
  } catch (error) {
    console.error('Error adding payment method:', error);
    showNotification('Failed to add payment method', 'danger');
  }
}

// Set primary payment method
async function setPrimaryPaymentMethod(paymentMethodId) {
  if (!currentUserId) return;

  try {
    const response = await fetch(`/api/payment-methods/${currentUserId}/primary`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payment_method_id: paymentMethodId })
    });

    const result = await response.json();

    if (result.success) {
      loadPaymentMethods();
      showNotification('Primary payment method updated!', 'success');
    } else {
      showNotification(result.message || 'Failed to update primary payment method', 'danger');
    }
  } catch (error) {
    console.error('Error setting primary payment method:', error);
    showNotification('Failed to update primary payment method', 'danger');
  }
}

// Delete payment method
async function deletePaymentMethod(paymentMethodId) {
  if (!currentUserId) return;

  if (!confirm('Are you sure you want to delete this payment method?')) {
    return;
  }

  try {
    const response = await fetch(`/api/payment-methods/${currentUserId}/${paymentMethodId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      loadPaymentMethods();
      showNotification('Payment method deleted!', 'success');
    } else {
      showNotification(result.message || 'Failed to delete payment method', 'danger');
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
    showNotification('Failed to delete payment method', 'danger');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// TRANSACTION HISTORY FUNCTIONS

// Load transaction history
async function loadTransactionHistory() {
  if (!currentUserId) return;

  try {
    // Get student ID from user ID
    const student = await getStudentByUserId(currentUserId);
    if (!student) return;

    const response = await fetch(`/api/student/${student.studentID}/payments`);
    const result = await response.json();
    
    if (result.success) {
      renderTransactionHistory(result.payments);
      updateSpendingSummary(result.payments);
    } else {
      console.error('Failed to load transaction history:', result.message);
    }
  } catch (error) {
    console.error('Error loading transaction history:', error);
  }
}

// Get student by user ID
async function getStudentByUserId(userId) {
  try {
    const response = await fetch(`/api/student/${userId}/profile`);
    const result = await response.json();
    
    if (result.success) {
      return result.student;
    } else {
      console.error('Failed to get student:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error getting student:', error);
    return null;
  }
}

async function getStudentPaymentMethods(userId) {
  try {
    const response = await fetch(`/api/payment-methods/${userId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.payment_methods;
    } else {
      console.error('Failed to get payment methods:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
}

// Render transaction history
function renderTransactionHistory(payments) {
  const tbody = document.querySelector('#transactionHistoryTable tbody');
  
  if (!payments || payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions yet</td></tr>';
    return;
  }

  tbody.innerHTML = payments.map(payment => `
    <tr>
      <td>${formatDate(payment.payment_date)}</td>
      <td><code>${payment.transaction_id}</code></td>
      <td>${payment.teacher_name}</td>
      <td>${payment.instrument} - ${payment.lesson_type}</td>
      <td>$${payment.amount.toFixed(2)}</td>
      <td><span class="badge bg-success">${payment.status}</span></td>
    </tr>
  `).join('');
}

// Update spending summary
function updateSpendingSummary(payments) {
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlySpent = payments
    .filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    })
    .reduce((sum, payment) => sum + payment.amount, 0);

  document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
  document.getElementById('monthlySpent').textContent = `$${monthlySpent.toFixed(2)}`;
  document.getElementById('totalLessons').textContent = payments.length;
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Initialize the portal when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadUserData();
  loadAvailableLessons();
  loadPaymentMethods();
  loadTransactionHistory();
  setupPaymentMethodToggle();
  // renderCalendar() is now called after loadAvailableLessons() completes
});

// ==================== RECURRING LESSONS FUNCTIONALITY ====================

let availableRecurringSlots = [];
let myRecurringLessons = [];

// Load available recurring slots
async function loadAvailableRecurringSlots() {
  try {
    const response = await fetch('/api/recurring-slots/available');
    const result = await response.json();
    
    if (result.success) {
      availableRecurringSlots = result.slots || [];
      updateAvailableRecurringTable();
    } else {
      console.error('Failed to load available recurring slots:', result.message);
    }
  } catch (error) {
    console.error('Error loading available recurring slots:', error);
  }
}

// Load student's recurring lessons
async function loadStudentRecurringLessons() {
  try {
    const student = await getStudentByUserId(currentUserId);
    if (!student) {
      console.error('Student not found');
      return;
    }
    const studentId = student.studentID;
    
    const response = await fetch(`/api/student/${studentId}/recurring-lessons`);
    const result = await response.json();
    
    if (result.success) {
      myRecurringLessons = result.lessons || [];
      updateStudentRecurringLessonsTable();
      updateStudentRecurringSummary();
    } else {
      console.error('Failed to load recurring lessons:', result.message);
    }
  } catch (error) {
    console.error('Error loading recurring lessons:', error);
  }
}

// Update available recurring slots table
function updateAvailableRecurringTable() {
  const tbody = document.querySelector('#availableRecurringTable tbody');
  
  if (!tbody) return;
  
  if (availableRecurringSlots.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No recurring slots available</td></tr>';
    return;
  }
  
  tbody.innerHTML = availableRecurringSlots.map(slot => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[slot.day_of_week];
    const time = formatTime(slot.start_time);
    
    return `
      <tr>
        <td>${slot.teacher_name}</td>
        <td>${slot.instrument}</td>
        <td>${dayName} at ${time}</td>
        <td><span class="badge bg-info">${slot.frequency}</span></td>
        <td><span class="badge bg-${slot.lesson_type === 'virtual' ? 'primary' : 'success'}">${slot.lesson_type}</span></td>
        <td>${slot.duration} min</td>
        <td>$${slot.rate_per_hour || 'TBD'}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="bookRecurringSlot(${slot.id})">
            <i class="bi bi-bookmark-plus me-1"></i>Book
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Update student's recurring lessons table
function updateStudentRecurringLessonsTable() {
  const tbody = document.querySelector('#studentRecurringLessonsTable tbody');
  
  if (!tbody) return;
  
  if (myRecurringLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No recurring lessons scheduled</td></tr>';
    return;
  }
  
  tbody.innerHTML = myRecurringLessons.map(lesson => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[lesson.day_of_week];
    const time = formatTime(lesson.start_time);
    const nextLesson = lesson.next_lesson_date ? formatDate(lesson.next_lesson_date) : 'Not scheduled';
    
    return `
      <tr>
        <td>${lesson.teacher_name}</td>
        <td>${lesson.instrument}</td>
        <td>${dayName} at ${time}</td>
        <td><span class="badge bg-info">${lesson.frequency}</span></td>
        <td><span class="badge bg-${lesson.lesson_type === 'virtual' ? 'primary' : 'success'}">${lesson.lesson_type}</span></td>
        <td>${lesson.duration} min</td>
        <td>$${lesson.total_cost || 'TBD'}</td>
        <td><span class="badge bg-${getRecurringStatusColor(lesson.status)}">${lesson.status}</span></td>
        <td>${nextLesson}</td>
        <td>
          <div class="btn-group btn-group-sm">
            ${lesson.status === 'active' ? `
              <button class="btn btn-outline-warning" onclick="pauseRecurringLesson(${lesson.id})" title="Pause">
                <i class="bi bi-pause-circle"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="cancelRecurringLesson(${lesson.id})" title="Cancel">
                <i class="bi bi-x-circle"></i>
              </button>
            ` : lesson.status === 'paused' ? `
              <button class="btn btn-outline-success" onclick="resumeRecurringLesson(${lesson.id})" title="Resume">
                <i class="bi bi-play-circle"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="cancelRecurringLesson(${lesson.id})" title="Cancel">
                <i class="bi bi-x-circle"></i>
              </button>
            ` : `
              <span class="text-muted">Cancelled</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update student recurring summary
function updateStudentRecurringSummary() {
  const activeCount = myRecurringLessons.filter(l => l.status === 'active').length;
  const monthlyCost = myRecurringLessons
    .filter(l => l.status === 'active')
    .reduce((sum, l) => {
      const frequency = l.frequency;
      const cost = l.total_cost || 0;
      let multiplier = 1;
      
      if (frequency === 'weekly') multiplier = 4.33; // Average weeks per month
      else if (frequency === 'biweekly') multiplier = 2.17; // Average bi-weeks per month
      else if (frequency === 'monthly') multiplier = 1;
      
      return sum + (cost * multiplier);
    }, 0);
  
  const nextLesson = myRecurringLessons
    .filter(l => l.status === 'active' && l.next_lesson_date)
    .sort((a, b) => new Date(a.next_lesson_date) - new Date(b.next_lesson_date))[0];
  
  document.getElementById('studentActiveRecurringCount').textContent = activeCount;
  document.getElementById('monthlyRecurringCost').textContent = `$${monthlyCost.toFixed(2)}`;
  document.getElementById('studentNextRecurringLesson').textContent = nextLesson ? formatDate(nextLesson.next_lesson_date) : 'None';
}

// Book recurring slot
function bookRecurringSlot(slotId) {
  const slot = availableRecurringSlots.find(s => s.id === slotId);
  if (!slot) return;
  
  // Populate modal
  document.getElementById('recurringBookingTeacher').value = slot.teacher_name;
  document.getElementById('recurringBookingInstrument').value = slot.instrument;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[slot.day_of_week];
  const time = formatTime(slot.start_time);
  document.getElementById('recurringBookingSchedule').value = `${dayName} at ${time}`;
  
  document.getElementById('recurringBookingDuration').value = `${slot.duration} minutes`;
  document.getElementById('recurringBookingType').value = slot.lesson_type;
  document.getElementById('recurringBookingRate').value = `$${slot.rate_per_hour || 'TBD'}/hour`;
  
  // Set minimum start date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('recurringStartDate').min = tomorrow.toISOString().split('T')[0];
  document.getElementById('recurringStartDate').value = tomorrow.toISOString().split('T')[0];
  
  // Store slot ID for booking
  document.getElementById('recurringBookingForm').dataset.slotId = slotId;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('recurringBookingModal'));
  modal.show();
}

// Confirm recurring booking
async function confirmRecurringBooking() {
  const form = document.getElementById('recurringBookingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const slotId = form.dataset.slotId;
  const startDate = document.getElementById('recurringStartDate').value;
  const frequency = document.getElementById('recurringFrequency').value;
  const notes = document.getElementById('recurringBookingNotes').value;
  
  try {
    const student = await getStudentByUserId(currentUserId);
    if (!student) {
      showAlert('Student profile not found', 'danger');
      return;
    }
    const studentId = student.studentID;
    
    const response = await fetch('/api/recurring-lessons/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slot_id: slotId,
        student_id: studentId,
        start_date: startDate,
        frequency: frequency,
        notes: notes
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Recurring lesson booked successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('recurringBookingModal')).hide();
      loadAvailableRecurringSlots();
      loadStudentRecurringLessons();
    } else {
      showAlert(result.message || 'Failed to book recurring lesson', 'danger');
    }
  } catch (error) {
    console.error('Error booking recurring lesson:', error);
    showAlert('Error booking recurring lesson', 'danger');
  }
}

// Pause recurring lesson
async function pauseRecurringLesson(recurringId) {
  if (!confirm('Pause this recurring lesson? You can resume it later.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/recurring-lessons/${recurringId}/pause`, {
      method: 'PUT'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Recurring lesson paused', 'info');
      loadStudentRecurringLessons();
    } else {
      showAlert(result.message || 'Failed to pause lesson', 'danger');
    }
  } catch (error) {
    console.error('Error pausing recurring lesson:', error);
    showAlert('Error pausing lesson', 'danger');
  }
}

// Resume recurring lesson
async function resumeRecurringLesson(recurringId) {
  try {
    const response = await fetch(`/api/recurring-lessons/${recurringId}/resume`, {
      method: 'PUT'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Recurring lesson resumed', 'success');
      loadStudentRecurringLessons();
    } else {
      showAlert(result.message || 'Failed to resume lesson', 'danger');
    }
  } catch (error) {
    console.error('Error resuming recurring lesson:', error);
    showAlert('Error resuming lesson', 'danger');
  }
}

// Cancel recurring lesson
async function cancelRecurringLesson(recurringId) {
  if (!confirm('Cancel this recurring lesson? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/recurring-lessons/${recurringId}/cancel`, {
      method: 'PUT'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Recurring lesson cancelled', 'info');
      loadStudentRecurringLessons();
    } else {
      showAlert(result.message || 'Failed to cancel lesson', 'danger');
    }
  } catch (error) {
    console.error('Error cancelling recurring lesson:', error);
    showAlert('Error cancelling lesson', 'danger');
  }
}

// Refresh student recurring lessons
function refreshStudentRecurringLessons() {
  loadAvailableRecurringSlots();
  loadStudentRecurringLessons();
}

// Helper functions
function getRecurringStatusColor(status) {
  switch (status) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Update tab switching to load recurring lessons
document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
  tab.addEventListener('shown.bs.tab', function(event) {
    const target = event.target.getAttribute('href');
    
    if (target === '#recurring') {
      loadAvailableRecurringSlots();
      loadStudentRecurringLessons();
    }
  });
});
