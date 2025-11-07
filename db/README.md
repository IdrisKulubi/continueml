# Database Setup

This directory contains the database configuration and schema for Continuum MVP.

## Structure

- `drizzle.ts` - Database connection configuration with Neon DB
- `schema.ts` - Database schema definitions with Drizzle ORM

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Neon DB credentials:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 2. Generate Migrations

When you make changes to the schema, generate a new migration:

```bash
npm run db:generate
```

### 3. Run Migrations

Apply migrations to your database:

```bash
npm run db:migrate
```

Or push schema changes directly (for development):

```bash
npm run db:push
```

### 4. View Database

Open Drizzle Studio to view and manage your database:

```bash
npm run db:studio
```

## Schema Overview

### Tables

- **worlds** - User-created worlds/projects
- **branches** - Version branches for worlds
- **entities** - Characters, locations, objects, styles, and custom entities
- **entity_images** - Images associated with entities
- **generations** - AI generation records with prompt enhancement

### Indexes

All tables have indexes on:
- Foreign key columns (userId, worldId, entityId, branchId)
- Timestamp columns (createdAt, uploadedAt)
- Frequently queried columns (type, status)

### Foreign Keys

- All tables use CASCADE delete for proper cleanup
- Better Auth user table is referenced via userId (varchar)

## Notes

- Better Auth will automatically create user and session tables
- Connection pooling is configured for serverless environments
- All timestamps use PostgreSQL's `now()` function
- UUIDs are generated using PostgreSQL's `gen_random_uuid()`
