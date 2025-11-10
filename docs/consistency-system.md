# Consistency Analysis System

## Overview

The consistency analysis system automatically evaluates generated content against entity references to ensure visual and semantic consistency. This helps creators maintain coherent worlds across multiple AI-generated pieces.

## Architecture

### Core Components

1. **ConsistencyService** (`src/lib/consistency/consistency-service.ts`)
   - Extracts embeddings from generated content
   - Compares with source entity embeddings
   - Calculates cosine similarity scores (0-100%)
   - Identifies drifted attributes
   - Generates recommendations

2. **Consistency Actions** (`src/app/actions/consistency.ts`)
   - `checkConsistencyAction` - Manually trigger consistency check
   - `getConsistencyAction` - Retrieve consistency score for a generation

3. **Generation Integration** (`src/app/actions/generations.ts`)
   - Automatic consistency checking when generation completes
   - `triggerConsistencyCheckAction` - Manual re-check
   - Notification system for low consistency

4. **Notification Utilities** (`src/lib/utils/notifications.ts`)
   - Severity determination (success/warning/error)
   - User-friendly messages
   - Notification triggers

## How It Works

### Automatic Flow

1. User creates a generation with entity references
2. Generation is processed by external tool (Runway, Midjourney, etc.)
3. User updates generation status to "completed" with result URL
4. System automatically:
   - Extracts visual embedding from generated content
   - Retrieves entity embeddings from Pinecone
   - Calculates cosine similarity scores
   - Converts to percentage (0-100%)
   - Updates generation record with consistency score
   - Flags low consistency (<75%) for user notification

### Manual Flow

Users can manually trigger consistency checks:
- For generations that weren't automatically checked
- To re-check after updating entity references
- To get detailed analysis with drifted attributes

## Consistency Scoring

### Score Ranges

- **90-100%**: Excellent consistency (Green)
  - Recommendation: Accept
  - Message: "Excellent consistency! The generated content closely matches your entity references."

- **75-89%**: Good consistency (Amber)
  - Recommendation: Review
  - Message: "Good consistency with minor variations. Review the content to ensure it meets your expectations."

- **0-74%**: Low consistency (Red)
  - Recommendation: Regenerate
  - Message: "Low consistency detected. Consider regenerating with more specific prompts or adjusting entity references."

### Calculation Method

1. Extract visual embedding from generated content using CLIP
2. Retrieve combined embeddings for each referenced entity
3. Calculate cosine similarity between content and each entity
4. Convert similarity (-1 to 1) to percentage: `(similarity + 1) / 2 * 100`
5. Average scores across all entities for overall score

## API Usage

### Check Consistency

```typescript
import { checkConsistencyAction } from "@/app/actions/consistency";

const result = await checkConsistencyAction({
  generationId: "uuid",
  contentUrl: "https://...",
  contentType: "image", // or "video"
});

if (result.success) {
  console.log("Overall Score:", result.data.overallScore);
  console.log("Recommendation:", result.data.recommendation);
  console.log("Drifted Attributes:", result.data.driftedAttributes);
}
```

### Get Consistency Score

```typescript
import { getConsistencyAction } from "@/app/actions/consistency";

const result = await getConsistencyAction({
  generationId: "uuid",
});

if (result.success) {
  console.log("Score:", result.data.consistencyScore);
}
```

### Manual Trigger

```typescript
import { triggerConsistencyCheckAction } from "@/app/actions/generations";

const result = await triggerConsistencyCheckAction("generationId");

if (result.success) {
  console.log("Score:", result.data.overallScore);
  console.log("Recommendation:", result.data.recommendation);
}
```

## Database Schema

The `generations` table includes:
- `consistencyScore` (integer, nullable): Score from 0-100
- Updated automatically when consistency check completes

## Future Enhancements

1. **Separate Visual/Semantic Scores**: Track visual and semantic consistency independently
2. **Multi-frame Video Analysis**: Extract and analyze multiple frames from videos
3. **Attribute-level Scoring**: Score individual attributes (color, style, composition)
4. **Historical Trends**: Track consistency over time for entities
5. **Batch Analysis**: Analyze multiple generations simultaneously
6. **Custom Thresholds**: Allow users to set their own consistency thresholds
7. **Detailed Reports**: Generate PDF reports with side-by-side comparisons

## Requirements Satisfied

- **FR-9.1**: Extract embeddings from generated content ✓
- **FR-9.2**: Compare with source entity embeddings ✓
- **FR-9.3**: Calculate consistency score (0-100%) ✓
- **FR-9.4**: Flag low consistency generations (<75%) ✓
- **FR-9.5**: Provide recommendations (accept/review/regenerate) ✓

## Testing

To test the consistency system:

1. Create entities with reference images
2. Generate embeddings for entities
3. Create a generation with entity references
4. Update generation status to "completed" with result URL
5. System automatically checks consistency
6. View consistency score in generation record

## Error Handling

- Graceful degradation if embeddings not found
- Non-blocking: consistency check failures don't prevent status updates
- Detailed error logging for debugging
- User-friendly error messages

## Performance

- Embedding extraction: ~2-5 seconds per image
- Similarity calculation: <100ms for up to 10 entities
- Total consistency check: ~5-10 seconds
- Runs asynchronously to avoid blocking user actions
