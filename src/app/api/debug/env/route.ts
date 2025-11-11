import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    FROG_API_KEY: process.env.FROG_API_KEY ? 'Set' : 'Not set',
    FROG_API_KEY_length: process.env.FROG_API_KEY?.length || 0,
    FROG_USERNAME: process.env.FROG_USERNAME ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  return NextResponse.json(envVars);
}