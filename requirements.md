# REQUIREMENTS.md - continueml

## Project Overview

**continueml** is an AI memory system that enables creators to build consistent worlds across multiple AI-generated content pieces. It acts as a persistent memory layer that sits above generation tools, ensuring characters, locations, styles, and aesthetic choices remain consistent throughout a creative project.

**Tagline**: "Build worlds, not just one-offs."

---

## Core Problem Statement

AI generation tools (Runway, Midjourney, Stable Diffusion) are stateless and amnesiac. They cannot maintain consistency across multiple generations, making it impossible to create:

- Episodic content (series, games)
- Coherent fictional universes
- Brand-consistent content
- Long-form storytelling

**Solution**: continueml provides semantic memory using vector embeddings, enabling creators to generate content that automatically adheres to their established world rules.

---

## Target Users

### Primary

- AI filmmakers creating series/episodic content
- Game developers doing concept art
- Comic/manga creators needing character consistency
- Brand agencies maintaining character consistency

### Secondary

- Writers building fictional universes
- Educators creating consistent educational content
- Solo creators building personal projects

---

## Functional Requirements

### 1. World Management

#### 1.1 World Creation

- **FR-1.1.1**: User can create a new "World" (project container)
- **FR-1.1.2**: Each world has: name, description, tags, creation date
- **FR-1.1.3**: User can archive/delete worlds
- **FR-1.1.4**: User can switch between multiple worlds
- **FR-1.1.5**: World has privacy settings (private/team/public)

#### 1.2 World Dashboard

- **FR-1.2.1**: Display all entities in world (characters, locations, objects)
- **FR-1.2.2**: Show generation statistics (total, by type, by date)
- **FR-1.2.3**: Display relationship graph between entities
- **FR-1.2.4**: Quick search across all entities
- **FR-1.2.5**: Activity feed showing recent generations

### 2. Entity Management

#### 2.1 Entity Creation

- **FR-2.1.1**: User can create entities with types: Character, Location, Object, Style, Custom
- **FR-2.1.2**: Each entity requires: name, description (min 20 chars)
- **FR-2.1.3**: User can upload 1-10 reference images per entity
- **FR-2.1.4**: User can add tags for categorization
- **FR-2.1.5**: User can define relationships to other entities

#### 2.2 Entity Attributes

- **FR-2.2.1**: Visual attributes (stored as embeddings)
- **FR-2.2.2**: Semantic attributes (text description embeddings)
- **FR-2.2.3**: Metadata: creation date, last used, usage count
- **FR-2.2.4**: Custom fields (key-value pairs for user-defined attributes)
- **FR-2.2.5**: Version history of entity changes

#### 2.3 Entity Operations

- **FR-2.3.1**: Edit entity details (name, description, images)
- **FR-2.3.2**: Archive entity (hide but preserve)
- **FR-2.3.3**: Delete entity (with confirmation)
- **FR-2.3.4**: Duplicate entity (create variant)
- **FR-2.3.5**: Merge entities (combine memories)

### 3. Memory System

#### 3.1 Embedding Generation

- **FR-3.1.1**: Generate visual embeddings from images using CLIP
- **FR-3.1.2**: Generate semantic embeddings from text using OpenAI
- **FR-3.1.3**: Combine visual + semantic embeddings with weighting
- **FR-3.1.4**: Store embeddings in vector database (Pinecone/Weaviate)
- **FR-3.1.5**: Process embeddings asynchronously (queue system)

#### 3.2 Memory Retrieval

- **FR-3.2.1**: Query entities by natural language
- **FR-3.2.2**: Query entities by visual similarity
- **FR-3.2.3**: Query entities by relationship
- **FR-3.2.4**: Return ranked results by similarity score
- **FR-3.2.5**: Filter results by entity type, tags, date range

#### 3.3 Memory Learning

- **FR-3.3.1**: Update entity memory from successful generations
- **FR-3.3.2**: User can approve/reject memory updates
- **FR-3.3.3**: Track memory drift over time
- **FR-3.3.4**: Suggest memory consolidation when variants accumulate
- **FR-3.3.5**: Export memory snapshots for backup

### 4. Generation Assistant

#### 4.1 Prompt Enhancement

- **FR-4.1.1**: Detect entity references in user prompt (NLP)
- **FR-4.1.2**: Retrieve relevant entity memories automatically
- **FR-4.1.3**: Inject entity attributes into prompt
- **FR-4.1.4**: Maintain natural language flow in enhanced prompt
- **FR-4.1.5**: Show original vs enhanced prompt diff

#### 4.2 Generation Interface

- **FR-4.2.1**: Text input for generation prompt
- **FR-4.2.2**: Manual entity selection (override auto-detection)
- **FR-4.2.3**: Generation tool selection (Runway, Midjourney, etc.)
- **FR-4.2.4**: Generation parameters (aspect ratio, duration, style strength)
- **FR-4.2.5**: Real-time prompt preview with entity highlights

#### 4.3 Generation Execution

- **FR-4.3.1**: Queue generation requests
- **FR-4.3.2**: Display generation progress/status
- **FR-4.3.3**: Handle API errors gracefully
- **FR-4.3.4**: Retry failed generations
- **FR-4.3.5**: Notify user on completion

#### 4.4 Generation History

- **FR-4.4.1**: Store all generations with metadata
- **FR-4.4.2**: Link generations to source entities
- **FR-4.4.3**: Display generation timeline
- **FR-4.4.4**: Filter history by entity, date, tool
- **FR-4.4.5**: Regenerate from history item

### 5. Consistency Checker

#### 5.1 Consistency Analysis

- **FR-5.1.1**: Extract embeddings from generated content
- **FR-5.1.2**: Compare with entity reference embeddings
- **FR-5.1.3**: Calculate similarity score (0-100%)
- **FR-5.1.4**: Flag if drift exceeds threshold (default 25%)
- **FR-5.1.5**: Identify specific attributes that drifted

#### 5.2 Consistency Actions

- **FR-5.2.1**: Show consistency report with visual diff
- **FR-5.2.2**: Option to regenerate with stricter constraints
- **FR-5.2.3**: Option to update entity memory (learn variation)
- **FR-5.2.4**: Option to create new entity variant
- **FR-5.2.5**: Log consistency violations for analysis

### 6. Version Control & Branching

#### 6.1 Branch Management

- **FR-6.1.1**: Create branch from current world state
- **FR-6.1.2**: Name and describe branch purpose
- **FR-6.1.3**: Switch between branches
- **FR-6.1.4**: List all branches with metadata
- **FR-6.1.5**: Delete branches (with confirmation)

#### 6.2 Branch Isolation

- **FR-6.2.1**: Each branch has independent memory state
- **FR-6.2.2**: Generations in branch don't affect main
- **FR-6.2.3**: Entity changes are branch-specific
- **FR-6.2.4**: Branch creation copies current memories
- **FR-6.2.5**: Display branch indicator in UI

#### 6.3 Branch Operations

- **FR-6.3.1**: Compare branches (diff view)
- **FR-6.3.2**: Merge branch into main (manual conflict resolution)
- **FR-6.3.3**: Cherry-pick entities from branches
- **FR-6.3.4**: Tag branches (production, experimental, etc.)
- **FR-6.3.5**: Export branch as separate world

### 7. World Bible Export

#### 7.1 Export Content

- **FR-7.1.1**: Generate PDF with all entities
- **FR-7.1.2**: Include reference images (high quality)
- **FR-7.1.3**: Include entity descriptions and attributes
- **FR-7.1.4**: Include relationship diagram
- **FR-7.1.5**: Include generation statistics

#### 7.2 Export Options

- **FR-7.2.1**: Select entities to include
- **FR-7.2.2**: Choose format (PDF, Markdown, Notion)
- **FR-7.2.3**: Include/exclude generation history
- **FR-7.2.4**: Customize branding/theme
- **FR-7.2.5**: Share link or download file

### 8. User Management

#### 8.1 Authentication

- **FR-8.1.1**: Email/password signup
- **FR-8.1.2**: OAuth (Google, GitHub)
- **FR-8.1.3**: Email verification
- **FR-8.1.4**: Password reset flow
- **FR-8.1.5**: Session management

#### 8.2 User Profile

- **FR-8.2.1**: Edit profile (name, avatar, bio)
- **FR-8.2.2**: View usage statistics
- **FR-8.2.3**: Manage API keys
- **FR-8.2.4**: Delete account
- **FR-8.2.5**: Export all user data

#### 8.3 Subscription Management

- **FR-8.3.1**: Display current plan and limits
- **FR-8.3.2**: Upgrade/downgrade plan
- **FR-8.3.3**: View billing history
- **FR-8.3.4**: Cancel subscription
- **FR-8.3.5**: Apply promo codes

---

## Non-Functional Requirements

### 1. Performance

#### 1.1 Response Times

- **NFR-1.1.1**: Page load < 2 seconds
- **NFR-1.1.2**: Entity search results < 500ms
- **NFR-1.1.3**: Embedding generation < 5 seconds per image
- **NFR-1.1.4**: Dashboard render < 1 second
- **NFR-1.1.5**: API response time < 200ms (excluding AI generation)

#### 1.2 Scalability

- **NFR-1.2.1**: Support 10,000 concurrent users
- **NFR-1.2.2**: Handle 100K entities per world
- **NFR-1.2.3**: Process 1M generations per day
- **NFR-1.2.4**: Vector DB queries scale to 1M+ embeddings
- **NFR-1.2.5**: Storage supports 1TB+ of images

### 2. Security

#### 2.1 Data Protection

- **NFR-2.1.1**: HTTPS only (TLS 1.3)
- **NFR-2.1.2**: Encrypted data at rest (AES-256)
- **NFR-2.1.3**: JWT tokens with expiration
- **NFR-2.1.4**: API rate limiting (100 req/min per user)
- **NFR-2.1.5**: GDPR compliance (data export, deletion)

#### 2.2 Access Control

- **NFR-2.2.1**: Role-based access (owner, editor, viewer)
- **NFR-2.2.2**: World-level permissions
- **NFR-2.2.3**: API key scoping
- **NFR-2.2.4**: Audit logging for sensitive operations
- **NFR-2.2.5**: IP allowlisting for enterprise

### 3. Reliability

#### 3.1 Availability

- **NFR-3.1.1**: 99.9% uptime SLA
- **NFR-3.1.2**: Graceful degradation during outages
- **NFR-3.1.3**: Automated failover
- **NFR-3.1.4**: Database backups every 6 hours
- **NFR-3.1.5**: Point-in-time recovery (7 days)

#### 3.2 Error Handling

- **NFR-3.2.1**: User-friendly error messages
- **NFR-3.2.2**: Automatic retry for transient failures
- **NFR-3.2.3**: Error logging with stack traces
- **NFR-3.2.4**: Alert on-call for critical errors
- **NFR-3.2.5**: Circuit breaker for external APIs

### 4. Usability

#### 4.1 User Experience

- **NFR-4.1.1**: Mobile-responsive (down to 375px width)
- **NFR-4.1.2**: Keyboard navigation support
- **NFR-4.1.3**: Dark/light theme toggle
- **NFR-4.1.4**: Undo/redo for critical actions
- **NFR-4.1.5**: Loading states for async operations

#### 4.2 Accessibility

- **NFR-4.2.1**: WCAG 2.1 Level AA compliance
- **NFR-4.2.2**: Screen reader support
- **NFR-4.2.3**: High contrast mode
- **NFR-4.2.4**: Focus indicators
- **NFR-4.2.5**: Alt text for all images

### 5. Maintainability

#### 5.1 Code Quality

- **NFR-5.1.1**: TypeScript for type safety
- **NFR-5.1.2**: 80%+ test coverage
- **NFR-5.1.3**: ESLint + Prettier enforcement
- **NFR-5.1.4**: Automated CI/CD pipeline
- **NFR-5.1.5**: API documentation (OpenAPI/Swagger)

#### 5.2 Monitoring

- **NFR-5.2.1**: Application performance monitoring (APM)
- **NFR-5.2.2**: Error tracking (Sentry)
- **NFR-5.2.3**: Analytics (PostHog/Mixpanel)
- **NFR-5.2.4**: Infrastructure monitoring (uptime, CPU, memory)
- **NFR-5.2.5**: Cost tracking per feature

---

## Technical Requirements

### 1. Technology Stack

#### 1.1 Frontend

- **TR-1.1.1**: Next.js 14+ (App Router)
- **TR-1.1.2**: TypeScript 5+
- **TR-1.1.3**: Tailwind CSS 3+
- **TR-1.1.4**: shadcn/ui components
- **TR-1.1.5**: Zustand for state management

#### 1.2 Backend

- **TR-1.2.1**: Node.js 20+ with Express or tRPC
- **TR-1.2.2**: TypeScript 5+
- **TR-1.2.3**: PostgreSQL 15+ (via Supabase)
- **TR-1.2.4**: Redis for caching and queues
- **TR-1.2.5**: BullMQ for job processing

#### 1.3 AI/ML

- **TR-1.3.1**: OpenAI API (embeddings, GPT-4)
- **TR-1.3.2**: CLIP for image embeddings
- **TR-1.3.3**: Pinecone or Weaviate (vector database)
- **TR-1.3.4**: Runway API (video generation)
- **TR-1.3.5**: ElevenLabs API (voice generation)

#### 1.4 Infrastructure

- **TR-1.4.1**: Vercel (frontend hosting)
- **TR-1.4.2**: Railway/Render (backend hosting)
- **TR-1.4.3**: Cloudflare R2 or AWS S3 (object storage)
- **TR-1.4.4**: Cloudflare CDN
- **TR-1.4.5**: GitHub Actions (CI/CD)

### 2. Data Models

#### 2.1 Core Entities

```typescript
World {
  id: UUID
  userId: UUID
  name: string
  description: string
  createdAt: timestamp
  updatedAt: timestamp
}

Entity {
  id: UUID
  worldId: UUID
  branchId: UUID
  type: enum (character, location, object, style, custom)
  name: string
  description: string
  tags: string[]
  metadata: JSONB
  createdAt: timestamp
  updatedAt: timestamp
}

EntityImage {
  id: UUID
  entityId: UUID
  url: string
  embeddings: float[] (stored in vector DB)
  uploadedAt: timestamp
}

Generation {
  id: UUID
  worldId: UUID
  branchId: UUID
  userId: UUID
  prompt: string
  enhancedPrompt: string
  entityIds: UUID[]
  tool: enum
  status: enum (queued, processing, completed, failed)
  resultUrl: string
  consistency_score: float
  createdAt: timestamp
}

Branch {
  id: UUID
  worldId: UUID
  name: string
  description: string
  parentBranchId: UUID
  createdAt: timestamp
}
```

### 3. API Requirements

#### 3.1 RESTful Endpoints

```
POST   /api/worlds
GET    /api/worlds
GET    /api/worlds/:id
PUT    /api/worlds/:id
DELETE /api/worlds/:id

POST   /api/worlds/:worldId/entities
GET    /api/worlds/:worldId/entities
GET    /api/entities/:id
PUT    /api/entities/:id
DELETE /api/entities/:id

POST   /api/entities/:id/images
DELETE /api/entity-images/:id

POST   /api/generate
GET    /api/generations
GET    /api/generations/:id

POST   /api/worlds/:worldId/branches
GET    /api/worlds/:worldId/branches
PUT    /api/branches/:id
DELETE /api/branches/:id

POST   /api/worlds/:worldId/export
GET    /api/consistency/:generationId
```

#### 3.2 WebSocket Events

```
generation:started
generation:progress
generation:completed
generation:failed
```

### 4. Integration Requirements

#### 4.1 External APIs

- **TR-4.1.1**: Runway API for video generation
- **TR-4.1.2**: OpenAI API for embeddings and chat
- **TR-4.1.3**: Stripe for payment processing
- **TR-4.1.4**: Resend/SendGrid for email
- **TR-4.1.5**: Webhooks for async job updates

#### 4.2 Rate Limits

- **TR-4.2.1**: Handle Runway rate limits (per-account)
- **TR-4.2.2**: Handle OpenAI token limits
- **TR-4.2.3**: Implement exponential backoff
- **TR-4.2.4**: Queue system for fair distribution
- **TR-4.2.5**: User-facing rate limit feedback

---

## Phase 1: MVP (Hackathon - 10 Days)

### Must Have

- âœ… World creation and management
- âœ… Entity creation with images + descriptions
- âœ… Embedding generation and storage
- âœ… Basic generation with prompt enhancement
- âœ… Consistency checker (basic)
- âœ… Simple branching
- âœ… World Bible PDF export
- âœ… User authentication
- âœ… Dashboard UI

### Nice to Have

- â­• Relationship visualization
- â­• Advanced search filters
- â­• Generation history filtering
- â­• Mobile optimization
- â­• Onboarding flow

### Out of Scope (Phase 2)

- âŒ Physics-aware validation
- âŒ Team collaboration
- âŒ API for third-party integrations
- âŒ Fine-tuning custom models
- âŒ Advanced analytics dashboard

---

## Phase 2: Post-Hackathon (Weeks 2-8)

### Week 2-3: Physics Engine

- Physics violation detection
- Object tracking across frames
- Depth estimation integration
- Automatic correction suggestions

### Week 4-5: Collaboration

- Team workspaces
- Real-time cursors
- Comments and annotations
- Permission management

### Week 6-7: Advanced Features

- API for third-party integrations
- Webhook system
- Custom model fine-tuning
- Advanced analytics

### Week 8: Polish & Launch

- Performance optimization
- Bug fixes
- Marketing site
- Launch on Product Hunt

---

## Success Metrics

### Hackathon Success

- âœ… Working MVP deployed
- âœ… Demo video showcasing core features
- âœ… At least 10 beta testers during hackathon
- âœ… Positive judge feedback
- âœ… Top 3 finish in Tech Track

### Post-Hackathon (3 Months)

- 1,000 signups
- 100 paid users
- 10,000 generations processed
- $5K MRR
- Feature in AI creator communities

### Long-term (12 Months)

- 10,000 users
- 1,000 paid subscribers
- $30K MRR
- Seed funding raised
- Industry recognition

---

## Risk Assessment

### Technical Risks

| Risk                           | Impact | Probability | Mitigation                                       |
| ------------------------------ | ------ | ----------- | ------------------------------------------------ |
| Vector DB performance issues   | High   | Medium      | Use managed service (Pinecone), optimize queries |
| AI API rate limits             | High   | High        | Implement queue system, batch requests           |
| Embedding quality inconsistent | Medium | Medium      | Test multiple models, allow user tuning          |
| Generation costs too high      | High   | Medium      | Optimize prompt efficiency, cache results        |

### Business Risks

| Risk                       | Impact | Probability | Mitigation                                  |
| -------------------------- | ------ | ----------- | ------------------------------------------- |
| User adoption slow         | High   | Medium      | Strong demo, community building             |
| Competitors emerge         | Medium | High        | Move fast, build community moat             |
| AI tools become consistent | High   | Low         | Pivot to workflow optimization              |
| Costs exceed revenue       | High   | Medium      | Aggressive pricing, optimize infrastructure |

---

## Appendix

### A. Glossary

- **World**: A project container for a creative universe
- **Entity**: A persistent element (character, location, etc.)
- **Memory**: The stored embeddings and attributes of an entity
- **Branch**: An alternate version of a world's state
- **Consistency**: Similarity between generated content and entity memory
- **World Bible**: Exported documentation of all world entities

### B. References

- CLIP: https://github.com/openai/CLIP
- Pinecone: https://docs.pinecone.io
- Runway API: https://docs.runwayml.com
- Vector embeddings: https://platform.openai.com/docs/guides/embeddings
