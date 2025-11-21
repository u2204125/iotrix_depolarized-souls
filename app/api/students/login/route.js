import { validateLogin, getUserByEmail } from '../_db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    const user = await validateLogin({ email, password });
    if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
