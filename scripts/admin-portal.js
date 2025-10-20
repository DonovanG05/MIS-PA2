// Admin Portal JavaScript

// Global variables
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let charts = {};

// Sample data (will be replaced with database data)
const sampleData = {
  revenue: {
    Q1: 15000,
    Q2: 22000,
    Q3: 18000,
    Q4: 25000
  },
  referrals: {
    'Social Media': 35,
    'Google Search': 25,
    'Word of Mouth': 20,
    'Online Ads': 15,
    'Other': 5
  },
  popularInstruments: {
    'Piano': 45,
    'Guitar': 30,
    'Violin': 15,
    'Drums': 10
  },
  revenueByInstrument: {
    'Piano': 40,
    'Guitar': 25,
    'Violin': 20,
    'Drums': 15
  },
  revenueByStudent: {
    'John Smith': 15,
    'Sarah Johnson': 12,
    'Mike Davis': 10,
    'Lisa Wilson': 8,
    'Others': 55
  },
  bookings: [
    {
      date: '2024-01-15',
      time: '10:00 AM',
      teacher: 'Jane Doe',
      student: 'John Smith',
      instrument: 'Piano',
      type: 'Virtual',
      duration: '60 min',
      status: 'Confirmed',
      revenue: 75
    },
    {
      date: '2024-01-16',
      time: '2:00 PM',
      teacher: 'Bob Wilson',
      student: 'Sarah Johnson',
      instrument: 'Guitar',
      type: 'In-Person',
      duration: '45 min',
      status: 'Confirmed',
      revenue: 60
    }
  ],
  users: {
    total: 150,
    teachers: 25,
    students: 125,
    repeatStudents: 45,
    activeThisMonth: 80
  }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  initializeCharts();
  generateCalendar();
  updateUserStats();
});

function initializeDashboard() {
  // Update dashboard stats
  document.getElementById('totalUsers').textContent = sampleData.users.total;
  document.getElementById('totalBookings').textContent = sampleData.bookings.length;
  document.getElementById('repeatStudents').textContent = sampleData.users.repeatStudents;
  
  const totalRevenue = Object.values(sampleData.revenue).reduce((sum, val) => sum + val, 0);
  document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
}

function initializeCharts() {
  // Revenue Bar Chart
  const revenueCtx = document.getElementById('revenueBarChart').getContext('2d');
  charts.revenue = new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue ($)',
        data: Object.values(sampleData.revenue),
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

  // Referral Pie Chart
  const referralCtx = document.getElementById('referralChart').getContext('2d');
  charts.referral = new Chart(referralCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(sampleData.referrals),
      datasets: [{
        data: Object.values(sampleData.referrals),
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
  charts.popularInstruments = new Chart(popularCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(sampleData.popularInstruments),
      datasets: [{
        label: 'Lessons Booked',
        data: Object.values(sampleData.popularInstruments),
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
  charts.revenueByInstrument = new Chart(revenueInstrumentCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(sampleData.revenueByInstrument),
      datasets: [{
        data: Object.values(sampleData.revenueByInstrument),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
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

  // Revenue by Student Chart
  const revenueStudentCtx = document.getElementById('revenueByStudentChart').getContext('2d');
  charts.revenueByStudent = new Chart(revenueStudentCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(sampleData.revenueByStudent),
      datasets: [{
        data: Object.values(sampleData.revenueByStudent),
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

  // Users by Type Chart
  const usersTypeCtx = document.getElementById('usersByTypeChart').getContext('2d');
  charts.usersByType = new Chart(usersTypeCtx, {
    type: 'doughnut',
    data: {
      labels: ['Teachers', 'Students'],
      datasets: [{
        data: [sampleData.users.teachers, sampleData.users.students],
        backgroundColor: ['#FF6384', '#36A2EB']
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

  // User Registration Timeline
  const registrationCtx = document.getElementById('userRegistrationChart').getContext('2d');
  charts.userRegistration = new Chart(registrationCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Users',
        data: [12, 19, 15, 25, 22, 30],
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
    const lessonsOnDate = sampleData.bookings.filter(booking => booking.date === dateString);
    
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
  document.getElementById('usersJoinedCount').textContent = sampleData.users.total;
  document.getElementById('repeatStudentsCount').textContent = sampleData.users.repeatStudents;
  document.getElementById('activeUsersCount').textContent = sampleData.users.activeThisMonth;
}

function exportBookings() {
  // Create CSV content
  let csvContent = "Date,Time,Teacher,Student,Instrument,Type,Duration,Status,Revenue\n";
  sampleData.bookings.forEach(booking => {
    csvContent += `${booking.date},${booking.time},${booking.teacher},${booking.student},${booking.instrument},${booking.type},${booking.duration},${booking.status},$${booking.revenue}\n`;
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

function currentMonth() {
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
