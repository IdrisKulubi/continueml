# Deployment Guide

This guide covers deploying continueml to production using Vercel, Neon DB, Pinecone, and Cloudflare R2.

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account (https://vercel.com)
2. A Neon DB account (https://neon.tech)
3. A Pinecone account (https://www.pinecone.io)
4. A Cloudflare account with R2 enabled (https://cloudflare.com)
5. A Google Cloud project with OAuth configured
6. An OpenAI API key (https://platform.openai.com)
7. A Replicate API token (https://replicate.com)

## Step 1: Set Up Neon DB Production Database

1. Log in to Neon DB console
2. Create a new project named "continueml-production"
3. Create a new database named "continueml"
4. Copy the connection string (both pooled and direct)
5. Save these as:
   - `DATABASE_URL` (pooled connection for serverless)
   - `DIRECT_URL` (direct connection for migrations)

## Step 2: Configure Pinecone Production Index

1. Log in to Pinecone console
2. Create a new index with these settings:
   - Name: `continueml-production`
   - Dimensions: `1536` (for OpenAI text-embedding-3-small)
   - Metric: `cosine`
   - Cloud: `AWS`
   - Region: `us-east-1` (or closest to your Vercel region)
3. Copy the API key and environment
4. Save these as:
   - `PINECONE_API_KEY`
   - `PINECONE_ENVIRONMENT`
   - `PINECONE_INDEX_NAME=continueml-production`

## Step 3: Set Up Cloudflare R2 Production Bucket

1. Log in to Cloudflare dashboard
2. Navigate to R2 Object Storage
3. Create a new bucket named "continueml-production"
4. Configure public access settings:
   - Enable public access for read operations
   - Keep write operations private
5. Create an API token with R2 permissions:
   - Navigate to "Manage R2 API Tokens"
   - Create token with "Object Read & Write" permissions
6. Copy the credentials:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME=continueml-production`
   - `R2_PUBLIC_URL=https://[bucket-name].[account-id].r2.cloudflarestorage.com`

## Step 4: Configure Better Auth Production Settings

1. Generate a secure secret (minimum 32 characters):
   ```bash
   openssl rand -base64 32
   ```
2. Set your production URL:
   - `BETTER_AUTH_SECRET=[generated-secret]`
   - `BETTER_AUTH_URL=https://your-domain.vercel.app`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`

## Step 5: Configure Google OAuth for Production

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/google/callback`
6. Copy the credentials:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## Step 6: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   cd continueml
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Set project name: `continueml`
   - Set framework preset: `Next.js`
   - Set root directory: `./`

5. Add environment variables:
   ```bash
   vercel env add DATABASE_URL production
   vercel env add DIRECT_URL production
   vercel env add BETTER_AUTH_SECRET production
   vercel env add BETTER_AUTH_URL production
   vercel env add NEXT_PUBLIC_APP_URL production
   vercel env add GOOGLE_CLIENT_ID production
   vercel env add GOOGLE_CLIENT_SECRET production
   vercel env add PINECONE_API_KEY production
   vercel env add PINECONE_ENVIRONMENT production
   vercel env add PINECONE_INDEX_NAME production
   vercel env add OPENAI_API_KEY production
   vercel env add REPLICATE_API_TOKEN production
   vercel env add R2_ACCOUNT_ID production
   vercel env add R2_ACCESS_KEY_ID production
   vercel env add R2_SECRET_ACCESS_KEY production
   vercel env add R2_BUCKET_NAME production
   vercel env add R2_PUBLIC_URL production
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `continueml`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
4. Add all environment variables from the list above
5. Click "Deploy"

## Step 7: Run Database Migrations

After the first deployment:

1. Connect to your production database:
   ```bash
   # Set environment variables locally
   export DATABASE_URL="your-production-database-url"
   export DIRECT_URL="your-production-direct-url"
   ```

2. Run migrations:
   ```bash
   cd continueml
   pnpm db:migrate
   ```

3. Verify tables were created:
   ```bash
   pnpm db:studio
   ```

## Step 8: Verify Deployment

1. Visit your production URL: `https://your-domain.vercel.app`
2. Test the following:
   - [ ] Homepage loads correctly
   - [ ] Google OAuth login works
   - [ ] Can create a new world
   - [ ] Can create an entity with image upload
   - [ ] Can generate embeddings
   - [ ] Can create a generation
   - [ ] Can export world bible

## Environment Variables Checklist

Ensure all these variables are set in Vercel:

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

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure TypeScript has no errors: `pnpm build` locally

### Database Connection Issues

- Verify `DATABASE_URL` is the pooled connection
- Check Neon DB dashboard for connection limits
- Ensure IP allowlist includes Vercel IPs (or use "Allow all")

### OAuth Redirect Issues

- Verify redirect URIs in Google Cloud Console
- Ensure `BETTER_AUTH_URL` matches your domain exactly
- Check for trailing slashes in URLs

### Image Upload Fails

- Verify R2 credentials are correct
- Check R2 bucket permissions
- Ensure CORS is configured on R2 bucket

### Embedding Generation Fails

- Verify OpenAI API key has credits
- Check Replicate API token is valid
- Verify Pinecone index exists and is active

## Monitoring

After deployment, monitor:

1. **Vercel Dashboard**: Build status, function logs, analytics
2. **Neon DB Dashboard**: Connection count, query performance
3. **Pinecone Dashboard**: Index usage, query latency
4. **Cloudflare Dashboard**: R2 storage usage, bandwidth

## Rollback Procedure

If you need to rollback:

1. Go to Vercel dashboard
2. Navigate to your project
3. Click "Deployments"
4. Find the previous working deployment
5. Click "..." menu > "Promote to Production"

## Scaling Considerations

As your application grows:

1. **Database**: Upgrade Neon DB plan for more connections
2. **Vector DB**: Upgrade Pinecone plan for more vectors
3. **Storage**: Monitor R2 usage and costs
4. **Functions**: Monitor Vercel function execution time
5. **API Limits**: Monitor OpenAI and Replicate usage

## Security Checklist

- [ ] All environment variables are set as secrets
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] Security headers are configured (see vercel.json)
- [ ] OAuth redirect URIs are restricted to production domain
- [ ] Database credentials are rotated regularly
- [ ] API keys have appropriate permissions only
- [ ] Rate limiting is enabled (see middleware)

## Maintenance

Regular maintenance tasks:

1. **Weekly**: Review error logs and fix issues
2. **Monthly**: Update dependencies: `pnpm update`
3. **Quarterly**: Rotate API keys and secrets
4. **As needed**: Scale resources based on usage

## Support

For deployment issues:

- Vercel: https://vercel.com/support
- Neon DB: https://neon.tech/docs
- Pinecone: https://docs.pinecone.io
- Cloudflare: https://developers.cloudflare.com/r2
