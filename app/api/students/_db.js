import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'student_data.json');

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: {}, plans: {}, logs: {} };
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(email) {
  const prefix = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_\-]/g, '') : '';
  return `${prefix || 'S'}_${Math.random().toString(36).slice(2,10)}`;
}

function randomRfid() {
  // simple hex-like rfid
  return Math.random().toString(36).slice(2,10).toUpperCase();
}

function randomFaceId() {
  return Array.from({ length: 128 }, () => (Math.random() * 2 - 1)).slice(0, 16);
}

export async function getUserByEmail(email) {
  const data = await readData();
  for (const [id, user] of Object.entries(data.users || {})) {
    if (user.email === email) return { id, ...user };
  }
  return null;
}

export async function getUserById(id) {
  const data = await readData();
  return data.users && data.users[id] ? { id, ...data.users[id] } : null;
}

export async function createUser({ name, email, password }) {
  const data = await readData();
  const existing = await getUserByEmail(email);
  if (existing) throw new Error('User already exists');
  const id = generateId(email);
  const user = {
    name,
    email,
    password,
    role: 'student',
    rfid_tag: randomRfid(),
    face_id: randomFaceId(),
    status: 'active'
  };
  data.users[id] = user;
  await writeData(data);
  return { id, ...user };
}

export async function validateLogin({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export async function hasPendingPurchase(userId) {
  const data = await readData();
  const plans = data.plans || {};
  const userPlans = plans[userId] || {};
  for (const month of Object.keys(userPlans)) {
    for (const key of Object.keys(userPlans[month] || {})) {
      const p = userPlans[month][key];
      if (p && p.status === 'pending') return true;
    }
  }
  return false;
}

export async function addPurchase({ userId, days }) {
  const data = await readData();
  if (!data.plans) data.plans = {};
  if (!(userId in data.plans)) data.plans[userId] = {};
  const monthKey = new Date().toISOString().slice(0,7).replace('-', '_');
  if (!data.plans[userId][monthKey]) data.plans[userId][monthKey] = {};
  const timestampKey = `p_${Date.now()}`;
  data.plans[userId][monthKey][timestampKey] = {
    purchased_days: days,
    purchase_date: new Date().toISOString(),
    status: 'pending'
  };
  await writeData(data);
  return data.plans[userId][monthKey][timestampKey];
}

export async function listData() {
  return await readData();
}
