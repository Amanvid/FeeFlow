import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Check for CRON_SECRET authentication
  const authHeader = request.headers.get('Authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ 
    message: "API route is working",
    timestamp: new Date().toISOString(),
    auth: 'valid'
  });
}

export async function POST(request: Request) {
  // Check for CRON_SECRET authentication
  const authHeader = request.headers.get('Authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ 
    message: "POST API route is working",
    timestamp: new Date().toISOString(),
    auth: 'valid'
  });
}