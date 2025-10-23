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
      
      // Read and execute sample data (commented out to prevent duplicate data)
      // const samplePath = path.join(__dirname, '../data/sample_data.sql');
      // const sampleSQL = fs.readFileSync(samplePath, 'utf8');
      // await this.exec(sampleSQL);
      
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
      INSERT INTO users (name, email, password, phone, location, user_type, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.name,
      userData.email,
      userData.password, // Store password as plain text for now (in production, hash it)
      userData.phone,
      userData.location,
      userData.user_type,
      userData.photo_url || null
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

  // Get teacher by email
  async getTeacherByEmail(email) {
    const sql = `
      SELECT t.*, u.name, u.email, u.phone, u.location 
      FROM teachers t 
      JOIN users u ON t.user_id = u.id 
      WHERE u.email = ?
    `;
    const teacher = await this.get(sql, [email]);
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
      WHERE teacherID = ?
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
      INSERT INTO students (user_id, primary_instrument, skill_level, learning_goals, referral_source)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      studentData.user_id,
      studentData.primary_instrument,
      studentData.skill_level,
      studentData.learning_goals,
      studentData.referral_source
    ];
    return await this.run(sql, params);
  }

  // Get student by user ID
  async getStudentByUserId(userId) {
    const sql = `
      SELECT s.*, u.name, u.email, u.phone, u.location, u.photo_url
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.user_id = ?
    `;
    return await this.get(sql, [userId]);
  }

  // Get student profile by student ID
  async getStudentProfile(studentId) {
    const sql = `
      SELECT s.*, u.name, u.email, u.phone, u.location, u.password, u.photo_url
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.studentID = ?
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
      SET name = ?, email = ?, phone = ?, location = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const userParams = [
      updateData.name,
      updateData.email,
      updateData.phone,
      updateData.location,
      updateData.photo_url,
      student.user_id
    ];
    await this.run(userSql, userParams);
    
    // Update student table
    const studentSql = `
      UPDATE students 
      SET primary_instrument = ?, skill_level = ?, learning_goals = ?, updated_at = CURRENT_TIMESTAMP
      WHERE studentID = ?
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
    const currentDate = new Date().toISOString().split('T')[0];
    const sql = `
      SELECT a.*, t.rate_per_hour, u.name as teacher_name, a.instruments
      FROM availability a
      JOIN teachers t ON a.teacher_id = t.teacherID
      JOIN users u ON t.user_id = u.id
      WHERE a.lesson_type = ? AND a.is_available = 1
      AND a.available_date >= ?
      ORDER BY a.available_date, a.start_time
    `;
    const rows = await this.all(sql, [lessonType, currentDate]);
    return rows.map(row => {
      const instruments = row.instruments ? JSON.parse(row.instruments) : [];
      // Filter by instrument if specified
      if (instrument && !instruments.includes(instrument)) {
        return null;
      }
      return {
        ...row,
        instruments: instruments
      };
    }).filter(row => row !== null);
  }

  // Clean up past availability entries
  async cleanupPastAvailability() {
    const currentDate = new Date().toISOString().split('T')[0];
    const sql = `DELETE FROM availability WHERE available_date < ?`;
    const result = await this.run(sql, [currentDate]);
    return result.changes;
  }

  // Check if availability slot exists
  async checkAvailabilityExists(teacherId, lessonDate, lessonTime, lessonType) {
    const sql = `
      SELECT id FROM availability 
      WHERE teacher_id = ? AND available_date = ? AND start_time = ? AND lesson_type = ?
    `;
    const result = await this.get(sql, [teacherId, lessonDate, lessonTime, lessonType]);
    return result !== undefined;
  }

  // Remove availability slot
  async removeAvailability(teacherId, lessonDate, lessonTime, lessonType) {
    const sql = `
      DELETE FROM availability 
      WHERE teacher_id = ? AND available_date = ? AND start_time = ? AND lesson_type = ?
    `;
    const result = await this.run(sql, [teacherId, lessonDate, lessonTime, lessonType]);
    return result.changes > 0;
  }

  // Book a lesson
  async bookLesson(lessonData) {
    // First, check if the availability slot still exists
    const availabilityExists = await this.checkAvailabilityExists(
      lessonData.teacher_id,
      lessonData.lesson_date,
      lessonData.lesson_time,
      lessonData.lesson_type
    );
    
    if (!availabilityExists) {
      throw new Error('This time slot is no longer available. It may have been booked by another student.');
    }
    
    // Start a transaction to ensure both operations succeed or fail together
    await this.run('BEGIN TRANSACTION');
    
    try {
      // Remove the availability slot to prevent double-booking
      const removed = await this.removeAvailability(
        lessonData.teacher_id,
        lessonData.lesson_date,
        lessonData.lesson_time,
        lessonData.lesson_type
      );
      
      if (!removed) {
        throw new Error('Failed to remove availability slot. The slot may have been booked by another student.');
      }
      
      // Then, create the lesson
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
        lessonData.sheet_music_urls || '[]',
        lessonData.recurring_interval || null,
        lessonData.recurring_count || 1,
        totalCost,
        teacherEarnings,
        fmCommission
      ];
      
      const result = await this.run(sql, params);
      
      // Commit the transaction
      await this.run('COMMIT');
      
      return result;
    } catch (error) {
      // Rollback the transaction on error
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Get student's lessons
  async getStudentLessons(studentId, status = null) {
    const currentDate = new Date().toISOString().split('T')[0];
    let sql = `
      SELECT l.*, t.rate_per_hour, u.name as teacher_name
      FROM lessons l
      JOIN teachers t ON l.teacher_id = t.teacherID
      JOIN users u ON t.user_id = u.id
      WHERE l.student_id = ? AND l.lesson_date >= ?
    `;
    const params = [studentId, currentDate];
    
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY l.lesson_date DESC, l.lesson_time DESC';
    
    return await this.all(sql, params);
  }

  // Get teacher's lessons
  async getTeacherLessons(teacherId, status = null) {
    const currentDate = new Date().toISOString().split('T')[0];
    let sql = `
      SELECT l.*, s.primary_instrument, u.name as student_name
      FROM lessons l
      JOIN students s ON l.student_id = s.studentID
      JOIN users u ON s.user_id = u.id
      WHERE l.teacher_id = ? AND l.lesson_date >= ?
    `;
    const params = [teacherId, currentDate];
    
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
      INSERT INTO availability (teacher_id, available_date, start_time, end_time, lesson_type, instruments)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      availabilityData.teacher_id,
      availabilityData.available_date,
      availabilityData.start_time,
      availabilityData.end_time,
      availabilityData.lesson_type,
      JSON.stringify(availabilityData.instruments)
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
    const currentDate = new Date().toISOString().split('T')[0];
    const sql = `
      SELECT l.*, t.rate_per_hour, 
             ut.name as teacher_name, us.name as student_name
      FROM lessons l
      JOIN teachers t ON l.teacher_id = t.teacherID
      JOIN users ut ON t.user_id = ut.id
      JOIN students s ON l.student_id = s.studentID
      JOIN users us ON s.user_id = us.id
      WHERE l.lesson_date >= ?
      ORDER BY l.lesson_date DESC, l.lesson_time DESC
    `;
    return await this.all(sql, [currentDate]);
  }

  // Get revenue statistics (includes both regular and recurring lessons)
  async getRevenueStats() {
    const sql = `
      SELECT 
        SUM(amount) as total_revenue,
        SUM(platform_fee) as total_commission,
        SUM(teacher_earnings) as total_teacher_earnings,
        COUNT(*) as total_lessons
      FROM payments 
      WHERE status = 'completed'
    `;
    return await this.get(sql);
  }

  // Get admin dashboard data
  async getAdminDashboardData() {
    try {
      // Get user counts
      const userCounts = await this.get(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN user_type = 'teacher' THEN 1 ELSE 0 END) as teachers,
          SUM(CASE WHEN user_type = 'student' THEN 1 ELSE 0 END) as students,
          SUM(CASE WHEN user_type = 'admin' THEN 1 ELSE 0 END) as admins
        FROM users
      `);

      // Get lesson counts
      const lessonCounts = await this.get(`
        SELECT 
          COUNT(*) as total_lessons,
          SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming_lessons,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_lessons,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_lessons
        FROM lessons
      `);

      // Get revenue data from payments table (platform fees only) - includes both regular and recurring lessons
      const revenueData = await this.get(`
        SELECT 
          COALESCE(SUM(platform_fee), 0) as total_revenue,
          COALESCE(SUM(platform_fee), 0) as total_commission,
          COALESCE(SUM(teacher_earnings), 0) as total_teacher_earnings
        FROM payments
        WHERE status = 'completed'
      `);

      // Get recurring lesson statistics
      const recurringStats = await this.get(`
        SELECT 
          COUNT(*) as total_recurring_lessons,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_recurring,
          SUM(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) as booked_recurring
        FROM recurring_lessons
      `);

      // Get popular instruments (excluding 'mixed') - using platform fees from both regular and recurring lessons
      const popularInstruments = await this.all(`
        SELECT 
          COALESCE(l.instrument, rl.instrument) as instrument,
          COUNT(*) as lesson_count,
          SUM(p.platform_fee) as revenue
        FROM payments p
        LEFT JOIN lessons l ON p.lesson_id = l.id
        LEFT JOIN recurring_lessons rl ON p.recurring_lesson_id = rl.id
        WHERE p.status = 'completed'
        AND COALESCE(l.instrument, rl.instrument) IS NOT NULL 
        AND COALESCE(l.instrument, rl.instrument) != 'mixed'
        GROUP BY COALESCE(l.instrument, rl.instrument)
        ORDER BY lesson_count DESC
        LIMIT 5
      `);

      // Get revenue by student (showing both total spent and platform fees from both regular and recurring lessons)
      const revenueByStudent = await this.all(`
        SELECT 
          us.name as student_name,
          COUNT(*) as lesson_count,
          SUM(COALESCE(l.total_cost, rl.total_cost)) as total_spent,
          SUM(p.platform_fee) as platform_fee
        FROM payments p
        LEFT JOIN lessons l ON p.lesson_id = l.id
        LEFT JOIN recurring_lessons rl ON p.recurring_lesson_id = rl.id
        JOIN students s ON p.student_id = s.studentID
        JOIN users us ON s.user_id = us.id
        WHERE p.status = 'completed'
        GROUP BY us.name, s.studentID
        HAVING SUM(p.platform_fee) > 0
        ORDER BY platform_fee DESC
        LIMIT 10
      `);

      // Get revenue by quarter (using platform fees from payments table - includes both regular and recurring lessons)
      const currentYear = new Date().getFullYear();
      const quarterlyRevenue = await this.all(`
        SELECT 
          CASE 
            WHEN strftime('%m', p.payment_date) IN ('01', '02', '03') THEN 'Q1'
            WHEN strftime('%m', p.payment_date) IN ('04', '05', '06') THEN 'Q2'
            WHEN strftime('%m', p.payment_date) IN ('07', '08', '09') THEN 'Q3'
            WHEN strftime('%m', p.payment_date) IN ('10', '11', '12') THEN 'Q4'
          END as quarter,
          SUM(p.platform_fee) as revenue
        FROM payments p
        WHERE strftime('%Y', p.payment_date) = ? AND p.status = 'completed'
        GROUP BY quarter
        ORDER BY quarter
      `, [currentYear.toString()]);

      // Get recent lessons for calendar (all lessons for now since sample data is from 2024)
      const recentLessons = await this.all(`
        SELECT 
          l.*,
          ut.name as teacher_name,
          us.name as student_name
        FROM lessons l
        JOIN teachers t ON l.teacher_id = t.teacherID
        JOIN users ut ON t.user_id = ut.id
        JOIN students s ON l.student_id = s.studentID
        JOIN users us ON s.user_id = us.id
        ORDER BY l.lesson_date, l.lesson_time
        LIMIT 50
      `);

      // Get repeat students (students with more than 1 lesson)
      const repeatStudents = await this.get(`
        SELECT COUNT(*) as repeat_students
        FROM (
          SELECT student_id
          FROM lessons
          WHERE status IN ('upcoming', 'completed')
          GROUP BY student_id
          HAVING COUNT(*) > 1
        )
      `);

      return {
        users: userCounts,
        lessons: lessonCounts,
        revenue: revenueData,
        recurringStats,
        popularInstruments,
        revenueByStudent,
        quarterlyRevenue,
        recentLessons,
        repeatStudents: repeatStudents.repeat_students
      };
    } catch (error) {
      console.error('Error getting admin dashboard data:', error);
      throw error;
    }
  }

  // Get referral report data
  async getReferralReport() {
    try {
      const referralData = await this.all(`
        SELECT 
          referral_source,
          COUNT(*) as count
        FROM students 
        WHERE referral_source IS NOT NULL
        GROUP BY referral_source
        ORDER BY count DESC
      `);

      // Format the data for the chart
      const chartData = {
        labels: [],
        data: []
      };

      referralData.forEach(item => {
        let label;
        switch(item.referral_source) {
          case 'online_advertisement':
            label = 'Online Advertisement';
            break;
          case 'word_of_mouth':
            label = 'Word of Mouth';
            break;
          case 'other':
            label = 'Other';
            break;
          default:
            label = item.referral_source;
        }
        chartData.labels.push(label);
        chartData.data.push(item.count);
      });

      return chartData;
    } catch (error) {
      console.error('Error getting referral report data:', error);
      throw error;
    }
  }

  // Get repeat lessons report data
  async getRepeatLessonsReport() {
    try {
      const repeatData = await this.all(`
        SELECT 
          u.name as student_name,
          COUNT(*) as lesson_count
        FROM lessons l
        JOIN students s ON l.student_id = s.studentID
        JOIN users u ON s.user_id = u.id
        WHERE l.status IN ('upcoming', 'completed')
        GROUP BY u.name, s.studentID
        HAVING COUNT(*) > 1
        ORDER BY lesson_count DESC
        LIMIT 10
      `);

      // Format the data for the chart
      const chartData = {
        labels: [],
        data: []
      };

      repeatData.forEach(item => {
        chartData.labels.push(item.student_name);
        chartData.data.push(item.lesson_count);
      });

      return chartData;
    } catch (error) {
      console.error('Error getting repeat lessons report data:', error);
      throw error;
    }
  }

  // Get teacher profile by teacher ID
  async getTeacherProfile(teacherId) {
    const sql = `
      SELECT t.*, u.name, u.email, u.phone, u.location, u.password
      FROM teachers t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.teacherID = ?
    `;
    const teacher = await this.get(sql, [teacherId]);
    if (teacher) {
      teacher.instruments = JSON.parse(teacher.instruments);
    }
    return teacher;
  }

  // Get lessons for a specific teacher
  async getTeacherLessons(teacherId) {
    const currentDate = new Date().toISOString().split('T')[0];
    const sql = `
      SELECT l.*, s.primary_instrument, u.name as student_name, u.email as student_email
      FROM lessons l
      JOIN students s ON l.student_id = s.studentID
      JOIN users u ON s.user_id = u.id
      WHERE l.teacher_id = ? AND l.lesson_date >= ?
      ORDER BY l.lesson_date DESC, l.lesson_time DESC
    `;
    return await this.all(sql, [teacherId, currentDate]);
  }

  // PAYMENT METHODS OPERATIONS

  // Add payment method
  async addPaymentMethod(paymentData) {
    const sql = `
      INSERT INTO payment_methods (
        user_id, method_type, card_number, card_holder_name, 
        expiry_month, expiry_year, cvv, bank_routing_number, 
        bank_account_number, bank_name, account_holder_name, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      paymentData.user_id,
      paymentData.method_type,
      paymentData.card_number,
      paymentData.card_holder_name,
      paymentData.expiry_month,
      paymentData.expiry_year,
      paymentData.cvv,
      paymentData.bank_routing_number,
      paymentData.bank_account_number,
      paymentData.bank_name,
      paymentData.account_holder_name,
      paymentData.is_primary || 0
    ];
    return await this.run(sql, params);
  }

  // Get user's payment methods
  async getPaymentMethods(userId) {
    const sql = `
      SELECT id, method_type, card_holder_name, 
             SUBSTR(card_number, -4) as last_four_digits,
             expiry_month, expiry_year, bank_name, 
             SUBSTR(bank_account_number, -4) as last_four_account,
             is_primary, is_verified, created_at
      FROM payment_methods 
      WHERE user_id = ? 
      ORDER BY is_primary DESC, created_at DESC
    `;
    return await this.all(sql, [userId]);
  }

  // Set primary payment method
  async setPrimaryPaymentMethod(userId, paymentMethodId) {
    // First, unset all primary methods for this user
    await this.run('UPDATE payment_methods SET is_primary = 0 WHERE user_id = ?', [userId]);
    
    // Then set the specified method as primary
    const sql = 'UPDATE payment_methods SET is_primary = 1 WHERE id = ? AND user_id = ?';
    return await this.run(sql, [paymentMethodId, userId]);
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId, userId) {
    const sql = 'DELETE FROM payment_methods WHERE id = ? AND user_id = ?';
    return await this.run(sql, [paymentMethodId, userId]);
  }

  // LESSON COMPLETION OPERATIONS

  // Mark lesson as completed and process payment
  async completeLesson(completionData) {
    const sql = `
      INSERT INTO lesson_completions (
        lesson_id, teacher_id, completion_notes, student_rating, teacher_rating
      ) VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      completionData.lesson_id,
      completionData.teacher_id,
      completionData.completion_notes,
      completionData.student_rating,
      completionData.teacher_rating
    ];
    
    // Also update the lesson status
    await this.run('UPDATE lessons SET status = ? WHERE id = ?', ['completed', completionData.lesson_id]);
    
    // Process payment
    const lesson = await this.get('SELECT * FROM lessons WHERE id = ?', [completionData.lesson_id]);
    if (lesson) {
      // Get student directly by student_id (not user_id)
      const student = await this.get('SELECT * FROM students WHERE studentID = ?', [lesson.student_id]);
      if (student) {
        const paymentMethod = await this.getStudentPrimaryPaymentMethod(student.studentID);
        if (paymentMethod) {
          await this.processPayment(
            lesson.id,
            student.studentID,
            completionData.teacher_id,
            paymentMethod.id,
            lesson.total_cost
          );
        }
      }
    }
    
    return await this.run(sql, params);
  }

  // Get lesson completion details
  async getLessonCompletion(lessonId) {
    const sql = `
      SELECT lc.*, l.lesson_date, l.lesson_time, l.instrument,
             ut.name as teacher_name, us.name as student_name
      FROM lesson_completions lc
      JOIN lessons l ON lc.lesson_id = l.id
      JOIN teachers t ON lc.teacher_id = t.teacherID
      JOIN users ut ON t.user_id = ut.id
      JOIN students s ON l.student_id = s.studentID
      JOIN users us ON s.user_id = us.id
      WHERE lc.lesson_id = ?
    `;
    return await this.get(sql, [lessonId]);
  }

  // Get teacher's completed lessons
  async getTeacherCompletedLessons(teacherId) {
    const sql = `
      SELECT lc.*, l.lesson_date, l.lesson_time, l.instrument,
             us.name as student_name, s.primary_instrument
      FROM lesson_completions lc
      JOIN lessons l ON lc.lesson_id = l.id
      JOIN students s ON l.student_id = s.studentID
      JOIN users us ON s.user_id = us.id
      WHERE lc.teacher_id = ?
      ORDER BY lc.completed_at DESC
    `;
    return await this.all(sql, [teacherId]);
  }

  // VALIDATION FUNCTIONS

  // Validate credit card number (Luhn algorithm)
  validateCreditCard(cardNumber) {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check if it's 13-19 digits
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, error: 'Card number must be 13-19 digits' };
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return { valid: sum % 10 === 0, error: sum % 10 === 0 ? null : 'Invalid card number' };
  }

  // Validate CVV
  validateCVV(cvv, cardType = 'unknown') {
    const cleaned = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      return { valid: cleaned.length === 4, error: 'AMEX CVV must be 4 digits' };
    } else {
      return { valid: cleaned.length === 3, error: 'CVV must be 3 digits' };
    }
  }

  // Validate bank routing number
  validateRoutingNumber(routingNumber) {
    const cleaned = routingNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 9) {
      return { valid: false, error: 'Routing number must be 9 digits' };
    }
    
    // Basic checksum validation (simplified)
    const digits = cleaned.split('').map(Number);
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * weights[i];
    }
    
    return { valid: sum % 10 === 0, error: sum % 10 === 0 ? null : 'Invalid routing number' };
  }

  // Validate bank account number
  validateAccountNumber(accountNumber) {
    const cleaned = accountNumber.replace(/\D/g, '');
    
    if (cleaned.length < 4 || cleaned.length > 17) {
      return { valid: false, error: 'Account number must be 4-17 digits' };
    }
    
    return { valid: true, error: null };
  }

  // Validate expiry date
  validateExpiryDate(month, year) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, error: 'Card has expired' };
    }
    
    if (month < 1 || month > 12) {
      return { valid: false, error: 'Invalid month' };
    }
    
    return { valid: true, error: null };
  }

  // PAYMENT PROCESSING FUNCTIONS

  // Process payment when lesson is completed
  async processPayment(lessonId, studentId, teacherId, paymentMethodId, totalAmount) {
    const platformFee = totalAmount * 0.10; // 10% platform fee
    const teacherEarnings = totalAmount - platformFee;
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sql = `
      INSERT INTO payments (
        lesson_id, student_id, teacher_id, payment_method_id, 
        amount, platform_fee, teacher_earnings, transaction_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `;
    
    const params = [
      lessonId, studentId, teacherId, paymentMethodId,
      totalAmount, platformFee, teacherEarnings, transactionId
    ];
    
    return await this.run(sql, params);
  }

  // Get teacher's payment history
  async getTeacherPayments(teacherId) {
    const sql = `
      SELECT p.*, l.instrument, l.lesson_type, l.lesson_date,
             u.name as student_name
      FROM payments p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN students s ON p.student_id = s.studentID
      JOIN users u ON s.user_id = u.id
      WHERE p.teacher_id = ?
      ORDER BY p.payment_date DESC
    `;
    return await this.all(sql, [teacherId]);
  }

  // Get all payments for admin dashboard
  async getAllPayments() {
    const sql = `
      SELECT p.*, l.instrument, l.lesson_type, l.lesson_date,
             ut.name as teacher_name, us.name as student_name
      FROM payments p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN teachers t ON p.teacher_id = t.teacherID
      JOIN users ut ON t.user_id = ut.id
      JOIN students s ON p.student_id = s.studentID
      JOIN users us ON s.user_id = us.id
      ORDER BY p.payment_date DESC
    `;
    return await this.all(sql, []);
  }

  // Get platform revenue summary
  async getPlatformRevenue() {
    const sql = `
      SELECT 
        SUM(platform_fee) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(platform_fee) as avg_fee_per_transaction
      FROM payments 
      WHERE status = 'completed'
    `;
    return await this.get(sql, []);
  }

  // Get student's primary payment method
  async getStudentPrimaryPaymentMethod(studentId) {
    const sql = `
      SELECT pm.*, u.id as user_id
      FROM payment_methods pm
      JOIN students s ON pm.user_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE s.studentID = ? AND pm.method_type = 'credit_card' AND pm.is_primary = 1
    `;
    return await this.get(sql, [studentId]);
  }

  // Get student's payment history
  async getStudentPayments(studentId) {
    const sql = `
      SELECT p.*, l.instrument, l.lesson_type, l.lesson_date,
             u.name as teacher_name
      FROM payments p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN teachers t ON p.teacher_id = t.teacherID
      JOIN users u ON t.user_id = u.id
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
    `;
    return await this.all(sql, [studentId]);
  }

  // ==================== RECURRING LESSONS METHODS ====================

  // Add recurring slot (teacher creates always-available slot)
  async addRecurringSlot(teacherId, slotData) {
    const sql = `
      INSERT INTO recurring_lessons (
        teacher_id, instrument, day_of_week, start_time, duration, 
        lesson_type, frequency, notes, status, student_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'weekly', ?, 'active', NULL)
    `;
    
    const params = [
      teacherId,
      slotData.instrument,
      slotData.day_of_week,
      slotData.start_time,
      slotData.duration,
      slotData.lesson_type,
      slotData.notes || null
    ];
    
    return await this.run(sql, params);
  }

  // Get teacher's recurring slots
  async getTeacherRecurringSlots(teacherId) {
    const sql = `
      SELECT 
        rl.*,
        u.name as teacher_name,
        s.studentID,
        us.name as student_name
      FROM recurring_lessons rl
      JOIN teachers t ON rl.teacher_id = t.teacherID
      JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON rl.student_id = s.studentID
      LEFT JOIN users us ON s.user_id = us.id
      WHERE rl.teacher_id = ?
      ORDER BY rl.day_of_week, rl.start_time
    `;
    
    return await this.all(sql, [teacherId]);
  }

  // Get available recurring slots (not booked by any student)
  async getAvailableRecurringSlots() {
    const sql = `
      SELECT 
        rl.*,
        u.name as teacher_name,
        t.rate_per_hour
      FROM recurring_lessons rl
      JOIN teachers t ON rl.teacher_id = t.teacherID
      JOIN users u ON t.user_id = u.id
      WHERE rl.student_id IS NULL AND rl.status = 'active'
      ORDER BY rl.day_of_week, rl.start_time
    `;
    
    return await this.all(sql);
  }

  // Book recurring slot (student books an available slot)
  async bookRecurringSlot(slotId, studentId, startDate, frequency, notes) {
    // Calculate pricing
    const slot = await this.get('SELECT * FROM recurring_lessons WHERE id = ?', [slotId]);
    const teacher = await this.get('SELECT rate_per_hour FROM teachers WHERE teacherID = ?', [slot.teacher_id]);
    
    const totalCost = (teacher.rate_per_hour * slot.duration) / 60;
    const platformFee = totalCost * 0.1;
    const teacherEarnings = totalCost - platformFee;
    
    // Calculate next lesson date using student's chosen frequency
    const nextLessonDate = this.calculateNextLessonDate(startDate, slot.day_of_week, frequency);
    
    const sql = `
      UPDATE recurring_lessons 
      SET 
        student_id = ?,
        frequency = ?,
        total_cost = ?,
        teacher_earnings = ?,
        fm_commission = ?,
        next_lesson_date = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      studentId,
      frequency,
      totalCost,
      teacherEarnings,
      platformFee,
      nextLessonDate,
      notes || null,
      slotId
    ];
    
    return await this.run(sql, params);
  }

  // Get student's recurring lessons
  async getStudentRecurringLessons(studentId) {
    const sql = `
      SELECT 
        rl.*,
        u.name as teacher_name
      FROM recurring_lessons rl
      JOIN teachers t ON rl.teacher_id = t.teacherID
      JOIN users u ON t.user_id = u.id
      WHERE rl.student_id = ?
      ORDER BY rl.day_of_week, rl.start_time
    `;
    
    return await this.all(sql, [studentId]);
  }

  // Confirm recurring lesson (teacher confirms lesson occurred)
  async confirmRecurringLesson(recurringId) {
    const recurring = await this.get('SELECT * FROM recurring_lessons WHERE id = ?', [recurringId]);
    if (!recurring || !recurring.student_id) {
      throw new Error('Recurring lesson not found or not booked');
    }

    // Get student's primary payment method
    const student = await this.get('SELECT user_id FROM students WHERE studentID = ?', [recurring.student_id]);
    const paymentMethod = await this.get(`
      SELECT * FROM payment_methods 
      WHERE user_id = ? AND is_primary = 1 AND is_verified = 1
      ORDER BY created_at DESC LIMIT 1
    `, [student.user_id]);

    if (!paymentMethod) {
      throw new Error('Student has no verified payment method');
    }

    // Generate transaction ID
    const transactionId = `REC_${Date.now()}_${recurringId}`;

    // Create payment record
    const paymentSql = `
      INSERT INTO payments (
        recurring_lesson_id, student_id, teacher_id, payment_method_id, 
        amount, platform_fee, teacher_earnings, status, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `;
    
    const paymentParams = [
      recurringId,
      recurring.student_id,
      recurring.teacher_id,
      paymentMethod.id,
      recurring.total_cost,
      recurring.fm_commission,
      recurring.teacher_earnings,
      transactionId
    ];
    
    await this.run(paymentSql, paymentParams);
    
    // Update next lesson date
    const nextLessonDate = this.calculateNextLessonDate(
      recurring.next_lesson_date, 
      recurring.day_of_week, 
      recurring.frequency
    );
    
    const updateSql = `
      UPDATE recurring_lessons 
      SET next_lesson_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await this.run(updateSql, [nextLessonDate, recurringId]);
    
    return { 
      success: true, 
      next_lesson_date: nextLessonDate,
      transaction_id: transactionId,
      amount_charged: recurring.total_cost,
      teacher_earnings: recurring.teacher_earnings,
      platform_fee: recurring.fm_commission
    };
  }

  // Pause recurring lesson
  async pauseRecurringLesson(recurringId) {
    const sql = `
      UPDATE recurring_lessons 
      SET status = 'paused', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await this.run(sql, [recurringId]);
  }

  // Resume recurring lesson
  async resumeRecurringLesson(recurringId) {
    const sql = `
      UPDATE recurring_lessons 
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await this.run(sql, [recurringId]);
  }

  // Cancel recurring lesson
  async cancelRecurringLesson(recurringId) {
    const sql = `
      UPDATE recurring_lessons 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await this.run(sql, [recurringId]);
  }

  // Delete recurring slot (teacher deletes unbooked slot)
  async deleteRecurringSlot(recurringId) {
    const sql = 'DELETE FROM recurring_lessons WHERE id = ? AND student_id IS NULL';
    return await this.run(sql, [recurringId]);
  }

  // Calculate next lesson date based on frequency
  calculateNextLessonDate(currentDate, dayOfWeek, frequency) {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        date.setDate(date.getDate() + 7);
    }
    
    return date.toISOString().split('T')[0];
  }

  // Get recurring lesson revenue for admin dashboard
  async getRecurringLessonRevenue() {
    const sql = `
      SELECT 
        SUM(p.platform_fee) as total_revenue,
        COUNT(*) as total_lessons
      FROM payments p
      WHERE p.recurring_lesson_id IS NOT NULL
      AND p.status = 'completed'
    `;
    
    return await this.get(sql);
  }
}

module.exports = Database;
