import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
const domain = process.env.NEXTAUTH_URL;

export async function POST(req) {
  try {
    const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [
    {
      price: 'price_1RP3Ko2K8Zg9ohwnV3Lmjo8M',
      quantity: 1,
    },
  ],
  success_url: `${domain}/success`,
  cancel_url: `${domain}/cancel`,
});


    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('❌ Stripe error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
