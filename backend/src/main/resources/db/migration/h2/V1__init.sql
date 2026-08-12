-- V1__init.sql (H2 2.x compatible)
-- Initial schema for AI-Powered Task Management Portal

-- Users table
CREATE TABLE users (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description CLOB,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    estimated_time_hours INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    owner_id UUID NOT NULL,
    CONSTRAINT fk_tasks_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Task Audit Log table (blockchain-style)
CREATE TABLE task_audit_log (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    task_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    payload_hash CLOB NOT NULL,
    previous_hash CLOB NOT NULL,
    current_hash CLOB NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_task_id ON task_audit_log(task_id);
CREATE INDEX idx_audit_log_timestamp ON task_audit_log(timestamp);
