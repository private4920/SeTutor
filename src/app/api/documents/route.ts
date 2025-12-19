import { NextResponse } from 'next/server';
import { 
  getAllDocumentsByUserId, 
  getDocumentsByFolderId,
  searchDocuments,
  getDocumentsPaginated
} from '@/lib/db/repositories/documentRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';

/**
 * GET /api/documents - Get documents with optional filtering
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Query params:
 *   - folderId: Folder ID (optional, null for root documents)
 *   - search: Search query (optional)
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
    const folderId = searchParams.get('folderId') || undefined;
    const search = searchParams.get('search')?.trim() || undefined;
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

    // Handle search query (already trimmed by Zod schema)
    if (search) {
      const documents = await searchDocuments(user.id, search);
      return NextResponse.json({ documents, total: documents.length });
    }

    // Handle pagination (page is provided in validated data)
    if (page !== undefined) {
      const result = await getDocumentsPaginated(
        user.id,
        page,
        pageSize,
        folderId === 'null' ? null : folderId || undefined
      );
      return NextResponse.json(result);
    }

    // Get documents by folder
    let documents;
    if (folderId === undefined || folderId === '') {
      documents = await getAllDocumentsByUserId(user.id);
    } else {
      documents = await getDocumentsByFolderId(
        folderId === 'null' ? null : folderId,
        user.id
      );
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
