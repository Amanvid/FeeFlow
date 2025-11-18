import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== Server Environment Debug ===');
  console.log('FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
  console.log('FROG_USERNAME:', process.env.FROG_USERNAME ? 'Set' : 'Not set');
  
  if (process.env.FROG_API_KEY) {
    console.log('API_KEY length:', process.env.FROG_API_KEY.length);
    console.log('API_KEY starts with:', process.env.FROG_API_KEY.substring(0, 10) + '...');
  }
  
  if (process.env.FROG_USERNAME) {
    console.log('USERNAME:', process.env.FROG_USERNAME);
  }

  return NextResponse.json({
    apiKeySet: !!process.env.FROG_API_KEY,
    usernameSet: !!process.env.FROG_USERNAME,
    apiKeyLength: process.env.FROG_API_KEY?.length,
    username: process.env.FROG_USERNAME,
  });
}