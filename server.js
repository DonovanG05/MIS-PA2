// server.js - Express server for Freelance Music
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./scripts/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize database
const db = new Database();

// Initialize database on server start
async function startServer() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');
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
      rate_per_hour: parseFloat(rate_per_hour) || 0,
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
    const { name, email, password, phone, location, primary_instrument, skill_level, learning_goals } = req.body;
    
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
      learning_goals
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
    const { instrument, type } = req.query;
    
    if (!instrument || !type) {
      return res.status(400).json({
        success: false,
        message: 'Instrument and lesson type are required'
      });
    }
    
    const lessons = await db.getAvailableLessons(instrument, type);
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

// Book a lesson
app.post('/api/lessons/book', async (req, res) => {
  try {
    const lessonData = req.body;
    
    // Get teacher rate
    const teacher = await db.getTeacherByUserId(lessonData.teacher_id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    lessonData.rate_per_hour = teacher.rate_per_hour;
    
    const result = await db.bookLesson(lessonData);
    
    res.json({
      success: true,
      message: 'Lesson booked successfully',
      lesson_id: result.id
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
    
    const lessons = await db.getTeacherLessons(parseInt(id), status);
    
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

// Update teacher profile
app.put('/api/teacher/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await db.updateTeacher(parseInt(id), updateData);
    
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
    
    const student = await db.getStudentProfile(parseInt(id));
    
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
    
    const result = await db.updateStudent(parseInt(id), updateData);
    
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
