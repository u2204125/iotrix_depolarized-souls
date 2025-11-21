import { hasPendingPurchase, addPurchase, getUserById } from '../_db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, days } = body;
    if (!userId || !days) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    const user = await getUserById(userId);
    if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    const pending = await hasPendingPurchase(userId);
    if (pending) return new Response(JSON.stringify({ error: 'Pending purchase exists' }), { status: 409 });
    const purchase = await addPurchase({ userId, days });
    return new Response(JSON.stringify({ purchase }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
