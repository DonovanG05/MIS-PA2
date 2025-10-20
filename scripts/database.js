// Database.js - SQLite Database Operations for Freelance Music
// This class handles all database operations for the application

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dbPath = './freelance_music.db';
    this.db = null;
  }

  // Initialize database connection
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  // Initialize database with schema and sample data
  async initialize() {
    try {
      await this.connect();
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, '../data/init.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await this.exec(schemaSQL);
      
      // Read and execute sample data
      const samplePath = path.join(__dirname, '../data/sample_data.sql');
      const sampleSQL = fs.readFileSync(samplePath, 'utf8');
      await this.exec(sampleSQL);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Execute SQL statements
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Run SQL query with parameters
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all rows
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }

  // USER OPERATIONS

  // Create new user
  async createUser(userData) {
    const sql = `
      INSERT INTO users (name, email, password, phone, location, user_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.name,
      userData.email,
      userData.password, // Store password as plain text for now (in production, hash it)
      userData.phone,
      userData.location,
      userData.user_type
    ];
    return await this.run(sql, params);
  }

  // Get user by email
  async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await this.get(sql, [email]);
  }

  // Authenticate user with email and password
  async authenticateUser(email, password) {
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    return await this.get(sql, [email, password]);
  }

  // Get user by ID
  async getUserById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await this.get(sql, [id]);
  }

  // TEACHER OPERATIONS

  // Create new teacher
  async createTeacher(teacherData) {
    const sql = `
      INSERT INTO teachers (user_id, bio, instruments, photo_url, rate_per_hour, virtual_available, in_person_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      teacherData.user_id,
      teacherData.bio,
      JSON.stringify(teacherData.instruments),
      teacherData.photo_url,
      teacherData.rate_per_hour,
      teacherData.virtual_available ? 1 : 0,
      teacherData.in_person_available ? 1 : 0
    ];
    return await this.run(sql, params);
  }

  // Get teacher by user ID
  async getTeacherByUserId(userId) {
    const sql = `
      SELECT t.*, u.name, u.email, u.phone, u.location 
      FROM teachers t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = ?
    `;
    const teacher = await this.get(sql, [userId]);
    if (teacher) {
      teacher.instruments = JSON.parse(teacher.instruments);
    }
    return teacher;
  }

  // Update teacher profile
  async updateTeacher(teacherId, updateData) {
    const sql = `
      UPDATE teachers 
      SET bio = ?, instruments = ?, photo_url = ?, rate_per_hour = ?, 
          virtual_available = ?, in_person_available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      updateData.bio,
      JSON.stringify(updateData.instruments),
      updateData.photo_url,
      updateData.rate_per_hour,
      updateData.virtual_available ? 1 : 0,
      updateData.in_person_available ? 1 : 0,
      teacherId
    ];
    return await this.run(sql, params);
  }

  // STUDENT OPERATIONS

  // Create new student
  async createStudent(studentData) {
    const sql = `
      INSERT INTO students (user_id, primary_instrument, skill_level, learning_goals)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      studentData.user_id,
      studentData.primary_instrument,
      studentData.skill_level,
      studentData.learning_goals
    ];
    return await this.run(sql, params);
  }

  // Get student by user ID
  async getStudentByUserId(userId) {
    const sql = `
      SELECT s.*, u.name, u.email, u.phone, u.location 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.user_id = ?
    `;
    return await this.get(sql, [userId]);
  }

  // Get student profile by student ID
  async getStudentProfile(studentId) {
    const sql = `
      SELECT s.*, u.name, u.email, u.phone, u.location, u.password
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = ?
    `;
    return await this.get(sql, [studentId]);
  }

  // Update student profile
  async updateStudent(studentId, updateData) {
    // First get the user_id for this student
    const student = await this.getStudentProfile(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Update user table
    const userSql = `
      UPDATE users 
      SET name = ?, email = ?, phone = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const userParams = [
      updateData.name,
      updateData.email,
      updateData.phone,
      updateData.location,
      student.user_id
    ];
    await this.run(userSql, userParams);
    
    // Update student table
    const studentSql = `
      UPDATE students 
      SET primary_instrument = ?, skill_level = ?, learning_goals = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const studentParams = [
      updateData.primary_instrument,
      updateData.skill_level,
      updateData.learning_goals,
      studentId
    ];
    return await this.run(studentSql, studentParams);
  }

  // LESSON OPERATIONS

  // Get available lessons
  async getAvailableLessons(instrument, lessonType) {
    const sql = `
      SELECT a.*, t.rate_per_hour, u.name as teacher_name, t.instruments
      FROM availability a
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE t.instruments LIKE ? AND a.lesson_type = ? AND a.is_available = 1
      AND a.available_date >= date('now')
      ORDER BY a.available_date, a.start_time
    `;
    const rows = await this.all(sql, [`%${instrument}%`, lessonType]);
    return rows.map(row => ({
      ...row,
      instruments: JSON.parse(row.instruments)
    }));
  }

  // Book a lesson
  async bookLesson(lessonData) {
    const sql = `
      INSERT INTO lessons (teacher_id, student_id, instrument, lesson_date, lesson_time, 
                          duration, lesson_type, status, notes, sheet_music_urls, 
                          recurring_interval, recurring_count, total_cost, teacher_earnings, fm_commission)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Calculate costs (assuming 10% FM commission)
    const totalCost = lessonData.duration * (lessonData.rate_per_hour / 60);
    const fmCommission = totalCost * 0.1;
    const teacherEarnings = totalCost - fmCommission;
    
    const params = [
      lessonData.teacher_id,
      lessonData.student_id,
      lessonData.instrument,
      lessonData.lesson_date,
      lessonData.lesson_time,
      lessonData.duration,
      lessonData.lesson_type,
      'upcoming',
      lessonData.notes,
      JSON.stringify(lessonData.sheet_music_urls || []),
      lessonData.recurring_interval || null,
      lessonData.recurring_count || 1,
      totalCost,
      teacherEarnings,
      fmCommission
    ];
    
    return await this.run(sql, params);
  }

  // Get student's lessons
  async getStudentLessons(studentId, status = null) {
    let sql = `
      SELECT l.*, t.rate_per_hour, u.name as teacher_name
      FROM lessons l
      JOIN teachers t ON l.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE l.student_id = ?
    `;
    const params = [studentId];
    
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY l.lesson_date DESC, l.lesson_time DESC';
    
    return await this.all(sql, params);
  }

  // Get teacher's lessons
  async getTeacherLessons(teacherId, status = null) {
    let sql = `
      SELECT l.*, s.primary_instrument, u.name as student_name
      FROM lessons l
      JOIN students s ON l.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE l.teacher_id = ?
    `;
    const params = [teacherId];
    
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY l.lesson_date DESC, l.lesson_time DESC';
    
    return await this.all(sql, params);
  }

  // AVAILABILITY OPERATIONS

  // Add teacher availability
  async addAvailability(availabilityData) {
    const sql = `
      INSERT INTO availability (teacher_id, available_date, start_time, end_time, lesson_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      availabilityData.teacher_id,
      availabilityData.available_date,
      availabilityData.start_time,
      availabilityData.end_time,
      availabilityData.lesson_type
    ];
    return await this.run(sql, params);
  }

  // Get teacher availability
  async getTeacherAvailability(teacherId) {
    const sql = `
      SELECT * FROM availability 
      WHERE teacher_id = ? AND is_available = 1
      ORDER BY available_date, start_time
    `;
    return await this.all(sql, [teacherId]);
  }

  // ADMIN OPERATIONS

  // Get all users
  async getAllUsers() {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    return await this.all(sql);
  }

  // Get all lessons
  async getAllLessons() {
    const sql = `
      SELECT l.*, t.rate_per_hour, 
             ut.name as teacher_name, us.name as student_name
      FROM lessons l
      JOIN teachers t ON l.teacher_id = t.id
      JOIN users ut ON t.user_id = ut.id
      JOIN students s ON l.student_id = s.id
      JOIN users us ON s.user_id = us.id
      ORDER BY l.lesson_date DESC, l.lesson_time DESC
    `;
    return await this.all(sql);
  }

  // Get revenue statistics
  async getRevenueStats() {
    const sql = `
      SELECT 
        SUM(total_cost) as total_revenue,
        SUM(fm_commission) as total_commission,
        SUM(teacher_earnings) as total_teacher_earnings,
        COUNT(*) as total_lessons
      FROM lessons 
      WHERE status = 'completed'
    `;
    return await this.get(sql);
  }
}

module.exports = Database;
