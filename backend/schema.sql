CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    appointment_time TEXT,
    status TEXT
);


CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT REFERENCES patients(id),
    doctor_name TEXT,
    appointment_time TEXT,
    status TEXT
);


CREATE TABLE queues (
    id TEXT PRIMARY KEY,
    test_name TEXT,
    people_waiting INTEGER,
    estimated_wait INTEGER,
    next_available TEXT,
    status TEXT
);


CREATE TABLE patient_journey (
    id BIGSERIAL PRIMARY KEY,
    patient_id TEXT,
    step_name TEXT,
    status TEXT,
    estimated_time TEXT
);


CREATE TABLE test_orders (
    id BIGSERIAL PRIMARY KEY,
    patient_id TEXT,
    test_name TEXT,
    status TEXT
);


INSERT INTO queues
(id, test_name, people_waiting, estimated_wait, next_available, status)
VALUES

(
    'blood',
    'Blood Test',
    2,
    12,
    '10:42 AM',
    'Open'
),

(
    'mri',
    'MRI Scan',
    5,
    35,
    '11:15 AM',
    'Open'
);