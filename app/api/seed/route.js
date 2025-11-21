import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

// Read service account JSON from project root
const serviceAccountPath = path.resolve('./iotrix-final-firebase-adminsdk-fbsvc-6e07edd126.json');
let serviceAccount = null;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  console.error('Failed to read service account JSON:', e);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`,
  });
}

async function deleteAllAuthUsers() {
  const auth = admin.auth();
  let nextPageToken;
  do {
    const list = await auth.listUsers(1000, nextPageToken);
    const uids = list.users.map(u => u.uid);
    if (uids.length) {
      await auth.deleteUsers(uids);
    }
    nextPageToken = list.pageToken;
  } while (nextPageToken);
}

export async function POST(req) {
  console.log('Received POST request to /api/seed');

  if (!serviceAccount) {
    console.error('Service account JSON not found on server.');
    return new Response(JSON.stringify({ error: 'Service account JSON not found on server.' }), { status: 500 });
  }

  try {
    if (!admin.apps.length) {
      // re-init just in case
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`,
      });
    }

    const auth = admin.auth();
    const db = admin.database();

    console.log('Starting wipe and seed process...');

    // Verify database connection
    try {
      await db.ref('/').once('value');
      console.log('Database connection verified.');
    } catch (err) {
      console.error('Failed to verify database connection:', err);
      throw err;
    }

    // A. WIPE AUTH
    console.log('Wiping all auth users...');
    await deleteAllAuthUsers();
    console.log('All auth users deleted.');

    // B. WIPE DB (users, live_session, stats)
    console.log('Wiping database nodes...');
    try {
      await Promise.all([
        db.ref('/users').remove().then(() => console.log('Wiped /users node.')),
        db.ref('/live_session').remove().then(() => console.log('Wiped /live_session node.')),
        db.ref('/stats').remove().then(() => console.log('Wiped /stats node.')),
      ]);
    } catch (err) {
      console.error('Error wiping database nodes:', err);
      throw err;
    }

    console.log('Database nodes wiped.');

    // C. SEED AUTH
    console.log('Creating auth users...');
    const password = '11121112';
    let managerUser, studentUser;
    try {
      managerUser = await auth.createUser({ email: 'jigar@cuet.com', password });
      console.log('Manager user created:', managerUser.uid);
      studentUser = await auth.createUser({ email: 'piyal@cuet.com', password });
      console.log('Student user created:', studentUser.uid);
    } catch (err) {
      console.error('Error creating auth users:', err);
      throw err;
    }

    // D. SEED RTDB using UIDs
    console.log('Seeding database nodes...');
    const usersObj = {};
    usersObj[managerUser.uid] = {
      name: 'Jigar Alam (Manager)',
      role: 'manager',
      balance: 0,
      has_eaten_today: false,
    };
    usersObj[studentUser.uid] = {
      name: 'Piyal Chakraborty',
      role: 'student',
      balance: 100,
      has_eaten_today: false,
      pin: '1234',
    };

    try {
      await db.ref('/users').set(usersObj).then(() => console.log('Seeded /users node.'));
      await db.ref('/live_session').set({ state: 'IDLE' }).then(() => console.log('Seeded /live_session node.'));
      await db.ref('/stats').set({ total_served: 0, fraud: 0 }).then(() => console.log('Seeded /stats node.'));
    } catch (err) {
      console.error('Error seeding database nodes:', err);
      throw err;
    }

    console.log('Database seeded successfully.');

    return new Response(JSON.stringify({ ok: true, managerUid: managerUser.uid, studentUid: studentUser.uid }), { status: 200 });
  } catch (err) {
    console.error('Seed route error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export const runtime = 'nodejs';
