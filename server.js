// server.js - Express server for Freelance Music
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const Database = require('./scripts/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for large images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For form data
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only PDF, JPG, JPEG, PNG files
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
  }
});

// Initialize database
const db = new Database();

// Initialize database on server start
async function startServer() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');
    
    // Clean up past availability entries on startup
    const deletedCount = await db.cleanupPastAvailability();
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} past availability entries`);
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// API Routes

// User authentication
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await db.authenticateUser(email, password);
    
    if (user) {
      res.json({
        success: true,
        message: 'Sign in successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          user_type: user.user_type
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign in',
      error: error.message
    });
  }
});

// User signup routes
app.post('/api/signup/teacher', async (req, res) => {
  try {
    const { name, email, password, phone, location, bio, instruments, photo_url, rate_per_hour, virtual_available, in_person_available } = req.body;
    
    // Debug logging
    console.log('Teacher signup received:', {
      name, email, instruments, rate_per_hour, virtual_available, in_person_available
    });
    
    // Create user first
    const userResult = await db.createUser({
      name,
      email,
      password,
      phone,
      location,
      user_type: 'teacher'
    });
    
    // Create teacher profile
    const teacherResult = await db.createTeacher({
      user_id: userResult.id,
      bio,
      instruments,
      photo_url: photo_url || 'https://via.placeholder.com/150',
      rate_per_hour: rate_per_hour ? parseFloat(rate_per_hour) : 60, // Default to 60 if not provided
      virtual_available: virtual_available || true,
      in_person_available: in_person_available || true
    });
    
    res.json({
      success: true,
      message: 'Teacher account created successfully',
      user_id: userResult.id,
      teacher_id: teacherResult.id
    });
  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher account',
      error: error.message
    });
  }
});

app.post('/api/signup/student', async (req, res) => {
  try {
    const { name, email, password, phone, location, primary_instrument, skill_level, learning_goals, referral_source } = req.body;
    
    // Create user first
    const userResult = await db.createUser({
      name,
      email,
      password,
      phone,
      location,
      user_type: 'student'
    });
    
    // Create student profile
    const studentResult = await db.createStudent({
      user_id: userResult.id,
      primary_instrument,
      skill_level,
      learning_goals,
      referral_source
    });
    
    res.json({
      success: true,
      message: 'Student account created successfully',
      user_id: userResult.id,
      student_id: studentResult.id
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student account',
      error: error.message
    });
  }
});

// Get available lessons
app.get('/api/lessons/available', async (req, res) => {
  try {
    const { instrument, lessonType } = req.query;
    
    if (!instrument || !lessonType) {
      return res.status(400).json({
        success: false,
        message: 'Instrument and lesson type are required'
      });
    }
    
    const lessons = await db.getAvailableLessons(instrument, lessonType);
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Get available lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available lessons',
      error: error.message
    });
  }
});

// Book a lesson with file upload support
app.post('/api/lessons/book', upload.array('sheetMusic', 5), async (req, res) => {
  try {
    const lessonData = req.body;
    
    // Get teacher by teacher ID (not user ID)
    const teacher = await db.get('SELECT * FROM teachers WHERE teacherID = ?', [lessonData.teacher_id]);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    lessonData.rate_per_hour = teacher.rate_per_hour;
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
      lessonData.sheet_music_urls = JSON.stringify(fileUrls);
    } else {
      lessonData.sheet_music_urls = JSON.stringify([]);
    }
    
    const result = await db.bookLesson(lessonData);
    
    res.json({
      success: true,
      message: 'Lesson booked successfully',
      lesson_id: result.lastID,
      uploaded_files: req.files ? req.files.length : 0
    });
  } catch (error) {
    console.error('Book lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book lesson',
      error: error.message
    });
  }
});

// Get student lessons
app.get('/api/student/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    const lessons = await db.getStudentLessons(parseInt(id), status);
    
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Get student lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student lessons',
      error: error.message
    });
  }
});

// Get teacher lessons
app.get('/api/teacher/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    const lessons = await db.getTeacherLessons(parseInt(id));
    
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Get teacher lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher lessons',
      error: error.message
    });
  }
});

// Get teacher profile by email
app.get('/api/teacher/email/:email/profile', async (req, res) => {
  try {
    const { email } = req.params;
    
    const teacher = await db.getTeacherByEmail(email);
    
    if (teacher) {
      res.json({
        success: true,
        data: teacher
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
  } catch (error) {
    console.error('Get teacher profile by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher profile',
      error: error.message
    });
  }
});

// Get current date/time
app.get('/api/current-datetime', (req, res) => {
  const now = new Date();
  res.json({
    success: true,
    current_date: now.toISOString().split('T')[0], // YYYY-MM-DD
    current_time: now.toTimeString().split(' ')[0], // HH:MM:SS
    current_datetime: now.toISOString(), // Full ISO string
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
});

// Clean up past availability entries
app.post('/api/cleanup-past-availability', async (req, res) => {
  try {
    const deletedCount = await db.cleanupPastAvailability();
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} past availability entries`,
      deleted_count: deletedCount
    });
  } catch (error) {
    console.error('Cleanup past availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup past availability',
      error: error.message
    });
  }
});

// Add teacher availability
app.post('/api/availability', async (req, res) => {
  try {
    const { teacher_id, available_date, start_time, end_time, lesson_type, instruments } = req.body;
    
    if (!teacher_id || !available_date || !start_time || !end_time || !lesson_type || !instruments || instruments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required including instruments'
      });
    }
    
    const result = await db.addAvailability({
      teacher_id,
      available_date,
      start_time,
      end_time,
      lesson_type,
      instruments
    });
    
    res.json({
      success: true,
      message: 'Availability added successfully',
      availability_id: result.lastID
    });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add availability',
      error: error.message
    });
  }
});

// Get teacher availability
app.get('/api/teacher/:teacherId/availability', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const availability = await db.getTeacherAvailability(parseInt(teacherId));
    
    res.json({
      success: true,
      availability: availability
    });
  } catch (error) {
    console.error('Get teacher availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability',
      error: error.message
    });
  }
});

// PAYMENT METHODS API

// Add payment method
app.post('/api/payment-methods', async (req, res) => {
  try {
    const { user_id, method_type, ...paymentData } = req.body;
    
    // Validate based on method type
    if (method_type === 'credit_card') {
      const cardValidation = db.validateCreditCard(paymentData.card_number);
      if (!cardValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cardValidation.error
        });
      }
      
      const cvvValidation = db.validateCVV(paymentData.cvv);
      if (!cvvValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cvvValidation.error
        });
      }
      
      const expiryValidation = db.validateExpiryDate(paymentData.expiry_month, paymentData.expiry_year);
      if (!expiryValidation.valid) {
        return res.status(400).json({
          success: false,
          message: expiryValidation.error
        });
      }
    } else if (method_type === 'bank_account') {
      const routingValidation = db.validateRoutingNumber(paymentData.bank_routing_number);
      if (!routingValidation.valid) {
        return res.status(400).json({
          success: false,
          message: routingValidation.error
        });
      }
      
      const accountValidation = db.validateAccountNumber(paymentData.bank_account_number);
      if (!accountValidation.valid) {
        return res.status(400).json({
          success: false,
          message: accountValidation.error
        });
      }
    }
    
    const result = await db.addPaymentMethod({ user_id, method_type, ...paymentData });
    
    res.json({
      success: true,
      message: 'Payment method added successfully',
      payment_method_id: result.lastID
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message
    });
  }
});

// Get user's payment methods
app.get('/api/payment-methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const paymentMethods = await db.getPaymentMethods(parseInt(userId));
    
    res.json({
      success: true,
      payment_methods: paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
});

// Set primary payment method
app.put('/api/payment-methods/:userId/primary', async (req, res) => {
  try {
    const { userId } = req.params;
    const { payment_method_id } = req.body;
    
    await db.setPrimaryPaymentMethod(parseInt(userId), parseInt(payment_method_id));
    
    res.json({
      success: true,
      message: 'Primary payment method updated'
    });
  } catch (error) {
    console.error('Set primary payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary payment method',
      error: error.message
    });
  }
});

// Delete payment method
app.delete('/api/payment-methods/:userId/:paymentMethodId', async (req, res) => {
  try {
    const { userId, paymentMethodId } = req.params;
    
    await db.deletePaymentMethod(parseInt(paymentMethodId), parseInt(userId));
    
    res.json({
      success: true,
      message: 'Payment method deleted'
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: error.message
    });
  }
});

// LESSON COMPLETION API

// Complete a lesson
app.post('/api/lessons/:lessonId/complete', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { teacher_id, completion_notes, student_rating, teacher_rating } = req.body;
    
    const completionData = {
      lesson_id: parseInt(lessonId),
      teacher_id: parseInt(teacher_id),
      completion_notes,
      student_rating: student_rating ? parseInt(student_rating) : null,
      teacher_rating: teacher_rating ? parseInt(teacher_rating) : null
    };
    
    await db.completeLesson(completionData);
    
    res.json({
      success: true,
      message: 'Lesson marked as completed'
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson',
      error: error.message
    });
  }
});

// Get lesson completion details
app.get('/api/lessons/:lessonId/completion', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const completion = await db.getLessonCompletion(parseInt(lessonId));
    
    if (!completion) {
      return res.status(404).json({
        success: false,
        message: 'Lesson completion not found'
      });
    }
    
    res.json({
      success: true,
      completion
    });
  } catch (error) {
    console.error('Get lesson completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lesson completion',
      error: error.message
    });
  }
});

// Get teacher's completed lessons
app.get('/api/teacher/:teacherId/completed-lessons', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const completedLessons = await db.getTeacherCompletedLessons(parseInt(teacherId));
    
    res.json({
      success: true,
      completed_lessons: completedLessons
    });
  } catch (error) {
    console.error('Get completed lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get completed lessons',
      error: error.message
    });
  }
});

// Get teacher's payment history
app.get('/api/teacher/:teacherId/payments', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const payments = await db.getTeacherPayments(parseInt(teacherId));
    
    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get teacher payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// ADMIN REVENUE API

// Get all payments for admin dashboard
app.get('/api/admin/payments', async (req, res) => {
  try {
    const payments = await db.getAllPayments();
    const revenue = await db.getPlatformRevenue();
    
    res.json({
      success: true,
      payments: payments,
      revenue: revenue
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments data',
      error: error.message
    });
  }
});

// Get platform revenue summary
app.get('/api/admin/revenue', async (req, res) => {
  try {
    const revenue = await db.getPlatformRevenue();
    
    res.json({
      success: true,
      revenue: revenue
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue data',
      error: error.message
    });
  }
});

// Get student's payment history
app.get('/api/student/:studentId/payments', async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await db.getStudentPayments(parseInt(studentId));
    
    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get student payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// Get teacher profile by ID (for backward compatibility)
app.get('/api/teacher/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await db.getTeacherByUserId(parseInt(id));
    
    if (teacher) {
      res.json({
        success: true,
        data: teacher
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher profile',
      error: error.message
    });
  }
});

// Update teacher profile
app.put('/api/teacher/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // First get the teacher to find the teacher table ID
    const teacher = await db.getTeacherByUserId(parseInt(id));
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Update both user and teacher tables
    const result = await db.updateTeacher(teacher.teacherID, updateData);
    
    res.json({
      success: true,
      message: 'Teacher profile updated successfully',
      changes: result.changes
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher profile',
      error: error.message
    });
  }
});

// Get student profile
app.get('/api/student/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await db.getStudentByUserId(parseInt(id));
    
    if (student) {
      res.json({
        success: true,
        student: student
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student profile',
      error: error.message
    });
  }
});

// Update student profile
app.put('/api/student/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // First get the student to find the student table ID
    const student = await db.getStudentByUserId(parseInt(id));
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Update both user and student tables
    const result = await db.updateStudent(student.studentID, updateData);
    
    res.json({
      success: true,
      message: 'Student profile updated successfully',
      changes: result.changes
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student profile',
      error: error.message
    });
  }
});

// Admin routes
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await db.getRevenueStats();
    const allLessons = await db.getAllLessons();
    const allUsers = await db.getAllUsers();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        total_users: allUsers.length,
        total_lessons: allLessons.length
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin statistics',
      error: error.message
    });
  }
});

// Get all users for admin
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Get all lessons for admin
app.get('/api/admin/lessons', async (req, res) => {
  try {
    const lessons = await db.getAllLessons();
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lessons',
      error: error.message
    });
  }
});

// Get dashboard data for admin
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const dashboardData = await db.getAdminDashboardData();
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// Get referral report data
app.get('/api/admin/referral-report', async (req, res) => {
  try {
    const referralData = await db.getReferralReport();
    res.json({
      success: true,
      data: referralData
    });
  } catch (error) {
    console.error('Get referral report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral report data',
      error: error.message
    });
  }
});

// Get repeat lessons report data
app.get('/api/admin/repeat-lessons-report', async (req, res) => {
  try {
    const repeatData = await db.getRepeatLessonsReport();
    res.json({
      success: true,
      data: repeatData
    });
  } catch (error) {
    console.error('Get repeat lessons report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get repeat lessons report data',
      error: error.message
    });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

app.get('/admin-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-portal.html'));
});

app.get('/teacher-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacher-portal.html'));
});

app.get('/student-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'student-portal.html'));
});

// Start server
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`Freelance Music server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- Homepage: http://localhost:3000');
    console.log('- Admin Portal: http://localhost:3000/admin-portal');
    console.log('- Teacher Portal: http://localhost:3000/teacher-portal');
    console.log('- Student Portal: http://localhost:3000/student-portal');
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await db.close();
  process.exit(0);
});
