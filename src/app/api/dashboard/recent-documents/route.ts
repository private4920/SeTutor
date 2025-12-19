import { NextResponse } from 'next/server';
import { getRecentDocuments } from '@/lib/db/repositories/documentRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';

/**
 * GET /api/dashboard/recent-documents - Get recent documents
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
 * Query params:
 *   - limit: Number of documents to return (optional, default 5, max 10)
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
    const limitParam = searchParams.get('limit');
    
    // Default limit is 5, max is 10 per Requirements 6.3
    const limit = Math.min(Math.max(parseInt(limitParam || '5', 10), 1), 10);

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    const documents = await getRecentDocuments(user.id, limit);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent documents' },
      { status: 500 }
    );
  }
}
