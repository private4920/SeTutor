import { NextResponse } from 'next/server';
import { moveFolder, getFolderById } from '@/lib/db/repositories/folderRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

const moveFolderBodySchema = z.object({
  newParentId: z.string().uuid().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/folders/[id]/move - Move a folder to a new parent
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Body: { newParentId: string | null }
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
        { error: 'Invalid folder ID format' },
        { status: 400 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validation = moveFolderBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { newParentId: parentId } = validation.data;

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Check folder exists
    const folder = await getFolderById(id, user.id);
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentFolder = await getFolderById(parentId, user.id);
      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Target parent folder not found' },
          { status: 404 }
        );
      }
    }

    const movedFolder = await moveFolder(id, user.id, parentId || null);
    if (!movedFolder) {
      return NextResponse.json(
        { error: 'Failed to move folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({ folder: movedFolder });
  } catch (error) {
    console.error('Error moving folder:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('itself')) {
        return NextResponse.json(
          { error: 'Cannot move folder into itself' },
          { status: 400 }
        );
      }
      if (error.message.includes('descendant')) {
        return NextResponse.json(
          { error: 'Cannot move folder into its own descendant' },
          { status: 400 }
        );
      }
      if (error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in the target location' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to move folder' },
      { status: 500 }
    );
  }
}
