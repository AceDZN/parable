'use client';

interface FirebaseTestStatus {
  loading: boolean;
  success: boolean;
  error?: string;
  data?: any;
}

interface FirebaseTestClientProps {
  initialStatus: FirebaseTestStatus;
}

export function FirebaseTestClient({ initialStatus }: FirebaseTestClientProps) {
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>

      {initialStatus.loading ? (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
          Testing connection to Firebase...
        </div>
      ) : initialStatus.success ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          <h2 className="font-semibold text-xl mb-2">Connection Successful!</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(initialStatus.data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <h2 className="font-semibold text-xl mb-2">Connection Failed</h2>
          <p className="mb-2">{initialStatus.error}</p>
          <p className="text-sm">
            Please check your Firebase configuration in <code>.env.local</code>{' '}
            file and make sure you have the correct API keys and permissions.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h2 className="font-semibold mb-2">Firebase Configuration</h2>
        <p className="text-sm">
          Project ID:{' '}
          {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'parable-e1a9c'}
        </p>
      </div>

      <div className="mt-6">
        <a
          href="/api/firebase-test"
          target="_blank"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Test API Endpoint
        </a>
      </div>
    </div>
  );
}
