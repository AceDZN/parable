import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Attempt to connect to Firebase and retrieve data
    const storiesCollection = collection(db, 'stories');
    const snapshot = await getDocs(query(storiesCollection, limit(1)));

    return NextResponse.json({
      success: true,
      connected: true,
      documentsCount: snapshot.size,
      message: 'Firebase connection successful',
    });
  } catch (error: any) {
    console.error('Firebase connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
