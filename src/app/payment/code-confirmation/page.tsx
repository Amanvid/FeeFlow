'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';

interface VerificationCode {
  code: string;
  invoiceId: string;
  amount: number;
  studentName: string;
  expiresAt: string;
}

function CodeConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<VerificationCode | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get parameters from URL
  const invoiceId = searchParams.get('invoice') || '';
  const amount = searchParams.get('amount') || '';
  const studentName = searchParams.get('student') || '';
  const studentId = searchParams.get('studentId') || '';
  const classId = searchParams.get('class') || '';
  const bundleName = searchParams.get('bundle') || '';

  useEffect(() => {
    // Generate and send code on page load
    if (!codeSent && invoiceId && amount && studentName) {
      generateAndSendCode();
    }
  }, [invoiceId, amount, studentName]);

  useEffect(() => {
    // Countdown timer for code resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateAndSendCode = async () => {
    setLoading(true);
    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const codeData: VerificationCode = {
        code,
        invoiceId,
        amount: parseFloat(amount),
        studentName,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry
      };

      // Send code to admin
      const response = await fetch('/api/payments/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codeData),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      setGeneratedCode(codeData);
      setCodeSent(true);
      setCountdown(60); // 60 seconds cooldown
      
      toast({
        title: 'Verification Code Sent',
        description: 'A verification code has been sent to the admin for approval.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !generatedCode) return;
    
    setVerifying(true);
    try {
      const response = await fetch('/api/payments/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          invoiceId: generatedCode.invoiceId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Code Verified Successfully',
          description: 'Your payment has been verified and processed.',
          variant: 'default',
        });
        
        // Redirect to final confirmation page
        const params = new URLSearchParams({
          invoice: invoiceId,
          student: studentName,
          studentId,
          class: classId,
          bundle: bundleName,
          amount,
        });
        
        router.push(`/payment/confirmation?${params.toString()}`);
      } else {
        toast({
          title: 'Verification Failed',
          description: result.message || 'Invalid verification code. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    await generateAndSendCode();
  };

  if (!invoiceId || !amount || !studentName) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Request</AlertTitle>
          <AlertDescription>
            Missing required payment information. Please go back and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Payment Verification"
        description={`Confirm payment for ${studentName} - GHS ${parseFloat(amount).toFixed(2)}`}
      />

      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Enter Verification Code</CardTitle>
            <CardDescription className="text-center">
              A verification code has been sent to the admin. Please enter it below to complete your payment.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {codeSent ? (
              <>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Code Sent Successfully</AlertTitle>
                  <AlertDescription>
                    The verification code has been sent to the school administrator. 
                    Please wait for them to provide you with the code.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center tracking-[0.5em]"
                      disabled={verifying}
                    />
                  </div>

                  <Button
                    onClick={handleVerifyCode}
                    disabled={!verificationCode || verifying || verificationCode.length !== 6}
                    className="w-full"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Payment'
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={handleResendCode}
                      disabled={countdown > 0 || loading}
                      className="text-sm"
                    >
                      {countdown > 0 ? (
                        `Resend code in ${countdown}s`
                      ) : (
                        'Resend Code'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Payment Details:</p>
                  <div className="space-y-1">
                    <p>Student: {studentName}</p>
                    <p>Amount: GHS {parseFloat(amount).toFixed(2)}</p>
                    <p>Invoice ID: {invoiceId}</p>
                    {bundleName && <p>Bundle: {bundleName}</p>}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p>Sending verification code to admin...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function CodeConfirmationPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto mt-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p>Loading verification page...</p>
    </div>}>
      <CodeConfirmationContent />
    </Suspense>
  );
}