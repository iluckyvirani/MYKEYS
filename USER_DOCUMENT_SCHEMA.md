# User Document Upload Schema

## Overview
This implementation adds a document upload and verification system to the MYKEYS application. Users and owners can upload documents for verification by admins, with different document types required based on user role.

## Schema Changes

### New Enums

#### DocumentType
Defines the types of documents that can be uploaded based on user role:

**User Role Documents:**
- `PAN_CARD` - Pan card image
- `AADHAR_CARD` - Aadhar card image
- `DRIVING_LICENSE` - Driving license
- `PASSPORT` - Passport
- `VOTER_ID` - Voter ID

**Owner Role Documents:**
- `PROPERTY_LICENSE` - License/permission to rent property
- `BUSINESS_LICENSE` - Business license
- `GST_CERTIFICATE` - GST Certificate
- `TAX_IDENTIFICATION` - Tax ID
- `RENTAL_AGREEMENT_TEMPLATE` - Rental agreement template

#### DocumentStatus
Tracks the verification status of documents:
- `PENDING` - Awaiting admin verification
- `VERIFIED` - Approved by admin
- `REJECTED` - Rejected by admin
- `EXPIRED` - Document has expired

### New Document Model

```prisma
model Document {
  id            String           @id @default(cuid())
  documentType  DocumentType
  documentUrl   String           // URL to the uploaded document
  fileName      String
  fileSize      Int              // File size in bytes
  mimeType      String?          // e.g., application/pdf, image/jpeg
  status        DocumentStatus   @default(PENDING)
  
  // Admin Verification
  verifiedNotes String?          // Admin notes/reason for rejection
  verifiedBy    String?          // Admin user ID who verified
  verifiedAt    DateTime?        // When document was verified
  expiresAt     DateTime?        // Document expiration date
  
  // Relations
  userId        String
  user          User             @relation("UserDocuments", fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  
  // Indexes
  @@index([userId])
  @@index([documentType])
  @@index([status])
  @@index([createdAt])
}
```

### Updated User Model
Added new relation to Document model:
```prisma
documents       Document[]     @relation("UserDocuments")
```

## Database Migration
A migration has been created at: `prisma/migrations/20260223120000_add_user_documents/migration.sql`

Creates:
- `DocumentType` enum (PG type)
- `DocumentStatus` enum (PG type)
- `Document` table with proper indexes and foreign keys
- Foreign key constraint with CASCADE delete

## Usage Examples

### Uploading a Document (User)
```typescript
// Create a document for a user
const document = await prisma.document.create({
  data: {
    documentType: 'PAN_CARD',
    documentUrl: 'https://cloud.example.com/pancard-123.jpg',
    fileName: 'pancard.jpg',
    fileSize: 2048576, // 2MB
    mimeType: 'image/jpeg',
    userId: 'user-id-here',
  },
});
```

### Uploading a Document (Owner)
```typescript
// Create a document for an owner
const document = await prisma.document.create({
  data: {
    documentType: 'PROPERTY_LICENSE',
    documentUrl: 'https://cloud.example.com/license-456.pdf',
    fileName: 'property_license.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    userId: 'owner-id-here',
  },
});
```

### Verifying a Document (Admin)
```typescript
// Verify a document
const verified = await prisma.document.update({
  where: { id: 'document-id' },
  data: {
    status: 'VERIFIED',
    verifiedBy: 'admin-id',
    verifiedAt: new Date(),
  },
});

// Reject a document with notes
const rejected = await prisma.document.update({
  where: { id: 'document-id' },
  data: {
    status: 'REJECTED',
    verifiedBy: 'admin-id',
    verifiedAt: new Date(),
    verifiedNotes: 'Document is blurry and unreadable. Please upload a clear copy.',
  },
});
```

### Getting User Documents
```typescript
// Get all documents for a user
const userDocuments = await prisma.document.findMany({
  where: { userId: 'user-id' },
  orderBy: { createdAt: 'desc' },
});

// Get pending documents for verification
const pendingDocs = await prisma.document.findMany({
  where: { status: 'PENDING' },
  include: { user: true },
  orderBy: { createdAt: 'asc' },
});

// Get documents by type
const panCards = await prisma.document.findMany({
  where: {
    userId: 'user-id',
    documentType: 'PAN_CARD',
  },
});
```

### Document Expiration
```typescript
// Set expiration date for a document (e.g., 1 year from now)
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

const document = await prisma.document.update({
  where: { id: 'document-id' },
  data: {
    expiresAt: oneYearFromNow,
  },
});
```

## API Implementation Recommendations

### Document Upload Endpoint
```typescript
POST /api/documents/upload
- Accept: multipart/form-data
- Required fields:
  - file: File
  - documentType: DocumentType enum value
- Return: Document object
```

### Document Verification Endpoint (Admin)
```typescript
PATCH /api/admin/documents/:id/verify
- Required fields:
  - status: 'VERIFIED' | 'REJECTED'
  - verifiedNotes: string (optional, required for rejection)
- Return: Updated Document object
```

### Get User Documents Endpoint
```typescript
GET /api/user/documents
- Query params: documentType (optional), status (optional)
- Return: Document[] array
```

### Get Pending Documents Endpoint (Admin)
```typescript
GET /api/admin/documents/pending
- Return: Document[] array with owner info
```

## Frontend Components Needed

1. **Document Upload Form**
   - File input with validation (size, type)
   - Document type selector based on user role
   - Progress indicator for upload

2. **Document Management Dashboard**
   - List of user's documents
   - Document status badge (Pending/Verified/Rejected)
   - Delete document option
   - Reupload for rejected documents

3. **Admin Verification Panel**
   - List of pending documents
   - Document preview
   - Verification status selector
   - Notes input for rejection
   - Bulk verification actions

## File Upload Integration
For file storage, integrate with your existing upload service:
- Cloudinary (already in use)
- AWS S3
- Firebase Storage
- Local file system

Store the URL returned from the upload service in the `documentUrl` field.

## Validation Rules

### For USER Role
Required documents:
- PAN_CARD (mandatory)
- AADHAR_CARD (mandatory)

Optional documents:
- DRIVING_LICENSE
- PASSPORT
- VOTER_ID

### For OWNER Role
Required documents:
- PROPERTY_LICENSE (mandatory)
- TAX_IDENTIFICATION (for tax purposes)

Additional documents:
- BUSINESS_LICENSE
- GST_CERTIFICATE
- RENTAL_AGREEMENT_TEMPLATE

## Security Considerations

1. **File Access Control**
   - Users can only view their own documents
   - Admins need special permission to view
   - Implement row-level security in API routes

2. **File Store**
   - Store files in secure cloud storage with restricted access
   - Scan uploaded files for malware
   - Implement file type validation (not just extension)
   - Enforce file size limits

3. **Data Protection**
   - Consider encrypting sensitive document URLs
   - Implement audit logging for document access
   - GDPR: Include data deletion in user account deletion

## Next Steps

1. Create API routes for document upload, verification, and retrieval
2. Create frontend components for document management
3. Implement file upload handler with validation
4. Create admin dashboard for document verification
5. Add email notifications for document status changes
6. Implement document expiration checks
7. Add document verification status to user profile completeness
