# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for continueml.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and automatically runs on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

## Pipeline Stages

### 1. Lint Code

**Purpose**: Ensure code quality and consistency

**Steps**:
- Run ESLint to check for code issues
- Run Prettier to verify code formatting

**Commands**:
```bash
pnpm lint
pnpm format:check
```

**Failure Conditions**:
- ESLint errors or warnings
- Code not formatted according to Prettier rules

### 2. Type Check

**Purpose**: Verify TypeScript type safety

**Steps**:
- Run TypeScript compiler in check mode
- Verify no type errors exist

**Commands**:
```bash
pnpm exec tsc --noEmit
```

**Failure Conditions**:
- TypeScript compilation errors
- Type mismatches or missing types

### 3. Build Application

**Purpose**: Verify the application builds successfully

**Steps**:
- Install dependencies
- Create dummy environment variables for build
- Run Next.js production build
- Upload build artifacts

**Commands**:
```bash
pnpm install --frozen-lockfile
pnpm build
```

**Failure Conditions**:
- Build errors
- Missing dependencies
- Runtime errors during build

### 4. Deploy Preview (Pull Requests Only)

**Purpose**: Deploy preview environments for testing

**Trigger**: Pull requests to `main` or `develop`

**Steps**:
- Deploy to Vercel preview environment
- Comment on PR with preview URL

**Requirements**:
- `VERCEL_TOKEN` secret
- `VERCEL_ORG_ID` secret
- `VERCEL_PROJECT_ID` secret

### 5. Deploy Production (Main Branch Only)

**Purpose**: Deploy to production environment

**Trigger**: Push to `main` branch

**Steps**:
- Deploy to Vercel production environment
- Notify deployment success

**Requirements**:
- `VERCEL_TOKEN` secret
- `VERCEL_ORG_ID` secret
- `VERCEL_PROJECT_ID` secret

### 6. Dependency Review (Pull Requests Only)

**Purpose**: Review dependency changes for security issues

**Trigger**: Pull requests to `main` or `develop`

**Steps**:
- Analyze dependency changes
- Check for known vulnerabilities
- Verify license compatibility
- Comment summary on PR

**Failure Conditions**:
- Moderate or higher severity vulnerabilities
- Incompatible licenses (GPL-3.0, AGPL-3.0)

## Setting Up GitHub Secrets

To enable automatic deployments, add these secrets to your GitHub repository:

1. Go to repository Settings > Secrets and variables > Actions
2. Add the following secrets:

### Required Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel Dashboard > Settings > Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel` CLI and check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel` CLI and check `.vercel/project.json` |

### Getting Vercel Credentials

1. Install Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```

2. Login and link project:
   ```bash
   cd continueml
   vercel login
   vercel link
   ```

3. Get organization and project IDs:
   ```bash
   cat .vercel/project.json
   ```

4. Create a Vercel token:
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Name it "GitHub Actions"
   - Set scope to your organization
   - Copy the token

## Workflow Files

### `.github/workflows/ci.yml`

Main CI/CD pipeline with the following jobs:
- `lint`: Code quality checks
- `typecheck`: TypeScript validation
- `build`: Application build verification
- `deploy-preview`: Preview deployments for PRs
- `deploy-production`: Production deployments for main branch
- `notify-failure`: Failure notifications

### `.github/workflows/dependency-review.yml`

Dependency security and license review:
- Runs on pull requests
- Checks for vulnerabilities
- Verifies license compatibility
- Comments summary on PR

## Branch Strategy

### Main Branch (`main`)

- Production-ready code only
- Automatic deployment to production on push
- Requires passing CI checks
- Protected branch (recommended settings):
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date

### Develop Branch (`develop`)

- Integration branch for features
- Automatic CI checks on push
- No automatic deployment
- Merge to `main` via pull request

### Feature Branches

- Branch from `develop`
- Naming convention: `feature/feature-name`
- CI checks run on pull requests
- Preview deployments created automatically
- Merge to `develop` via pull request

### Hotfix Branches

- Branch from `main`
- Naming convention: `hotfix/issue-description`
- CI checks run on pull requests
- Can be merged directly to `main` after review

## Local Development Workflow

1. Create feature branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Make changes and test locally:
   ```bash
   pnpm dev
   pnpm lint
   pnpm format
   pnpm build
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

4. Create pull request:
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select `develop` as base branch
   - Select your feature branch
   - Fill in PR template
   - Submit for review

5. CI pipeline runs automatically:
   - Lint and type check
   - Build verification
   - Preview deployment created
   - Dependency review

6. After approval and merge:
   - Feature branch merged to `develop`
   - CI runs on `develop`
   - Delete feature branch

7. Release to production:
   - Create PR from `develop` to `main`
   - CI runs with full checks
   - After merge, automatic production deployment

## Monitoring CI/CD

### GitHub Actions Dashboard

View pipeline status:
1. Go to repository on GitHub
2. Click "Actions" tab
3. View workflow runs and logs

### Vercel Dashboard

View deployments:
1. Go to https://vercel.com
2. Select your project
3. View deployments and logs

## Troubleshooting

### Build Fails in CI but Works Locally

**Possible causes**:
- Environment variable differences
- Node version mismatch
- Dependency version differences

**Solutions**:
- Check Node version matches CI (20.x)
- Run `pnpm install --frozen-lockfile`
- Check for missing environment variables

### Deployment Fails

**Possible causes**:
- Missing Vercel secrets
- Invalid Vercel token
- Project not linked correctly

**Solutions**:
- Verify all secrets are set in GitHub
- Regenerate Vercel token if expired
- Re-link project with `vercel link`

### Type Check Fails

**Possible causes**:
- TypeScript errors in code
- Missing type definitions
- Outdated dependencies

**Solutions**:
- Run `pnpm exec tsc --noEmit` locally
- Fix type errors
- Update `@types/*` packages

### Lint Fails

**Possible causes**:
- Code style violations
- ESLint rule violations

**Solutions**:
- Run `pnpm lint` locally
- Run `pnpm format` to auto-fix
- Fix remaining issues manually

## Performance Optimization

### Caching

The pipeline uses caching to speed up builds:
- pnpm dependencies cached by Node.js action
- Build artifacts cached between jobs

### Parallel Execution

Jobs run in parallel when possible:
- Lint and type check run simultaneously
- Build waits for both to complete

### Conditional Execution

Jobs run conditionally to save resources:
- Preview deployment only on PRs
- Production deployment only on main branch
- Dependency review only on PRs

## Security Best Practices

1. **Secrets Management**:
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate tokens regularly

2. **Dependency Security**:
   - Dependency review runs on all PRs
   - Moderate+ vulnerabilities block merge
   - Regular dependency updates

3. **Branch Protection**:
   - Require CI checks to pass
   - Require code reviews
   - Prevent force pushes to main

4. **Access Control**:
   - Limit who can approve PRs
   - Limit who can push to main
   - Use least privilege for tokens

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Review failed builds
   - Check for dependency updates

2. **Monthly**:
   - Update GitHub Actions versions
   - Review and update CI configuration
   - Check Vercel usage and limits

3. **Quarterly**:
   - Rotate Vercel tokens
   - Review branch protection rules
   - Audit CI/CD performance

### Updating Dependencies

1. Update GitHub Actions:
   ```yaml
   # In workflow files, update version tags
   uses: actions/checkout@v4  # Update to latest
   ```

2. Update Node.js version:
   ```yaml
   # In workflow files
   env:
     NODE_VERSION: '20'  # Update as needed
   ```

3. Update pnpm version:
   ```yaml
   # In workflow files
   env:
     PNPM_VERSION: '9'  # Update as needed
   ```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [pnpm CI Documentation](https://pnpm.io/continuous-integration)
