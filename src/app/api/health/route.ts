/**
 * Health check endpoint for uptime monitoring
 * Returns 200 OK if the application is healthy
 */

import { NextResponse } from 'next/server';
import  db  from '../../../../db/drizzle';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
    // Add more checks as needed
  };
  version?: string;
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: HealthStatus['checks'] = {
    database: 'ok',
  };

  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    console.error('Database health check failed:', error);
  }

  // Determine overall health status
  const isHealthy = Object.values(checks).every((status) => status === 'ok');

  const healthStatus: HealthStatus = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    checks,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  };

  // Return 503 if unhealthy, 200 if healthy
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(healthStatus, { status: statusCode });
}
