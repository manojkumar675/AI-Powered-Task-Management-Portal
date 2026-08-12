# Assumptions & Design Decisions

## Authentication

| Decision | Rationale |
|----------|-----------|
| JWT expiration = 1 hour (3600000 ms) | Standard session length for web apps — balances security with usability. Users won't be interrupted too often. |
| No refresh token | Simplifies the initial implementation. On expiry the user is redirected to login. |
| JWT stored in localStorage | Simpler than HttpOnly cookies for a SPA with CORS. Trade-off: vulnerable to XSS but acceptable for a demo/portfolio app. |
| BCrypt strength = 10 (default) | Standard bcrypt cost factor — secure yet fast enough for normal use. |
| All users register with role USER | ADMIN role exists for future use; no admin-creation endpoint is exposed. |

## Database

| Decision | Rationale |
|----------|-----------|
| UUID primary keys | Avoids sequential ID enumeration attacks; works well in distributed systems. |
| PostgreSQL 16 | Latest stable LTS release with full JSON, UUID, and date support. |
| Flyway for migrations | Schema versioning is production-ready and auditable. |
| `createdBy` stored as String (email) | Simpler than a foreign key for audit purposes. |

## Task Management

| Decision | Rationale |
|----------|-----------|
| Tasks are scoped to authenticated user | Each user only sees and manages their own tasks. No shared/team tasks in v1. |
| Soft delete not implemented | Tasks are hard-deleted. Audit log preserves the history. |
| `estimatedTimeHours` is Integer | Whole hours are sufficient granularity for task estimation. |
| `dueDate` is LocalDate (not DateTime) | Tasks have a due *date*, not a due *time*. Simpler UX. |
| Default page size = 10 | Standard pagination size for task lists. |

## AI Module

| Decision | Rationale |
|----------|-----------|
| Google Gemini 2.5 Flash | Specified in requirements. Fast, cost-effective model. |
| HTTP call via RestTemplate | Simpler than adding the full Gemini SDK as a dependency. |
| Fallback is keyword-based | Deterministic rules ensure the endpoint never fails. |
| AI response is not persisted | Generated suggestions are returned to the client for review before task creation. |
| Temperature = 0.7 | Balanced creativity for task descriptions. |

## Blockchain Module

| Decision | Rationale |
|----------|-----------|
| SHA-256 hash chaining | Industry-standard hash algorithm; sufficient for tamper detection. |
| Hash chain is per-task | Each task has its own independent chain. Simplifies verification. |
| First entry has previousHash = "0" | Genesis block convention. |
| Payload hash = SHA-256(actionType + taskId + timestamp + serialized payload) | Captures the full state at each point. |
| Audit entries are immutable | No update or delete operations on audit log records. |

## Frontend

| Decision | Rationale |
|----------|-----------|
| Tailwind CSS v3 | Explicitly requested. Utility-first approach for rapid UI development. |
| React Router v6 | Latest stable version with data router support. |
| Context API (not Redux) | Sufficient for auth state management in this app. Less boilerplate. |
| Toast via custom component | Avoids external dependency; lightweight implementation. |
| Dark theme by default | Modern, premium feel as required by design guidelines. |

## Docker

| Decision | Rationale |
|----------|-----------|
| Multi-stage builds | Smaller final images; build tools not included in production. |
| Backend on port 8080 | Spring Boot default. |
| Frontend on port 5173 (mapped from nginx 80) | Matches Vite dev server port for consistency. |
| PostgreSQL on port 5432 | Default PostgreSQL port. |
| No SSL/TLS in Docker Compose | Local development setup. Production would use a reverse proxy. |

## Testing

| Decision | Rationale |
|----------|-----------|
| Unit tests with JUnit 5 + Mockito | Standard Spring Boot testing stack. |
| Integration tests with Testcontainers | Real PostgreSQL instance for realistic testing. |
| Frontend tests not included | Backend testing prioritized per requirements. Frontend can add Vitest/RTL later. |

## Seed Data

| Decision | Rationale |
|----------|-----------|
| Demo user: demo@taskportal.com / Demo@123 | Easy to remember for demos. Password meets typical complexity rules. |
| 15 tasks with varied data | Covers all priorities, statuses, and date ranges for realistic demo. |
| Pre-computed BCrypt hash in seed SQL | Avoids needing the app running to hash the password. |
| Audit log entries included | Demonstrates the blockchain feature out of the box. |
