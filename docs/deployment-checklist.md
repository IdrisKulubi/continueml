# Deployment Checklist

Use this checklist to ensure all deployment infrastructure is properly configured.

## Pre-Deployment Setup

### 1. External Services Setup

- [ ] **Neon DB Production Database**
  - [ ] Create production project
  - [ ] Create database
  - [ ] Copy connection strings (pooled and direct)
  - [ ] Configure IP allowlist (or allow all for Vercel)

- [ ] **Pinecone Production Index**
  - [ ] Create index (dimensions: 1536, metric: cosine)
  - [ ] Copy API key and environment
  - [ ] Verify index is active

- [ ] **Cloudflare R2 Production Bucket**
  - [ ] Create bucket
  - [ ] Configure public access settings
  - [ ] Create API token with R2 permissions
  - [ ] Copy credentials and public URL

- [ ] **Google OAuth Production**
  - [ ] Create/update OAuth 2.0 credentials
  - [ ] Add production redirect URIs
  - [ ] Copy client ID and secret

- [ ] **OpenAI API**
  - [ ] Verify API key has credits
  - [ ] Set usage limits (optional)

- [ ] **Replicate API**
  - [ ] Verify API token is valid
  - [ ] Check billing settings

### 2. Vercel Project Setup

- [ ] **Create Vercel Project**
  - [ ] Import Git repository
  - [ ] Configure framework preset (Next.js)
  - [ ] Set root directory to `continueml`
  - [ ] Configure build settings

- [ ] **Environment Variables**
  - [ ] Add all required environment variables (see list below)
  - [ ] Verify all values are correct
  - [ ] Set variables for production environment

- [ ] **Domain Configuration**
  - [ ] Add custom domain (optional)
  - [ ] Configure DNS settings
  - [ ] Enable HTTPS

### 3. GitHub Repository Setup

- [ ] **GitHub Secrets**
  - [ ] Add `VERCEL_TOKEN`
  - [ ] Add `VERCEL_ORG_ID`
  - [ ] Add `VERCEL_PROJECT_ID`

- [ ] **Branch Protection**
  - [ ] Enable branch protection for `main`
  - [ ] Require pull request reviews
  - [ ] Require status checks to pass
  - [ ] Prevent force pushes

### 4. Monitoring Setup (Optional but Recommended)

- [ ] **Sentry (Error Tracking)**
  - [ ] Create Sentry project
  - [ ] Install Sentry SDK
  - [ ] Add `NEXT_PUBLIC_SENTRY_DSN`
  - [ ] Uncomment Sentry code

- [ ] **Logtail (Logging)**
  - [ ] Create Logtail source
  - [ ] Add `LOGTAIL_SOURCE_TOKEN`
  - [ ] Uncomment Logtail code

- [ ] **UptimeRobot (Uptime Monitoring)**
  - [ ] Create monitor for `/api/health`
  - [ ] Configure alert contacts
  - [ ] Set check interval (5 minutes)

- [ ] **Slack Alerts (Optional)**
  - [ ] Create Slack webhook
  - [ ] Add `SLACK_WEBHOOK_URL`
  - [ ] Uncomment Slack code

## Environment Variables Checklist

### Required Variables

- [ ] `DATABASE_URL` - Neon DB pooled connection
- [ ] `DIRECT_URL` - Neon DB direct connection
- [ ] `BETTER_AUTH_SECRET` - 32+ character secret
- [ ] `BETTER_AUTH_URL` - Production URL
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (public)
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `PINECONE_API_KEY` - Pinecone API key
- [ ] `PINECONE_ENVIRONMENT` - Pinecone environment
- [ ] `PINECONE_INDEX_NAME` - Pinecone index name
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `REPLICATE_API_TOKEN` - Replicate API token
- [ ] `R2_ACCOUNT_ID` - Cloudflare R2 account ID
- [ ] `R2_ACCESS_KEY_ID` - R2 access key
- [ ] `R2_SECRET_ACCESS_KEY` - R2 secret key
- [ ] `R2_BUCKET_NAME` - R2 bucket name
- [ ] `R2_PUBLIC_URL` - R2 public URL

### Optional Variables (Monitoring)

- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN
- [ ] `LOGTAIL_SOURCE_TOKEN` - Logtail token
- [ ] `DATADOG_API_KEY` - Datadog API key
- [ ] `DATADOG_APP_KEY` - Datadog app key
- [ ] `SLACK_WEBHOOK_URL` - Slack webhook URL

## Deployment Steps

### 1. Initial Deployment

- [ ] Push code to `main` branch
- [ ] Verify GitHub Actions workflow runs successfully
- [ ] Verify Vercel deployment completes
- [ ] Check deployment logs for errors

### 2. Database Migration

- [ ] Connect to production database locally
- [ ] Run migrations: `pnpm db:migrate`
- [ ] Verify tables were created: `pnpm db:studio`

### 3. Verification

- [ ] Visit production URL
- [ ] Test homepage loads
- [ ] Test Google OAuth login
- [ ] Test creating a world
- [ ] Test creating an entity with image upload
- [ ] Test generating embeddings
- [ ] Test creating a generation
- [ ] Test exporting world bible

### 4. Monitoring Verification

- [ ] Check health endpoint: `/api/health`
- [ ] Verify Sentry receives test error
- [ ] Verify Logtail receives logs
- [ ] Verify UptimeRobot shows "Up" status
- [ ] Test Slack alerts (if configured)

## Post-Deployment

### 1. Performance Optimization

- [ ] Review Vercel Analytics
- [ ] Check function execution times
- [ ] Optimize slow endpoints
- [ ] Review bundle size

### 2. Security Audit

- [ ] Verify HTTPS is enforced
- [ ] Check security headers
- [ ] Test authentication flows
- [ ] Verify rate limiting works
- [ ] Review API permissions

### 3. Documentation

- [ ] Update README with production URL
- [ ] Document any deployment issues
- [ ] Update runbook for common issues
- [ ] Share credentials with team (securely)

### 4. Monitoring Setup

- [ ] Set up alert thresholds
- [ ] Configure notification channels
- [ ] Test alert delivery
- [ ] Document on-call procedures

## Rollback Procedure

If deployment fails or issues are discovered:

1. [ ] Go to Vercel dashboard
2. [ ] Navigate to Deployments
3. [ ] Find previous working deployment
4. [ ] Click "..." menu > "Promote to Production"
5. [ ] Verify rollback successful
6. [ ] Investigate and fix issues
7. [ ] Redeploy when ready

## Maintenance Schedule

### Daily

- [ ] Review error logs in Sentry
- [ ] Check uptime status
- [ ] Monitor critical alerts

### Weekly

- [ ] Review performance metrics
- [ ] Analyze slow queries
- [ ] Check error trends
- [ ] Review security logs

### Monthly

- [ ] Update dependencies
- [ ] Review and rotate API keys
- [ ] Check resource usage and costs
- [ ] Update documentation

### Quarterly

- [ ] Security audit
- [ ] Performance optimization
- [ ] Review monitoring strategy
- [ ] Update disaster recovery plan

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Run `pnpm build` locally to reproduce
4. Check for TypeScript errors
5. Review recent code changes

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Neon DB dashboard for connection limits
3. Verify IP allowlist includes Vercel IPs
4. Test connection with `pnpm db:studio`

### OAuth Redirect Issues

1. Verify redirect URIs in Google Cloud Console
2. Check `BETTER_AUTH_URL` matches domain exactly
3. Ensure no trailing slashes in URLs
4. Test OAuth flow in incognito mode

### Image Upload Fails

1. Verify R2 credentials are correct
2. Check R2 bucket permissions
3. Test R2 connection with AWS CLI
4. Review storage service logs

### Embedding Generation Fails

1. Verify OpenAI API key has credits
2. Check Replicate API token is valid
3. Verify Pinecone index exists and is active
4. Review embedding service logs

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Neon DB Support**: https://neon.tech/docs
- **Pinecone Support**: https://docs.pinecone.io
- **Cloudflare Support**: https://developers.cloudflare.com/r2
- **Sentry Support**: https://sentry.io/support
- **Logtail Support**: https://betterstack.com/support

## Additional Resources

- [Deployment Guide](./deployment.md)
- [CI/CD Guide](./ci-cd.md)
- [Monitoring Guide](./monitoring.md)
- [Monitoring Quick Start](../MONITORING.md)
- [Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
