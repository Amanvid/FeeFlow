# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## OTP Implementation Reference

The following is the correct and working implementation for the Frog API OTP generation and verification.

**File:** `src/lib/actions.ts`

```typescript
"use server";

const FROG_API_URL = "https://frogapi.wigal.com.gh/api/v3/sms/otp";
const SENDER_ID = "xxxxxxxxxxxx";
const API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const USERNAME = "xxxxxxx";

export async function generateOtp(phone: string): Promise<{ success: boolean; message: string }> {
  console.log(`Generating OTP for ${phone}`);

  try {
    const response = await fetch(`${FROG_API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        number: phone,
        expiry: 5,
        length: 6,
        messagetemplate: `Your ${SENDER_ID} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
        type: "NUMERIC",
        senderid: SENDER_ID,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESS") {
      console.log(`Successfully sent OTP to ${phone}`);
      return { success: true, message: data.message || "An OTP has been sent to your phone." };
    } else {
      console.error("Failed to send OTP:", data);
      return { success: false, message: data.message || "Failed to send OTP. Please try again." };
    }
  } catch (error) {
    console.error("Error in generateOtp:", error);
    return { success: false, message: "An unexpected error occurred while sending OTP." };
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }>  {
  console.log(`Verifying OTP ${otp} for ${phone}`);

  try {
    const response = await fetch(`${FROG_API_URL}/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "API-KEY": API_KEY,
            "USERNAME": USERNAME,
        },
        body: JSON.stringify({
            otpcode: otp,
            number: phone,
        }),
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESS") {
        console.log(`Successfully verified OTP for ${phone}`);
        return { success: true, message: data.message };
    } else {
        console.warn(`OTP verification failed for ${phone}:`, data.message);
        return { success: false, message: data.message || "OTP verification failed." };
    }
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return { success: false, message: "An unexpected error occurred during OTP verification." };
  }
}
```

This will serve as our single source of truth for the OTP logic going forward.
