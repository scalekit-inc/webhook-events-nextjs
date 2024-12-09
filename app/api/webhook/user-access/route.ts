import { NextRequest, NextResponse } from 'next/server';
import eventMockDB from './store'; // For event storage
import userMockDB from './userMockDB'; // For user CRUD
import { ScalekitClient } from '@scalekit-sdk/node';


if (!process.env.SCALEKIT_ENV_URL) {
  throw new Error('SCALEKIT_ENV_URL is required');
}
if (!process.env.SCALEKIT_CLIENT_ID) {
  throw new Error('SCALEKIT_CLIENT_ID is required');
}
if (!process.env.SCALEKIT_CLIENT_SECRET) {
  throw new Error('SCALEKIT_CLIENT_SECRET is required');
}
const scalekit = new ScalekitClient(
  process.env.SCALEKIT_ENV_URL,
  process.env.SCALEKIT_CLIENT_ID,
  process.env.SCALEKIT_CLIENT_SECRET,
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
  const event = await req.json();
  const headers = Object.fromEntries(req.headers.entries());
  const secret = process.env.SCALEKIT_WEBHOOK_SECRET;

  try {
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    await scalekit.verifyWebhookPayload(secret, headers, JSON.stringify(event));
    console.log('Webhook verification passed');

    // Store the event in the EventMockDB
    await eventMockDB.insertEvent(event);

    // log the event
    console.log('Event received:', event);

    // Process the event
    if (event.type === 'scalekit.dir.user.create') {
      const { id, email, name } = event.data;
      if (!id || !email || !name) {
        console.error('Missing required fields for user creation:', { id, email, name });
        return NextResponse.json({ error: 'Invalid user creation event data' }, { status: 400 });
      }
      await userMockDB.createUser({ id: event.data.id, email, name });
    } else if (event.type === 'scalekit.dir.user.update') {
      const { id, ...updates } = event.data;
      if (!id) {
        console.error('Missing user ID for update:', { id, updates });
        return NextResponse.json({ error: 'Invalid user update event data' }, { status: 400 });
      } const success = await userMockDB.updateUser(id, updates);
      if (!success) {
        console.error(`User with ID ${id} not found for update`);
      }
      
    } else if (event.type === 'scalekit.dir.user.delete') {
      await userMockDB.deleteUser(event.data.id);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('Error handling webhook:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Always return 200 for webhook endpoints
  return NextResponse.json({ message: 'Event processed' }, { status: 200 });
}

export async function GET(req: NextRequest) {
  const events = await eventMockDB.getAllEvents();
  return NextResponse.json(
    { message: 'Events retrieved', events },
    { status: 200 },
  );
}

