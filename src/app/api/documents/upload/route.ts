import { NextResponse } from 'next/server';
import { createDocument } from '@/lib/db/repositories/documentRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { getFolderById } from '@/lib/db/repositories/folderRepository';
import { authenticateRequest } from '@/lib/firebase/admin';
import { 
  generateS3Key, 
  uploadFileToS3, 
  validateFileForUpload,
  S3_CONFIG 
} from '@/lib/s3';

/**
 * POST /api/documents/upload - Upload a document
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * FormData:
 *   - file: File (required)
 *   - folderId: Folder ID (optional)
 */
export async function POST(request: Request) {
  try {
    // Authenticate request using JWT token
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folderId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Validate file (PDF format, 50MB limit) - Requirements 4.1
    const validation = validateFileForUpload({
      size: file.size,
      type: file.type,
      name: file.name
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate folder exists if provided
    if (folderId && folderId !== 'null') {
      const folder = await getFolderById(folderId, user.id);
      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        );
      }
    }

    // Generate S3 key and upload file - Requirements 4.4
    const folderPath = folderId && folderId !== 'null' ? folderId : 'root';
    const s3Key = generateS3Key(user.id, folderPath, file.name);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const { s3Url } = await uploadFileToS3(buffer, s3Key, file.type);

    // Save metadata to PostgreSQL - Requirements 4.4
    const document = await createDocument({
      name: file.name.replace(/\.pdf$/i, ''),
      original_name: file.name,
      folder_id: folderId && folderId !== 'null' ? folderId : null,
      user_id: user.id,
      s3_key: s3Key,
      s3_url: s3Url,
      file_size: file.size,
      mime_type: file.type
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/upload - Get presigned URL for direct upload
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Query params:
 *   - fileName: Original file name (required)
 *   - fileType: MIME type (required)
 *   - fileSize: File size in bytes (required)
 *   - folderId: Folder ID (optional)
 */
export async function GET(request: Request) {
  try {
    // Authenticate request using JWT token
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');
    const fileSize = parseInt(searchParams.get('fileSize') || '0', 10);
    const folderId = searchParams.get('folderId');

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Validate file before generating presigned URL
    const validation = validateFileForUpload({
      size: fileSize,
      type: fileType,
      name: fileName
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate S3 key
    const folderPath = folderId && folderId !== 'null' ? folderId : 'root';
    const s3Key = generateS3Key(user.id, folderPath, fileName);

    // Return the S3 key for the client to use
    return NextResponse.json({ 
      s3Key,
      maxSize: S3_CONFIG.MAX_FILE_SIZE,
      allowedTypes: S3_CONFIG.ALLOWED_MIME_TYPES
    });
  } catch (error) {
    console.error('Error preparing upload:', error);
    return NextResponse.json(
      { error: 'Failed to prepare upload' },
      { status: 500 }
    );
  }
}
