import { NextRequest, NextResponse } from 'next/server';
import eventMockDB from './store';
import userMockDB from './userMockDB';
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
  ``
  // Convert headers (Headers) to a plain object (Record<string, string>)
  const headers = Object.fromEntries(req.headers.entries());

  // Secret from Scalekit Dasbhoard > Webhooks
  const secret = process.env.SCALEKIT_WEBHOOK_SECRET;

  try {
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    await scalekit.verifyWebhookPayload(secret, headers, JSON.stringify(event));
    console.log('Webhook verification passed');

    // Store the event 
    await eventMockDB.insertEvent(event);

    // Acknowledge the webhook immediately
    setImmediate(async () => {
      try {
        // Log the event
        console.log('Processing event:', event);


        // Process the event
        switch (event.type) {
          case 'scalekit.dir.user.create':
            await userMockDB.processUserCreate(event);
            break;

          case 'scalekit.dir.user.update':
            await userMockDB.processUserUpdate(event);
            break;

          case 'scalekit.dir.user.delete':
            await userMockDB.processUserDelete(event.data.id);
            break;

          default:
            console.log(`Unhandled event type: ${event.type}`);
            break;
        }
      } catch (error: any) {
        console.error('Error processing webhook event asynchronously:', error.message);
      }
    });

    // Return a success response immediately
    return NextResponse.json({ message: 'Webhook received' }, { status: 201 });
  } catch (error: any) {
    console.error('Error verifying webhook:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const events = await eventMockDB.getAllEvents();
  return NextResponse.json(
    { message: 'Events retrieved', events },
    { status: 200 },
  );
}

