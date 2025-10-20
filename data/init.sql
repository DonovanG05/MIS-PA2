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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    primary_instrument TEXT,
    skill_level TEXT CHECK(skill_level IN ('beginner', 'intermediate', 'advanced')),
    learning_goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table (bookings)
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
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
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lesson_type TEXT CHECK(lesson_type IN ('virtual', 'in-person')),
    is_available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (for future implementation)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (for future implementation)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT,
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
