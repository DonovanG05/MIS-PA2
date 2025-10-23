-- Freelance Music Database Schema
-- This file creates all the necessary tables for the application

-- Users table (base table for all user types)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    user_type TEXT CHECK(user_type IN ('student', 'teacher', 'admin')),
    password TEXT, -- User password for authentication
    photo_url TEXT, -- Profile photo URL for all user types
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table (extends users)
CREATE TABLE IF NOT EXISTS teachers (
    teacherID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    instruments TEXT, -- JSON array of instruments taught
    photo_url TEXT,
    rate_per_hour DECIMAL(10,2) DEFAULT 0.00,
    virtual_available BOOLEAN DEFAULT 1,
    in_person_available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Students table (extends users)
CREATE TABLE IF NOT EXISTS students (
    studentID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    primary_instrument TEXT,
    skill_level TEXT CHECK(skill_level IN ('beginner', 'intermediate', 'advanced')),
    learning_goals TEXT,
    referral_source TEXT CHECK(referral_source IN ('online_advertisement', 'word_of_mouth', 'other')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table (bookings)
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER REFERENCES teachers(teacherID) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(studentID) ON DELETE CASCADE,
    instrument TEXT NOT NULL,
    lesson_date DATE NOT NULL,
    lesson_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    lesson_type TEXT CHECK(lesson_type IN ('virtual', 'in-person')),
    status TEXT CHECK(status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
    notes TEXT,
    sheet_music_urls TEXT, -- JSON array of file URLs
    recurring_interval TEXT, -- weekly, biweekly, monthly
    recurring_count INTEGER DEFAULT 1,
    total_cost DECIMAL(10,2),
    teacher_earnings DECIMAL(10,2), -- After FM commission
    fm_commission DECIMAL(10,2), -- FM's cut
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Availability table (teacher schedules)
CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER REFERENCES teachers(teacherID) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lesson_type TEXT CHECK(lesson_type IN ('virtual', 'in-person')),
    instruments TEXT, -- JSON array of available instruments
    is_available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, available_date, start_time)
);


-- Reviews table (for future implementation)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(studentID) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(teacherID) ON DELETE CASCADE,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    method_type TEXT CHECK(method_type IN ('credit_card', 'bank_account')) NOT NULL,
    card_number TEXT, -- Encrypted/stored securely
    card_holder_name TEXT,
    expiry_month INTEGER CHECK(expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER CHECK(expiry_year >= 2025),
    cvv TEXT, -- Encrypted/stored securely
    bank_routing_number TEXT, -- 9 digits
    bank_account_number TEXT, -- Encrypted/stored securely
    bank_name TEXT,
    account_holder_name TEXT,
    is_primary BOOLEAN DEFAULT 0,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lesson completion tracking
CREATE TABLE IF NOT EXISTS lesson_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(teacherID) ON DELETE CASCADE,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completion_notes TEXT,
    student_rating INTEGER CHECK(student_rating >= 1 AND student_rating <= 5),
    teacher_rating INTEGER CHECK(teacher_rating >= 1 AND teacher_rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recurring lessons table
CREATE TABLE IF NOT EXISTS recurring_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER REFERENCES teachers(teacherID) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(studentID) ON DELETE CASCADE,
    instrument TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    lesson_type TEXT CHECK(lesson_type IN ('virtual', 'in-person')),
    frequency TEXT CHECK(frequency IN ('weekly', 'biweekly', 'monthly')) DEFAULT 'weekly',
    status TEXT CHECK(status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
    notes TEXT,
    sheet_music_urls TEXT, -- JSON array of file URLs
    total_cost DECIMAL(10,2),
    teacher_earnings DECIMAL(10,2), -- After FM commission
    fm_commission DECIMAL(10,2), -- FM's cut
    next_lesson_date DATE, -- Next scheduled lesson date
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    recurring_lesson_id INTEGER REFERENCES recurring_lessons(id) ON DELETE SET NULL,
    student_id INTEGER REFERENCES students(studentID) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(teacherID) ON DELETE CASCADE,
    payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    teacher_earnings DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(lesson_date);
CREATE INDEX IF NOT EXISTS idx_availability_teacher_id ON availability(teacher_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(available_date);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_teacher_id ON lesson_completions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_payments_lesson_id ON payments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_teacher_id ON payments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_recurring_lessons_teacher_id ON recurring_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_recurring_lessons_student_id ON recurring_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_recurring_lessons_status ON recurring_lessons(status);
CREATE INDEX IF NOT EXISTS idx_recurring_lessons_next_date ON recurring_lessons(next_lesson_date);
