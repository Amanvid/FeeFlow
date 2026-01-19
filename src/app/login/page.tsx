
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ArrowLeft, Home } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

const OtpSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number."),
  otp: z.string().min(6, "OTP must be 6 digits.").max(6, "OTP must be 6 digits."),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"login" | "otp">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [usernameForOtp, setUsernameForOtp] = useState('');

  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { phone: "", otp: "" },
  });

  const handleLoginSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Credentials Verified",
          description: "Please complete OTP verification to continue.",
        });
        setUsernameForOtp(values.username);
        if (data.phone) {
          otpForm.setValue('phone', data.phone);
        }
        setStep("otp");
      } else {
        throw new Error(data.message || "Invalid credentials.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const phone = otpForm.getValues("phone");
    const phoneValidation = z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number.").safeParse(phone);

    if (!phoneValidation.success) {
      toast({ variant: "destructive", title: "Invalid Phone", description: phoneValidation.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({ title: "OTP Sent", description: `An OTP has been sent to ${phone}.` });
      setIsOtpSent(true);
      setPhoneForOtp(phone);

    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Send OTP", description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOtpSubmit = async (values: z.infer<typeof OtpSchema>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneForOtp, otp: values.otp, username: usernameForOtp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      // Save user info to localStorage
      if (data.user) {
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }

      toast({ title: "Login Successful", description: "Redirecting to dashboard..." });

      // Full page reload to navigate to admin dashboard.
      window.location.href = "/admin";

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 relative overflow-hidden">
      {/* Navigation Buttons */}
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>

      {/* Large background logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 z-0">
        <Image
          src="/cec_logo.png"
          alt="School Logo Background"
          width={880}
          height={880}
          className="object-contain blur-sm"
        />
      </div>
      {/* Additional subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 z-0"></div>
      <Card className="w-full max-w-md relative z-10 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Admin Authentication</CardTitle>
          <CardDescription>
            {step === 'login' ? 'Please enter your credentials to proceed.' : 'Complete the final security step.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.div
                key="login"
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify Credentials
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center">
                  <Link href="/teacher/login" className="text-sm text-blue-600 hover:text-blue-800 underline">
                    Teacher Portal Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                    {!isOtpSent ? (
                      <div className="space-y-4">
                        <FormField
                          control={otpForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="024XXXXXXX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={handleSendOtp} className="w-full" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send OTP'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                          Enter the 6-digit code sent to <span className="font-semibold text-foreground">{phoneForOtp}</span>.
                        </p>
                        <FormField
                          control={otpForm.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="_ _ _ _ _ _"
                                  {...field}
                                  className="text-center text-lg tracking-[0.5em]"
                                  maxLength={6}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Login to Dashboard
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
                <Button variant="link" size="sm" className="mt-2 w-full" onClick={() => {
                  setStep("login");
                  setIsOtpSent(false);
                  otpForm.reset();
                  loginForm.reset();
                }}>
                  Start Over
                </Button>
                <div className="mt-4 text-center">
                  <Link href="/teacher/login" className="text-sm text-blue-600 hover:text-blue-800 underline">
                    Teacher Portal Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
