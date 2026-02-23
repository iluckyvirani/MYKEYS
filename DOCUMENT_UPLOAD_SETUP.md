# Document Upload Integration - Setup Guide

## ✅ Completed Implementation

I have successfully integrated a complete document upload system for user verification. Here's what has been implemented:

### 1. **Database Schema** ✅
- Updated Prisma schema with `Document` model
- Added `DocumentType` enum (10 document types)
- Added `DocumentStatus` enum (4 statuses)
- Migration created: `20260223120000_add_user_documents`
- Updated `User` model with document relationship

**Location:** `prisma/schema.prisma` and `prisma/migrations/20260223120000_add_user_documents/migration.sql`

### 2. **Backend API Routes** ✅
- `POST /api/documents` - Upload new document
- `GET /api/documents` - List user documents
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document
- `PATCH /api/documents/:id` - Update document

**Location:** 
- `src/app/api/documents/route.ts`
- `src/app/api/documents/[id]/route.ts`

**Features:**
- Authentication required via JWT middleware
- Input validation for document type and file data
- Cloudinary integration for file storage
- Proper error handling with standardized error codes
- Ownership verification (users can only access their own documents)

### 3. **Frontend Components** ✅

#### DocumentUploadModal
**Location:** `src/components/dashboard/UserDashboard/DocumentUploadModal.tsx`

Features:
- Modal for document upload
- Document type selection (role-based)
- File upload with validation
- Base64 encoding and API integration
- Loading states and error handling
- Support for JPG, PNG, WebP, PDF

#### DocumentList
**Location:** `src/components/dashboard/UserDashboard/DocumentList.tsx`

Features:
- Display user documents from API
- Status badges (Pending, Verified, Rejected, Expired)
- Document preview (opens in new window)
- Download functionality
- Delete with confirmation
- File size formatting
- Loading and empty states
- Real-time list updates

### 4. **User Profile Integration** ✅
**Location:** `src/app/user/dashboard/profile/page.tsx`

Features:
- "Documents" tab in profile settings
- Upload button opens DocumentUploadModal
- Dynamic document list refresh
- Verification status display
- Document management UI

### 5. **Type Definitions** ✅
**Location:** `src/types/document.ts`

Includes:
- Document and DocumentType interfaces
- Constants for document labels and role-based requirements
- Request/Response types

### 6. **Documentation** ✅
- `DOCUMENT_UPLOAD_API.md` - Complete API documentation
- `USER_DOCUMENT_SCHEMA.md` - Schema and database design
- Inline code comments

---

## 🚀 Setup Instructions

### Step 1: Generate Prisma Client
After the schema changes, regenerate the Prisma client:

```bash
npx prisma generate
```

This will resolve the TypeScript errors about `prisma.document` not existing.

### Step 2: Run Database Migration
Once your database is running, apply the migration:

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev --name add_user_documents
```

### Step 3: Start the Application
```bash
npm run dev
```

### Step 4: Test the Feature
1. Navigate to user dashboard profile page
2. Click on "Documents" tab
3. Click "Upload Document" button
4. Select a document type
5. Upload a file (JPG, PNG, WebP, or PDF)
6. Verify document appears in list

---

## 📋 Document Types by Role

### USER Role
**Required:**
- PAN_CARD
- AADHAR_CARD

**Optional:**
- DRIVING_LICENSE
- PASSPORT
- VOTER_ID

### OWNER Role  
**Required:**
- PROPERTY_LICENSE
- TAX_IDENTIFICATION

**Optional:**
- BUSINESS_LICENSE
- GST_CERTIFICATE
- RENTAL_AGREEMENT_TEMPLATE

---

## 🔐 Security Implementation

### Authentication
- All API endpoints require valid JWT token
- User ID extracted from JWT claims
- Ownership verification on all operations

### File Handling
- Base64 encoding for secure transmission
- Cloudinary handles file storage and CDN
- Files stored in `mykeys/user-documents` folder
- Maximum file size: 10MB
- Allowed types: JPG, PNG, WebP, PDF

### Data Access
- Users can only access their own documents
- API returns 403 Forbidden for unauthorized access
- Proper error codes for all scenarios

---

## 📝 API Usage Examples

### Upload a Document
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "PAN_CARD",
    "fileName": "pan_card.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "base64Image": "data:image/jpeg;base64,...",
    "expiresAt": "2027-02-23"
  }'
```

### Get All Documents
```bash
curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Delete Document
```bash
curl -X DELETE http://localhost:3000/api/documents/{ID} \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 🎨 Frontend Integration

The DocumentUploadModal and DocumentList are already integrated into:
- User Dashboard Profile Page
- Documents Tab in settings
- Upload button triggers modal
- List refreshes after upload
- Delete confirmation dialog

---

## 🔄 Data Flow

```
User Interface (Frontend)
    ↓
DocumentUploadModal (Upload)
    ↓
Convert File to Base64
    ↓
POST /api/documents
    ↓
Validate Input & Auth
    ↓
Upload to Cloudinary
    ↓
Create Document Record (DB)
    ↓
Return Document Object
    ↓
DocumentList (Display)
```

---

## ✨ Features

### Admin Verification (Backend Ready)
The schema supports admin verification:
- `verifiedBy`: Admin user ID
- `verifiedAt`: Verification timestamp
- `verifiedNotes`: Rejection reason
- `status`: Can be set to VERIFIED or REJECTED

(Admin panel endpoints can be created following the same pattern)

### Document Expiration
- Optional `expiresAt` field
- Can be set during upload or updated later
- Status can be marked as EXPIRED

### Verification Status
Four status options:
- **PENDING**: Awaiting admin review
- **VERIFIED**: Approved by admin
- **REJECTED**: Rejected with notes
- **EXPIRED**: Expiration date passed

---

## 🧪 Testing Checklist

- [ ] Can upload document via modal
- [ ] Document appears in list after upload
- [ ] Can download uploaded document
- [ ] Can preview/view document
- [ ] Can delete document
- [ ] File validation works (size limit)
- [ ] File type validation works
- [ ] Error messages display correctly
- [ ] Modal closes after successful upload
- [ ] List refreshes automatically
- [ ] Can't access others' documents (403 error)
- [ ] All document types can be uploaded
- [ ] Status badges display correctly

---

## 🚧 Future Enhancements

### Admin Dashboard
- [ ] List of pending documents
- [ ] Verify/reject documents
- [ ] Add verification notes
- [ ] Bulk verification operations
- [ ] Document audit trail

### Additional Features
- [ ] Document expiration reminders (email)
- [ ] Automatic expiration status updates
- [ ] Document versioning
- [ ] OCR for text extraction
- [ ] Document template downloads
- [ ] Document comparison UI

---

## 🐛 Troubleshooting

### "Property 'document' does not exist" Error
**Cause:** Prisma client hasn't been regenerated
**Fix:** Run `npx prisma generate`

### Upload Fails with "Invalid image format"
**Cause:** File not converted to base64 properly
**Fix:** Check file is valid and < 10MB

### 404 Document Not Found
**Cause:** Document ID doesn't exist or belongs to different user
**Fix:** Verify document ID and user authentication

### "Unauthorized" Error
**Cause:** Trying to access another user's document
**Fix:** Users can only access their own documents

---

## 📚 File Structure

```
src/
├── app/api/documents/
│   ├── route.ts                 # GET, POST endpoints
│   └── [id]/route.ts            # GET, DELETE, PATCH endpoints
├── components/dashboard/UserDashboard/
│   ├── DocumentList.tsx         # Document list display
│   └── DocumentUploadModal.tsx  # Upload modal
├── types/
│   └── document.ts              # TypeScript types
└── app/user/dashboard/profile/
    └── page.tsx                 # Profile page with integration

prisma/
├── schema.prisma                # Updated with Document model
└── migrations/
    └── 20260223120000_add_user_documents/
        └── migration.sql        # Database migration

docs/
├── DOCUMENT_UPLOAD_API.md       # Complete API documentation
└── USER_DOCUMENT_SCHEMA.md      # Schema documentation
```

---

## ✅ Summary

All components are ready and follow the existing code patterns in your project:
1. ✅ API routes follow the same structure as other API endpoints
2. ✅ Components use the same UI framework and patterns
3. ✅ Error handling matches the project's standard
4. ✅ Type safety with TypeScript interfaces
5. ✅ Integration with existing Cloudinary setup
6. ✅ Authentication uses existing JWT middleware
7. ✅ Database uses existing Prisma ORM

**Next Step:** Run the migration to set up the database, then test the feature!

```bash
npx prisma migrate dev --name add_user_documents
npm run dev
```

Navigate to user dashboard profile → Documents tab to see it in action.
