# Document Upload API Integration Guide

## Overview
This document describes the document upload system integrated into the user dashboard profile section. Users can upload various identity and verification documents that can be verified by admins.

## Implemented Components

### 1. API Endpoints

#### `POST /api/documents`
Upload a new document.

**Request Body:**
```json
{
  "documentType": "PAN_CARD",
  "fileName": "pan_card.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "documentUrl": "https://res.cloudinary.com/...",
  "expiresAt": "2027-02-23"  // optional
}
```

**Note:** The `documentUrl` should be obtained from the Cloudinary upload endpoint (`/api/upload`) first, then passed to this endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid-string",
    "documentType": "PAN_CARD",
    "documentUrl": "https://res.cloudinary.com/...",
    "fileName": "pan_card.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "status": "PENDING",
    "verifiedNotes": null,
    "verifiedAt": null,
    "expiresAt": "2027-02-23",
    "createdAt": "2026-02-23T12:00:00Z",
    "updatedAt": "2026-02-23T12:00:00Z"
  },
  "message": "Document uploaded successfully",
  "statusCode": 201
}
```

#### `GET /api/documents`
Get all documents for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid-string",
      "documentType": "PAN_CARD",
      "documentUrl": "https://res.cloudinary.com/...",
      "fileName": "pan_card.jpg",
      "fileSize": 2048576,
      "mimeType": "image/jpeg",
      "status": "VERIFIED",
      "verifiedNotes": null,
      "verifiedAt": "2026-02-23T12:00:00Z",
      "expiresAt": "2027-02-23",
      "createdAt": "2026-02-23T12:00:00Z",
      "updatedAt": "2026-02-23T12:00:00Z"
    }
  ],
  "message": "Documents retrieved successfully",
  "statusCode": 200
}
```

#### `GET /api/documents/:id`
Get a specific document.

**Response:** Same as single document object from POST

#### `DELETE /api/documents/:id`
Delete a document.

**Response:**
```json
{
  "success": true,
  "data": { "id": "cuid-string" },
  "message": "Document deleted successfully",
  "statusCode": 200
}
```

#### `PATCH /api/documents/:id`
Update a document (currently supports expiration date update).

**Request Body:**
```json
{
  "expiresAt": "2027-02-23"
}
```

**Response:** Same as single document object from POST

### 2. Frontend Components

#### DocumentUploadModal
**Location:** `src/components/dashboard/UserDashboard/DocumentUploadModal.tsx`

Modal component for uploading documents. Features:
- Document type selection dropdown (filtered by user role)
- File upload with drag-and-drop support
- File validation (type and size)
- Base64 encoding of files before upload
- Error handling and feedback
- Loading states

**Props:**
```typescript
interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: "USER" | "OWNER";
}
```

**Usage:**
```tsx
const [showUpload, setShowUpload] = useState(false);

<DocumentUploadModal
  isOpen={showUpload}
  onClose={() => setShowUpload(false)}
  onSuccess={() => {
    // Refresh document list
  }}
  userRole="USER"
/>
```

#### DocumentList
**Location:** `src/components/dashboard/UserDashboard/DocumentList.tsx`

Component for displaying user documents. Features:
- Fetch documents from API
- Display document status with color-coded badges
- Document preview (opens in new window)
- Download functionality
- Delete functionality with confirmation
- File size formatting
- Empty state handling

**Props:**
```typescript
interface DocumentListProps {
  onDocumentDeleted?: () => void;
}
```

**Usage:**
```tsx
<DocumentList onDocumentDeleted={() => refetchDocuments()} />
```

### 3. Types

**Location:** `src/types/document.ts`

```typescript
export type DocumentType = 
  | "PAN_CARD"
  | "AADHAR_CARD"
  | "DRIVING_LICENSE"
  | "PASSPORT"
  | "VOTER_ID"
  | "PROPERTY_LICENSE"
  | "BUSINESS_LICENSE"
  | "GST_CERTIFICATE"
  | "TAX_IDENTIFICATION"
  | "RENTAL_AGREEMENT_TEMPLATE";

export type DocumentStatus = 
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export interface Document {
  id: string;
  documentType: DocumentType;
  documentUrl: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  status: DocumentStatus;
  verifiedNotes?: string | null;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 4. Integration in Profile Page

**Location:** `src/app/user/dashboard/profile/page.tsx`

Features:
- Added "Documents" tab in the profile settings
- Upload button opens DocumentUploadModal
- DocumentList displays user's documents
- Automatic refresh of document list after upload
- State management for modal visibility and list refresh key

**Key State Variables:**
```typescript
const [showDocumentUpload, setShowDocumentUpload] = useState(false);
const [documentListKey, setDocumentListKey] = useState(0);
```

## Document Type Configuration

### User Role Documents
**Required:**
- PAN_CARD
- AADHAR_CARD

**Optional:**
- DRIVING_LICENSE
- PASSPORT
- VOTER_ID

### Owner Role Documents
**Required:**
- PROPERTY_LICENSE
- TAX_IDENTIFICATION

**Optional:**
- BUSINESS_LICENSE
- GST_CERTIFICATE
- RENTAL_AGREEMENT_TEMPLATE

## File Handling

### Upload Process
1. User selects file in DocumentUploadModal
2. File validation (type and size)
3. File converted to base64
4. API request sent with base64 data
5. Cloudinary uploads the file
6. Document record created in database
7. DocumentList refreshed with new document

### File Constraints
- **Max Size:** 10MB
- **Allowed Types:** JPG, PNG, WebP, PDF
- **Storage:** Cloudinary (folder: `mykeys/user-documents`)

## Security Features

### API Routes
- Authentication required via `requireAuth` middleware
- User can only access/delete their own documents
- Ownership verification before operations

### File Upload
- Base64 encoding for secure transmission
- Cloudinary handles storage security
- MIME type validation
- File size limits enforced

## Status Workflow

### Document Statuses
- **PENDING:** Awaiting admin verification
- **VERIFIED:** Approved by admin
- **REJECTED:** Rejected by admin with optional notes
- **EXPIRED:** Document expiration date has passed

### User Actions by Status
- **PENDING:** Can view, download, or delete
- **VERIFIED:** Can view, download, or delete
- **REJECTED:** Can delete and re-upload new document
- **EXPIRED:** Can update expiration or re-upload

## Error Handling

### API Errors
- 400: Validation errors (missing fields, invalid types)
- 403: Unauthorized access (not document owner)
- 404: Document not found
- 500: Server errors

### Frontend Error Handling
- User-friendly error messages
- Validation before upload
- Graceful degradation
- Error states in components

## Integration with Other Services

### Cloudinary Integration
- Uses existing `uploadToCloudinary` utility
- Stores files in `mykeys/user-documents` folder
- Returns secure URL for document access

### Database (Prisma)
- Document model with proper relations
- Cascade delete when user is removed
- Indexes on userId, documentType, status for performance

### Authentication
- Uses existing JWT auth middleware
- User ID extracted from JWT token
- All requests require valid authentication

## Future Enhancements

### Admin Dashboard
1. Create admin verification endpoints
2. List pending documents for verification
3. Verify/reject documents with notes
4. Bulk verification operations

### Advanced Features
1. Document expiration reminders
2. Automatic expiration handling
3. Document versioning
4. Audit logging for verification actions
5. Email notifications on verification status
6. Document template downloads
7. OCR for automatic data extraction

### Validation Enhancements
1. Role-based required documents
2. Profile completion percentage
3. Document completeness tracking
4. Automatic status updates on expiration

## Testing Checklist

- [ ] Upload document successfully
- [ ] View uploaded documents in list
- [ ] Download document
- [ ] Preview document
- [ ] Delete document
- [ ] File validation (type and size)
- [ ] Error handling on failed upload
- [ ] Ownership verification (can't access others' docs)
- [ ] Modal opening/closing
- [ ] List refresh after upload
- [ ] API response structure validation
- [ ] Status badge display
- [ ] Empty state handling

## Troubleshooting

### Document Upload Fails
1. Check file size (must be < 10MB)
2. Verify file type (JPG, PNG, WebP, PDF)
3. Check internet connection
4. Verify Cloudinary is accessible
5. Check authentication token validity

### Document List Not Loading
1. Verify user is authenticated
2. Check API response in network tab
3. Ensure database connection is active
4. Check browser console for errors

### Unable to Access Own Documents
1. Verify user authentication
2. Check browser developer tools for errors
3. Verify document userId matches authenticated user

## Database Schema

### Document Table
```sql
CREATE TABLE "Document" (
    id TEXT PRIMARY KEY,
    documentType TEXT NOT NULL,
    documentUrl TEXT NOT NULL,
    fileName TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    mimeType TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    verifiedNotes TEXT,
    verifiedBy TEXT,
    verifiedAt TIMESTAMP,
    expiresAt TIMESTAMP,
    userId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL
);

CREATE INDEX "Document_userId_idx" ON "Document"(userId);
CREATE INDEX "Document_documentType_idx" ON "Document"(documentType);
CREATE INDEX "Document_status_idx" ON "Document"(status);
CREATE INDEX "Document_createdAt_idx" ON "Document"(createdAt);
```

## Related Migrations

- `20260223120000_add_user_documents`: Initial migration creating Document table and enums
