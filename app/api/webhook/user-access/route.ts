import { NextRequest, NextResponse } from 'next/server';
import { addEvent, retrieveEvents } from './store';

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
  console.log('Event received:', event);

  // Destructure to get necessary data from the event
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
