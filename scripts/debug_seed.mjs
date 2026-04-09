import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(resolve(__dirname, '../serviceAccountKey.json'), 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore('ai-studio-371bd5a3-f7f5-47f8-b691-2c68455fa731');

async function test() {
  console.log("Testing Firestore connection...");
  const snap = await db.collection('courses').limit(1).get();
  console.log("Success! Found", snap.size, "courses.");
}

test().catch(console.error);
