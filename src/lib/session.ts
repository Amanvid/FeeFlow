
import 'server-only'
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-for-development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    console.log('Decrypting JWT...');
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    console.log('JWT payload:', payload);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies(); // ✅ must await
  const session = cookieStore.get('session')?.value;
  console.log('Session cookie found:', !!session);
  if (!session) return null;
  const decrypted = await decrypt(session);
  console.log('Decrypted session:', decrypted);
  return decrypted;
}

export async function verifySession(session?: string) {
  try {
    const sessionData = session || await getSession();
    if (!sessionData) {
      console.log('No session data found');
      return null;
    }
    
    console.log('Session data:', sessionData);
    
    if (!sessionData.exp) {
      console.log('No expiration field in session');
      return null;
    }
    
    const isExpired = sessionData.exp * 1000 < Date.now();
    if (isExpired) {
      console.log('Session expired');
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
