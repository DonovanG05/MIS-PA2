// Admin Portal JavaScript

// Global variables
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let charts = {};
let dashboardData = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin portal loaded, starting data fetch...');
  loadDashboardData();
  loadTransactions();
});

// Load dashboard data from API
async function loadDashboardData() {
  try {
    console.log('Fetching dashboard data from API...');
    const response = await fetch('/api/admin/dashboard');
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('API response:', result);
    
    if (result.success) {
      dashboardData = result.data;
      console.log('Dashboard data loaded:', dashboardData);
      initializeDashboard();
      initializeCharts();
      generateCalendar();
      updateUserStats();
      loadBookingsTable();
    } else {
      console.error('Failed to load dashboard data:', result.message);
      showAlert('Failed to load dashboard data', 'danger');
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showAlert('Error loading dashboard data', 'danger');
  }
}

// Load transactions data
async function loadTransactions() {
  try {
    console.log('Fetching transactions data from API...');
    const response = await fetch('/api/admin/payments');
    const result = await response.json();
    
    if (result.success) {
      console.log('Transactions data loaded:', result);
      renderTransactions(result.payments, result.revenue);
    } else {
      console.error('Failed to load transactions:', result.message);
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

// Render transactions table
function renderTransactions(payments, revenue) {
  console.log('renderTransactions called with:', { payments: payments?.length, revenue });
  
  // Update revenue summary
  if (revenue) {
    console.log('Updating revenue summary with:', revenue);
    const totalRevenueElement = document.getElementById('totalRevenue');
    if (totalRevenueElement) {
      totalRevenueElement.textContent = `$${revenue.total_revenue ? revenue.total_revenue.toFixed(2) : '0.00'}`;
    }
    const totalTransactionsElement = document.getElementById('totalTransactions');
    if (totalTransactionsElement) {
      totalTransactionsElement.textContent = revenue.total_transactions || 0;
    }
    const avgFeeElement = document.getElementById('avgFee');
    if (avgFeeElement) {
      avgFeeElement.textContent = `$${revenue.avg_fee_per_transaction ? revenue.avg_fee_per_transaction.toFixed(2) : '0.00'}`;
    }
  } else {
    console.log('No revenue data provided');
  }

  // Render transactions table
  const tbody = document.querySelector('#transactionsTable tbody');
  
  if (!payments || payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No transactions yet</td></tr>';
    return;
  }

  tbody.innerHTML = payments.map(payment => `
    <tr>
      <td>${formatDate(payment.payment_date)}</td>
      <td><code>${payment.transaction_id}</code></td>
      <td>${payment.student_name}</td>
      <td>${payment.teacher_name}</td>
      <td>${payment.instrument} - ${payment.lesson_type}</td>
      <td>$${payment.amount.toFixed(2)}</td>
      <td>$${payment.platform_fee.toFixed(2)}</td>
      <td>$${payment.teacher_earnings.toFixed(2)}</td>
      <td><span class="badge bg-success">${payment.status}</span></td>
    </tr>
  `).join('');
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function initializeDashboard() {
  if (!dashboardData) {
    console.log('No dashboard data available');
    return;
  }
  
  console.log('Initializing dashboard with data:', dashboardData);
  
  // Update dashboard stats
  const totalUsers = dashboardData.users.total_users || 0;
  const totalBookings = dashboardData.lessons.total_lessons || 0;
  const repeatStudents = dashboardData.repeatStudents || 0;
  const totalRevenue = dashboardData.revenue.total_revenue || 0;
  
  console.log('Updating stats:', { totalUsers, totalBookings, repeatStudents, totalRevenue });
  
  document.getElementById('totalUsers').textContent = totalUsers;
  document.getElementById('totalBookings').textContent = totalBookings;
  document.getElementById('repeatStudents').textContent = repeatStudents;
  document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
}

function initializeCharts() {
  if (!dashboardData) return;
  
  // Revenue Bar Chart
  const revenueCtx = document.getElementById('revenueBarChart').getContext('2d');
  
  // Process quarterly revenue data
  const quarterlyData = {};
  dashboardData.quarterlyRevenue.forEach(q => {
    quarterlyData[q.quarter] = q.revenue || 0;
  });
  
  charts.revenue = new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue ($)',
        data: [
          quarterlyData.Q1 || 0,
          quarterlyData.Q2 || 0,
          quarterlyData.Q3 || 0,
          quarterlyData.Q4 || 0
        ],
        backgroundColor: 'rgba(13, 110, 253, 0.8)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });

  // Referral Pie Chart (placeholder - no referral tracking in database yet)
  const referralCtx = document.getElementById('referralChart').getContext('2d');
  const referralData = {
    'No Data Available': 100
  };
  
  charts.referral = new Chart(referralCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(referralData),
      datasets: [{
        data: Object.values(referralData),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Popular Instruments Chart
  const popularCtx = document.getElementById('popularInstrumentsReportChart').getContext('2d');
  
  const instrumentLabels = dashboardData.popularInstruments.map(inst => inst.instrument);
  const instrumentData = dashboardData.popularInstruments.map(inst => inst.lesson_count);
  
  charts.popularInstruments = new Chart(popularCtx, {
    type: 'bar',
    data: {
      labels: instrumentLabels,
      datasets: [{
        label: 'Lessons Booked',
        data: instrumentData,
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Revenue by Instrument Chart
  const revenueInstrumentCtx = document.getElementById('revenueByInstrumentChart').getContext('2d');
  
  const revenueInstrumentLabels = dashboardData.popularInstruments.map(inst => inst.instrument);
  const revenueInstrumentData = dashboardData.popularInstruments.map(inst => inst.revenue);
  
  charts.revenueByInstrument = new Chart(revenueInstrumentCtx, {
    type: 'pie',
    data: {
      labels: revenueInstrumentLabels,
      datasets: [{
        data: revenueInstrumentData,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Revenue by Student Chart (placeholder - would need student revenue aggregation)
  const revenueStudentCtx = document.getElementById('revenueByStudentChart').getContext('2d');
  charts.revenueByStudent = new Chart(revenueStudentCtx, {
    type: 'doughnut',
    data: {
      labels: ['No Data Available'],
      datasets: [{
        data: [100],
        backgroundColor: ['#FF6384']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Users by Type Chart
  const usersTypeCtx = document.getElementById('usersByTypeChart').getContext('2d');
  charts.usersByType = new Chart(usersTypeCtx, {
    type: 'doughnut',
    data: {
      labels: ['Teachers', 'Students', 'Admins'],
      datasets: [{
        data: [
          dashboardData.users.teachers || 0,
          dashboardData.users.students || 0,
          dashboardData.users.admins || 0
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // User Registration Timeline (placeholder - would need monthly user registration data)
  const registrationCtx = document.getElementById('userRegistrationChart').getContext('2d');
  charts.userRegistration = new Chart(registrationCtx, {
    type: 'line',
    data: {
      labels: ['No Data Available'],
      datasets: [{
        label: 'New Users',
        data: [0],
        borderColor: 'rgba(13, 110, 253, 1)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function generateCalendar() {
  if (!dashboardData) return;
  
  const calendarGrid = document.getElementById('calendarGrid');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  calendarGrid.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day text-center fw-bold bg-light';
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });
  
  // Generate calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (date.getMonth() !== currentMonth) {
      dayElement.classList.add('other-month');
    }
    
    if (date.toDateString() === new Date().toDateString()) {
      dayElement.classList.add('today');
    }
    
    dayElement.textContent = date.getDate();
    
    // Check if this date has lessons
    const dateString = date.toISOString().split('T')[0];
    const lessonsOnDate = dashboardData.recentLessons.filter(lesson => lesson.lesson_date === dateString);
    
    if (lessonsOnDate.length > 0) {
      dayElement.classList.add('has-lessons');
      const lessonCount = document.createElement('div');
      lessonCount.className = 'lesson-count';
      lessonCount.textContent = lessonsOnDate.length;
      dayElement.appendChild(lessonCount);
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

function updateUserStats() {
  if (!dashboardData) return;
  
  document.getElementById('usersJoinedCount').textContent = dashboardData.users.total_users || 0;
  document.getElementById('repeatStudentsCount').textContent = dashboardData.repeatStudents || 0;
  document.getElementById('activeUsersCount').textContent = dashboardData.lessons.total_lessons || 0;
}

// Load bookings table with real data
function loadBookingsTable() {
  if (!dashboardData) {
    console.log('No dashboard data available for bookings table');
    return;
  }
  
  console.log('Loading bookings table with data:', dashboardData.recentLessons);
  
  const tbody = document.querySelector('#bookingsTable tbody');
  if (!tbody) {
    console.log('Bookings table tbody not found');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (!dashboardData.recentLessons || dashboardData.recentLessons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No lessons found</td></tr>';
    console.log('No recent lessons found in dashboard data');
    return;
  }
  
  dashboardData.recentLessons.forEach(lesson => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lesson.lesson_date}</td>
      <td>${lesson.lesson_time}</td>
      <td>${lesson.teacher_name}</td>
      <td>${lesson.student_name}</td>
      <td>${lesson.instrument}</td>
      <td>${lesson.lesson_type}</td>
      <td>${lesson.duration} min</td>
      <td><span class="badge bg-${lesson.status === 'upcoming' ? 'primary' : lesson.status === 'completed' ? 'success' : 'secondary'}">${lesson.status}</span></td>
      <td>$${lesson.total_cost}</td>
    `;
    tbody.appendChild(row);
  });
  
  console.log(`Loaded ${dashboardData.recentLessons.length} lessons into bookings table`);
}

// Show alert function
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
  const alertId = 'alert-' + Date.now();
  
  const alertHTML = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  alertContainer.insertAdjacentHTML('beforeend', alertHTML);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.remove();
    }
  }, 5000);
}

// Create alert container if it doesn't exist
function createAlertContainer() {
  const container = document.createElement('div');
  container.id = 'alertContainer';
  container.className = 'position-fixed top-0 end-0 p-3';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  return container;
}

function exportBookings() {
  if (!dashboardData) return;
  
  // Create CSV content
  let csvContent = "Date,Time,Teacher,Student,Instrument,Type,Duration,Status,Revenue\n";
  dashboardData.recentLessons.forEach(lesson => {
    csvContent += `${lesson.lesson_date},${lesson.lesson_time},${lesson.teacher_name},${lesson.student_name},${lesson.instrument},${lesson.lesson_type},${lesson.duration} min,${lesson.status},$${lesson.total_cost}\n`;
  });
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookings.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

function filterBookings() {
  // Simple filter implementation
  const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
  filterModal.show();
}

function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar();
}

function goToCurrentMonth() {
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  generateCalendar();
}

// Tab switching functionality
document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
  tab.addEventListener('shown.bs.tab', function(event) {
    const target = event.target.getAttribute('href');
    
    // Resize charts when switching to reports tab
    if (target === '#reports') {
      setTimeout(() => {
        Object.values(charts).forEach(chart => {
          if (chart && chart.resize) {
            chart.resize();
          }
        });
      }, 100);
    }
  });
});
