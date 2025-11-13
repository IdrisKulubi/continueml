# Monitoring Setup Quick Start

This document provides a quick start guide for setting up monitoring and observability for continueml.

## Quick Setup Checklist

- [ ] Set up error tracking (Sentry)
- [ ] Set up logging (Logtail)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure alerts
- [ ] Test monitoring setup

## 1. Error Tracking with Sentry (Recommended)

### Setup Steps

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Sign up for free account
   - Create new project (select Next.js)

2. **Install Sentry**
   ```bash
   cd continueml
   pnpm add @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Configure Environment Variable**
   ```bash
   # Add to .env.local and Vercel
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
   ```

4. **Uncomment Sentry Code**
   - Edit `src/lib/monitoring/error-tracker.ts`
   - Uncomment Sentry initialization and tracking code

5. **Test Error Tracking**
   ```typescript
   import { errorTracker } from '@/lib/monitoring';
   
   // Trigger test error
   errorTracker.track(new Error('Test error'), 'UNKNOWN', 'MEDIUM');
   ```

6. **Verify in Sentry Dashboard**
   - Go to Sentry dashboard
   - Check "Issues" tab
   - Verify test error appears

### Cost: Free tier includes 5,000 errors/month

## 2. Logging with Logtail (Recommended)

### Setup Steps

1. **Create Logtail Account**
   - Go to https://betterstack.com/logtail
   - Sign up for free account
   - Create new source (select "HTTP")

2. **Configure Environment Variable**
   ```bash
   # Add to .env.local and Vercel
   LOGTAIL_SOURCE_TOKEN=your-logtail-token
   ```

3. **Uncomment Logtail Code**
   - Edit `src/lib/monitoring/logger.ts`
   - Uncomment Logtail integration code

4. **Test Logging**
   ```typescript
   import { logger } from '@/lib/monitoring';
   
   logger.info('Test log message', { test: true });
   ```

5. **Verify in Logtail Dashboard**
   - Go to Logtail dashboard
   - Check "Live Tail" tab
   - Verify test log appears

### Cost: Free tier includes 1GB logs/month

## 3. Uptime Monitoring with UptimeRobot (Recommended)

### Setup Steps

1. **Create UptimeRobot Account**
   - Go to https://uptimerobot.com
   - Sign up for free account

2. **Add Monitor**
   - Click "Add New Monitor"
   - Monitor Type: HTTP(s)
   - Friendly Name: continueml Production
   - URL: https://your-domain.vercel.app/api/health
   - Monitoring Interval: 5 minutes

3. **Configure Alerts**
   - Add alert contacts (email, Slack, etc.)
   - Set alert threshold (e.g., down for 2 minutes)

4. **Test Health Endpoint**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

5. **Verify Response**
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "checks": {
       "database": "ok"
     },
     "version": "0.1.0"
   }
   ```

### Cost: Free tier includes 50 monitors

## 4. Configure Slack Alerts (Optional)

### Setup Steps

1. **Create Slack Webhook**
   - Go to https://api.slack.com/apps
   - Create new app
   - Enable "Incoming Webhooks"
   - Add webhook to channel
   - Copy webhook URL

2. **Configure Environment Variable**
   ```bash
   # Add to .env.local and Vercel
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **Uncomment Slack Code**
   - Edit `src/lib/monitoring/error-tracker.ts`
   - Uncomment Slack webhook code in `alertCriticalError` method

4. **Test Slack Alert**
   ```typescript
   import { errorTracker, ErrorSeverity } from '@/lib/monitoring';
   
   // Trigger critical error
   errorTracker.track(
     new Error('Test critical error'),
     'UNKNOWN',
     ErrorSeverity.CRITICAL
   );
   ```

5. **Verify in Slack**
   - Check configured Slack channel
   - Verify alert message appears

### Cost: Free

## 5. Vercel Environment Variables

Add all monitoring environment variables to Vercel:

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add LOGTAIL_SOURCE_TOKEN production
vercel env add SLACK_WEBHOOK_URL production

# Or via Vercel Dashboard:
# 1. Go to project settings
# 2. Navigate to "Environment Variables"
# 3. Add each variable
```

## 6. Test Complete Setup

### Test Error Tracking

1. Deploy to production
2. Trigger test error in production
3. Verify error appears in Sentry
4. Verify error logged to Logtail
5. Verify critical error alerts to Slack

### Test Uptime Monitoring

1. Verify health endpoint returns 200
2. Wait for UptimeRobot check
3. Verify status shows "Up"
4. Test alert by stopping service (optional)

### Test Performance Monitoring

1. Generate some traffic
2. Check Vercel Analytics
3. Review performance metrics
4. Identify slow endpoints

## Monitoring Dashboards

### Daily Checks

1. **Sentry Dashboard**
   - Review new errors
   - Check error trends
   - Resolve fixed errors

2. **Logtail Dashboard**
   - Review error logs
   - Check warning logs
   - Analyze patterns

3. **UptimeRobot Dashboard**
   - Verify uptime percentage
   - Check response times
   - Review downtime incidents

4. **Vercel Dashboard**
   - Check deployment status
   - Review function logs
   - Monitor usage

### Weekly Reviews

1. **Error Analysis**
   - Top errors by frequency
   - New error types
   - Error resolution rate

2. **Performance Analysis**
   - Slow API endpoints
   - Slow database queries
   - External API latency

3. **Uptime Analysis**
   - Uptime percentage
   - Downtime incidents
   - Response time trends

## Alerting Strategy

### Critical Alerts (Immediate Action)

- Application down (uptime < 99%)
- Critical errors (severity: CRITICAL)
- Database connection failures
- External API complete failures

**Notification**: Slack + Email + SMS (PagerDuty)

### High Priority Alerts (Action within 1 hour)

- High error rate (> 5%)
- Slow API responses (> 2s average)
- High severity errors
- Database query timeouts

**Notification**: Slack + Email

### Medium Priority Alerts (Action within 24 hours)

- Moderate error rate (> 2%)
- Slow external API calls
- Medium severity errors
- Storage quota warnings

**Notification**: Email

### Low Priority Alerts (Review weekly)

- Low severity errors
- Performance degradation
- Validation errors
- Warning logs

**Notification**: Dashboard only

## Cost Summary

| Service | Free Tier | Paid Plans Start At |
|---------|-----------|---------------------|
| Sentry | 5,000 errors/month | $26/month |
| Logtail | 1GB logs/month | $10/month |
| UptimeRobot | 50 monitors | $7/month |
| Slack | Unlimited | Free |
| Vercel Analytics | Included | Included |

**Total Free Tier**: $0/month (sufficient for MVP)

## Troubleshooting

### Sentry Not Receiving Errors

1. Check NEXT_PUBLIC_SENTRY_DSN is set
2. Verify Sentry initialization code is uncommented
3. Check browser console for Sentry errors
4. Test with manual error trigger

### Logtail Not Receiving Logs

1. Check LOGTAIL_SOURCE_TOKEN is set
2. Verify Logtail code is uncommented
3. Check network requests in browser
4. Test with manual log trigger

### UptimeRobot Shows Down

1. Check health endpoint manually
2. Verify database connection
3. Check Vercel function logs
4. Review recent deployments

### Slack Alerts Not Working

1. Check SLACK_WEBHOOK_URL is set
2. Verify webhook is active in Slack
3. Test webhook with curl
4. Check error tracker code

## Next Steps

After basic monitoring is set up:

1. **Add Custom Metrics**
   - Business metrics (signups, generations)
   - Feature usage metrics
   - User engagement metrics

2. **Set Up Dashboards**
   - Create custom Grafana dashboards
   - Set up business intelligence reports
   - Create executive summaries

3. **Implement Advanced Alerting**
   - Anomaly detection
   - Predictive alerts
   - Smart alert grouping

4. **Add Distributed Tracing**
   - Implement OpenTelemetry
   - Trace requests across services
   - Identify bottlenecks

## Additional Resources

- [Full Monitoring Guide](./docs/monitoring.md)
- [Deployment Guide](./docs/deployment.md)
- [CI/CD Guide](./docs/ci-cd.md)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Logtail Documentation](https://betterstack.com/docs/logtail/)
- [UptimeRobot API](https://uptimerobot.com/api/)
