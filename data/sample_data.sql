-- Freelance Music Sample Data
-- This file populates the database with sample data for demonstration

-- Insert sample users
INSERT OR IGNORE INTO users (name, email, password, phone, location, user_type) VALUES
('Jane Smith', 'jane.smith@email.com', 'password123', '(555) 123-4567', 'Nashville, TN', 'teacher'),
('Mike Johnson', 'mike.johnson@email.com', 'password123', '(555) 234-5678', 'Memphis, TN', 'teacher'),
('Sarah Wilson', 'sarah.wilson@email.com', 'password123', '(555) 345-6789', 'Knoxville, TN', 'teacher'),
('John Doe', 'john.doe@email.com', 'password123', '(555) 456-7890', 'Nashville, TN', 'student'),
('Emily Davis', 'emily.davis@email.com', 'password123', '(555) 567-8901', 'Chattanooga, TN', 'student'),
('Admin User', 'admin@freelancemusic.com', 'admin123', '(555) 000-0000', 'Nashville, TN', 'admin');

-- Insert sample teachers
INSERT OR IGNORE INTO teachers (user_id, bio, instruments, photo_url, rate_per_hour, virtual_available, in_person_available) VALUES
(1, 'Experienced piano teacher with 10+ years of teaching. Specializing in classical and contemporary styles. I love helping students discover their musical potential!', '["piano", "voice"]', 'https://via.placeholder.com/150', 60.00, 1, 1),
(2, 'Professional guitarist and music producer. Teaching rock, blues, and jazz styles. I have performed with several bands and have 15+ years of teaching experience.', '["guitar", "bass"]', 'https://via.placeholder.com/150', 50.00, 1, 0),
(3, 'Classical violinist with conservatory training. I teach all levels from beginner to advanced, focusing on proper technique and musical expression.', '["violin", "viola"]', 'https://via.placeholder.com/150', 70.00, 1, 1);

-- Insert sample students
INSERT OR IGNORE INTO students (user_id, primary_instrument, skill_level, learning_goals) VALUES
(4, 'piano', 'intermediate', 'Learn classical piano and improve technique. I want to be able to play Chopin and Debussy pieces.'),
(5, 'guitar', 'beginner', 'Learn to play acoustic guitar for personal enjoyment. I want to be able to play my favorite songs around the campfire.');

-- Insert sample availability
INSERT OR IGNORE INTO availability (teacher_id, available_date, start_time, end_time, lesson_type) VALUES
-- Jane Smith (Piano/Voice) availability
(1, '2024-01-15', '10:00:00', '11:00:00', 'virtual'),
(1, '2024-01-15', '14:00:00', '15:00:00', 'in-person'),
(1, '2024-01-16', '09:00:00', '10:00:00', 'virtual'),
(1, '2024-01-16', '15:00:00', '16:00:00', 'in-person'),
(1, '2024-01-17', '11:00:00', '12:00:00', 'virtual'),
(1, '2024-01-18', '13:00:00', '14:00:00', 'in-person'),

-- Mike Johnson (Guitar/Bass) availability
(2, '2024-01-15', '16:00:00', '17:00:00', 'virtual'),
(2, '2024-01-16', '10:00:00', '11:00:00', 'virtual'),
(2, '2024-01-17', '14:00:00', '15:00:00', 'virtual'),
(2, '2024-01-18', '11:00:00', '12:00:00', 'virtual'),

-- Sarah Wilson (Violin/Viola) availability
(3, '2024-01-15', '15:00:00', '16:00:00', 'virtual'),
(3, '2024-01-15', '17:00:00', '18:00:00', 'in-person'),
(3, '2024-01-16', '13:00:00', '14:00:00', 'virtual'),
(3, '2024-01-17', '10:00:00', '11:00:00', 'in-person'),
(3, '2024-01-18', '15:00:00', '16:00:00', 'virtual');

-- Insert sample lessons (booked lessons)
INSERT OR IGNORE INTO lessons (teacher_id, student_id, instrument, lesson_date, lesson_time, duration, lesson_type, status, notes, total_cost, teacher_earnings, fm_commission) VALUES
(1, 1, 'piano', '2024-01-20', '10:00:00', 60, 'virtual', 'upcoming', 'Focus on Chopin Nocturne', 60.00, 54.00, 6.00),
(2, 2, 'guitar', '2024-01-21', '14:00:00', 60, 'virtual', 'upcoming', 'Beginner chord progressions', 50.00, 45.00, 5.00),
(3, 1, 'violin', '2024-01-22', '15:00:00', 90, 'in-person', 'upcoming', 'Advanced technique work', 105.00, 94.50, 10.50);

-- Insert sample payments
INSERT OR IGNORE INTO payments (lesson_id, student_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 1, 60.00, 'credit_card', 'completed', 'txn_001'),
(2, 2, 50.00, 'credit_card', 'completed', 'txn_002'),
(3, 1, 105.00, 'credit_card', 'pending', 'txn_003');
