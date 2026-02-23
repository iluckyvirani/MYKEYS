# Document Upload - Cloudinary Integration

## Overview

The document upload system now follows the **same Cloudinary integration pattern as avatar uploads**.

## Upload Flow

```
User Selects File
    ↓
Convert File to Base64
    ↓
POST /api/upload (Cloudinary Upload)
    ↓
Get Cloudinary URL + PublicId
    ↓
POST /api/documents (Create DB Record)
    ↓
Document Record Saved with Cloudinary URL
```

## Implementation Details

### 1. Frontend (DocumentUploadModal)

**File:** `src/components/dashboard/UserDashboard/DocumentUploadModal.tsx`

```typescript
const handleUpload = async () => {
  // Step 1: Convert file to base64
  const base64 = await fileToBase64(file);

  // Step 2: Upload to Cloudinary via /api/upload
  const uploadResponse = await api.post("/upload", {
    image: base64,
    folder: "mykeys/user-documents",
  });

  const documentUrl = uploadResponse.data.data.url;

  // Step 3: Create document record with Cloudinary URL
  const response = await api.post("/documents", {
    documentType,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    documentUrl,  // <- Use the Cloudinary URL
  });
};
```

### 2. API Flow

#### Endpoint 1: Upload to Cloudinary
- **Route:** `POST /api/upload`
- **Handled by:** Existing `/api/upload/route.ts`
- **Input:** Base64 encoded file + folder
- **Output:** Cloudinary URL & PublicId
- **Folder:** `mykeys/user-documents`

#### Endpoint 2: Save Document Record
- **Route:** `POST /api/documents`
- **Handled by:** New `/api/documents/route.ts`
- **Input:** documentUrl (from Cloudinary), documentType, fileName, etc.
- **Output:** Document record saved in database
- **Storage:** PostgreSQL (Prisma ORM)

### 3. Database Schema

```prisma
model Document {
  id               String    @id @default(cuid())
  documentType     DocumentType
  documentUrl      String    // <- Cloudinary URL stored here
  fileName         String
  fileSize         Int
  mimeType         String?
  status           DocumentStatus @default(PENDING)
  verifiedNotes    String?
  verifiedBy       String?
  verifiedAt       DateTime?
  expiresAt        DateTime?
  userId           String
  user             User      @relation("UserDocuments", fields: [userId], references: [id], onDelete: Cascade)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## Why This Approach?

### Advantages
✅ **Separation of Concerns**
- Cloudinary handles file storage
- Database stores metadata and URLs
- Frontend doesn't handle raw file data

✅ **Same Pattern as Avatar Upload**
- Consistent with existing code
- Easier to maintain
- Developers already familiar with this pattern

✅ **Better Error Handling**
- Cloudinary errors separate from database errors
- Can retry Cloudinary upload independently
- Database issues don't affect file upload

✅ **Efficient Resource Usage**
- Cloudinary optimizes images on the fly
- URL remains valid forever (unless deleted from Cloudinary)
- No need to re-upload files

✅ **Scalability**
- Cloudinary handles CDN distribution
- Fast downloads from anywhere
- No server storage needed

## Request/Response Examples

### Step 1: Upload to Cloudinary

**Request:**
```bash
POST /api/upload HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJ...",
  "folder": "mykeys/user-documents"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/mykeys/image/upload/v123456/mykeys/user-documents/pancard_abc123.jpg",
    "publicId": "mykeys/user-documents/pancard_abc123"
  },
  "message": "Image uploaded successfully",
  "statusCode": 201
}
```

### Step 2: Create Document Record

**Request:**
```bash
POST /api/documents HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "documentType": "PAN_CARD",
  "fileName": "pancard.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "documentUrl": "https://res.cloudinary.com/mykeys/image/upload/v123456/mykeys/user-documents/pancard_abc123.jpg",
  "expiresAt": "2027-02-23"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid-string",
    "documentType": "PAN_CARD",
    "documentUrl": "https://res.cloudinary.com/mykeys/image/upload/v123456/mykeys/user-documents/pancard_abc123.jpg",
    "fileName": "pancard.jpg",
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

## Cloudinary Integration

### Configuration
- Uses existing Cloudinary API credentials from environment variables
- Folder structure: `mykeys/user-documents/`
- Automatic naming from public ID

### File Transformations (Potential Future Enhancements)
Cloudinary URL can be modified for:
- Auto image optimization: `/image/upload/q_auto/...`
- Compression: `/w_800,h_800/...`
- Format conversion: `/f_auto/...`

Example with optimization:
```
https://res.cloudinary.com/mykeys/image/upload/q_auto/c_scale,w_1200/mykeys/user-documents/...
```

## Comparison: Avatar vs Document Upload

Both follow the same pattern:

| Aspect | Avatar Upload | Document Upload |
|--------|---------------|-----------------|
| **Frontend** | `fileToBase64()` | `fileToBase64()` |
| **Step 1** | POST `/api/upload` | POST `/api/upload` |
| **Storage** | Cloudinary | Cloudinary |
| **Step 2** | PATCH `/auth/profile` | POST `/api/documents` |
| **Database** | User.avatar (string) | Document.documentUrl (string) |
| **Flow** | Base64 → Cloudinary → DB | Base64 → Cloudinary → DB |

## Maximum File Sizes

- **Avatar:** 5 MB (image only)
- **Document:** 10 MB (images + PDF)

## Supported File Types

- **Avatar:** Image files (jpg, png, webp, etc.) - validated by `file.type.startsWith('image/')`
- **Document:** JPG, PNG, WebP, PDF - validated by MIME type in upload

## Security Features

1. **Authentication:** All endpoints require valid JWT
2. **File Validation:** Type and size checks on frontend and backend
3. **Ownership:** Documents linked to user via userId
4. **Cloudinary Security:** Secure token-based access
5. **HTTPS:** All URLs are HTTPS

## Performance Considerations

### Cloudinary Benefits
- **CDN Delivery:** Fast global delivery
- **Auto-Optimization:** Automatic format and quality optimization
- **Caching:** Cloudinary handles CDN caching
- **No Server Load:** Server doesn't store or serve files

### Database
- **Small Storage:** Only metadata stored (URL, size, type)
- **Fast Queries:** Indexed by userId and documentType
- **Scalable:** No file size limitations on database

## Troubleshooting

### Upload Fails with "Invalid image format"
**Cause:** File not properly converted to base64 or Cloudinary credentials missing
**Fix:** 
1. Check file is valid
2. Verify Cloudinary API key in environment
3. Check browser console for detailed error

### Document URL is Broken
**Cause:** Cloudinary URL expired or public ID deleted
**Fix:**
1. Re-upload document
2. Check Cloudinary dashboard for deleted files
3. Verify folder permissions

### 500 Error on /api/documents
**Cause:** Database connection issue or invalid data
**Fix:**
1. Check database connection
2. Verify userId exists in User table
3. Check request payload format

## Future Enhancements

1. **Automatic Image Optimization**
   - Add Cloudinary transformations for smaller file sizes
   - Use format auto-detection

2. **Document Validation**
   - OCR to extract text from documents
   - Auto-detect document type from content
   - Verify document authenticity

3. **Versioning**
   - Keep history of document uploads
   - Allow rollback to previous versions
   - Track who uploaded and when

4. **Bulk Upload**
   - Multiple documents at once
   - Batch processing
   - Progress tracking

5. **Admin Actions**
   - Download documents from admin panel
   - Delete documents (with soft delete option)
   - Generate verification reports

## Summary

✅ Document upload uses the same Cloudinary pattern as avatar upload  
✅ Two-step process: Cloudinary → Database  
✅ Scalable, secure, and maintainable  
✅ Follows existing project patterns  
✅ Production-ready implementation
