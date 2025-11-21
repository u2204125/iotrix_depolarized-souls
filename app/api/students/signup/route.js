import { createUser, getUserByEmail } from '../_db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }
    const exists = await getUserByEmail(email);
    if (exists) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
    }
    const user = await createUser({ name, email, password });
    return new Response(JSON.stringify({ user }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
