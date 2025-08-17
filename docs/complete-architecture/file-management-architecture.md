# File Management Architecture

## Cloudflare R2 Integration
```typescript
// lib/storage/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString()
    }
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

// CDN URL for public access
export function getCDNUrl(key: string): string {
  return `https://${process.env.R2_CUSTOM_DOMAIN}/${key}`
}
```

## File Upload API Route
```typescript
// /api/content/upload/route.ts
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'creator') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileName, fileType, fileSize } = await request.json()
  
  // Validate file
  const allowedTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png']
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (!allowedTypes.includes(fileType) || fileSize > maxSize) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 })
  }

  // Generate unique key
  const key = `content/${session.user.id}/${Date.now()}-${fileName}`
  
  // Generate presigned URL
  const uploadUrl = await generatePresignedUploadUrl(key, fileType)
  
  return NextResponse.json({
    uploadUrl,
    key,
    cdnUrl: getCDNUrl(key)
  })
}
```

---
