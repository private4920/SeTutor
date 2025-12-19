import { NextResponse } from 'next/server';
import { getFolderPath } from '@/lib/db/repositories/folderRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/folders/[id]/path - Get the full path (breadcrumbs) for a folder
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Returns: Array of folders from root to the specified folder
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

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    const path = await getFolderPath(id, user.id);
    
    if (path.length === 0) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error('Error fetching folder path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder path' },
      { status: 500 }
    );
  }
}
