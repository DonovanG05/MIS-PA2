// Freelance Music - Main JavaScript

// Form validation and submission functions
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (input.type === 'file') {
      // File inputs are handled separately
      return;
    }
    
    if (input.multiple) {
      // Handle multi-select dropdowns
      const selectedOptions = Array.from(input.selectedOptions);
      if (selectedOptions.length === 0) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    } else if (!input.value.trim()) {
      input.classList.add('is-invalid');
      isValid = false;
    } else {
      input.classList.remove('is-invalid');
    }
  });
  
  return isValid;
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

// Helper function to convert file to base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function submitTeacherSignup() {
  if (!validateForm('teacherSignupForm')) {
    showAlert('Please fill in all required fields.', 'danger');
    return;
  }
  
  // Get form data
  const formData = {
    firstName: document.getElementById('teacherFirstName').value,
    lastName: document.getElementById('teacherLastName').value,
    email: document.getElementById('teacherEmail').value,
    phone: document.getElementById('teacherPhone').value,
    password: document.getElementById('teacherPassword').value,
    confirmPassword: document.getElementById('teacherConfirmPassword').value,
    instruments: Array.from(document.getElementById('teacherInstruments').selectedOptions).map(option => option.value),
    experience: document.getElementById('teacherExperience').value,
    location: document.getElementById('teacherLocation').value,
    photo: document.getElementById('teacherPhoto').files[0],
    virtual: document.getElementById('teacherVirtual').checked,
    inPerson: document.getElementById('teacherInPerson').checked,
    bio: document.getElementById('teacherBio').value,
    rates: document.getElementById('teacherRates').value
  };
  
  // Validate password
  if (formData.password.length < 6) {
    showAlert('Password must be at least 6 characters long.', 'danger');
    return;
  }
  
  // Validate password confirmation
  if (formData.password !== formData.confirmPassword) {
    showAlert('Passwords do not match.', 'danger');
    return;
  }
  
  // Validate at least one lesson type is selected
  if (!formData.virtual && !formData.inPerson) {
    showAlert('Please select at least one lesson type (virtual or in-person).', 'danger');
    return;
  }
  
  // Validate at least one instrument is selected
  if (formData.instruments.length === 0) {
    showAlert('Please select at least one instrument you teach.', 'danger');
    return;
  }
  
  // Validate profile photo
  if (!formData.photo) {
    showAlert('Please upload a profile photo.', 'danger');
    return;
  }
  
  // Validate photo file size (5MB max)
  if (formData.photo.size > 5 * 1024 * 1024) {
    showAlert('Profile photo must be smaller than 5MB.', 'danger');
    return;
  }
  
  // Validate photo file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(formData.photo.type)) {
    showAlert('Profile photo must be a JPG, PNG, or GIF file.', 'danger');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#teacherSignupModal .btn-primary');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
  submitBtn.disabled = true;

  try {
    // Convert photo to base64 for storage
    const photoBase64 = await convertToBase64(formData.photo);
    
    // Prepare data for API
    const signupData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
      instruments: formData.instruments,
      photo_url: photoBase64,
      rate_per_hour: parseFloat(formData.rates) || 60,
      virtual_available: formData.virtual,
      in_person_available: formData.inPerson
    };
    
    // Debug logging
    console.log('Teacher signup data:', signupData);
    console.log('Instruments array:', formData.instruments);
    console.log('Rate per hour:', formData.rates);

    // Send to API
    const response = await fetch('/api/signup/teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      showAlert('Server error. Please try again.', 'danger');
      return;
    }

    if (result.success) {
      showAlert('Welcome to Freelance Music! Your teacher account has been created successfully. Redirecting to your dashboard...', 'success');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('teacherSignupModal'));
      modal.hide();
      
      // Redirect to teacher portal after a short delay
      setTimeout(() => {
        window.location.href = `teacher-portal.html?user_id=${result.user_id}`;
      }, 2000);

      // Reset form
      document.getElementById('teacherSignupForm').reset();
    } else {
      showAlert(result.message || 'Failed to create teacher account.', 'danger');
    }
  } catch (error) {
    console.error('Teacher signup error:', error);
    showAlert('Failed to create teacher account. Please try again.', 'danger');
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function submitStudentSignup() {
  if (!validateForm('studentSignupForm')) {
    showAlert('Please fill in all required fields.', 'danger');
    return;
  }
  
  // Get form data
  const formData = {
    firstName: document.getElementById('studentFirstName').value,
    lastName: document.getElementById('studentLastName').value,
    email: document.getElementById('studentEmail').value,
    phone: document.getElementById('studentPhone').value,
    password: document.getElementById('studentPassword').value,
    confirmPassword: document.getElementById('studentConfirmPassword').value,
    instrument: document.getElementById('studentInstrument').value,
    level: document.getElementById('studentLevel').value,
    location: document.getElementById('studentLocation').value,
    virtual: document.getElementById('studentVirtual').checked,
    inPerson: document.getElementById('studentInPerson').checked,
    goals: document.getElementById('studentGoals').value,
    budget: document.getElementById('studentBudget').value,
    schedule: document.getElementById('studentSchedule').value
  };
  
  // Validate password
  if (formData.password.length < 6) {
    showAlert('Password must be at least 6 characters long.', 'danger');
    return;
  }
  
  // Validate password confirmation
  if (formData.password !== formData.confirmPassword) {
    showAlert('Passwords do not match.', 'danger');
    return;
  }
  
  // Validate at least one lesson type is selected
  if (!formData.virtual && !formData.inPerson) {
    showAlert('Please select at least one lesson type (virtual or in-person).', 'danger');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#studentSignupModal .btn-success');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
  submitBtn.disabled = true;

  try {
    // Prepare data for API
    const signupData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location,
      primary_instrument: formData.instrument,
      skill_level: formData.level,
      learning_goals: formData.goals
    };

    // Send to API
    const response = await fetch('/api/signup/student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    const result = await response.json();

    if (result.success) {
      showAlert('Welcome to Freelance Music! Your student account has been created successfully. Redirecting to your dashboard...', 'success');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('studentSignupModal'));
      modal.hide();
      
      // Redirect to student portal after a short delay
      setTimeout(() => {
        window.location.href = `student-portal.html?user_id=${result.user_id}`;
      }, 2000);

      // Reset form
      document.getElementById('studentSignupForm').reset();
    } else {
      showAlert(result.message || 'Failed to create student account.', 'danger');
    }
  } catch (error) {
    console.error('Student signup error:', error);
    showAlert('Failed to create student account. Please try again.', 'danger');
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function showLoadingState(formId) {
  const submitButton = document.querySelector(`#${formId}`).closest('.modal').querySelector('button[onclick*="submit"]');
  const originalText = submitButton.innerHTML;
  
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="loading"></span> Processing...';
  
  // Reset button after timeout
  setTimeout(() => {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }, 2000);
}

function showSignInModal() {
  const modal = new bootstrap.Modal(document.getElementById('signInModal'));
  modal.show();
}

async function submitSignIn() {
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  if (!email || !password) {
    showAlert('Please enter both email and password.', 'danger');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#signInModal .btn-primary');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing In...';
  submitBtn.disabled = true;
  
  try {
    // Send to API
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, rememberMe })
    });

    const result = await response.json();

    if (result.success) {
      showAlert(`Welcome back, ${result.user.name}! Redirecting to your dashboard...`, 'success');
      
      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById('signInModal'));
      modal.hide();
      document.getElementById('signInForm').reset();
      
      // Redirect based on user type
      setTimeout(() => {
        if (result.user.user_type === 'teacher') {
          window.location.href = `teacher-portal.html?user_id=${result.user.id}`;
        } else if (result.user.user_type === 'student') {
          window.location.href = `student-portal.html?user_id=${result.user.id}`;
        } else if (result.user.user_type === 'admin') {
          window.location.href = `admin-portal.html?user_id=${result.user.id}`;
        }
      }, 2000);
    } else {
      showAlert(result.message || 'Invalid email or password.', 'danger');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    showAlert('Failed to sign in. Please try again.', 'danger');
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.card, .step-number').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
  
  // Form validation on input
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('is-invalid') && this.value.trim()) {
        this.classList.remove('is-invalid');
      }
    });
  });
  
  // Email validation
  document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', function() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value && !emailRegex.test(this.value)) {
        this.classList.add('is-invalid');
        if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('invalid-feedback')) {
          const feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = 'Please enter a valid email address.';
          this.parentNode.appendChild(feedback);
        }
      } else {
        this.classList.remove('is-invalid');
        const feedback = this.parentNode.querySelector('.invalid-feedback');
        if (feedback) feedback.remove();
      }
    });
  });
  
  // Phone validation
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('blur', function() {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (this.value && !phoneRegex.test(this.value.replace(/[\s\-\(\)]/g, ''))) {
        this.classList.add('is-invalid');
        if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('invalid-feedback')) {
          const feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = 'Please enter a valid phone number.';
          this.parentNode.appendChild(feedback);
        }
      } else {
        this.classList.remove('is-invalid');
        const feedback = this.parentNode.querySelector('.invalid-feedback');
        if (feedback) feedback.remove();
      }
    });
  });
});
