// Freelance Music - Main JavaScript

// Form validation and submission functions
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
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

function submitTeacherSignup() {
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
    instruments: Array.from(document.getElementById('teacherInstruments').selectedOptions).map(option => option.value),
    experience: document.getElementById('teacherExperience').value,
    location: document.getElementById('teacherLocation').value,
    photo: document.getElementById('teacherPhoto').files[0],
    virtual: document.getElementById('teacherVirtual').checked,
    inPerson: document.getElementById('teacherInPerson').checked,
    bio: document.getElementById('teacherBio').value,
    rates: document.getElementById('teacherRates').value
  };
  
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
  
  // Simulate API call
  showLoadingState('teacherSignupForm');
  
  setTimeout(() => {
    console.log('Teacher signup data:', formData);
    showAlert('Welcome to Freelance Music! Your teacher account has been created successfully. You can now start offering lessons to students.', 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('teacherSignupModal'));
    modal.hide();
    document.getElementById('teacherSignupForm').reset();
    
    // In a real app, you would send this data to your backend API
    // fetch('/api/teachers/signup', { method: 'POST', body: JSON.stringify(formData) })
  }, 2000);
}

function submitStudentSignup() {
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
    instrument: document.getElementById('studentInstrument').value,
    level: document.getElementById('studentLevel').value,
    location: document.getElementById('studentLocation').value,
    virtual: document.getElementById('studentVirtual').checked,
    inPerson: document.getElementById('studentInPerson').checked,
    goals: document.getElementById('studentGoals').value,
    budget: document.getElementById('studentBudget').value,
    schedule: document.getElementById('studentSchedule').value
  };
  
  // Validate at least one lesson type is selected
  if (!formData.virtual && !formData.inPerson) {
    showAlert('Please select at least one lesson type (virtual or in-person).', 'danger');
    return;
  }
  
  // Simulate API call
  showLoadingState('studentSignupForm');
  
  setTimeout(() => {
    console.log('Student signup data:', formData);
    showAlert('Welcome to Freelance Music! Your student account has been created successfully. You can now browse and book lessons with teachers.', 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('studentSignupModal'));
    modal.hide();
    document.getElementById('studentSignupForm').reset();
    
    // In a real app, you would send this data to your backend API
    // fetch('/api/students/signup', { method: 'POST', body: JSON.stringify(formData) })
  }, 2000);
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

function submitSignIn() {
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  if (!email || !password) {
    showAlert('Please enter both email and password.', 'danger');
    return;
  }
  
  // Simulate API call
  showLoadingState('signInForm');
  
  setTimeout(() => {
    console.log('Sign in data:', { email, password, rememberMe });
    showAlert('Welcome back! You have successfully signed in.', 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('signInModal'));
    modal.hide();
    document.getElementById('signInForm').reset();
    
    // In a real app, you would send this data to your backend API
    // fetch('/api/auth/signin', { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) })
  }, 2000);
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
