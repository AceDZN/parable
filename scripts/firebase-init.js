/**
 * Firebase initialization script
 *
 * This script sets up the required collections and indexes in Firebase.
 * Run it with: node scripts/firebase-init.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables if .env.local exists
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Check if service account key is provided
let serviceAccount;
try {
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'service-account.json';

  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
  } else {
    console.log(
      'No service account file found. Using environment variables instead.'
    );
    // Try to create service account from environment variables
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      serviceAccount = {
        projectId:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'parable-e1a9c',
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };
    }
  }
} catch (error) {
  console.error('Error loading service account:', error);
}

// Initialize Firebase
let app;
if (serviceAccount) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  // Try using application default credentials (useful for Cloud Functions/Cloud Run)
  app = initializeApp();
  console.log('Using application default credentials');
}

const db = getFirestore(app);

async function initializeFirebase() {
  console.log('Initializing Firebase collections and indexes...');

  try {
    // Create stories collection if it doesn't exist
    // In Firestore, collections are created automatically when you add documents
    // So we'll just create a test document and then delete it

    const testDoc = db.collection('stories').doc('test-init-doc');
    await testDoc.set({
      _test: true,
      createdAt: new Date(),
      userId: 'system',
    });
    console.log('Created stories collection');

    await testDoc.delete();
    console.log('Deleted test document');

    // Create indexes
    // Note: Firestore indexes can only be created through the Firebase console
    // or using the Firebase CLI, not through the admin SDK
    console.log(`
For optimal query performance, create the following index in the Firebase Console:

Collection: stories
Fields to index:
  - userId (Ascending)
  - createdAt (Descending)
`);

    console.log('Firebase initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    process.exit(1);
  }
}

initializeFirebase();
