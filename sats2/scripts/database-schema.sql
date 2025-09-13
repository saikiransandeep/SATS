-- Smart Attendance Tracking System - PostgreSQL Schema
-- This is a reference schema for PostgreSQL implementation
-- The actual implementation uses MongoDB with Mongoose

-- Create database
CREATE DATABASE smart_attendance;
USE smart_attendance;

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    hod_id INTEGER,
    established_year INTEGER CHECK (established_year >= 1900 AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    is_active BOOLEAN DEFAULT TRUE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    office_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (Faculty and Staff)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('faculty', 'class_incharge', 'hod', 'principal', 'admin')),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    profile_photo VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections table
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    class_incharge_id INTEGER REFERENCES users(id),
    max_students INTEGER DEFAULT 60 CHECK (max_students > 0),
    current_strength INTEGER DEFAULT 0 CHECK (current_strength >= 0),
    academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^\d{4}-\d{4}$'),
    classroom VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, year, code, academic_year)
);

-- Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    credits INTEGER NOT NULL CHECK (credits >= 1 AND credits <= 6),
    type VARCHAR(20) DEFAULT 'theory' CHECK (type IN ('theory', 'practical', 'project', 'seminar')),
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    description TEXT,
    syllabus TEXT,
    theory_hours INTEGER DEFAULT 0,
    practical_hours INTEGER DEFAULT 0,
    tutorial_hours INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    section_id INTEGER NOT NULL REFERENCES sections(id),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    profile_photo VARCHAR(500),
    contact_number VARCHAR(20),
    parent_contact VARCHAR(20),
    address TEXT,
    admission_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subject assignments table
CREATE TABLE subject_assignments (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    section_id INTEGER NOT NULL REFERENCES sections(id),
    academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^\d{4}-\d{4}$'),
    assignment_type VARCHAR(20) DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'substitute', 'guest')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, section_id, academic_year)
);

-- Attendance sessions table
CREATE TABLE attendance_sessions (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    section_id INTEGER NOT NULL REFERENCES sections(id),
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER, -- in minutes
    session_type VARCHAR(20) DEFAULT 'lecture' CHECK (session_type IN ('lecture', 'lab', 'tutorial', 'seminar')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    total_students INTEGER NOT NULL,
    present_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    od_count INTEGER DEFAULT 0,
    unmarked_count INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    is_submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES attendance_sessions(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    status VARCHAR(20) DEFAULT 'unmarked' CHECK (status IN ('present', 'absent', 'od', 'unmarked')),
    marked_at TIMESTAMP,
    marked_by INTEGER REFERENCES users(id),
    remarks TEXT,
    is_late BOOLEAN DEFAULT FALSE,
    late_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- Holidays table
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    holiday_date DATE NOT NULL,
    type VARCHAR(20) DEFAULT 'institutional' CHECK (type IN ('national', 'regional', 'institutional', 'exam')),
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^\d{4}-\d{4}$'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OD (On Duty) requests table
CREATE TABLE od_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    requested_by INTEGER NOT NULL REFERENCES users(id),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    event_name VARCHAR(255),
    venue VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER NOT NULL REFERENCES users(id),
    target_model VARCHAR(50),
    target_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date);
CREATE INDEX idx_attendance_sessions_faculty ON attendance_sessions(faculty_id);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);

-- Add foreign key constraints
ALTER TABLE departments ADD CONSTRAINT fk_departments_hod FOREIGN KEY (hod_id) REFERENCES users(id);

-- Create views for common queries
CREATE VIEW student_attendance_summary AS
SELECT 
    s.id as student_id,
    s.roll_number,
    s.name,
    sec.name as section_name,
    COUNT(ar.id) as total_sessions,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN ar.status = 'od' THEN 1 END) as od_count,
    ROUND(
        (COUNT(CASE WHEN ar.status = 'present' THEN 1 END) * 100.0 / 
         NULLIF(COUNT(CASE WHEN ar.status != 'unmarked' THEN 1 END), 0)), 2
    ) as attendance_percentage
FROM students s
JOIN sections sec ON s.section_id = sec.id
LEFT JOIN attendance_records ar ON s.id = ar.student_id
LEFT JOIN attendance_sessions ats ON ar.session_id = ats.id
WHERE ats.is_submitted = TRUE
GROUP BY s.id, s.roll_number, s.name, sec.name;

-- Create function to update attendance statistics
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE attendance_sessions 
    SET 
        present_count = (
            SELECT COUNT(*) FROM attendance_records 
            WHERE session_id = NEW.session_id AND status = 'present'
        ),
        absent_count = (
            SELECT COUNT(*) FROM attendance_records 
            WHERE session_id = NEW.session_id AND status = 'absent'
        ),
        od_count = (
            SELECT COUNT(*) FROM attendance_records 
            WHERE session_id = NEW.session_id AND status = 'od'
        ),
        unmarked_count = (
            SELECT COUNT(*) FROM attendance_records 
            WHERE session_id = NEW.session_id AND status = 'unmarked'
        )
    WHERE id = NEW.session_id;
    
    -- Update attendance percentage
    UPDATE attendance_sessions 
    SET attendance_percentage = ROUND(
        (present_count * 100.0 / NULLIF(total_students, 0)), 2
    )
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update session statistics
CREATE TRIGGER trigger_update_session_stats
    AFTER INSERT OR UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_session_stats();
