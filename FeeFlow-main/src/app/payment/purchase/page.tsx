
'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Smartphone, CreditCard, ShieldCheck, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Invoice } from '@/types';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { calculateTransactionFee } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { generateOtp, verifyOtp } from '@/lib/actions';

function PurchaseContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    // --- State Management ---
    // Step 1: Choose Method, Step 2: Phone for MoMo/QR, Step 3: MoMo Instructions, Step 4: QR Display
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [qrPayload, setQrPayload] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'ghana-qr' | 'momo' | null>(null);
    
    // State for MoMo/QR flow
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    // State for pricing
    const [transactionFee, setTransactionFee] = useState<number | null>(null);
    const [totalAmount, setTotalAmount] = useState<number | null>(null);

    // --- Constants and URL Params ---
    const merchantNumber = '0536282694';
    const momoPaymentLink = 'https://appbiz.momo.africa/momo/kashme/233536282694';
    
    const purchaseType = searchParams.get('purchaseType') || 'sms';
    const userPhoneFromUrl = searchParams.get('userPhone');
    const redirectUrl = purchaseType === 'fee' ? '/check-fees' : '/communications';

    useEffect(() => {
        const priceString = searchParams.get('price');

        if (!searchParams.get('bundle') || !searchParams.get('credits') || !priceString) {
            toast({ variant: 'destructive', title: 'Error', description: 'No payment details found. Redirecting...' });
            router.push(redirectUrl);
            return;
        }

        const price = parseFloat(priceString);
        if (!isNaN(price)) {
            const fee = calculateTransactionFee(price);
            setTransactionFee(fee);
            setTotalAmount(price + fee);
        }
        
        if (userPhoneFromUrl) {
            setPhoneNumber(userPhoneFromUrl);
        }

    }, [searchParams, router, toast, redirectUrl, userPhoneFromUrl]);

    const createInvoice = async () => {
        const bundleName = searchParams.get('bundle');
        const studentName = searchParams.get('studentName');
        const studentClass = searchParams.get('class');

        if (totalAmount === null || !bundleName) return null;

        setLoading(true);
        try {
            const studentFirstName = studentName?.split(' ')[0]?.toUpperCase() || 'FEE';
            const classShortHand = studentClass?.replace(/\s/g, '').toUpperCase() || 'CLS';
            const referenceId = `${studentFirstName}-${classShortHand}`;

            const res = await fetch('/api/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    description: `Paying the fee for ${bundleName}`,
                    reference: referenceId,
                }),
            });
            if (!res.ok) throw new Error('Could not initiate payment.');
            const newInvoice: Invoice = await res.json();
            setInvoice(newInvoice);
            return newInvoice;
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    const navigateToFinalConfirmation = (inv: Invoice) => {
        const params = new URLSearchParams({
            purchaseType: searchParams.get('purchaseType') || 'fee',
            invoiceId: inv.id,
            credits: searchParams.get('credits') || '',
            bundle: searchParams.get('bundle') || '',
            price: searchParams.get('price') || '0',
            userPhone: phoneNumber || userPhoneFromUrl || '', 
            studentName: searchParams.get('studentName') || '',
            class: searchParams.get('class') || '',
            totalAmount: totalAmount?.toString() || '0',
        });
        router.push(`/payment/confirm?${params.toString()}`);
    };

    const handleGhanaQrSelection = () => {
        setPaymentMethod('ghana-qr');
        // If phone number is not provided from the fee check flow, ask for it.
        if (!userPhoneFromUrl) {
            setStep(2); 
        } else {
            handleGenerateQrCode(); // Phone number exists, proceed to generate QR
        }
    };

    const handleGenerateQrCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
            toast({ variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.' });
            return;
        }

        setLoading(true);
        const inv = await createInvoice();
        if (inv && totalAmount) {
             try {
                const qrRes = await fetch('/api/generate-gh-qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: totalAmount, referenceId: inv.id }),
                });

                if (!qrRes.ok) throw new Error('Could not generate QR code.');
                const { qrPayload } = await qrRes.json();
                setQrPayload(qrPayload);
                setStep(4); // Move to QR display step
            } catch (e: any) {
                toast({ variant: 'destructive', title: 'QR Generation Failed', description: e.message });
            } finally {
                setLoading(false);
            }
        }
        setLoading(false);
    };
    
    const handleMomoSelection = () => {
        setPaymentMethod('momo');
        // If phone number is not provided from the fee check flow, ask for it.
        if (!userPhoneFromUrl) {
            setStep(2); 
        } else {
             // Phone is known, but MoMo flow requires OTP verification regardless.
             setStep(2);
        }
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
            toast({ variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.' });
            return;
        }
        setLoading(true);
        const result = await generateOtp(phoneNumber);
        setLoading(false);
        if (result.success) {
            toast({ title: 'OTP Sent', description: 'A verification code has been sent to your phone.' });
            setIsOtpSent(true);
        } else {
            toast({ variant: 'destructive', title: 'Failed to Send OTP', description: result.message });
        }
    }

    const handleVerifyAndContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit code.' });
            return;
        }
        setLoading(true);
        const result = await verifyOtp(phoneNumber, otp);
        if (!result.success) {
            setLoading(false);
            toast({ variant: 'destructive', title: 'Verification Failed', description: result.message });
            return;
        }
        
        // OTP is valid, now create invoice and proceed
        const inv = await createInvoice();
        setLoading(false);
        if (inv) {
            setStep(3); // Move to payment instructions
        }
    }
    
    const handleProceedToConfirmation = async () => {
        if (!invoice || totalAmount === null) return;
        
        // Redirect to final confirmation page
        const params = new URLSearchParams({
            purchaseType: searchParams.get('purchaseType') || 'fee',
            invoiceId: invoice.id,
            credits: searchParams.get('credits') || '',
            bundle: searchParams.get('bundle') || '',
            price: searchParams.get('price') || '0',
            userPhone: phoneNumber || userPhoneFromUrl || '', 
            studentName: searchParams.get('studentName') || '',
            class: searchParams.get('class') || '',
            totalAmount: totalAmount?.toString() || '0',
        });
        
        router.push(`/payment/confirm?${params.toString()}`);
    }

    const bundlePrice = parseFloat(searchParams.get('price') || '0');
    const bundleName = searchParams.get('bundle');

    if (!bundleName || bundlePrice === null || totalAmount === null || transactionFee === null) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const pageDescription = purchaseType === 'fee' 
        ? `You are paying the fee for ${bundleName}.`
        : `You are purchasing the ${bundleName}.`;

    const handleBack = () => {
        if (step === 2) {
            setIsOtpSent(false);
            setOtp('');
            setStep(1);
            setPaymentMethod(null);
        } else if (step === 3) {
            setStep(2);
        } else if (step === 4) {
            setStep(1);
            setPaymentMethod(null);
            setQrPayload(null);
        } else {
            router.back();
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                     <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full h-20 text-lg" onClick={handleGhanaQrSelection} disabled={loading}>
                            {loading && paymentMethod === 'ghana-qr' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-4 h-8 w-8" />}
                            Pay with GhanaPay QR
                        </Button>
                        <Button variant="outline" className="w-full h-20 text-lg" onClick={handleMomoSelection} disabled={loading}>
                            {loading && paymentMethod === 'momo' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Smartphone className="mr-4 h-8 w-8" />}
                            Pay with Mobile Money
                        </Button>
                    </CardContent>
                );
            case 2: // Enter Phone Number & OTP (shared by MoMo and QR)
                return (
                    <CardContent>
                        {paymentMethod === 'momo' ? (
                            !isOtpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone-number">Your Mobile Money Number</Label>
                                        <Input id="phone-number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="024XXXXXXX" required pattern="[0-9]{10}" />
                                        <p className="text-xs text-muted-foreground">This number will be used to send the payment confirmation SMS.</p>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Verification Code'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyAndContinue} className="space-y-4">
                                    <p className="text-center text-sm text-muted-foreground">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{phoneNumber}</span>.</p>
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Verification Code</Label>
                                        <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="_ _ _ _ _ _" maxLength={6} className="text-center tracking-[0.5em]" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Continue'}
                                    </Button>
                                </form>
                            )
                        ) : ( // paymentMethod === 'ghana-qr'
                            <form onSubmit={handleGenerateQrCode} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone-number">Guardian's Phone Number</Label>
                                    <Input id="phone-number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="024XXXXXXX" required pattern="[0-9]{10}" />
                                    <p className="text-xs text-muted-foreground">The payment confirmation SMS will be sent to this number.</p>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue to QR Code'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                );
            case 3: // MoMo Payment Instructions
                 return (
                    <CardContent className="space-y-4">
                        <div>
                            <Alert>
                                <AlertTitle>Action Required: Send Payment</AlertTitle>
                                <AlertDescription>
                                    Please send **GHS {totalAmount.toFixed(2)}** to the merchant number below, or use the direct payment link.
                                </AlertDescription>
                            </Alert>
                            <div className="text-center p-4 border rounded-lg my-4">
                                <p className="text-sm text-muted-foreground">Merchant Number</p>
                                <p className="text-2xl font-bold tracking-widest">{merchantNumber}</p>
                            </div>
                             <Button asChild className="w-full" variant="secondary">
                                <a href={momoPaymentLink} target="_blank" rel="noopener noreferrer">
                                    Pay with MoMo Link <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>

                            <Card className="mt-4">
                                <CardHeader><CardTitle className="text-base">Manual Instructions</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <p>1. Dial your Mobile Money USSD code (e.g., *170# for MTN).</p>
                                    <p>2. Select the option for "Transfer Money" or "Send Money".</p>
                                    <p>3. Choose "MoMo User" or equivalent.</p>
                                    <p>4. Enter the merchant number: **{merchantNumber}**</p>
                                    <p>5. Enter the amount: **{totalAmount.toFixed(2)}**</p>
                                    <p>6. Use reference: **{invoice?.reference || 'Fee Payment'}**</p>
                                    <p>7. Enter your PIN to confirm.</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Button className="w-full" onClick={handleProceedToConfirmation} disabled={loading}>
                           {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'I Have Sent The Money'}
                        </Button>
                    </CardContent>
                );
            case 4: // GhanaPay QR Code Display
                return (
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertTitle>Scan to Pay with GhanaPay</AlertTitle>
                            <AlertDescription>
                                Use any banking app that supports GhanaPay QR to scan the code below and complete your payment.
                            </AlertDescription>
                        </Alert>
                        <div className="flex justify-center p-4 border rounded-lg my-4">
                            {qrPayload ? (
                                <Image
                                    src={qrPayload}
                                    alt="GhanaPay QR Code"
                                    width={256}
                                    height={256}
                                />
                            ) : (
                                <div className="h-[256px] w-[256px] flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 animate-spin" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            After paying, click the button below to finalize your transaction.
                        </p>
                        <Button className="w-full" onClick={handleProceedToConfirmation} disabled={loading || !qrPayload}>
                           {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'I Have Completed Payment'}
                        </Button>
                    </CardContent>
                );
            default:
                 return (
                     <CardContent className="space-y-6">
                         <div className="text-center">An unexpected error occurred. Please try again.</div>
                         <Button onClick={() => setStep(1)} className="w-full">Start Over</Button>
                     </CardContent>
                 );
        }
    };
    
    const getStepTitle = () => {
        if (step === 1) return 'Choose Payment Method';
        if (step === 2) return 'Confirm Your Number';
        if (step === 3) return 'Complete Payment';
        if (step === 4) return 'Scan QR to Pay';
        return `Step ${step}`;
    }

    return (
        <>
            <PageHeader
                title={purchaseType === 'subscription' ? 'Confirm Subscription' : (purchaseType === 'fee' ? 'Pay School Fees' : 'Purchase SMS Credits')}
                description={pageDescription}
            />

            <div className="max-w-lg mx-auto">
                 <Card>
                    <CardHeader className="relative">
                        {step > 1 && (
                            <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={handleBack}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <CardTitle className="text-center">
                            {getStepTitle()}
                        </CardTitle>
                        <CardDescription className="text-center">
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span>GHS {bundlePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Transaction Fee:</span>
                                     {transactionFee !== null ? (
                                        <span>GHS {transactionFee.toFixed(2)}</span>
                                     ) : (
                                        <Skeleton className="h-5 w-16" />
                                     )}
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base text-foreground">
                                    <span>Total Amount:</span>
                                    {totalAmount !== null ? (
                                        <span>GHS {totalAmount.toFixed(2)}</span>
                                    ) : (
                                        <Skeleton className="h-6 w-20" />
                                    )}
                                </div>
                            </div>
                        </CardDescription>
                    </CardHeader>
                   
                    {renderStep()}
                </Card>
            </div>
        </>
    );
}


export default function PurchasePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <PurchaseContent />
        </Suspense>
    )
}

    