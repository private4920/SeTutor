import { NextResponse } from 'next/server';
import { countDocumentsByUserId } from '@/lib/db/repositories/documentRepository';
import { countFoldersByUserId } from '@/lib/db/repositories/folderRepository';
import { getOrCreateUser } from '@/lib/db/repositories/userRepository';
import { authenticateRequest } from '@/lib/firebase/admin';

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 * Headers:
 *   - Authorization: Bearer <firebase-id-token> (required)
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

    // Get or create user from verified Firebase UID
    const user = await getOrCreateUser(authResult.uid, authResult.email, authResult.displayName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 500 }
      );
    }

    // Fetch counts in parallel
    const [documentsCount, foldersCount] = await Promise.all([
      countDocumentsByUserId(user.id),
      countFoldersByUserId(user.id),
    ]);

    // Flashcards and quizzes counts are placeholders for now
    // Will be implemented when those features are added
    const flashcardsCount = 0;
    const quizzesCount = 0;

    return NextResponse.json({
      documents: documentsCount,
      folders: foldersCount,
      flashcards: flashcardsCount,
      quizzes: quizzesCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
