import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.FROG_API_KEY;
    const username = process.env.FROG_USERNAME;
    
    return NextResponse.json({
      apiKeySet: !!apiKey,
      usernameSet: !!username,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStartsWith: apiKey?.substring(0, 10) || 'not set',
      username: username || 'not set',
    });
  } catch (error) {
    console.error('Debug FROG API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}