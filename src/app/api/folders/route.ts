import { NextResponse } from 'next/server';
import { 
  createFolder, 
  getAllFoldersByUserId, 
  getFoldersByParentId,
  getFolderById,
  getFoldersPaginated
} from '@/lib/db/repositories/folderRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';
import { z } from 'zod';

// Schema for folder creation (name only, uid comes from JWT)
const createFolderBodySchema = z.object({
  name: z.string().min(1).max(255).trim(),
  parentId: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/folders - Get all folders or folders by parent
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Query params:
 *   - parentId: Parent folder ID (optional, null for root folders)
 *   - page: Page number for pagination (optional)
 *   - pageSize: Items per page (optional, default 20)
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
    const parentId = searchParams.get('parentId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Handle pagination (page is provided in validated data)
    if (page !== undefined) {
      const result = await getFoldersPaginated(
        user.id,
        page,
        pageSize,
        parentId === 'null' ? null : parentId || undefined
      );
      return NextResponse.json(result);
    }

    let folders;
    if (parentId === undefined || parentId === '') {
      // Get all folders for the user
      folders = await getAllFoldersByUserId(user.id);
    } else {
      // Get folders by parent (null for root folders)
      folders = await getFoldersByParentId(
        parentId === 'null' ? null : parentId,
        user.id
      );
    }

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/folders - Create a new folder
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Body: { name: string, parentId?: string }
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

    // Validate request body
    const body = await request.json();
    const validation = createFolderBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { name, parentId } = validation.data;

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Calculate path based on parent
    let path: string;
    if (parentId) {
      const parentFolder = await getFolderById(parentId, user.id);
      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        );
      }
      path = `${parentFolder.path}/${name}`; // name is already trimmed by Zod
    } else {
      path = `/${name}`; // name is already trimmed by Zod
    }

    const folder = await createFolder({
      name: name, // Already trimmed by Zod schema
      parent_id: parentId || null,
      user_id: user.id,
      path
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
