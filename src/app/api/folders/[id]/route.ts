import { NextResponse } from 'next/server';
import { 
  getFolderById, 
  updateFolder, 
  deleteFolder,
  getChildFolders
} from '@/lib/db/repositories/folderRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

const updateFolderBodySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/folders/[id] - Get a specific folder
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
        { error: 'Invalid folder ID format' },
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

    const folder = await getFolderById(idValidation.data, user.id);
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/folders/[id] - Update a folder (rename)
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Body: { name?: string }
 */
export async function PUT(request: Request, { params }: RouteParams) {
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
    const validation = updateFolderBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { name } = validation.data;

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    const validatedId = idValidation.data;
    
    // Get current folder to update path
    const currentFolder = await getFolderById(validatedId, user.id);
    if (!currentFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    const updates: { name?: string; path?: string } = {};
    
    if (name) {
      // name is already validated and trimmed by Zod schema
      updates.name = name;
      
      // Update path to reflect new name
      const pathParts = currentFolder.path.split('/');
      pathParts[pathParts.length - 1] = name;
      updates.path = pathParts.join('/');
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    const folder = await updateFolder(validatedId, user.id, updates);
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Update paths for all child folders if name changed
    if (updates.path) {
      const children = await getChildFolders(validatedId, user.id);
      for (const child of children) {
        const relativePath = child.path.substring(currentFolder.path.length);
        const newChildPath = updates.path + relativePath;
        await updateFolder(child.id, user.id, { path: newChildPath });
      }
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error('Error updating folder:', error);
    
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/folders/[id] - Delete a folder and all contents
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
        { error: 'Invalid folder ID format' },
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

    // Check folder exists
    const folder = await getFolderById(validatedId, user.id);
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Delete folder (CASCADE will handle children due to DB schema)
    const deleted = await deleteFolder(validatedId, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
