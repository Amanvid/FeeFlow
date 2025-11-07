import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== Environment Test ===');
  console.log('FROG_API_KEY from process.env:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
  console.log('FROG_USERNAME from process.env:', process.env.FROG_USERNAME ? 'Set' : 'Not set');
  
  if (process.env.FROG_API_KEY) {
    console.log('FROG_API_KEY length:', process.env.FROG_API_KEY.length);
    console.log('FROG_API_KEY starts with:', process.env.FROG_API_KEY.substring(0, 10));
  }
  
  if (process.env.FROG_USERNAME) {
    console.log('FROG_USERNAME:', process.env.FROG_USERNAME);
  }
  
  return NextResponse.json({
    frogApiKeySet: !!process.env.FROG_API_KEY,
    frogUsernameSet: !!process.env.FROG_USERNAME,
    frogApiKeyLength: process.env.FROG_API_KEY?.length || 0,
    frogUsername: process.env.FROG_USERNAME || 'not set'
  });
}