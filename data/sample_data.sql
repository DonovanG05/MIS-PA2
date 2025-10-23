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

-- Insert sample payment methods
INSERT OR IGNORE INTO payment_methods (user_id, method_type, card_number, card_holder_name, expiry_month, expiry_year, cvv, is_primary) VALUES
(4, 'credit_card', '4111111111111111', 'John Doe', 12, 2026, '123', 1),
(5, 'credit_card', '5555555555554444', 'Emily Davis', 10, 2027, '456', 1);

-- Insert sample bank accounts for teachers
INSERT OR IGNORE INTO payment_methods (user_id, method_type, bank_name, account_holder_name, bank_routing_number, bank_account_number, is_primary) VALUES
(1, 'bank_account', 'Chase Bank', 'Jane Smith', '021000021', '1234567890', 1),
(2, 'bank_account', 'Wells Fargo', 'Mike Johnson', '121000248', '9876543210', 1),
(3, 'bank_account', 'Bank of America', 'Sarah Wilson', '026009593', '1122334455', 1);

-- Insert sample availability (October 2025)
INSERT OR IGNORE INTO availability (teacher_id, available_date, start_time, end_time, lesson_type) VALUES
-- Jane Smith (Piano/Voice) availability - Past dates (for testing cleanup)
(1, '2024-01-01', '10:00:00', '11:00:00', 'virtual'),
(1, '2024-06-15', '14:00:00', '15:00:00', 'in-person'),
-- Jane Smith (Piano/Voice) availability - Future dates (November 2025)
(1, '2025-11-01', '10:00:00', '11:00:00', 'virtual'),
(1, '2025-11-01', '14:00:00', '15:00:00', 'in-person'),
(1, '2025-11-02', '09:00:00', '10:00:00', 'virtual'),
(1, '2025-11-02', '15:00:00', '16:00:00', 'in-person'),
(1, '2025-11-03', '11:00:00', '12:00:00', 'virtual'),
(1, '2025-11-04', '13:00:00', '14:00:00', 'in-person'),
(1, '2025-11-07', '10:00:00', '11:00:00', 'virtual'),
(1, '2025-11-08', '14:00:00', '15:00:00', 'in-person'),
(1, '2025-11-09', '09:00:00', '10:00:00', 'virtual'),
(1, '2025-11-10', '15:00:00', '16:00:00', 'in-person'),

-- Mike Johnson (Guitar/Bass) availability - November 2025
(2, '2025-11-01', '16:00:00', '17:00:00', 'virtual'),
(2, '2025-11-02', '10:00:00', '11:00:00', 'virtual'),
(2, '2025-11-03', '14:00:00', '15:00:00', 'virtual'),
(2, '2025-11-04', '11:00:00', '12:00:00', 'virtual'),
(2, '2025-11-07', '16:00:00', '17:00:00', 'virtual'),
(2, '2025-11-08', '10:00:00', '11:00:00', 'virtual'),
(2, '2025-11-09', '14:00:00', '15:00:00', 'virtual'),
(2, '2025-11-10', '11:00:00', '12:00:00', 'virtual'),

-- Sarah Wilson (Violin/Viola) availability - November 2025
(3, '2025-11-01', '15:00:00', '16:00:00', 'virtual'),
(3, '2025-11-01', '17:00:00', '18:00:00', 'in-person'),
(3, '2025-11-02', '13:00:00', '14:00:00', 'virtual'),
(3, '2025-11-03', '10:00:00', '11:00:00', 'in-person'),
(3, '2025-11-04', '15:00:00', '16:00:00', 'virtual'),
(3, '2025-11-07', '15:00:00', '16:00:00', 'virtual'),
(3, '2025-11-08', '17:00:00', '18:00:00', 'in-person'),
(3, '2025-11-09', '13:00:00', '14:00:00', 'virtual'),
(3, '2025-11-10', '10:00:00', '11:00:00', 'in-person');

-- Insert sample lessons (booked lessons) - One lesson per student
INSERT OR IGNORE INTO lessons (teacher_id, student_id, instrument, lesson_date, lesson_time, duration, lesson_type, status, notes, total_cost, teacher_earnings, fm_commission) VALUES
-- John Doe (piano) with Jane Smith
(1, 1, 'piano', '2025-11-05', '10:00:00', 60, 'virtual', 'upcoming', 'Focus on Chopin Nocturne', 60.00, 54.00, 6.00),
-- Emily Davis (guitar) with Mike Johnson  
(2, 2, 'guitar', '2025-11-06', '14:00:00', 60, 'virtual', 'upcoming', 'Beginner chord progressions', 50.00, 45.00, 5.00);

-- Insert sample payments (using new schema) - One payment per lesson
INSERT OR IGNORE INTO payments (lesson_id, student_id, teacher_id, payment_method_id, amount, platform_fee, teacher_earnings, status, transaction_id) VALUES
(1, 1, 1, 1, 60.00, 6.00, 54.00, 'completed', 'txn_001'),
(2, 2, 2, 2, 50.00, 5.00, 45.00, 'completed', 'txn_002');
