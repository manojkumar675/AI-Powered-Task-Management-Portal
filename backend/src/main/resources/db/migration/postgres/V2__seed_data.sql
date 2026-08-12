-- V2__seed_data.sql
-- Demo user and sample tasks for testing/demo

-- Demo user: demo@taskportal.com / Demo@123
-- BCrypt hash for "Demo@123"
INSERT INTO users (id, name, email, password, role, created_at, updated_at, created_by)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Demo User',
    'demo@taskportal.com',
    '$2a$10$w8aPkARjMAzskXcg4A6/Yuz7/N3BVbQRB1pNkiZvLQxOVOtajyj7a',
    'USER',
    NOW(),
    NOW(),
    'system'
);

-- Sample Tasks
INSERT INTO tasks (id, title, description, priority, due_date, status, estimated_time_hours, created_at, updated_at, created_by, owner_id) VALUES
('11111111-1111-1111-1111-111111111101', 'Prepare Q3 client presentation', 'Create comprehensive presentation slides for the Q3 quarterly business review with key clients.', 'HIGH', CURRENT_DATE + INTERVAL '3 days', 'IN_PROGRESS', 4, NOW() - INTERVAL '2 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111102', 'Fix login page redirect bug', 'Users are not being redirected properly after login when they had a deep link.', 'HIGH', CURRENT_DATE + INTERVAL '1 day', 'TODO', 2, NOW() - INTERVAL '1 day', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111103', 'Update project documentation', 'Review and update the API documentation to reflect the latest changes.', 'LOW', CURRENT_DATE + INTERVAL '7 days', 'TODO', 3, NOW() - INTERVAL '3 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111104', 'Design new dashboard layout', 'Create wireframes and mockups for the redesigned analytics dashboard.', 'MEDIUM', CURRENT_DATE + INTERVAL '5 days', 'IN_PROGRESS', 5, NOW() - INTERVAL '4 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111105', 'Sprint planning meeting', 'Prepare agenda and facilitate the sprint planning meeting for the team.', 'MEDIUM', CURRENT_DATE + INTERVAL '2 days', 'TODO', 2, NOW() - INTERVAL '1 day', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111106', 'Deploy v2.1 to production', 'Coordinate the production deployment of version 2.1 with DevOps.', 'HIGH', CURRENT_DATE, 'TODO', 3, NOW() - INTERVAL '2 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111107', 'Code review for auth module', 'Review pull requests for the authentication module refactoring.', 'MEDIUM', CURRENT_DATE + INTERVAL '3 days', 'DONE', 2, NOW() - INTERVAL '5 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111108', 'Research caching strategies', 'Investigate Redis vs Memcached for the application caching layer.', 'MEDIUM', CURRENT_DATE + INTERVAL '10 days', 'TODO', 3, NOW(), NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111109', 'Write unit tests for payment service', 'Achieve 80% code coverage for the payment processing module.', 'HIGH', CURRENT_DATE + INTERVAL '4 days', 'IN_PROGRESS', 4, NOW() - INTERVAL '3 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111110', 'Organize shared drive', 'Clean up and restructure the team shared drive folders.', 'LOW', CURRENT_DATE + INTERVAL '14 days', 'TODO', 2, NOW(), NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111111', 'Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment.', 'HIGH', CURRENT_DATE + INTERVAL '6 days', 'DONE', 6, NOW() - INTERVAL '7 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111112', 'Create onboarding guide', 'Write a comprehensive onboarding guide for new team members.', 'LOW', CURRENT_DATE + INTERVAL '21 days', 'TODO', 4, NOW(), NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111113', 'Database performance optimization', 'Analyze slow queries and add appropriate indexes.', 'HIGH', CURRENT_DATE - INTERVAL '1 day', 'IN_PROGRESS', 5, NOW() - INTERVAL '6 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111114', 'Weekly team standup notes', 'Compile and distribute meeting notes from the weekly standups.', 'LOW', CURRENT_DATE + INTERVAL '1 day', 'DONE', 1, NOW() - INTERVAL '2 days', NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('11111111-1111-1111-1111-111111111115', 'Implement dark mode toggle', 'Add a user preference toggle for dark mode across the application.', 'MEDIUM', CURRENT_DATE + INTERVAL '8 days', 'TODO', 3, NOW(), NOW(), 'demo@taskportal.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- Audit log entries for seed tasks (pre-computed hash chain)
-- Note: For seed data, we use simplified hashes since these are demo entries
INSERT INTO task_audit_log (id, task_id, action_type, payload_hash, previous_hash, current_hash, timestamp) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa101', '11111111-1111-1111-1111-111111111101', 'TASK_CREATED', 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '0', 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', NOW() - INTERVAL '2 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa102', '11111111-1111-1111-1111-111111111101', 'STATUS_CHANGED', 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', NOW() - INTERVAL '1 day'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa103', '11111111-1111-1111-1111-111111111102', 'TASK_CREATED', 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', '0', 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', NOW() - INTERVAL '1 day'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa104', '11111111-1111-1111-1111-111111111107', 'TASK_CREATED', '1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b', '0', '2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c', NOW() - INTERVAL '5 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa105', '11111111-1111-1111-1111-111111111107', 'TASK_COMPLETED', '3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d', '2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c', '4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e', NOW() - INTERVAL '3 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa106', '11111111-1111-1111-1111-111111111111', 'TASK_CREATED', '5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f', '0', '6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a', NOW() - INTERVAL '7 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa107', '11111111-1111-1111-1111-111111111111', 'TASK_COMPLETED', '7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b', '6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a', '8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c', NOW() - INTERVAL '5 days');
