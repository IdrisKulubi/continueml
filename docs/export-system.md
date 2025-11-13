# World Bible Export System

## Overview

The World Bible Export system allows users to generate comprehensive PDF documents containing all entities, images, and descriptions from their worlds. This feature is useful for sharing world documentation with collaborators, creating reference materials, or archiving project information.

## Features

- **PDF Generation**: Creates professional PDF documents with formatted entity information
- **Image Embedding**: Includes entity reference images in the export
- **Statistics**: Displays world statistics and entity breakdown by type
- **Automatic Formatting**: Applies consistent styling and branding
- **Secure Downloads**: Generates signed URLs with 24-hour expiration
- **Rate Limiting**: Prevents abuse with 5 exports per 15-minute window per user

## Architecture

### Components

1. **PDFService** (`src/lib/export/pdf-service.ts`)
   - Handles PDF generation using jsPDF and jspdf-autotable
   - Creates formatted pages with title, table of contents, statistics, and entity details
   - Fetches and embeds images from URLs
   - Applies consistent styling and branding

2. **ExportService** (`src/lib/export/export-service.ts`)
   - Orchestrates the export process
   - Fetches entities and images from database
   - Calculates statistics
   - Uploads generated PDF to storage
   - Generates signed download URLs

3. **Server Actions** (`src/app/actions/export.ts`)
   - `exportWorldBibleAction`: Triggers export generation
   - `getExportSizeEstimateAction`: Estimates file size before export

4. **API Route** (`src/app/api/worlds/[worldId]/export/route.ts`)
   - POST endpoint for generating exports
   - GET endpoint for size estimates
   - Implements rate limiting

5. **UI Component** (`src/components/worlds/export-world-dialog.tsx`)
   - Dialog interface for initiating exports
   - Shows estimated file size
   - Displays export progress
   - Opens download link in new tab

## Usage

### From the UI

1. Navigate to a world dashboard
2. Click the "Export World Bible" button in the header
3. Review the estimated file size
4. Click "Export PDF" to generate the document
5. The download will open in a new tab automatically

### Programmatically

```typescript
import { exportService } from "@/lib/export";

// Export entire world
const result = await exportService.exportWorldBible(
  worldId,
  userId
);

// Export specific entities
const result = await exportService.exportWorldBible(
  worldId,
  userId,
  ["entity-id-1", "entity-id-2"]
);

// Get size estimate
const sizeMB = await exportService.estimateExportSize(
  worldId,
  ["entity-id-1", "entity-id-2"]
);
```

### Via API

```bash
# Generate export
curl -X POST https://your-domain.com/api/worlds/{worldId}/export \
  -H "Content-Type: application/json" \
  -d '{"format": "pdf"}'

# Get size estimate
curl https://your-domain.com/api/worlds/{worldId}/export
```

## PDF Structure

The generated PDF includes:

1. **Title Page**
   - World name and description
   - Tags
   - Generation date
   - continueml branding

2. **Table of Contents**
   - Statistics section
   - Entity sections grouped by type

3. **Statistics Page**
   - Total entity count
   - Entity breakdown by type (table)

4. **Entity Pages** (one per entity)
   - Entity type badge (color-coded)
   - Entity name
   - Tags
   - Primary reference image
   - Full description
   - Metadata (created date, usage count, image count)

5. **Footer** (all pages)
   - Page numbers
   - World name
   - continueml branding

## Configuration

### Environment Variables

The export system uses the existing storage configuration:

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-cdn-url.com
```

### Rate Limiting

Default rate limits (configurable in `route.ts`):
- 5 exports per 15-minute window per user
- Returns 429 status code when exceeded

### Download Expiration

- Signed URLs expire after 24 hours
- Users must regenerate exports after expiration

## File Storage

Exports are stored in R2 with the following structure:

```
exports/
  {worldId}/
    {timestamp}-{random}.pdf
```

Example: `exports/abc-123/1234567890-xyz789.pdf`

## Error Handling

The system handles various error scenarios:

- **Unauthorized**: Returns 401 if user is not authenticated
- **Not Found**: Returns 404 if world doesn't exist or user doesn't have access
- **No Entities**: Throws error if world has no entities to export
- **Rate Limited**: Returns 429 if user exceeds rate limit
- **Image Fetch Errors**: Continues export without failed images
- **Storage Errors**: Returns 500 with error message

## Performance Considerations

- **Image Fetching**: Images are fetched asynchronously during PDF generation
- **PDF Size**: Estimated at ~0.5 MB base + 50% of original image sizes
- **Generation Time**: Typically 5-15 seconds depending on entity count and images
- **Memory Usage**: PDF is generated in memory before upload

## Future Enhancements

Potential improvements for future versions:

1. **Markdown Export**: Alternative format for text-based documentation
2. **Selective Export**: UI for selecting specific entities to include
3. **Custom Branding**: Allow users to customize PDF styling
4. **Batch Exports**: Export multiple worlds at once
5. **Scheduled Exports**: Automatic periodic exports
6. **Export History**: Track and manage previous exports
7. **Compression Options**: Different quality/size trade-offs
8. **Collaborative Exports**: Include generation history and team notes

## Testing

To test the export system:

1. Create a world with several entities
2. Add reference images to entities
3. Navigate to the world dashboard
4. Click "Export World Bible"
5. Verify the PDF contains all expected content
6. Check that images are properly embedded
7. Verify download link expires after 24 hours

## Troubleshooting

### Export fails with "No entities found"
- Ensure the world has at least one non-archived entity
- Check that entities are properly saved in the database

### Images not appearing in PDF
- Verify image URLs are accessible
- Check R2 storage configuration
- Ensure images are not blocked by CORS

### Rate limit errors
- Wait 15 minutes before trying again
- Contact support if legitimate use case requires higher limits

### Download link expired
- Generate a new export
- Links are valid for 24 hours only

## Dependencies

- `jspdf`: PDF generation library
- `jspdf-autotable`: Table formatting for jsPDF
- `@aws-sdk/client-s3`: Storage client for R2
- `@aws-sdk/s3-request-presigner`: Signed URL generation

## Security

- All exports require authentication
- Users can only export their own worlds
- Download URLs are signed and time-limited
- Rate limiting prevents abuse
- No sensitive data is included in exports
