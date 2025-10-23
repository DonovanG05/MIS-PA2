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
  
  // Add a small delay to ensure DOM is fully ready
  setTimeout(() => {
    console.log('Loading transactions after delay...');
    loadTransactions();
  }, 100);
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
      console.log('Revenue data:', result.revenue);
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
    const platformRevenueElement = document.getElementById('platformRevenue');
    console.log('platformRevenueElement found:', !!platformRevenueElement);
    if (platformRevenueElement) {
      const revenueAmount = revenue.total_revenue ? revenue.total_revenue.toFixed(2) : '0.00';
      console.log('Setting platform revenue to:', revenueAmount);
      platformRevenueElement.textContent = `$${revenueAmount}`;
    } else {
      console.error('platformRevenue element not found!');
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
  const recurringLessons = dashboardData.recurringStats?.active_recurring || 0;
  
  console.log('Updating stats:', { totalUsers, totalBookings, repeatStudents, recurringLessons });
  
  // Update elements
  const totalUsersEl = document.getElementById('totalUsers');
  const totalBookingsEl = document.getElementById('totalBookings');
  const repeatStudentsEl = document.getElementById('repeatStudents');
  const recurringLessonsEl = document.getElementById('recurringLessons');
  
  console.log('Elements found:', {
    totalUsers: !!totalUsersEl,
    totalBookings: !!totalBookingsEl,
    repeatStudents: !!repeatStudentsEl,
    recurringLessons: !!recurringLessonsEl
  });
  
  if (totalUsersEl) totalUsersEl.textContent = totalUsers;
  if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
  if (repeatStudentsEl) repeatStudentsEl.textContent = repeatStudents;
  if (recurringLessonsEl) recurringLessonsEl.textContent = recurringLessons;
}

function initializeCharts() {
  if (!dashboardData) return;
  
  // Revenue Bar Chart
  const revenueCtx = document.getElementById('revenueBarChart').getContext('2d');
  
  // Process quarterly revenue data
  console.log('Quarterly revenue data:', dashboardData.quarterlyRevenue);
  const quarterlyData = {};
  dashboardData.quarterlyRevenue.forEach(q => {
    quarterlyData[q.quarter] = q.revenue || 0;
  });
  console.log('Processed quarterly data:', quarterlyData);
  
  charts.revenue = new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Platform Revenue ($)',
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

  // Referral Bar Chart
  const referralCtx = document.getElementById('referralChart').getContext('2d');
  
  // Load referral data
  loadReferralData().then(referralData => {
    charts.referral = new Chart(referralCtx, {
      type: 'bar',
      data: {
        labels: referralData.labels,
        datasets: [{
          label: 'Number of Students',
          data: referralData.data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ],
          borderColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
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

  // Repeat Lessons Bar Chart
  const repeatLessonsCtx = document.getElementById('repeatLessonsChart').getContext('2d');
  
  // Load repeat lessons data
  loadRepeatLessonsData().then(repeatData => {
    charts.repeatLessons = new Chart(repeatLessonsCtx, {
      type: 'bar',
      data: {
        labels: repeatData.labels,
        datasets: [{
          label: 'Number of Lessons',
          data: repeatData.data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#4BC0C0',
            '#9966FF',
            '#FF6384',
            '#36A2EB'
          ],
          borderColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#4BC0C0',
            '#9966FF',
            '#FF6384',
            '#36A2EB'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `${context.label}: ${value} lesson${value > 1 ? 's' : ''}`;
              }
            }
          }
        }
      }
    });
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
          position: 'bottom',
          labels: {
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                
                return data.labels.map((label, index) => {
                  const value = dataset.data[index];
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  
                  return {
                    text: `${label}: $${value} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.backgroundColor[index],
                    lineWidth: 0,
                    hidden: false,
                    index: index
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              
              return `${label}: $${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Revenue by Student Chart
  const revenueStudentCtx = document.getElementById('revenueByStudentChart').getContext('2d');
  
  const revenueStudentLabels = dashboardData.revenueByStudent.map(student => student.student_name);
  const revenueStudentData = dashboardData.revenueByStudent.map(student => student.platform_fee);
  
  charts.revenueByStudent = new Chart(revenueStudentCtx, {
    type: 'pie',
    data: {
      labels: revenueStudentLabels,
      datasets: [{
        data: revenueStudentData,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#4BC0C0',
          '#9966FF',
          '#FF6384',
          '#36A2EB'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                
                return data.labels.map((label, index) => {
                  const value = dataset.data[index];
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  
                  return {
                    text: `${label}: $${value} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.backgroundColor[index],
                    lineWidth: 0,
                    hidden: false,
                    index: index
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              
              // Get the full student data for additional info
              const studentIndex = context.dataIndex;
              const studentData = dashboardData.revenueByStudent[studentIndex];
              
              return [
                `${label}: $${value} platform fee (${percentage}%)`,
                `Total spent: $${studentData.total_spent}`,
                `Lessons: ${studentData.lesson_count}`
              ];
            }
          }
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
      dayElement.style.cursor = 'pointer';
      dayElement.addEventListener('click', () => showLessonDetails(dateString, lessonsOnDate));
      
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

// Load referral data from API
async function loadReferralData() {
  try {
    const response = await fetch('/api/admin/referral-report');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Failed to load referral data:', result.message);
      return { labels: ['No Data'], data: [0] };
    }
  } catch (error) {
    console.error('Error loading referral data:', error);
    return { labels: ['No Data'], data: [0] };
  }
}

async function loadRepeatLessonsData() {
  try {
    const response = await fetch('/api/admin/repeat-lessons-report');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Failed to load repeat lessons data:', result.message);
      return { labels: ['No Data'], data: [0] };
    }
  } catch (error) {
    console.error('Error loading repeat lessons data:', error);
    return { labels: ['No Data'], data: [0] };
  }
}

// Show lesson details modal
function showLessonDetails(dateString, lessons) {
  const modal = new bootstrap.Modal(document.getElementById('lessonDetailsModal'));
  const content = document.getElementById('lessonDetailsContent');
  
  // Format the date
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Generate lesson details HTML
  let html = `
    <div class="mb-3">
      <h6 class="text-primary">${formattedDate}</h6>
      <p class="text-muted">${lessons.length} lesson${lessons.length > 1 ? 's' : ''} scheduled</p>
    </div>
    <div class="row">
  `;
  
  lessons.forEach((lesson, index) => {
    const statusBadge = getStatusBadge(lesson.status);
    const lessonTypeBadge = getLessonTypeBadge(lesson.lesson_type);
    
    html += `
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">${lesson.teacher_name}</h6>
              ${statusBadge}
            </div>
            <p class="card-text mb-1">
              <strong>Student:</strong> ${lesson.student_name || 'Unknown'}<br>
              <strong>Instrument:</strong> ${lesson.instrument || 'N/A'}<br>
              <strong>Time:</strong> ${lesson.lesson_time}<br>
              <strong>Duration:</strong> ${lesson.duration} minutes<br>
              <strong>Type:</strong> ${lessonTypeBadge}<br>
              <strong>Cost:</strong> $${lesson.total_cost || '0.00'}
            </p>
            ${lesson.notes ? `<p class="card-text"><small class="text-muted"><strong>Notes:</strong> ${lesson.notes}</small></p>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  content.innerHTML = html;
  modal.show();
}

// Helper function to get status badge
function getStatusBadge(status) {
  const badges = {
    'upcoming': '<span class="badge bg-primary">Upcoming</span>',
    'completed': '<span class="badge bg-success">Completed</span>',
    'cancelled': '<span class="badge bg-danger">Cancelled</span>'
  };
  return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Helper function to get lesson type badge
function getLessonTypeBadge(type) {
  const badges = {
    'virtual': '<span class="badge bg-info">Virtual</span>',
    'in-person': '<span class="badge bg-warning">In-Person</span>'
  };
  return badges[type] || '<span class="badge bg-secondary">Unknown</span>';
}
