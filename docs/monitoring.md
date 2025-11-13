# Monitoring and Logging Guide

This guide covers the monitoring, logging, and observability setup for continueml.

## Overview

The application uses a comprehensive monitoring stack:

1. **Logging**: Centralized logging with structured logs
2. **Error Tracking**: Error monitoring and alerting
3. **Performance Monitoring**: Application performance metrics
4. **Uptime Monitoring**: Service availability tracking

## Logging System

### Logger Service

Location: `src/lib/monitoring/logger.ts`

The logger provides structured logging with different levels:

```typescript
import { logger } from '@/lib/monitoring';

// Debug (development only)
logger.debug('Processing entity', { entityId: '123' });

// Info
logger.info('Entity created successfully', { entityId: '123', worldId: '456' });

// Warning
logger.warn('Slow query detected', { query: 'SELECT ...', duration: 1500 });

// Error
logger.error('Failed to upload image', error, { entityId: '123' });
```

### Log Levels

- **DEBUG**: Detailed information for debugging (development only)
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures

### Log Context

Always include relevant context with logs:

```typescript
logger.info('Generation completed', {
  userId: 'user-123',
  worldId: 'world-456',
  generationId: 'gen-789',
  duration: 5000,
});
```

### Sensitive Data

The logger automatically redacts sensitive fields:
- `password`
- `token`
- `secret`
- `apiKey`
- `accessKey`
- `secretKey`

### Log Format

**Development**: Human-readable format
```
[2024-01-15T10:30:00.000Z] INFO: Entity created | {"entityId":"123","worldId":"456"}
```

**Production**: JSON format for log aggregators
```json
{
  "level": "info",
  "message": "Entity created",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "context": {
    "entityId": "123",
    "worldId": "456"
  }
}
```

## Error Tracking

### Error Tracker Service

Location: `src/lib/monitoring/error-tracker.ts`

Track errors with categorization and severity:

```typescript
import { errorTracker, ErrorCategory, ErrorSeverity } from '@/lib/monitoring';

// Track general error
errorTracker.track(
  error,
  ErrorCategory.DATABASE,
  ErrorSeverity.HIGH,
  { userId: '123' }
);

// Track specific error types
errorTracker.trackDatabaseError(error, { query: 'SELECT ...' });
errorTracker.trackExternalAPIError(error, 'OpenAI', { endpoint: '/embeddings' });
errorTracker.trackAuthError(error, { userId: '123' });
errorTracker.trackValidationError(error, { field: 'email' });
errorTracker.trackStorageError(error, { key: 'image.jpg' });
errorTracker.trackEmbeddingError(error, { entityId: '123' });
errorTracker.trackGenerationError(error, { generationId: '456' });
```

### Error Categories

- **DATABASE**: Database-related errors
- **EXTERNAL_API**: External API call failures
- **AUTHENTICATION**: Auth-related errors
- **VALIDATION**: Input validation errors
- **STORAGE**: File storage errors
- **EMBEDDING**: Embedding generation errors
- **GENERATION**: Content generation errors
- **UNKNOWN**: Uncategorized errors

### Error Severity

- **LOW**: Minor issues, no immediate action needed
- **MEDIUM**: Moderate issues, should be investigated
- **HIGH**: Serious issues, requires attention
- **CRITICAL**: Critical failures, immediate action required

### User Context

Set user context for better error tracking:

```typescript
// After user login
errorTracker.setUserContext(user.id, user.email, user.name);

// After user logout
errorTracker.clearUserContext();
```

### Breadcrumbs

Add breadcrumbs for debugging:

```typescript
errorTracker.addBreadcrumb(
  'User clicked generate button',
  'user_action',
  { worldId: '123' }
);
```

## Performance Monitoring

### Performance Monitor Service

Location: `src/lib/monitoring/performance.ts`

Track performance metrics:

```typescript
import { performanceMonitor } from '@/lib/monitoring';

// Time an operation
const stopTimer = performanceMonitor.startTimer('embedding_generation');
// ... do work ...
stopTimer();

// Measure async function
const result = await performanceMonitor.measure(
  'fetch_entities',
  async () => {
    return await entityService.getEntities(worldId);
  }
);

// Measure sync function
const result = performanceMonitor.measureSync('calculate_score', () => {
  return calculateConsistencyScore(embedding1, embedding2);
});

// Record specific metrics
performanceMonitor.recordDatabaseQuery('SELECT * FROM entities', 150);
performanceMonitor.recordAPIResponse('GET', '/api/entities', 200, 250);
performanceMonitor.recordExternalAPI('OpenAI', '/embeddings', 1500);
performanceMonitor.recordEmbeddingGeneration('visual', 4500);
performanceMonitor.recordImageUpload(1024000, 2000);
```

### Performance Thresholds

The monitor automatically warns on slow operations:

- **Database queries**: > 1000ms
- **API responses**: > 2000ms
- **External API calls**: > 5000ms
- **Visual embeddings**: > 5000ms
- **Semantic embeddings**: > 3000ms

### Web Vitals (Client-Side)

Track Core Web Vitals in your app:

```typescript
// In app/layout.tsx or _app.tsx
import { performanceMonitor } from '@/lib/monitoring';

export function reportWebVitals(metric: any) {
  performanceMonitor.reportWebVitals(metric);
}
```

## Setting Up External Services

### Option 1: Sentry (Recommended for Error Tracking)

1. Create Sentry account: https://sentry.io
2. Create new project for Next.js
3. Install Sentry SDK:
   ```bash
   pnpm add @sentry/nextjs
   ```
4. Run Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
5. Add environment variable:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```
6. Uncomment Sentry code in `error-tracker.ts`

### Option 2: Logtail (Recommended for Logging)

1. Create Logtail account: https://betterstack.com/logtail
2. Create new source
3. Add environment variable:
   ```bash
   LOGTAIL_SOURCE_TOKEN=your-logtail-token
   ```
4. Uncomment Logtail code in `logger.ts`

### Option 3: Datadog (Comprehensive Monitoring)

1. Create Datadog account: https://www.datadoghq.com
2. Get API key
3. Add environment variables:
   ```bash
   DATADOG_API_KEY=your-datadog-api-key
   DATADOG_APP_KEY=your-datadog-app-key
   ```
4. Uncomment Datadog code in `performance.ts`

### Option 4: UptimeRobot (Uptime Monitoring)

1. Create UptimeRobot account: https://uptimerobot.com
2. Add HTTP(S) monitor for your production URL
3. Configure alert contacts (email, Slack, etc.)
4. Set check interval (recommended: 5 minutes)

## Monitoring Dashboard

### Vercel Analytics

Vercel provides built-in analytics:

1. Go to Vercel dashboard
2. Select your project
3. Navigate to "Analytics" tab
4. View:
   - Page views
   - Top pages
   - Top referrers
   - Devices and browsers

### Vercel Logs

View application logs:

1. Go to Vercel dashboard
2. Select your project
3. Navigate to "Logs" tab
4. Filter by:
   - Deployment
   - Time range
   - Log level
   - Search term

### Database Monitoring (Neon DB)

Monitor database performance:

1. Go to Neon DB dashboard
2. Select your project
3. View:
   - Connection count
   - Query performance
   - Storage usage
   - Compute usage

### Vector Database Monitoring (Pinecone)

Monitor vector operations:

1. Go to Pinecone dashboard
2. Select your index
3. View:
   - Query latency
   - Vector count
   - Index usage
   - API requests

### Storage Monitoring (Cloudflare R2)

Monitor storage usage:

1. Go to Cloudflare dashboard
2. Navigate to R2
3. Select your bucket
4. View:
   - Storage usage
   - Bandwidth
   - Request count
   - Costs

## Alerting

### Critical Error Alerts

Configure alerts for critical errors:

1. **Email Alerts**: Set up in Sentry
2. **Slack Alerts**: Configure webhook in `error-tracker.ts`
3. **PagerDuty**: For on-call rotation

### Performance Alerts

Set up alerts for performance degradation:

1. **Slow API responses**: > 2s average
2. **High error rate**: > 5% of requests
3. **Database connection issues**: Connection pool exhausted
4. **External API failures**: > 10% failure rate

### Uptime Alerts

Configure uptime monitoring:

1. **Service down**: HTTP status != 200
2. **Response time**: > 5s
3. **SSL certificate expiration**: < 30 days

## Best Practices

### 1. Log Appropriately

```typescript
// ✅ Good: Structured logging with context
logger.info('Entity created', { entityId, worldId, userId });

// ❌ Bad: Unstructured logging without context
console.log('Entity created');
```

### 2. Track Errors with Context

```typescript
// ✅ Good: Track with category, severity, and context
errorTracker.trackDatabaseError(error, { query, userId });

// ❌ Bad: Generic error tracking
console.error(error);
```

### 3. Measure Performance

```typescript
// ✅ Good: Measure critical operations
const result = await performanceMonitor.measure('generate_embedding', async () => {
  return await embeddingService.generate(text);
});

// ❌ Bad: No performance tracking
const result = await embeddingService.generate(text);
```

### 4. Set User Context

```typescript
// ✅ Good: Set user context after login
errorTracker.setUserContext(user.id, user.email);

// ❌ Bad: No user context
// Errors won't be associated with users
```

### 5. Use Breadcrumbs

```typescript
// ✅ Good: Add breadcrumbs for debugging
errorTracker.addBreadcrumb('User started generation', 'user_action');
// ... operation ...
errorTracker.addBreadcrumb('Generation completed', 'user_action');

// ❌ Bad: No breadcrumbs
// Hard to debug user flows
```

## Troubleshooting

### Logs Not Appearing

**Possible causes**:
- Log level too high
- External service not configured
- Network issues

**Solutions**:
- Check log level in logger
- Verify environment variables
- Check external service status

### Errors Not Tracked

**Possible causes**:
- Sentry not initialized
- DSN not configured
- Error not caught

**Solutions**:
- Verify Sentry initialization
- Check NEXT_PUBLIC_SENTRY_DSN
- Add try-catch blocks

### Performance Metrics Missing

**Possible causes**:
- Monitoring not enabled
- External service not configured
- Metrics not sent

**Solutions**:
- Enable performance monitoring
- Configure external service
- Check network connectivity

## Maintenance

### Regular Tasks

1. **Daily**:
   - Review error logs
   - Check critical alerts
   - Monitor uptime

2. **Weekly**:
   - Review performance metrics
   - Analyze slow queries
   - Check error trends

3. **Monthly**:
   - Review monitoring costs
   - Update alert thresholds
   - Audit log retention

4. **Quarterly**:
   - Review monitoring strategy
   - Update external services
   - Optimize logging

## Cost Optimization

### Logging

- Use appropriate log levels
- Avoid logging in tight loops
- Set log retention policies
- Sample high-volume logs

### Error Tracking

- Filter out known errors
- Set error sampling rate
- Deduplicate similar errors
- Archive old errors

### Performance Monitoring

- Sample metrics in production
- Aggregate similar metrics
- Set appropriate retention
- Monitor monitoring costs

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Logtail Documentation](https://betterstack.com/docs/logtail)
- [Datadog Documentation](https://docs.datadoghq.com)
- [UptimeRobot Documentation](https://uptimerobot.com/help)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)
