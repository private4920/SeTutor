import { NextResponse } from 'next/server';
import { getDocumentById, updateDocument } from '@/lib/db/repositories/documentRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { getFolderById } from '@/lib/db/repositories/folderRepository';
import { authenticateRequest } from '@/lib/firebase/admin';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

const moveDocumentBodySchema = z.object({
  folderId: z.string().uuid().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/documents/[id]/move - Move a document to a different folder
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Body: { folderId: string | null }
 */
export async function POST(request: Request, { params }: RouteParams) {
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
    const validation = moveDocumentBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { folderId } = validation.data;

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Check document exists and belongs to user
    const existingDocument = await getDocumentById(id, user.id);
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Validate target folder if provided
    if (folderId !== null && folderId !== undefined) {
      const targetFolder = await getFolderById(folderId, user.id);
      if (!targetFolder) {
        return NextResponse.json(
          { error: 'Target folder not found' },
          { status: 404 }
        );
      }
    }

    // Move document - Requirements 5.4
    const document = await updateDocument(id, user.id, { folder_id: folderId });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error moving document:', error);
    return NextResponse.json(
      { error: 'Failed to move document' },
      { status: 500 }
    );
  }
}
