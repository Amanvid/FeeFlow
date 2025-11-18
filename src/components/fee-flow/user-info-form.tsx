"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateOtp, verifyOtp } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const InfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number."),
});

const OtpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits.").max(6, "OTP must be 6 digits."),
});

type UserInfoFormProps = {
  onVerified: (name: string, phone: string) => void;
};

export default function UserInfoForm({ onVerified }: UserInfoFormProps) {
  const [step, setStep] = useState<"info" | "otp">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const infoForm = useForm<z.infer<typeof InfoSchema>>({
    resolver: zodResolver(InfoSchema),
    defaultValues: { name: "", phone: "" },
  });

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
  });

  const handleInfoSubmit = async (values: z.infer<typeof InfoSchema>) => {
    setIsSubmitting(true);
    const result = await generateOtp(values.phone);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "OTP Sent",
        description: result.message,
      });
      setStep("otp");
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleOtpSubmit = async (values: z.infer<typeof OtpSchema>) => {
    setIsSubmitting(true);
    const phone = infoForm.getValues("phone");
    const result = await verifyOtp(phone, values.otp);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Your phone number has been verified.",
        className: "bg-green-100 text-green-800 border-green-300",
      });
      onVerified(infoForm.getValues("name"), phone);
    } else {
      toast({
        title: "Verification Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl font-headline mt-2">Let's Get Started</CardTitle>
        <CardDescription>First, we need to verify your identity.</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === "info" ? (
            <motion.div
              key="info"
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Form {...infoForm}>
                <form onSubmit={infoForm.handleSubmit(handleInfoSubmit)} className="space-y-6">
                  <FormField
                    control={infoForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={infoForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="024XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Verification Code
                  </Button>
                </form>
              </Form>
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
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-semibold text-foreground">{infoForm.getValues("phone")}</span>.
                    </p>
                  </div>
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Proceed
                  </Button>
                </form>
              </Form>
              <Button variant="link" size="sm" className="mt-2 w-full" onClick={() => setStep("info")}>
                Entered the wrong number? Go back.
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
