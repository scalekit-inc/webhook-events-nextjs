import { NextRequest, NextResponse } from 'next/server';
import { addEvent, retrieveEvents } from './store';
import { ScalekitClient } from '@scalekit-sdk/node';

const scalekit = new ScalekitClient(
  process.env.SCALEKIT_ENV_URL ?? '',
  process.env.SCALEKIT_CLIENT_ID ?? '',
  process.env.SCALEKIT_CLIENT_SECRET ?? '',
);

/**
 * Webhook Endpoint using Next.js App Router v14.2
 * @endpoint /api/webhook/user-access
 * app/api
 * └── webhook
 *     └── user-access
 *         └── route.ts
 */

export async function POST(req: NextRequest) {
  // Parse the JSON body of the request
  const event = await req.json();
  const headers = req.headers;
  // Secret from Scalekit Dasbhoard > Webhooks
  const secret = process.env.SCALEKIT_WEBHOOK_SECRET;

  // Verify the signature of the event
  try {
    if (!secret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }
    await scalekit.verifyWebhookPayload(secret, headers, event);
  } catch (error: any) {
    console.error('Webhook verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Event received:', event);

  const { email, name } = event.data;

  // Call a function to perform business logic
  await createUserAccount(email, name, event);

  // Return a JSON response with a status code of 200
  return NextResponse.json({ status: 201 });
}

export async function GET(req: NextRequest) {
  const events = await retrieveEvents();
  return NextResponse.json(
    { message: 'Events retrieved', events },
    { status: 200 },
  );
}

async function createUserAccount(email: string, name: string, event: any) {
  console.log('Creating user account with email:', email, 'and name:', name);
  await addEvent(event);
  console.info('Event added to store in memory');
}
