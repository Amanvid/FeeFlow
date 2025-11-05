
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateRandomString(length: number) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export async function POST(req: Request) {
  try {
    const { amount, referenceId } = await req.json();

    if (!amount || !referenceId) {
      return NextResponse.json({ error: 'Amount and referenceId are required' }, { status: 400 });
    }

    // This is a simplified simulation of a QR code payload generation.
    // In a real application, this would involve a specific format required by the payment provider.
    const payloadObject = {
      version: '1.0',
      merchantId: 'M123456789', // Example Merchant ID
      merchantName: 'CampusFlow',
      amount: amount,
      currency: 'GHS',
      reference: referenceId,
      timestamp: Date.now(),
      checksum: generateRandomString(16) // Simplified checksum
    };
    
    // In a real scenario, you'd generate an actual QR image. Here, we'll return a data URI of a placeholder QR
    // For demonstration, we'll use a public placeholder image service that generates QR codes.
    const qrText = encodeURIComponent(JSON.stringify(payloadObject));
    const qrPayload = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${qrText}`;


    return NextResponse.json({ qrPayload });

  } catch (error) {
    console.error('Error generating GhanaPay QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
