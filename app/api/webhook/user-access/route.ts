import { NextRequest, NextResponse } from 'next/server';

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

  // Destructure to get necessary data from the event
  console.log('Event received:', event);
  const { email, name } = event.data;

  // event.data
  // event
  // root:{ data:}
  // Call a function to perform business logic
  await createUserAccount(email, name);

  // Return a JSON response with a status code of 200
  return NextResponse.json({ status: 200 });
}

export async function GET(req: NextRequest) {
  console.log('GET request received');
  return NextResponse.json(
    { message: 'GET request received' },
    { status: 200 },
  );
}

async function createUserAccount(email: string, name: string) {
  console.log('Creating user account with email:', email, 'and name:', name);
}
