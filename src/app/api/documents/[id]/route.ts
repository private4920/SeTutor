import { NextResponse } from 'next/server';
import { 
  getDocumentById, 
  updateDocument, 
  deleteDocument 
} from '@/lib/db/repositories/documentRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { getFolderById } from '@/lib/db/repositories/folderRepository';
import { deleteFileFromS3, generatePresignedUrl } from '@/lib/s3';
import { authenticateRequest } from '@/lib/firebase/admin';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

const updateDocumentBodySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  folderId: z.string().uuid().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/documents/[id] - Get a single document
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request using JWT token
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Validate route parameter
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      );
    }

    const validatedId = idValidation.data;
    
    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    const document = await getDocumentById(validatedId, user.id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate presigned URL for secure access - Requirements 11.2
    const presignedUrl = await generatePresignedUrl(document.s3_key);

    return NextResponse.json({ 
      document,
      presignedUrl 
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id] - Update a document
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Body: { name?: string, folderId?: string }
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate request using JWT token
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Validate route parameter
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validation = updateDocumentBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { name, folderId } = validation.data;

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    const validatedId = idValidation.data;
    
    // Check document exists
    const existingDocument = await getDocumentById(validatedId, user.id);
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Validate folder if provided
    if (folderId !== undefined && folderId !== null) {
      const folder = await getFolderById(folderId, user.id);
      if (!folder) {
        return NextResponse.json(
          { error: 'Target folder not found' },
          { status: 404 }
        );
      }
    }

    const updates: { name?: string; folder_id?: string | null } = {};
    if (name !== undefined) updates.name = name;
    if (folderId !== undefined) updates.folder_id = folderId;

    const document = await updateDocument(validatedId, user.id, updates);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id] - Delete a document
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request using JWT token
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Validate route parameter
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      );
    }

    const validatedId = idValidation.data;
    
    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Get document to retrieve S3 key
    const document = await getDocumentById(validatedId, user.id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from S3 first - Requirements 5.5
    try {
      await deleteFileFromS3(document.s3_key);
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database - Requirements 5.5
    await deleteDocument(validatedId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
