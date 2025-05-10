import { FirebaseTestClient } from '@/components/client/FirebaseTestClient';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

interface FirebaseTestStatus {
  loading: boolean;
  success: boolean;
  error?: string;
  data?: any;
}

export default async function FirebaseTestPage() {
  let status: FirebaseTestStatus = {
    loading: false,
    success: false,
    error: undefined,
    data: undefined,
  };

  try {
    // Test connection server-side
    const storiesCollection = collection(db, 'stories');
    const snapshot = await getDocs(query(storiesCollection, limit(1)));

    status = {
      loading: false,
      success: true,
      data: {
        documentsCount: snapshot.size,
        connectionEstablished: true,
      },
      error: undefined,
    };
  } catch (error: any) {
    console.error('Firebase connection error:', error);
    status = {
      loading: false,
      success: false,
      error: error.message || 'Unknown error occurred',
      data: undefined,
    };
  }

  return <FirebaseTestClient initialStatus={status} />;
}
