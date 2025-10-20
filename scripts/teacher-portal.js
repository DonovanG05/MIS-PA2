// Teacher Portal JavaScript

// Global variables
let teacherProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  instruments: [],
  photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0zMCAxMTBDMzAgMTA1LjU4IDM0LjU4IDEwMSA0MCAxMDFIMTEwQzExNS40MiAxMDEgMTIwIDEwNS41OCAxMjAgMTEwVjExMEgzMFYxMTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZmlsZTwvdGV4dD4KPC9zdmc+"
};
let availability = [];
let bookedLessons = [];
let pricing = {
  rate: 60,
  duration: 60,
  virtual: true,
  inPerson: true
};
let currentUserId = null;

// Sample data
const sampleLessons = [
  {
    id: 1,
    date: '2024-01-15',
    time: '10:00 AM',
    student: 'John Smith',
    instrument: 'Piano',
    type: 'Virtual',
    duration: '60 min',
    revenue: 54,
    status: 'Confirmed'
  },
  {
    id: 2,
    date: '2024-01-16',
    time: '2:00 PM',
    student: 'Sarah Johnson',
    instrument: 'Guitar',
    type: 'In-Person',
    duration: '45 min',
    revenue: 40.5,
    status: 'Confirmed'
  }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Get user ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  currentUserId = urlParams.get('user_id');
  
  if (currentUserId) {
    loadTeacherDataFromAPI();
  } else {
    loadTeacherData();
  }
  
  updatePricingSummary();
  loadBookedLessons();
});

async function loadTeacherDataFromAPI() {
  try {
    // Fetch teacher profile from API
    const response = await fetch(`/api/teacher/${currentUserId}/profile`);
    const result = await response.json();
    
    if (result.success) {
      teacherProfile = {
        name: result.data.name || '',
        email: result.data.email || '',
        phone: result.data.phone || '',
        location: result.data.location || '',
        bio: result.data.bio || '',
        instruments: result.data.instruments || [],
        photo: result.data.photo_url || teacherProfile.photo
      };
      
      // Update pricing from profile data
      pricing.rate = result.data.rate_per_hour || 60;
      pricing.virtual = result.data.virtual_available || false;
      pricing.inPerson = result.data.in_person_available || false;
      
      populateProfileForm();
      populatePricingForm();
    } else {
      console.error('Failed to load teacher profile:', result.message);
      showAlert('Failed to load profile data', 'danger');
    }
  } catch (error) {
    console.error('Error loading teacher data:', error);
    showAlert('Error loading profile data', 'danger');
  }
}

function loadTeacherData() {
  // Fallback: Load teacher profile data from localStorage
  const savedProfile = localStorage.getItem('teacherProfile');
  if (savedProfile) {
    teacherProfile = JSON.parse(savedProfile);
  }
  
  const savedPricing = localStorage.getItem('teacherPricing');
  if (savedPricing) {
    pricing = JSON.parse(savedPricing);
  }
  
  // Always populate forms with current data
  populateProfileForm();
  populatePricingForm();
}

function populateProfileForm() {
  document.getElementById('teacherName').value = teacherProfile.name || '';
  document.getElementById('teacherEmail').value = teacherProfile.email || '';
  document.getElementById('teacherPhone').value = teacherProfile.phone || '';
  document.getElementById('teacherLocation').value = teacherProfile.location || '';
  document.getElementById('teacherBio').value = teacherProfile.bio || '';
  
  if (teacherProfile.instruments) {
    const instrumentSelect = document.getElementById('teacherInstruments');
    teacherProfile.instruments.forEach(instrument => {
      const option = instrumentSelect.querySelector(`option[value="${instrument}"]`);
      if (option) option.selected = true;
    });
  }
  
  if (teacherProfile.photo) {
    document.getElementById('profilePhotoPreview').src = teacherProfile.photo;
  }
}

function populatePricingForm() {
  document.getElementById('lessonRate').value = pricing.rate || '';
  document.getElementById('lessonDuration').value = pricing.duration || 60;
  document.getElementById('virtualLessons').checked = pricing.virtual !== false;
  document.getElementById('inPersonLessons').checked = pricing.inPerson !== false;
}

function previewPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profilePhotoPreview').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function updateTeacherProfile() {
  const form = document.getElementById('teacherProfileForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Get form data
  const profileData = {
    name: document.getElementById('teacherName').value,
    email: document.getElementById('teacherEmail').value,
    phone: document.getElementById('teacherPhone').value,
    location: document.getElementById('teacherLocation').value,
    bio: document.getElementById('teacherBio').value,
    instruments: Array.from(document.getElementById('teacherInstruments').selectedOptions).map(option => option.value),
    photo_url: document.getElementById('profilePhotoPreview').src
  };
  
  // Validate required fields
  if (profileData.instruments.length === 0) {
    alert('Please select at least one instrument you teach.');
    return;
  }
  
  if (currentUserId) {
    // Update profile in database
    try {
      const response = await fetch(`/api/teacher/${currentUserId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        teacherProfile = profileData;
        showAlert('Profile updated successfully!', 'success');
      } else {
        showAlert(result.message || 'Failed to update profile', 'danger');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Error updating profile', 'danger');
    }
  } else {
    // Fallback: Update local storage
    teacherProfile = profileData;
    localStorage.setItem('teacherProfile', JSON.stringify(profileData));
    showAlert('Profile updated successfully!', 'success');
  }
}

function addAvailability() {
  const form = document.getElementById('availabilityForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const date = document.getElementById('availableDate').value;
  const startTime = document.getElementById('startTime').value;
  const duration = parseInt(document.getElementById('duration').value);
  const virtual = document.getElementById('modalVirtual').checked;
  const inPerson = document.getElementById('modalInPerson').checked;
  
  if (!virtual && !inPerson) {
    alert('Please select at least one lesson type.');
    return;
  }
  
  // Calculate end time
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(start.getTime() + duration * 60000);
  const endTime = end.toTimeString().slice(0, 5);
  
  const availabilityData = {
    id: Date.now(),
    date: date,
    startTime: startTime,
    endTime: endTime,
    duration: duration,
    virtual: virtual,
    inPerson: inPerson,
    status: 'Available'
  };
  
  availability.push(availabilityData);
  updateAvailabilityTable();
  
  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById('addAvailabilityModal'));
  modal.hide();
  form.reset();
  
  showAlert('Availability added successfully!', 'success');
}

function addQuickAvailability() {
  const form = document.getElementById('quickAvailabilityForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const date = document.getElementById('quickDate').value;
  const startTime = document.getElementById('quickStartTime').value;
  const duration = parseInt(document.getElementById('quickDuration').value);
  
  // Calculate end time
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(start.getTime() + duration * 60000);
  const endTime = end.toTimeString().slice(0, 5);
  
  const availabilityData = {
    id: Date.now(),
    date: date,
    startTime: startTime,
    endTime: endTime,
    duration: duration,
    virtual: true,
    inPerson: true,
    status: 'Available'
  };
  
  availability.push(availabilityData);
  updateAvailabilityTable();
  
  // Reset form
  form.reset();
  
  showAlert('Availability added successfully!', 'success');
}

function updateAvailabilityTable() {
  const tbody = document.querySelector('#availabilityTable tbody');
  
  if (availability.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No availability scheduled</td></tr>';
    return;
  }
  
  tbody.innerHTML = availability.map(item => `
    <tr>
      <td>${formatDate(item.date)}</td>
      <td>${formatTime(item.startTime)}</td>
      <td>${formatTime(item.endTime)}</td>
      <td>${item.duration} min</td>
      <td><span class="badge bg-success">${item.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="removeAvailability(${item.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function removeAvailability(id) {
  availability = availability.filter(item => item.id !== id);
  updateAvailabilityTable();
  showAlert('Availability removed successfully!', 'success');
}

function savePricing() {
  const form = document.getElementById('pricingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const pricingData = {
    rate: parseFloat(document.getElementById('lessonRate').value),
    duration: parseInt(document.getElementById('lessonDuration').value),
    virtual: document.getElementById('virtualLessons').checked,
    inPerson: document.getElementById('inPersonLessons').checked
  };
  
  pricing = pricingData;
  localStorage.setItem('teacherPricing', JSON.stringify(pricingData));
  updatePricingSummary();
  
  showAlert('Pricing saved successfully!', 'success');
}

function updatePricingSummary() {
  const rate = pricing.rate || 0;
  const teacherEarnings = rate * 0.9; // 90% after 10% commission
  
  document.getElementById('currentRate').textContent = `$${rate}`;
  document.getElementById('teacherEarnings').textContent = `$${teacherEarnings.toFixed(2)}`;
}

function loadBookedLessons() {
  bookedLessons = [...sampleLessons];
  updateLessonsTable();
}

function updateLessonsTable() {
  const tbody = document.querySelector('#lessonsTable tbody');
  
  if (bookedLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No lessons booked</td></tr>';
    return;
  }
  
  tbody.innerHTML = bookedLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.date)} at ${lesson.time}</td>
      <td>${lesson.student}</td>
      <td>${lesson.instrument}</td>
      <td>${lesson.type}</td>
      <td>${lesson.duration}</td>
      <td>$${lesson.revenue}</td>
      <td><span class="badge bg-success">${lesson.status}</span></td>
    </tr>
  `).join('');
}

function filterLessons(filter) {
  // Update button states
  document.querySelectorAll('#lessons .btn-group button').forEach(btn => {
    btn.classList.remove('btn-primary', 'active');
    btn.classList.add('btn-outline-secondary');
  });
  
  event.target.classList.remove('btn-outline-secondary');
  event.target.classList.add('btn-primary', 'active');
  
  // Filter lessons based on date
  const today = new Date();
  let filteredLessons = [...bookedLessons];
  
  if (filter === 'upcoming') {
    filteredLessons = bookedLessons.filter(lesson => new Date(lesson.date) >= today);
  } else if (filter === 'past') {
    filteredLessons = bookedLessons.filter(lesson => new Date(lesson.date) < today);
  }
  
  // Update table
  const tbody = document.querySelector('#lessonsTable tbody');
  
  if (filteredLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No lessons found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.date)} at ${lesson.time}</td>
      <td>${lesson.student}</td>
      <td>${lesson.instrument}</td>
      <td>${lesson.type}</td>
      <td>${lesson.duration}</td>
      <td>$${lesson.revenue}</td>
      <td><span class="badge bg-success">${lesson.status}</span></td>
    </tr>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function showAlert(message, type = 'success') {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());
  
  // Create new alert
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Tab switching functionality
document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
  tab.addEventListener('shown.bs.tab', function(event) {
    const target = event.target.getAttribute('href');
    
    if (target === '#schedule') {
      updateAvailabilityTable();
    } else if (target === '#lessons') {
      updateLessonsTable();
    } else if (target === '#pricing') {
      updatePricingSummary();
    }
  });
});
