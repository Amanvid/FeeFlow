'use client'

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateAdminActivationCode } from '@/lib/actions';

function ConfirmPurchaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const hasSentCode = useRef(false);

  // --- Get all required data directly from URL Search Params ---
  const invoiceId = searchParams.get('invoiceId');
  const userPhone = searchParams.get('userPhone');
  const studentName = searchParams.get('studentName');
  const studentClass = searchParams.get('class');
  const bundleCredits = searchParams.get('credits'); 
  const purchaseType = searchParams.get('purchaseType') || 'fee';
  const bundleName = searchParams.get('bundle');
  const bundlePrice = searchParams.get('price');
  const totalAmountStr = searchParams.get('totalAmount');
  
  const adminPhoneNumber = '0536282694';
  const redirectUrl = purchaseType === 'fee' ? '/check-fees' : '/billing';
  
  useEffect(() => {
    // Use a ref to ensure this runs only ONCE, even in React Strict Mode.
    if (hasSentCode.current) return;

    if (invoiceId && userPhone && studentName && studentClass && totalAmountStr) {
        const totalAmountNum = parseFloat(totalAmountStr);
        if (isNaN(totalAmountNum)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'The payment amount is invalid. Please start over.',
            });
            return;
        }

        hasSentCode.current = true; // Set immediately to prevent re-sends.
        
        generateAdminActivationCode({
            adminPhone: adminPhoneNumber,
            guardianPhone: userPhone,
            studentName: studentName,
            className: studentClass,
            totalAmount: totalAmountNum
        }).then((res) => {
            if (res.success) {
                toast({
                    title: 'Activation Code Sent',
                    description: `An 8-digit code has been sent to the admin for confirmation.`,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to Send Code',
                    description: res.message || 'Could not send activation code. Please contact support.',
                });
                hasSentCode.current = false; // Allow retry if it failed.
            }
        });
    }
  }, [invoiceId, userPhone, studentName, studentClass, totalAmountStr, toast]);


  const handleConfirm = async () => {
    if (!otp || !userPhone || !invoiceId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Missing required information.' });
        return;
    }
    setLoading(true);
    try {
        const res = await fetch('/api/finalize-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone: userPhone, 
                otp, 
                bundleCredits, 
                invoiceId,
                purchaseType, 
                bundleName, 
                bundlePrice,  
                studentName,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            const errorMessage = purchaseType === 'fee' 
                ? 'Failed to confirm fee payment.' 
                : 'Failed to confirm purchase.';
            throw new Error(errorData.error || errorMessage);
        }

        const successMessages = {
            subscription: `Your subscription has been successfully upgraded.`,
            sms: `Your account has been credited with ${bundleCredits} SMS units.`,
            fee: `Your payment of GHS ${bundlePrice} has been confirmed.`
        };
        
        const successTitle = purchaseType === 'fee' ? 'Payment Successful!' : 'Purchase Successful!';

        toast({
            title: successTitle,
            description: successMessages[purchaseType as keyof typeof successMessages] || 'Your transaction was successful.',
        });

        router.push(redirectUrl);
        
    } catch (e: any) {
         const failureTitle = purchaseType === 'fee' ? 'Payment Failed' : 'Confirmation Failed';
         toast({ variant: 'destructive', title: failureTitle, description: e.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
        <PageHeader 
            title={purchaseType === 'fee' ? "Confirm Your Payment" : "Confirm Your Purchase"}
            description="Enter the final 8-digit code to complete the transaction."
        />
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Final Verification</CardTitle>
                    <CardDescription>
                        For your security, please enter the 8-digit code sent to the authorized number to apply the bundle to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <Timer className="h-4 w-4" />
                        <AlertTitle>Waiting for Admin Confirmation</AlertTitle>
                        <AlertDescription>
                            Your payment is pending confirmation. Once you enter the 8-digit code from the admin, your balance will be updated.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="otp">Confirmation Code</Label>
                        <Input 
                            id="otp" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            placeholder="Enter 8-digit code"
                            maxLength={8}
                        />
                    </div>
                    <Button onClick={handleConfirm} disabled={loading || otp.length < 8} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        {purchaseType === 'fee' ? 'Confirm Payment' : 'Confirm & Apply Bundle'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    </>
  )
}


export default function ConfirmPurchasePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ConfirmPurchaseContent />
        </Suspense>
    )
}
