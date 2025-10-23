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
document.addEventListener('DOMContentLoaded', async function() {
  // Get user ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  currentUserId = urlParams.get('user_id');
  
  console.log('Current URL:', window.location.href);
  console.log('User ID from URL:', currentUserId);
  
  if (currentUserId) {
    await loadTeacherDataFromAPI();
    await loadAvailability();
    await loadBankInfo();
    await loadPaymentHistory();
  } else {
    console.log('No user_id found in URL, loading sample data');
    loadTeacherData();
  }
  
  updatePricingSummary();
  await loadBookedLessons();
});

async function loadTeacherDataFromAPI() {
  try {
    console.log('Loading teacher data for user ID:', currentUserId);
    // Fetch teacher profile from API
    const response = await fetch(`/api/teacher/${currentUserId}/profile`);
    console.log('API response status:', response.status);
    const result = await response.json();
    console.log('API response data:', result);
    
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
      pricing.rate_per_hour = result.data.rate_per_hour || 60;
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
  document.getElementById('lessonRate').value = pricing.rate_per_hour || '';
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

async function loadAvailability() {
  try {
    const teacher = await getTeacherByUserId(currentUserId);
    if (!teacher) {
      console.log('Teacher not found for loading availability');
      return;
    }
    
    const response = await fetch(`/api/teacher/${teacher.teacherID}/availability`);
    const result = await response.json();
    
    if (result.success) {
      availability = result.availability.map(avail => ({
        id: avail.id,
        date: avail.available_date,
        startTime: avail.start_time,
        endTime: avail.end_time,
        duration: Math.round((new Date(`2000-01-01T${avail.end_time}`) - new Date(`2000-01-01T${avail.start_time}`)) / 60000),
        virtual: avail.lesson_type === 'virtual',
        inPerson: avail.lesson_type === 'in-person',
        instruments: avail.instruments ? JSON.parse(avail.instruments) : [],
        status: 'Available'
      }));
      updateAvailabilityTable();
    } else {
      console.error('Failed to load availability:', result.message);
    }
  } catch (error) {
    console.error('Error loading availability:', error);
  }
}

async function addAvailability() {
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
  const instrumentsSelect = document.getElementById('availableInstruments');
  const selectedInstruments = Array.from(instrumentsSelect.selectedOptions).map(option => option.value);
  
  if (!virtual && !inPerson) {
    alert('Please select at least one lesson type.');
    return;
  }
  
  if (selectedInstruments.length === 0) {
    alert('Please select at least one instrument.');
    return;
  }
  
  // Calculate end time
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(start.getTime() + duration * 60000);
  const endTime = end.toTimeString().slice(0, 5);
  
  try {
    // Get teacher ID
    const teacher = await getTeacherByUserId(currentUserId);
    if (!teacher) {
      alert('Teacher not found');
      return;
    }
    
    // Add availability for each lesson type selected
    const promises = [];
    
    if (virtual) {
      promises.push(
        fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacher_id: teacher.teacherID,
            available_date: date,
            start_time: startTime,
            end_time: endTime,
            lesson_type: 'virtual',
            instruments: selectedInstruments
          })
        })
      );
    }
    
    if (inPerson) {
      promises.push(
        fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacher_id: teacher.teacherID,
            available_date: date,
            start_time: startTime,
            end_time: endTime,
            lesson_type: 'in-person',
            instruments: selectedInstruments
          })
        })
      );
    }
    
    const responses = await Promise.all(promises);
    const results = await Promise.all(responses.map(r => r.json()));
    
    // Check if all requests were successful
    const allSuccess = results.every(r => r.success);
    if (allSuccess) {
      showAlert('Availability added successfully!', 'success');
      loadAvailability(); // Reload availability from server
    } else {
      alert('Error adding availability: ' + results.find(r => !r.success)?.message);
    }
    
  } catch (error) {
    console.error('Error adding availability:', error);
    alert('Error adding availability: ' + error.message);
  }
  
  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById('addAvailabilityModal'));
  modal.hide();
  form.reset();
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
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No availability scheduled</td></tr>';
    return;
  }
  
  tbody.innerHTML = availability.map(item => `
    <tr>
      <td>${formatDate(item.date)}</td>
      <td>${formatTime(item.startTime)}</td>
      <td>${formatTime(item.endTime)}</td>
      <td>${item.duration} min</td>
      <td>
        ${item.instruments.map(inst => `<span class="badge bg-info me-1">${inst}</span>`).join('')}
      </td>
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

async function savePricing() {
  const form = document.getElementById('pricingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const pricingData = {
    rate_per_hour: parseFloat(document.getElementById('lessonRate').value),
    duration: parseInt(document.getElementById('lessonDuration').value),
    virtual: document.getElementById('virtualLessons').checked,
    inPerson: document.getElementById('inPersonLessons').checked
  };
  
  try {
    const response = await fetch(`/api/teacher/${currentUserId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pricingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      pricing = pricingData;
      updatePricingSummary();
      showAlert('Pricing saved successfully!', 'success');
    } else {
      showAlert('Failed to save pricing: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving pricing:', error);
    showAlert('Error saving pricing: ' + error.message, 'danger');
  }
}

function updatePricingSummary() {
  const rate = pricing.rate_per_hour || 0;
  const teacherEarnings = rate * 0.9; // 90% after 10% commission
  
  document.getElementById('currentRate').textContent = `$${rate}`;
  document.getElementById('teacherEarnings').textContent = `$${teacherEarnings.toFixed(2)}`;
}

async function getTeacherByUserId(userId) {
  try {
    console.log('Getting teacher by user ID:', userId);
    const response = await fetch(`/api/teacher/${userId}/profile`);
    console.log('Teacher API response status:', response.status);
    const result = await response.json();
    console.log('Teacher API response data:', result);
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Failed to get teacher:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error getting teacher by user ID:', error);
    return null;
  }
}

async function loadBookedLessons() {
  try {
    console.log('Loading booked lessons...');
    if (!currentUserId) {
      console.log('No user ID available for loading lessons');
      return;
    }

    // Get teacher ID from the teacher profile
    const teacher = await getTeacherByUserId(currentUserId);
    if (!teacher) {
      console.log('Teacher not found');
      return;
    }

    console.log('Teacher found:', teacher);
    console.log('Fetching lessons for teacher ID:', teacher.teacherID);

    // Fetch lessons from API
    const response = await fetch(`/api/teacher/${teacher.teacherID}/lessons`);
    const result = await response.json();
    
    console.log('API response:', result);
    
    if (result.success) {
      const previousCount = bookedLessons ? bookedLessons.length : 0;
      bookedLessons = result.lessons.map(lesson => {
        // Safely parse sheet_music_urls
        let sheetMusicUrls = [];
        try {
          if (lesson.sheet_music_urls) {
            if (typeof lesson.sheet_music_urls === 'string') {
              sheetMusicUrls = JSON.parse(lesson.sheet_music_urls);
            } else if (Array.isArray(lesson.sheet_music_urls)) {
              sheetMusicUrls = lesson.sheet_music_urls;
            }
          }
        } catch (error) {
          console.error('Error parsing sheet_music_urls:', error);
          sheetMusicUrls = [];
        }
        
        return {
          id: lesson.id,
          date: lesson.lesson_date,
          time: lesson.lesson_time,
          student: lesson.student_name,
          instrument: lesson.instrument,
          type: lesson.lesson_type,
          duration: lesson.duration,
          revenue: lesson.teacher_earnings,
          status: lesson.status,
          notes: lesson.notes,
          sheet_music_urls: sheetMusicUrls
        };
      });
      
      console.log('Processed lessons:', bookedLessons);
      updateLessonsTable();
      
      // Show notification if new lessons were added
      if (bookedLessons.length > previousCount && previousCount > 0) {
        showNotification('New lesson booking received!', 'success');
      }
    } else {
      console.error('Failed to load lessons:', result.message);
      bookedLessons = [];
      updateLessonsTable();
    }
  } catch (error) {
    console.error('Error loading lessons:', error);
    bookedLessons = [];
    updateLessonsTable();
  }
}

async function refreshLessons() {
  const refreshBtn = document.querySelector('button[onclick="refreshLessons()"]');
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Refreshing...';
  }
  
  await loadBookedLessons();
  
  if (refreshBtn) {
    refreshBtn.disabled = false;
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Refresh';
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// LESSON COMPLETION FUNCTIONS

let currentLessonId = null;

// Open lesson completion modal
function openCompleteLessonModal(lessonId, studentName, instrument, date, time) {
  currentLessonId = lessonId;
  
  // Populate modal with lesson details
  document.getElementById('completionStudentName').textContent = studentName;
  document.getElementById('completionInstrument').textContent = instrument;
  document.getElementById('completionDate').textContent = formatDate(date);
  document.getElementById('completionTime').textContent = time;
  
  // Clear form
  document.getElementById('completionNotes').value = '';
  document.getElementById('studentRating').value = '';
  document.getElementById('teacherRating').value = '';
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('completeLessonModal'));
  modal.show();
}

// Complete lesson
async function completeLesson() {
  if (!currentLessonId || !currentUserId) return;

  const completionNotes = document.getElementById('completionNotes').value;
  const studentRating = document.getElementById('studentRating').value;
  const teacherRating = document.getElementById('teacherRating').value;

  // Get teacher ID
  const teacher = await getTeacherByUserId(currentUserId);
  if (!teacher) {
    showNotification('Teacher not found', 'danger');
    return;
  }

  const completionData = {
    lesson_id: currentLessonId,
    teacher_id: teacher.teacherID,
    completion_notes: completionNotes,
    student_rating: studentRating ? parseInt(studentRating) : null,
    teacher_rating: teacherRating ? parseInt(teacherRating) : null
  };

  try {
    const response = await fetch(`/api/lessons/${currentLessonId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completionData)
    });

    const result = await response.json();

    if (result.success) {
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('completeLessonModal')).hide();
      
      // Refresh lessons table and payment history
      await loadBookedLessons();
      await loadPaymentHistory();
      
      showNotification('Lesson completed and payment processed!', 'success');
    } else {
      showNotification(result.message || 'Failed to complete lesson', 'danger');
    }
  } catch (error) {
    console.error('Error completing lesson:', error);
    showNotification('Failed to complete lesson', 'danger');
  }
}

// BANK INFORMATION FUNCTIONS

// Save bank information
async function saveBankInfo() {
  if (!currentUserId) return;

  const bankData = {
    user_id: parseInt(currentUserId),
    method_type: 'bank_account',
    bank_name: document.getElementById('bankName').value,
    account_holder_name: document.getElementById('accountHolderName').value,
    bank_routing_number: document.getElementById('routingNumber').value.replace(/\D/g, ''),
    bank_account_number: document.getElementById('accountNumber').value.replace(/\D/g, ''),
    is_primary: true
  };

  try {
    const response = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bankData)
    });

    const result = await response.json();

    if (result.success) {
      // Clear form
      document.getElementById('bankInfoForm').reset();
      
      // Refresh bank info display
      await loadBankInfo();
      
      showNotification('Bank information saved successfully!', 'success');
    } else {
      showNotification(result.message || 'Failed to save bank information', 'danger');
    }
  } catch (error) {
    console.error('Error saving bank information:', error);
    showNotification('Failed to save bank information', 'danger');
  }
}

// Load bank information
async function loadBankInfo() {
  if (!currentUserId) return;

  try {
    const response = await fetch(`/api/payment-methods/${currentUserId}`);
    const result = await response.json();
    
    if (result.success) {
      const bankAccount = result.payment_methods.find(method => method.method_type === 'bank_account');
      renderBankInfo(bankAccount);
    } else {
      console.error('Failed to load bank information:', result.message);
    }
  } catch (error) {
    console.error('Error loading bank information:', error);
  }
}

// Render bank information
function renderBankInfo(bankAccount) {
  const container = document.getElementById('currentBankInfo');
  
  if (!bankAccount) {
    container.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="bi bi-bank fs-1 d-block mb-2"></i>
        <p>No bank information added</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-bank fs-4 me-3 text-primary"></i>
      <div>
        <h6 class="mb-1">${bankAccount.bank_name}</h6>
        <p class="text-muted mb-0">****${bankAccount.last_four_account}</p>
        <small class="text-muted">${bankAccount.account_holder_name}</small>
      </div>
    </div>
  `;
}

// PAYMENT HISTORY FUNCTIONS

// Load payment history
async function loadPaymentHistory() {
  if (!currentUserId) return;

  try {
    // Get teacher ID from user ID
    const teacher = await getTeacherByUserId(currentUserId);
    if (!teacher) {
      console.error('Teacher not found for user ID:', currentUserId);
      return;
    }

    const response = await fetch(`/api/teacher/${teacher.teacherID}/payments`);
    const result = await response.json();
    
    if (result.success) {
      renderPaymentHistory(result.payments);
      updateEarningsSummary(result.payments);
    } else {
      console.error('Failed to load payment history:', result.message);
    }
  } catch (error) {
    console.error('Error loading payment history:', error);
  }
}

// Render payment history
function renderPaymentHistory(payments) {
  const tbody = document.querySelector('#paymentHistoryTable tbody');
  
  if (!payments || payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No payments yet</td></tr>';
    return;
  }

  tbody.innerHTML = payments.map(payment => `
    <tr>
      <td>${formatDate(payment.payment_date)}</td>
      <td>${payment.student_name}</td>
      <td>${payment.instrument} - ${payment.lesson_type}</td>
      <td>$${payment.teacher_earnings.toFixed(2)}</td>
      <td><span class="badge bg-success">${payment.status}</span></td>
    </tr>
  `).join('');
}

// Update earnings summary
function updateEarningsSummary(payments) {
  const totalEarnings = payments.reduce((sum, payment) => sum + payment.teacher_earnings, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyEarnings = payments
    .filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    })
    .reduce((sum, payment) => sum + payment.teacher_earnings, 0);

  document.getElementById('totalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
  document.getElementById('monthlyEarnings').textContent = `$${monthlyEarnings.toFixed(2)}`;
}

function updateLessonsTable() {
  console.log('Updating lessons table with', bookedLessons.length, 'lessons');
  const tbody = document.querySelector('#lessonsTable tbody');
  
  if (!tbody) {
    console.error('Lessons table tbody not found!');
    return;
  }
  
  if (bookedLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No lessons booked</td></tr>';
    return;
  }
  
  tbody.innerHTML = bookedLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.date)} at ${lesson.time}</td>
      <td>${lesson.student}</td>
      <td>${lesson.instrument}</td>
      <td><span class="badge bg-${lesson.type === 'virtual' ? 'info' : 'success'}">${lesson.type}</span></td>
      <td>${lesson.duration}</td>
      <td>$${lesson.revenue}</td>
      <td><span class="badge bg-${lesson.status === 'upcoming' ? 'warning' : lesson.status === 'completed' ? 'success' : 'danger'}">${lesson.status}</span></td>
      <td>
        ${(() => {
          try {
            // Ensure sheet_music_urls is an array
            let sheetMusicUrls = lesson.sheet_music_urls;
            if (typeof sheetMusicUrls === 'string') {
              sheetMusicUrls = JSON.parse(sheetMusicUrls);
            }
            if (!Array.isArray(sheetMusicUrls)) {
              sheetMusicUrls = [];
            }
            
            if (sheetMusicUrls.length > 0) {
              return `
                <div class="d-flex flex-wrap gap-1">
                  ${sheetMusicUrls.map((url, index) => `
                    <a href="${url}" target="_blank" class="btn btn-outline-primary btn-sm" title="View sheet music">
                      <i class="bi bi-file-music me-1"></i>File ${index + 1}
                    </a>
                  `).join('')}
                </div>
              `;
            } else {
              return '<span class="text-muted">None</span>';
            }
          } catch (error) {
            console.error('Error processing sheet music URLs:', error);
            return '<span class="text-muted">Error loading files</span>';
          }
        })()}
      </td>
      <td>
        ${lesson.status === 'upcoming' ? `
          <button class="btn btn-success btn-sm" onclick="openCompleteLessonModal(${lesson.id}, '${lesson.student}', '${lesson.instrument}', '${lesson.date}', '${lesson.time}')">
            <i class="bi bi-check-circle me-1"></i>Complete
          </button>
        ` : lesson.status === 'completed' ? `
          <span class="text-success"><i class="bi bi-check-circle me-1"></i>Completed</span>
        ` : ''}
      </td>
    </tr>
  `).join('');
  
  console.log('Lessons table updated');
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
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No lessons found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredLessons.map(lesson => `
    <tr>
      <td>${formatDate(lesson.date)} at ${lesson.time}</td>
      <td>${lesson.student}</td>
      <td>${lesson.instrument}</td>
      <td><span class="badge bg-${lesson.type === 'virtual' ? 'info' : 'success'}">${lesson.type}</span></td>
      <td>${lesson.duration}</td>
      <td>$${lesson.revenue}</td>
      <td><span class="badge bg-${lesson.status === 'upcoming' ? 'warning' : lesson.status === 'completed' ? 'success' : 'danger'}">${lesson.status}</span></td>
      <td>
        ${lesson.status === 'upcoming' ? `
          <button class="btn btn-success btn-sm" onclick="openCompleteLessonModal(${lesson.id}, '${lesson.student}', '${lesson.instrument}', '${lesson.date}', '${lesson.time}')">
            <i class="bi bi-check-circle me-1"></i>Complete
          </button>
        ` : lesson.status === 'completed' ? `
          <span class="text-success"><i class="bi bi-check-circle me-1"></i>Completed</span>
        ` : ''}
      </td>
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
