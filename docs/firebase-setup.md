# Firebase Setup for Parable

## Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select the project "parable-e1a9c" or create a new project if necessary
3. Enable Firestore Database and Storage services if not already enabled

## Firestore Security Rules

For security, update your Firestore rules to ensure users can only access their own stories:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to specific public collections if needed
    // match /public/{document=**} {
    //   allow read;
    // }

    // Stories collection - users can only read/write their own stories
    match /stories/{storyId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Security Rules

For Firebase Storage, here are the recommended security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User images - users can only access their own uploaded images
    match /users/{userId}/{allPaths=**} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Environment Variables

To connect your application to Firebase, create a `.env.local` file with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=parable-e1a9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=parable-e1a9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=parable-e1a9c.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

You can find these values in your Firebase project settings.

## Authentication Integration with Clerk

Since we're using Clerk for authentication, we'll need to use the Clerk-provided user IDs in our Firebase rules.

The Firebase service in our application uses the Clerk user ID as the `userId` field in our Firestore documents, which ensures that our security rules work correctly.

## Firestore Indexes

For the "Get stories by user ID" query, we need to create an index:

1. Go to the Firebase Console > Firestore Database > Indexes tab
2. Add a new index with:
   - Collection ID: `stories`
   - Fields to index:
     - `userId` (Ascending)
     - `createdAt` (Descending) - for sorting newer stories first
   - Query scope: `Collection`
3. Click "Create index"

This will optimize queries that filter stories by `userId` and order them by creation date.

## Data Backup and Export

To back up your Firestore data:

1. Go to the Firebase Console > Firestore Database
2. Click on the "Export" button
3. Choose a destination (Google Cloud Storage bucket)
4. Start the export

## Firebase Emulator for Local Development

For local development, you can use the Firebase Emulator Suite:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Firebase in your project: `firebase init`
3. Start the emulators: `firebase emulators:start`

Update your Firebase configuration to connect to the emulators during development:

```javascript
// In src/lib/firebase.ts

// Initialize Firebase with emulator connection
if (process.env.NODE_ENV === 'development') {
  // Connect to emulators
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```
